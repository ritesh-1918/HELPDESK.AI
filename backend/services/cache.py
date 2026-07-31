"""
Generic TTL cache layer.

Backed by Redis when REDIS_URL is configured (see backend/requirements.txt),
with an in-process TTL fallback so the application keeps working on hosts
without Redis.
"""

import json
import os
import threading
import time

try:
    import redis  # type: ignore

    _REDIS_AVAILABLE = True
except Exception:  # pragma: no cover - redis is optional
    redis = None
    _REDIS_AVAILABLE = False


class CacheLayer:
    def __init__(self, prefix: str = "helpdesk", default_ttl: int = 300):
        self._prefix = prefix
        self._default_ttl = default_ttl
        self._memory: dict = {}
        self._lock = threading.Lock()
        self._redis = None
        self._connect_redis()

    def _connect_redis(self):
        if not _REDIS_AVAILABLE:
            return
        url = os.environ.get("REDIS_URL")
        if not url:
            return
        try:
            client = redis.from_url(
                url,
                decode_responses=True,
                socket_connect_timeout=1,
                socket_timeout=1,
            )
            client.ping()
            self._redis = client
            print(f"[CacheLayer] Redis connected: {url.split('@')[-1]}")
        except Exception as exc:
            self._redis = None
            print(f"[CacheLayer] Redis unavailable, falling back to in-memory cache: {exc}")

    def is_redis_enabled(self) -> bool:
        return self._redis is not None

    def _key(self, key: str) -> str:
        return f"{self._prefix}:{key}"

    def get(self, key: str):
        rk = self._key(key)
        if self._redis:
            try:
                raw = self._redis.get(rk)
                if raw is None:
                    return None
                return json.loads(raw)
            except Exception:
                pass
        with self._lock:
            item = self._memory.get(rk)
            if item is None:
                return None
            value, expires_at = item
            if expires_at is not None and time.monotonic() > expires_at:
                self._memory.pop(rk, None)
                return None
            return value

    def set(self, key: str, value, ttl: int | None = None) -> None:
        rk = self._key(key)
        ttl_seconds = self._default_ttl if ttl is None else int(ttl)
        if self._redis:
            try:
                self._redis.setex(rk, ttl_seconds, json.dumps(value))
                return
            except Exception:
                pass
        with self._lock:
            self._memory[rk] = (value, time.monotonic() + ttl_seconds)

    def delete(self, key: str) -> None:
        rk = self._key(key)
        if self._redis:
            try:
                self._redis.delete(rk)
            except Exception:
                pass
        with self._lock:
            self._memory.pop(rk, None)

    def delete_prefix(self, prefix: str) -> None:
        rp = f"{self._prefix}:{prefix}"
        if self._redis:
            try:
                for rk in self._redis.scan_iter(match=f"{rp}*"):
                    self._redis.delete(rk)
            except Exception:
                pass
        with self._lock:
            stale = [rk for rk in self._memory if rk.startswith(rp)]
            for rk in stale:
                self._memory.pop(rk, None)
