"""
WebSocket Connection Manager — Manages active WebSocket connections with dynamic pool sizing.

Reads pool bounds from environment variables:
  WS_POOL_MIN_SIZE  — minimum pool size (default: 10)
  WS_POOL_MAX_SIZE  — maximum pool size (default: 100)
  WS_POOL_CLEANUP_INTERVAL — cleanup interval in seconds (default: 300)
"""

import os
import logging
import asyncio
from typing import Dict, Set, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[WebSocketManager] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


@dataclass
class PoolConfig:
    min_size: int = 10
    max_size: int = 100
    cleanup_interval: int = 300

    @classmethod
    def from_env(cls) -> "PoolConfig":
        return cls(
            min_size=int(os.getenv("WS_POOL_MIN_SIZE", "10")),
            max_size=int(os.getenv("WS_POOL_MAX_SIZE", "100")),
            cleanup_interval=int(os.getenv("WS_POOL_CLEANUP_INTERVAL", "300")),
        )


class ConnectionManager:
    def __init__(self, config: Optional[PoolConfig] = None):
        self.config = config or PoolConfig.from_env()
        self._connections: Dict[str, Set[object]] = {}
        self._active_count: int = 0
        self._cleanup_task: Optional[asyncio.Task] = None

    @property
    def active_connections(self) -> int:
        return self._active_count

    @property
    def pool_size(self) -> int:
        return len(self._connections)

    def register(self, company_id: str, connection: object) -> bool:
        if self._active_count >= self.config.max_size:
            logger.warning(
                f"Pool at max capacity ({self.config.max_size}), "
                f"rejecting connection for company {company_id}"
            )
            return False

        if company_id not in self._connections:
            self._connections[company_id] = set()
        self._connections[company_id].add(connection)
        self._active_count += 1
        return True

    def unregister(self, company_id: str, connection: object) -> None:
        if company_id in self._connections:
            self._connections[company_id].discard(connection)
            if not self._connections[company_id]:
                del self._connections[company_id]
            self._active_count = max(0, self._active_count - 1)

    def get_connections(self, company_id: str) -> Set[object]:
        return self._connections.get(company_id, set())

    def broadcast(self, company_id: str, message: str) -> int:
        sent = 0
        for conn in self.get_connections(company_id):
            try:
                if hasattr(conn, "send") and callable(conn.send):
                    conn.send(message)
                    sent += 1
            except Exception as e:
                logger.error(f"Broadcast error for company {company_id}: {e}")
        return sent

    async def cleanup_stale(self) -> int:
        removed = 0
        now = datetime.now(timezone.utc)
        for company_id in list(self._connections.keys()):
            stale = set()
            for conn in self._connections[company_id]:
                last_active = getattr(conn, "last_active", now)
                if hasattr(conn, "closed") and conn.closed:
                    stale.add(conn)
            for conn in stale:
                self._connections[company_id].discard(conn)
                self._active_count = max(0, self._active_count - 1)
                removed += 1
            if not self._connections[company_id]:
                del self._connections[company_id]
        if removed:
            logger.info(f"Cleanup removed {removed} stale connection(s)")
        return removed

    async def start_cleanup_loop(self):
        async def _loop():
            while True:
                await asyncio.sleep(self.config.cleanup_interval)
                await self.cleanup_stale()

        self._cleanup_task = asyncio.create_task(_loop())
        logger.info(f"Cleanup loop started (interval={self.config.cleanup_interval}s)")

    async def stop_cleanup_loop(self):
        if self._cleanup_task:
            self._cleanup_task.cancel()
            self._cleanup_task = None
            logger.info("Cleanup loop stopped")


_instance: Optional[ConnectionManager] = None


def load():
    global _instance
    if _instance is None:
        config = PoolConfig.from_env()
        _instance = ConnectionManager(config)
        logger.info(
            f"ConnectionManager loaded (min={config.min_size}, "
            f"max={config.max_size}, cleanup={config.cleanup_interval}s)"
        )
    return _instance


def get_instance() -> Optional[ConnectionManager]:
    return _instance
