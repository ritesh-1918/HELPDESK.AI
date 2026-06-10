"""Redis cache for AI inference (classification + embeddings)."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from typing import Any

logger = logging.getLogger(__name__)

CLASSIFICATION_PREFIX = "helpdesk:cls:"
EMBEDDING_PREFIX = "helpdesk:emb:"


def _truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def _text_key(prefix: str, text: str) -> str:
    """
    Computes an MD5 hash of the given text for use as a cache key.
    
    Raises:
        ValueError: If the input text is empty or only whitespace.
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty or whitespace.")
    digest = hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()
    return f"{prefix}{digest}"


class RedisInferenceCache:
    """Optional Redis layer for DistilBERT classifications and ST embeddings."""

    def __init__(self) -> None:
        self._client: Any | None = None
        self.enabled = _truthy(os.getenv("USE_REDIS_CACHE"))
        self.allow_degraded = _truthy(os.getenv("ALLOW_DEGRADED_STARTUP"))
        self.ttl_seconds = int(os.getenv("REDIS_CACHE_TTL_SECONDS", "3600"))
        self.socket_connect_timeout = float(os.getenv("REDIS_SOCKET_CONNECT_TIMEOUT_SECONDS", "2"))
        self.socket_timeout = float(os.getenv("REDIS_SOCKET_TIMEOUT_SECONDS", "2"))
        self.health_check_interval = int(os.getenv("REDIS_HEALTH_CHECK_INTERVAL_SECONDS", "30"))
        self.reconnect_interval = float(os.getenv("REDIS_RECONNECT_INTERVAL_SECONDS", "5"))
        self._last_connect_attempt = 0.0

    @property
    def available(self) -> bool:
        return self.enabled and self._client is not None

    def connect(self, *, raise_on_failure: bool | None = None) -> None:
        if not self.enabled:
            logger.info("[RedisCache] Disabled (USE_REDIS_CACHE=false)")
            return

        if raise_on_failure is None:
            raise_on_failure = not self.allow_degraded

        self._last_connect_attempt = time.monotonic()

        try:
            import redis

            url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
            client = redis.from_url(
                url,
                decode_responses=True,
                socket_connect_timeout=self.socket_connect_timeout,
                socket_timeout=self.socket_timeout,
                retry_on_timeout=True,
                health_check_interval=self.health_check_interval,
            )
            client.ping()
            self._client = client
            logger.info("[RedisCache] Connected")
        except Exception as error:
            self._client = None
            message = f"[RedisCache] Unavailable: {error}"
            if not raise_on_failure:
                logger.warning("%s — bypassing cache", message)
            else:
                raise RuntimeError(message) from error

    def _ensure_client(self) -> bool:
        if not self.enabled:
            return False

        if self._client is not None:
            return True

        if time.monotonic() - self._last_connect_attempt < self.reconnect_interval:
            return False

        self.connect(raise_on_failure=False)
        return self._client is not None

    def _mark_unavailable(self, operation: str, error: Exception) -> None:
        self._client = None
        logger.warning("[RedisCache] %s failed: %s — will retry on a later cache operation", operation, error)

    def get_classification(self, text: str) -> dict | None:
        """
        Retrieve a cached classification result for the given text.
        Handles empty text gracefully by returning None.
        """
        if not self._ensure_client():
            return None
            
        try:
            cache_key = _text_key(CLASSIFICATION_PREFIX, text)
        except ValueError as err:
            logger.warning("[RedisCache] %s", err)
            return None
            
        try:
            raw = self._client.get(cache_key)
            return json.loads(raw) if raw else None
        except Exception as error:
            self._mark_unavailable("classification get", error)
            return None

    def set_classification(self, text: str, payload: dict) -> None:
        """
        Cache a classification result for the given text.
        Handles empty text gracefully by returning early.
        """
        if not self._ensure_client():
            return
            
        try:
            cache_key = _text_key(CLASSIFICATION_PREFIX, text)
        except ValueError as err:
            logger.warning("[RedisCache] %s", err)
            return
            
        try:
            self._client.setex(
                cache_key,
                self.ttl_seconds,
                json.dumps(payload),
            )
        except Exception as error:
            self._mark_unavailable("classification set", error)

    def get_embedding(self, text: str) -> list[float] | None:
        """
        Retrieve a cached embedding for the given text.
        Handles empty text gracefully by returning None.
        """
        if not self._ensure_client():
            return None
            
        try:
            cache_key = _text_key(EMBEDDING_PREFIX, text)
        except ValueError as err:
            logger.warning("[RedisCache] %s", err)
            return None
            
        try:
            raw = self._client.get(cache_key)
            if not raw:
                return None
            values = json.loads(raw)
            return [float(v) for v in values]
        except Exception as error:
            self._mark_unavailable("embedding get", error)
            return None

    def set_embedding(self, text: str, embedding: list[float]) -> None:
        """
        Cache an embedding for the given text.
        Handles empty text gracefully by returning early.
        """
        if not self._ensure_client():
            return
            
        try:
            cache_key = _text_key(EMBEDDING_PREFIX, text)
        except ValueError as err:
            logger.warning("[RedisCache] %s", err)
            return
            
        try:
            self._client.setex(
                cache_key,
                self.ttl_seconds,
                json.dumps(embedding),
            )
        except Exception as error:
            self._mark_unavailable("embedding set", error)


redis_cache = RedisInferenceCache()
