import os
import json
import hashlib
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class RedisCache:
    def __init__(self):
        self._client = None
        self._available = False
        self._local_cache: dict[str, tuple[Any, float]] = {}
        self._default_ttl = int(os.environ.get("REDIS_CACHE_TTL", "300"))

    def _connect(self):
        if self._available:
            return
        try:
            import redis.asyncio as aioredis
            redis_url = os.environ.get("REDIS_URL")
            if redis_url:
                self._client = aioredis.from_url(redis_url, decode_responses=True)
                self._available = True
                logger.info("[RedisCache] Connected to Redis")
            else:
                logger.info("[RedisCache] REDIS_URL not set, using local fallback cache")
        except ImportError:
            logger.info("[RedisCache] redis-py not installed, using local fallback cache")
        except Exception as e:
            logger.warning(f"[RedisCache] Connection failed: {e}")

    def _make_key(self, prefix: str, *parts: str) -> str:
        raw = ":".join(str(p) for p in parts)
        return f"helpdesk:{prefix}:{hashlib.sha256(raw.encode()).hexdigest()[:16]}"

    async def get(self, prefix: str, *parts: str) -> Optional[Any]:
        key = self._make_key(prefix, *parts)
        if self._available and self._client:
            try:
                raw = await self._client.get(key)
                if raw:
                    return json.loads(raw)
            except Exception:
                pass
        cached = self._local_cache.get(key)
        if cached:
            import time
            value, expires = cached
            if time.time() < expires:
                return value
            del self._local_cache[key]
        return None

    async def set(self, prefix: str, value: Any, *parts: str, ttl: Optional[int] = None):
        key = self._make_key(prefix, *parts)
        ttl = ttl if ttl is not None else self._default_ttl
        if self._available and self._client:
            try:
                await self._client.setex(key, ttl, json.dumps(value, default=str))
            except Exception:
                pass
        import time
        self._local_cache[key] = (value, time.time() + ttl)

    async def invalidate(self, prefix: str, *parts: str):
        key = self._make_key(prefix, *parts)
        self._local_cache.pop(key, None)
        if self._available and self._client:
            try:
                await self._client.delete(key)
            except Exception:
                pass

    async def invalidate_prefix(self, prefix: str):
        pattern = f"helpdesk:{prefix}:*"
        self._local_cache = {k: v for k, v in self._local_cache.items() if not k.startswith(f"helpdesk:{prefix}:")}
        if self._available and self._client:
            try:
                cursor = 0
                while True:
                    cursor, keys = await self._client.scan(cursor=cursor, match=pattern, count=100)
                    if keys:
                        await self._client.delete(*keys)
                    if cursor == 0:
                        break
            except Exception:
                pass

    @property
    def available(self) -> bool:
        return self._available


redis_cache = RedisCache()
