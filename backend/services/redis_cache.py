"""Redis cache for AI inference (classification + embeddings)."""

from __future__ import annotations

import hashlib
import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

CLASSIFICATION_PREFIX = "helpdesk:cls:"
EMBEDDING_PREFIX = "helpdesk:emb:"


def _truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def _text_key(prefix: str, text: str) -> str | None:
    if not text or not text.strip():
        return None
    digest = hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()
    return f"{prefix}{digest}"


class RedisInferenceCache:
    """Optional Redis layer for DistilBERT classifications and ST embeddings."""

    def __init__(self) -> None:
        self._client: Any | None = None
        self.enabled = _truthy(os.getenv("USE_REDIS_CACHE"))
        self.allow_degraded = _truthy(os.getenv("ALLOW_DEGRADED_STARTUP"))
        self.ttl_seconds = int(os.getenv("REDIS_CACHE_TTL_SECONDS", "3600"))

    @property
    def available(self) -> bool:
        return self.enabled and self._client is not None

    def connect(self) -> None:
        if not self.enabled:
            logger.info("[RedisCache] Disabled (USE_REDIS_CACHE=false)")
            return

        try:
            import redis

            url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
            client = redis.from_url(url, decode_responses=True, socket_connect_timeout=2)
            client.ping()
            self._client = client
            logger.info("[RedisCache] Connected")
        except Exception as error:
            self._client = None
            message = f"[RedisCache] Unavailable: {error}"
            if self.allow_degraded:
                logger.warning("%s — bypassing cache", message)
            else:
                raise RuntimeError(message) from error

    def get_classification(self, text: str) -> dict | None:
        if not self.available:
            return None
        cache_key = _text_key(CLASSIFICATION_PREFIX, text)
        if not cache_key:
            return None
        try:
            raw = self._client.get(cache_key)
            return json.loads(raw) if raw else None
        except Exception as error:
            logger.warning("[RedisCache] classification get failed: %s", error)
            return None

    def set_classification(self, text: str, payload: dict) -> None:
        if not self.available:
            return
        cache_key = _text_key(CLASSIFICATION_PREFIX, text)
        if not cache_key:
            return
        try:
            self._client.setex(
                cache_key,
                self.ttl_seconds,
                json.dumps(payload),
            )
        except Exception as error:
            logger.warning("[RedisCache] classification set failed: %s", error)

    def get_embedding(self, text: str) -> list[float] | None:
        if not self.available:
            return None
        cache_key = _text_key(EMBEDDING_PREFIX, text)
        if not cache_key:
            return None
        try:
            raw = self._client.get(cache_key)
            if not raw:
                return None
            values = json.loads(raw)
            return [float(v) for v in values]
        except Exception as error:
            logger.warning("[RedisCache] embedding get failed: %s", error)
            return None

    def set_embedding(self, text: str, embedding: list[float]) -> None:
        if not self.available:
            return
        cache_key = _text_key(EMBEDDING_PREFIX, text)
        if not cache_key:
            return
        try:
            self._client.setex(
                cache_key,
                self.ttl_seconds,
                json.dumps(embedding),
            )
        except Exception as error:
            logger.warning("[RedisCache] embedding set failed: %s", error)


redis_cache = RedisInferenceCache()
