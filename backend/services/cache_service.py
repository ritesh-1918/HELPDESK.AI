"""
Redis Distributed Cache Service
Provides connection-pooled async access to Redis for caching embeddings,
classification results, and duplicate-check mappings.

Falls back gracefully when Redis is unavailable so the backend continues
to operate without caching (degraded-but-functional mode).
"""

import hashlib
import json
import os
import logging
from typing import Any

logger = logging.getLogger(__name__)

# TTLs (seconds)
_TTL_EMBEDDING = int(os.getenv("REDIS_TTL_EMBEDDING", 86400))      # 24 h
_TTL_CLASSIFY  = int(os.getenv("REDIS_TTL_CLASSIFY",  3600))        # 1 h
_TTL_DUPLICATE = int(os.getenv("REDIS_TTL_DUPLICATE", 1800))        # 30 min
_KEY_PREFIX    = os.getenv("REDIS_KEY_PREFIX", "helpdesk")

# Redis connection settings
_REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
_REDIS_URL_BASE = os.getenv("REDIS_URL", "redis://localhost:6379/0")
if _REDIS_PASSWORD and _REDIS_PASSWORD not in _REDIS_URL_BASE:
    _REDIS_URL = f"redis://:{_REDIS_PASSWORD}@{_REDIS_URL_BASE.split('://', 1)[-1]}"
else:
    _REDIS_URL = _REDIS_URL_BASE
_POOL_MAX      = int(os.getenv("REDIS_POOL_MAX_CONNECTIONS", 20))
_SOCKET_TIMEOUT = float(os.getenv("REDIS_SOCKET_TIMEOUT", 1.0))     # fail fast


def _make_key(namespace: str, raw: str) -> str:
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]
    return f"{_KEY_PREFIX}:{namespace}:{digest}"


class CacheService:
    """
    Thin wrapper around a synchronous Redis connection pool.

    Designed for use from synchronous FastAPI path functions
    (the duplicate_service and classifier are both sync).  An async-capable
    variant can be layered on top if the codebase moves to full async IO.

    All public methods silently swallow Redis errors and return None /
    False so callers never need to guard against cache failures.
    """

    def __init__(self) -> None:
        self._client = None
        self._available = False

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def connect(self) -> None:
        """Attempt to open a connection pool.  Safe to call multiple times."""
        if self._available:
            return
        try:
            import redis  # lazy import so missing package only errors here

            pool = redis.ConnectionPool.from_url(
                _REDIS_URL,
                max_connections=_POOL_MAX,
                socket_connect_timeout=_SOCKET_TIMEOUT,
                socket_timeout=_SOCKET_TIMEOUT,
                decode_responses=True,
            )
            client = redis.Redis(connection_pool=pool)
            client.ping()  # validate connectivity at startup
            self._client = client
            self._available = True
            logger.info("[CacheService] Connected to Redis at %s", _REDIS_URL)
        except ImportError:
            logger.warning(
                "[CacheService] 'redis' package not installed. "
                "Cache disabled — add redis>=5.0.0 to requirements.txt."
            )
        except Exception as exc:
            logger.warning(
                "[CacheService] Redis unavailable (%s). Running without cache.", exc
            )

    def close(self) -> None:
        if self._client is not None:
            try:
                self._client.close()
            except Exception:
                pass
        self._available = False
        self._client = None

    @property
    def is_available(self) -> bool:
        return self._available

    # ------------------------------------------------------------------
    # Generic primitives
    # ------------------------------------------------------------------

    def get(self, key: str) -> Any | None:
        if not self._available:
            return None
        try:
            raw = self._client.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as exc:
            logger.debug("[CacheService] GET error for key=%s: %s", key, exc)
            return None

    def set(self, key: str, value: Any, ttl: int) -> bool:
        if not self._available:
            return False
        try:
            self._client.set(key, json.dumps(value), ex=ttl)
            return True
        except Exception as exc:
            logger.debug("[CacheService] SET error for key=%s: %s", key, exc)
            return False

    def delete(self, key: str) -> bool:
        if not self._available:
            return False
        try:
            self._client.delete(key)
            return True
        except Exception as exc:
            logger.debug("[CacheService] DELETE error for key=%s: %s", key, exc)
            return False

    def flush_pattern(self, pattern: str) -> int:
        """Delete all keys matching a glob pattern.  Returns count deleted."""
        if not self._available:
            return 0
        try:
            keys = self._client.keys(pattern)
            if keys:
                return self._client.delete(*keys)
            return 0
        except Exception as exc:
            logger.debug("[CacheService] FLUSH_PATTERN error pattern=%s: %s", pattern, exc)
            return 0

    # ------------------------------------------------------------------
    # Domain helpers
    # ------------------------------------------------------------------

    # ---- Embeddings ----

    def get_embedding(self, text: str) -> list[float] | None:
        """Return cached embedding vector for *text*, or None on miss."""
        key = _make_key("embedding", text)
        return self.get(key)

    def set_embedding(self, text: str, vector: list[float]) -> bool:
        key = _make_key("embedding", text)
        return self.set(key, vector, _TTL_EMBEDDING)

    # ---- Classification results ----

    def get_classification(self, text: str) -> dict | None:
        key = _make_key("classify", text)
        return self.get(key)

    def set_classification(self, text: str, result: dict) -> bool:
        key = _make_key("classify", text)
        return self.set(key, result, _TTL_CLASSIFY)

    # ---- Duplicate-check results ----

    def get_duplicate_result(self, text: str) -> dict | None:
        key = _make_key("dup_result", text)
        return self.get(key)

    def set_duplicate_result(self, text: str, result: dict) -> bool:
        key = _make_key("dup_result", text)
        return self.set(key, result, _TTL_DUPLICATE)

    def invalidate_duplicate_cache(self) -> int:
        """
        Flush all cached duplicate results.
        Called when a new ticket is indexed so stale "no duplicate" answers
        that were cached before this ticket arrived get evicted.
        """
        pattern = f"{_KEY_PREFIX}:dup_result:*"
        evicted = self.flush_pattern(pattern)
        if evicted:
            logger.debug("[CacheService] Evicted %d stale duplicate-result entries.", evicted)
        return evicted

    # ---- Cache health ----

    def ping(self) -> bool:
        if not self._available:
            return False
        try:
            return self._client.ping()
        except Exception:
            return False


# Module-level singleton shared across all services
cache_service = CacheService()
