"""
WebSocket Connection Manager — heartbeat, connection pooling, and company-scoped broadcast.

Features:
  - connect(websocket, client_id, company_id) — adds to pool, starts heartbeat
  - disconnect(client_id) — removes from pool, cancels heartbeat
  - send_personal(message, client_id) — sends JSON to a specific client
  - broadcast(message, company_id=None) — broadcast to all or company-scoped clients
  - heartbeat_task — sends ping every 30s, disconnects if no pong within 10s
  - eviction_sweep — background task removes dead connections every 60s
  - Pool limits: max 100 total, max 20 per company

Thread/async safety: all mutations use asyncio.Lock.
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from typing import Optional

from fastapi import WebSocket

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MAX_TOTAL_CONNECTIONS = 100
MAX_PER_COMPANY = 20
HEARTBEAT_INTERVAL_S = 30
PONG_TIMEOUT_S = 10
EVICTION_INTERVAL_S = 60


@dataclass
class _Connection:
    websocket: WebSocket
    client_id: str
    company_id: Optional[str]
    connected_at: float = field(default_factory=time.monotonic)
    last_pong_at: float = field(default_factory=time.monotonic)
    alive: bool = True
    heartbeat_task: Optional[asyncio.Task] = None


class ConnectionManager:
    """Manages WebSocket connections with heartbeat and company-scoped broadcast."""

    def __init__(self):
        self._connections: dict[str, _Connection] = {}
        self._lock = asyncio.Lock()
        self._eviction_task: Optional[asyncio.Task] = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def connect(
        self,
        websocket: WebSocket,
        client_id: str,
        company_id: Optional[str] = None,
    ) -> bool:
        """
        Accept a WebSocket connection and add it to the pool.

        Returns:
            True if accepted; False if pool is full.
        """
        await websocket.accept()

        async with self._lock:
            if len(self._connections) >= MAX_TOTAL_CONNECTIONS:
                await websocket.close(code=1008, reason="Connection pool full")
                logger.warning(f"[WS] Rejected {client_id}: global pool limit reached")
                return False

            company_count = sum(
                1 for c in self._connections.values()
                if c.company_id == company_id and company_id is not None
            )
            if company_id and company_count >= MAX_PER_COMPANY:
                await websocket.close(code=1008, reason="Company connection limit reached")
                logger.warning(f"[WS] Rejected {client_id}: company {company_id} limit reached")
                return False

            conn = _Connection(
                websocket=websocket,
                client_id=client_id,
                company_id=company_id,
            )
            self._connections[client_id] = conn

        # Start heartbeat outside the lock
        task = asyncio.create_task(self._heartbeat_task(client_id))
        async with self._lock:
            if client_id in self._connections:
                self._connections[client_id].heartbeat_task = task

        # Start eviction sweep if not already running
        if self._eviction_task is None or self._eviction_task.done():
            self._eviction_task = asyncio.create_task(self._eviction_sweep())

        logger.info(f"[WS] Connected: {client_id} (company={company_id}). "
                    f"Pool size: {len(self._connections)}")
        return True

    async def disconnect(self, client_id: str):
        """Remove a client from the pool and cancel its heartbeat task."""
        async with self._lock:
            conn = self._connections.pop(client_id, None)

        if conn:
            conn.alive = False
            if conn.heartbeat_task and not conn.heartbeat_task.done():
                conn.heartbeat_task.cancel()
            try:
                await conn.websocket.close()
            except Exception:
                pass
            logger.info(f"[WS] Disconnected: {client_id}. Pool size: {len(self._connections)}")

    async def send_personal(self, message: dict | str, client_id: str) -> bool:
        """
        Send a message to a specific client.

        Returns:
            True if sent successfully; False if client not found or send failed.
        """
        async with self._lock:
            conn = self._connections.get(client_id)

        if not conn or not conn.alive:
            return False

        try:
            payload = json.dumps(message) if isinstance(message, dict) else message
            await conn.websocket.send_text(payload)
            return True
        except Exception as exc:
            logger.warning(f"[WS] send_personal to {client_id} failed: {exc}")
            await self.disconnect(client_id)
            return False

    async def broadcast(
        self,
        message: dict | str,
        company_id: Optional[str] = None,
    ):
        """
        Broadcast a message to all connected clients, optionally filtered by company.
        Dead connections are evicted automatically.
        """
        payload = json.dumps(message) if isinstance(message, dict) else message

        async with self._lock:
            targets = [
                conn for conn in self._connections.values()
                if conn.alive and (company_id is None or conn.company_id == company_id)
            ]

        dead_ids = []
        for conn in targets:
            try:
                await conn.websocket.send_text(payload)
            except Exception as exc:
                logger.warning(f"[WS] broadcast to {conn.client_id} failed: {exc}")
                dead_ids.append(conn.client_id)

        for cid in dead_ids:
            await self.disconnect(cid)

    def connection_count(self, company_id: Optional[str] = None) -> int:
        """Return the current number of connections (optionally filtered by company)."""
        if company_id is None:
            return len(self._connections)
        return sum(1 for c in self._connections.values() if c.company_id == company_id)

    def is_connected(self, client_id: str) -> bool:
        """Return whether a client ID is currently connected."""
        return client_id in self._connections

    # ------------------------------------------------------------------
    # Internal tasks
    # ------------------------------------------------------------------

    async def _heartbeat_task(self, client_id: str):
        """
        Send a ping every HEARTBEAT_INTERVAL_S seconds.
        Disconnect the client if no pong is received within PONG_TIMEOUT_S.
        """
        try:
            while True:
                await asyncio.sleep(HEARTBEAT_INTERVAL_S)

                async with self._lock:
                    conn = self._connections.get(client_id)

                if not conn or not conn.alive:
                    break

                # Check time since last pong
                elapsed = time.monotonic() - conn.last_pong_at
                if elapsed > HEARTBEAT_INTERVAL_S + PONG_TIMEOUT_S:
                    logger.warning(f"[WS] Heartbeat timeout for {client_id}; disconnecting.")
                    asyncio.create_task(self.disconnect(client_id))
                    break

                # Send ping
                try:
                    await conn.websocket.send_text(json.dumps({"type": "ping"}))
                except Exception as exc:
                    logger.warning(f"[WS] Ping failed for {client_id}: {exc}")
                    asyncio.create_task(self.disconnect(client_id))
                    break

        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.error(f"[WS] Heartbeat task error for {client_id}: {exc}")

    async def handle_pong(self, client_id: str):
        """Call this when a pong message is received from a client."""
        async with self._lock:
            conn = self._connections.get(client_id)
            if conn:
                conn.last_pong_at = time.monotonic()

    async def _eviction_sweep(self):
        """
        Background task that periodically removes dead connections.
        Runs every EVICTION_INTERVAL_S seconds.
        """
        try:
            while True:
                await asyncio.sleep(EVICTION_INTERVAL_S)

                async with self._lock:
                    dead_ids = [
                        cid for cid, conn in self._connections.items()
                        if not conn.alive
                    ]
                    # Also evict connections that have been silent too long
                    now = time.monotonic()
                    for cid, conn in self._connections.items():
                        if (now - conn.last_pong_at) > (HEARTBEAT_INTERVAL_S + PONG_TIMEOUT_S) * 2:
                            if cid not in dead_ids:
                                dead_ids.append(cid)

                for cid in dead_ids:
                    await self.disconnect(cid)

                if dead_ids:
                    logger.info(f"[WS] Eviction sweep removed {len(dead_ids)} dead connections.")

        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.error(f"[WS] Eviction sweep error: {exc}")


# Singleton instance
manager = ConnectionManager()
