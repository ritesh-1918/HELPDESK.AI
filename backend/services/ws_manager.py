"""
WebSocket Connection Manager with Ping/Pong Heartbeat and Pool Eviction.

Provides:
- Per-ticket WebSocket rooms for real-time ticket dashboard updates
- Server-side ping/pong heartbeat to detect dead sockets
- Connection pool eviction sweeps to release stale connections
- Thread-safe connection tracking with last-pong timestamps
"""

import asyncio
import time
import logging
from typing import Dict, Set, Optional
from dataclasses import dataclass, field
from fastapi import WebSocket

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
HEARTBEAT_INTERVAL_SECONDS = 30       # Send ping every 30s
PONG_TIMEOUT_SECONDS = 10             # Wait 10s for pong before evicting
EVICTION_SWEEP_INTERVAL_SECONDS = 60  # Run sweep every 60s
MAX_CONNECTIONS_PER_ROOM = 50         # Cap per ticket room
MAX_TOTAL_CONNECTIONS = 500           # Global connection cap


@dataclass
class TrackedConnection:
    """Wraps a WebSocket with liveness metadata."""
    ws: WebSocket
    connected_at: float = field(default_factory=time.time)
    last_pong_at: float = field(default_factory=time.time)
    remote_addr: str = "unknown"

    def is_alive(self) -> bool:
        """True if we received a pong within the timeout window."""
        return (time.time() - self.last_pong_at) < (HEARTBEAT_INTERVAL_SECONDS + PONG_TIMEOUT_SECONDS)

    def mark_pong(self) -> None:
        self.last_pong_at = time.time()


class ConnectionManager:
    """
    Manages WebSocket connections grouped by ticket room.

    Usage:
        manager = ConnectionManager()
        # In lifespan:
        await manager.start()
        # In endpoint:
        await manager.connect(ticket_id, websocket)
        ...
        await manager.disconnect(ticket_id, websocket)
        # On shutdown:
        await manager.stop()
    """

    def __init__(self) -> None:
        # ticket_id → set of tracked connections
        self._rooms: Dict[str, Set[TrackedConnection]] = {}
        self._global_lock = asyncio.Lock()
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._eviction_task: Optional[asyncio.Task] = None
        self._total_connections = 0

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------
    async def start(self) -> None:
        """Start background heartbeat and eviction tasks."""
        self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        self._eviction_task = asyncio.create_task(self._eviction_loop())
        logger.info("[WS] Connection manager started (heartbeat=%ds, eviction=%ds)",
                     HEARTBEAT_INTERVAL_SECONDS, EVICTION_SWEEP_INTERVAL_SECONDS)

    async def stop(self) -> None:
        """Cancel background tasks and close all connections."""
        for task in (self._heartbeat_task, self._eviction_task):
            if task:
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

        async with self._global_lock:
            for room_id, conns in self._rooms.items():
                for tc in list(conns):
                    try:
                        await tc.ws.close(code=1001, reason="Server shutting down")
                    except Exception:
                        pass
            self._rooms.clear()
            self._total_connections = 0
        logger.info("[WS] Connection manager stopped")

    # ------------------------------------------------------------------
    # Connect / Disconnect
    # ------------------------------------------------------------------
    async def connect(self, room_id: str, ws: WebSocket, remote_addr: str = "unknown") -> bool:
        """
        Accept a WebSocket and add it to the room.
        Returns False if global or per-room cap is reached.
        """
        # Check caps before accepting
        async with self._global_lock:
            if self._total_connections >= MAX_TOTAL_CONNECTIONS:
                logger.warning("[WS] Global connection cap reached (%d)", MAX_TOTAL_CONNECTIONS)
                return False
            room = self._rooms.setdefault(room_id, set())
            if len(room) >= MAX_CONNECTIONS_PER_ROOM:
                logger.warning("[WS] Room %s cap reached (%d)", room_id, MAX_CONNECTIONS_PER_ROOM)
                return False

        await ws.accept()
        tc = TrackedConnection(ws=ws, remote_addr=remote_addr)

        async with self._global_lock:
            self._rooms[room_id].add(tc)
            self._total_connections += 1

        logger.info("[WS] Connected: room=%s addr=%s total=%d",
                     room_id, remote_addr, self._total_connections)
        return True

    async def disconnect(self, room_id: str, ws: WebSocket) -> None:
        """Remove a specific WebSocket from its room."""
        async with self._global_lock:
            room = self._rooms.get(room_id)
            if not room:
                return
            to_remove = next((tc for tc in room if tc.ws is ws), None)
            if to_remove:
                room.discard(to_remove)
                self._total_connections = max(0, self._total_connections - 1)
                if not room:
                    del self._rooms[room_id]
        logger.info("[WS] Disconnected: room=%s total=%d", room_id, self._total_connections)

    # ------------------------------------------------------------------
    # Broadcast
    # ------------------------------------------------------------------
    async def broadcast(self, room_id: str, message: dict) -> int:
        """Send a JSON message to all connections in a room. Returns count of recipients."""
        import json
        payload = json.dumps(message)
        room = self._rooms.get(room_id, set()).copy()
        sent = 0
        dead: list[TrackedConnection] = []
        for tc in room:
            try:
                await tc.ws.send_text(payload)
                sent += 1
            except Exception:
                dead.append(tc)

        # Clean up dead connections
        if dead:
            async with self._global_lock:
                actual_room = self._rooms.get(room_id)
                if actual_room:
                    for tc in dead:
                        actual_room.discard(tc)
                        self._total_connections = max(0, self._total_connections - 1)
                    if not actual_room:
                        del self._rooms[room_id]
        return sent

    # ------------------------------------------------------------------
    # Stats
    # ------------------------------------------------------------------
    def stats(self) -> dict:
        return {
            "total_connections": self._total_connections,
            "rooms": {rid: len(conns) for rid, conns in self._rooms.items()},
            "room_count": len(self._rooms),
        }

    # ------------------------------------------------------------------
    # Background: Heartbeat Ping/Pong
    # ------------------------------------------------------------------
    async def _heartbeat_loop(self) -> None:
        """Periodically sends ping frames to all connections."""
        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL_SECONDS)
            async with self._global_lock:
                all_conns = []
                for room_id, conns in self._rooms.items():
                    for tc in conns:
                        all_conns.append((room_id, tc))

            pinged = 0
            failed: list[tuple[str, TrackedConnection]] = []
            for room_id, tc in all_conns:
                try:
                    await tc.ws.send_json({"type": "ping", "ts": time.time()})
                    pinged += 1
                except Exception:
                    failed.append((room_id, tc))

            if failed:
                async with self._global_lock:
                    for room_id, tc in failed:
                        room = self._rooms.get(room_id)
                        if room:
                            room.discard(tc)
                            self._total_connections = max(0, self._total_connections - 1)
                        try:
                            await tc.ws.close(code=1000, reason="Ping failed")
                        except Exception:
                            pass
                    # Prune empty rooms
                    empty = [r for r, c in self._rooms.items() if not c]
                    for r in empty:
                        del self._rooms[r]
                logger.info("[WS] Heartbeat: pinged %d, evicted %d dead connections", pinged, len(failed))
            else:
                logger.debug("[WS] Heartbeat: pinged %d connections", pinged)

    # ------------------------------------------------------------------
    # Background: Eviction Sweep
    # ------------------------------------------------------------------
    async def _eviction_loop(self) -> None:
        """Periodically evict connections that missed pong responses."""
        while True:
            await asyncio.sleep(EVICTION_SWEEP_INTERVAL_SECONDS)
            now = time.time()
            stale: list[tuple[str, TrackedConnection]] = []

            async with self._global_lock:
                for room_id, conns in self._rooms.items():
                    for tc in conns:
                        if not tc.is_alive():
                            stale.append((room_id, tc))

            if stale:
                evicted = 0
                for room_id, tc in stale:
                    try:
                        await tc.ws.close(code=1000, reason="Heartbeat timeout")
                    except Exception:
                        pass
                    async with self._global_lock:
                        room = self._rooms.get(room_id)
                        if room:
                            room.discard(tc)
                            self._total_connections = max(0, self._total_connections - 1)
                    evicted += 1

                # Prune empty rooms
                async with self._global_lock:
                    empty = [r for r, c in self._rooms.items() if not c]
                    for r in empty:
                        del self._rooms[r]

                logger.info("[WS] Eviction sweep: removed %d stale connections", evicted)

    # ------------------------------------------------------------------
    # Client Pong Handler (call from WebSocket endpoint)
    # ------------------------------------------------------------------
    async def handle_pong(self, room_id: str, ws: WebSocket) -> None:
        """Update last-pong timestamp when client sends {'type': 'pong'}."""
        async with self._global_lock:
            room = self._rooms.get(room_id)
            if room:
                tc = next((t for t in room if t.ws is ws), None)
                if tc:
                    tc.mark_pong()


# Singleton instance
ws_manager = ConnectionManager()
