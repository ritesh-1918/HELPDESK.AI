"""
Redis Cache Service — Distributed caching layer for AI inference and embeddings.

Provides a thin wrapper around redis-py with graceful degradation when Redis is
unavailable. Controlled by the ``USE_REDIS_CACHE`` env toggle. When disabled or
unreachable, all operations become no-ops so the server keeps running (honors
``ALLOW_DEGRADED_STARTUP``).
"""

import os
import json
import hashlib
import pickle
import base64

DEFAULT_TTL = int(os.getenv("REDIS_CACHE_TTL", "3600"))  # 1 hour
CLASSIFIER_PREFIX = "helpdesk:classifier:"
EMBEDDING_PREFIX = "helpdesk:embedding:"


def text_hash(text: str) -> str:
    """MD5 hash of ticket text — used as the cache key."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()


class RedisCacheService:
    def __init__(self):
        self.client = None
        self.enabled = False
        self._initialized = False

    def load(self):
        """Connect to Redis if USE_REDIS_CACHE=True. Never raises."""
        if self._initialized:
            return
        self._initialized = True

        if os.getenv("USE_REDIS_CACHE", "False").lower() not in ("true", "1", "yes"):
            print("[RedisCache] Disabled (USE_REDIS_CACHE != True).")
            return

        try:
            import redis  # type: ignore
        except ImportError:
            print("[RedisCache] redis-py not installed — caching disabled.")
            return

        url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.client = redis.Redis.from_url(url, socket_connect_timeout=2, socket_timeout=2)
            self.client.ping()
            self.enabled = True
            print(f"[RedisCache] Connected to {url}.")
        except Exception as e:
            self.client = None
            self.enabled = False
            allow_degraded = os.getenv("ALLOW_DEGRADED_STARTUP", "True").lower() in ("true", "1", "yes")
            msg = f"[RedisCache] Connection failed ({e}). Running without cache."
            if not allow_degraded:
                raise RuntimeError(msg)
            print(msg)

    # ---- JSON helpers (for classifier output) ----
    def get_json(self, key: str):
        if not self.enabled or self.client is None:
            return None
        try:
            raw = self.client.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as e:
            print(f"[RedisCache] get_json failed: {e}")
            return None

    def set_json(self, key: str, value, ttl: int = DEFAULT_TTL):
        if not self.enabled or self.client is None:
            return
        try:
            self.client.setex(key, ttl, json.dumps(value))
        except Exception as e:
            print(f"[RedisCache] set_json failed: {e}")

    # ---- Pickle helpers (for tensor embeddings) ----
    def get_pickle(self, key: str):
        if not self.enabled or self.client is None:
            return None
        try:
            raw = self.client.get(key)
            if raw is None:
                return None
            return pickle.loads(base64.b64decode(raw))
        except Exception as e:
            print(f"[RedisCache] get_pickle failed: {e}")
            return None

    def set_pickle(self, key: str, value, ttl: int = DEFAULT_TTL):
        if not self.enabled or self.client is None:
            return
        try:
            payload = base64.b64encode(pickle.dumps(value))
            self.client.setex(key, ttl, payload)
        except Exception as e:
            print(f"[RedisCache] set_pickle failed: {e}")


# Module-level singleton
redis_cache = RedisCacheService()
