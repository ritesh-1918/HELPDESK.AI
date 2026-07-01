"""
Enhanced Redis cache service with distributed features.

Adds to the base redis_cache.py:
- Batch operations for better throughput
- Cache statistics and monitoring
- Connection pooling optimization
- Circuit breaker pattern for resilience
- Distributed locking support
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import time
import threading
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from contextlib import contextmanager

logger = logging.getLogger(__name__)

CLASSIFICATION_PREFIX = "helpdesk:cls:"
EMBEDDING_PREFIX = "helpdesk:emb:"
STATS_PREFIX = "helpdesk:stats:"
LOCK_PREFIX = "helpdesk:lock:"


def _truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def _text_key(prefix: str, text: str) -> str | None:
    if not text or not text.strip():
        return None
    digest = hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()
    return f"{prefix}{digest}"


@dataclass
class CacheStats:
    """Track cache performance metrics."""
    hits: int = 0
    misses: int = 0
    errors: int = 0
    total_requests: int = 0
    avg_latency_ms: float = 0.0
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def record_hit(self, latency_ms: float) -> None:
        with self._lock:
            self.hits += 1
            self.total_requests += 1
            self._update_avg_latency(latency_ms)

    def record_miss(self) -> None:
        with self._lock:
            self.misses += 1
            self.total_requests += 1

    def record_error(self) -> None:
        with self._lock:
            self.errors += 1

    def _update_avg_latency(self, new_latency: float) -> None:
        if self.hits == 1:
            self.avg_latency_ms = new_latency
        else:
            self.avg_latency_ms = (self.avg_latency_ms * (self.hits - 1) + new_latency) / self.hits

    @property
    def hit_rate(self) -> float:
        if self.total_requests == 0:
            return 0.0
        return self.hits / self.total_requests

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hits": self.hits,
            "misses": self.misses,
            "errors": self.errors,
            "total_requests": self.total_requests,
            "hit_rate": round(self.hit_rate, 4),
            "avg_latency_ms": round(self.avg_latency_ms, 2),
        }


class DistributedRedisCache:
    """
    Enhanced distributed Redis cache with advanced features.

    Features:
    - Batch operations for improved throughput
    - Cache statistics tracking
    - Circuit breaker pattern for resilience
    - Connection pooling optimization
    - Distributed locking
    """

    def __init__(self) -> None:
        self._client: Any | None = None
        self.enabled = _truthy(os.getenv("USE_REDIS_CACHE"))
        self.allow_degraded = _truthy(os.getenv("ALLOW_DEGRADED_STARTUP"))
        self.ttl_seconds = int(os.getenv("REDIS_CACHE_TTL_SECONDS", "3600"))
        self.stats = CacheStats()
        self._circuit_open = False
        self._circuit_failures = 0
        self._circuit_threshold = int(os.getenv("REDIS_CIRCUIT_THRESHOLD", "5"))
        self._circuit_reset_time = int(os.getenv("REDIS_CIRCUIT_RESET_SECONDS", "60"))
        self._last_failure_time = 0.0

    @property
    def available(self) -> bool:
        if not self.enabled or self._client is None:
            return False
        # Circuit breaker check
        if self._circuit_open:
            if time.time() - self._last_failure_time > self._circuit_reset_time:
                self._circuit_open = False
                self._circuit_failures = 0
                logger.info("[RedisCache] Circuit breaker reset")
            else:
                return False
        return True

    def connect(self) -> None:
        if not self.enabled:
            logger.info("[RedisCache] Disabled (USE_REDIS_CACHE=false)")
            return

        try:
            import redis

            url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
            
            # Optimized connection pool settings
            pool = redis.ConnectionPool.from_url(
                url,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=3,
                socket_keepalive=True,
                health_check_interval=30,
                max_connections=50,  # Connection pool size
            )
            
            client = redis.Redis(connection_pool=pool)
            client.ping()
            self._client = client
            logger.info("[RedisCache] Connected with optimized connection pool")
        except Exception as error:
            self._client = None
            message = f"[RedisCache] Unavailable: {error}"
            if self.allow_degraded:
                logger.warning("%s — bypassing cache", message)
            else:
                raise RuntimeError(message) from error

    def _check_circuit(self) -> bool:
        """Check if circuit breaker allows operation."""
        if self._circuit_open:
            return False
        return True

    def _record_failure(self) -> None:
        """Record a failure for circuit breaker."""
        self._circuit_failures += 1
        self._last_failure_time = time.time()
        self.stats.record_error()
        
        if self._circuit_failures >= self._circuit_threshold:
            self._circuit_open = True
            logger.warning(
                f"[RedisCache] Circuit breaker opened after {self._circuit_failures} failures"
            )

    # -------------------------------------------------------------------------
    # Single operations (with stats tracking)
    # -------------------------------------------------------------------------

    def get_classification(self, text: str) -> dict | None:
        if not self.available:
            self.stats.record_miss()
            return None
        cache_key = _text_key(CLASSIFICATION_PREFIX, text)
        if not cache_key:
            self.stats.record_miss()
            return None
        
        start_time = time.time()
        try:
            raw = self._client.get(cache_key)
            if raw:
                latency = (time.time() - start_time) * 1000
                self.stats.record_hit(latency)
                return json.loads(raw)
            else:
                self.stats.record_miss()
                return None
        except Exception as error:
            logger.warning("[RedisCache] classification get failed: %s", error)
            self._record_failure()
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
            self._record_failure()

    def get_embedding(self, text: str) -> list[float] | None:
        if not self.available:
            self.stats.record_miss()
            return None
        cache_key = _text_key(EMBEDDING_PREFIX, text)
        if not cache_key:
            self.stats.record_miss()
            return None
        
        start_time = time.time()
        try:
            raw = self._client.get(cache_key)
            if raw:
                latency = (time.time() - start_time) * 1000
                self.stats.record_hit(latency)
                values = json.loads(raw)
                return [float(v) for v in values]
            else:
                self.stats.record_miss()
                return None
        except Exception as error:
            logger.warning("[RedisCache] embedding get failed: %s", error)
            self._record_failure()
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
            self._record_failure()

    # -------------------------------------------------------------------------
    # Batch operations for improved throughput
    # -------------------------------------------------------------------------

    def batch_get_classifications(self, texts: List[str]) -> List[dict | None]:
        """
        Fetch multiple classifications in a single Redis operation.
        
        Returns list of results in same order as input texts.
        """
        if not self.available or not texts:
            return [None] * len(texts)
        
        start_time = time.time()
        keys = [_text_key(CLASSIFICATION_PREFIX, text) for text in texts]
        valid_keys = [k for k in keys if k is not None]
        
        try:
            # Use pipeline for batch operations
            pipe = self._client.pipeline()
            for key in valid_keys:
                pipe.get(key)
            results = pipe.execute()
            
            # Map results back to original order
            result_map = {k: v for k, v in zip(valid_keys, results) if v}
            output = []
            for key in keys:
                if key and key in result_map:
                    latency = (time.time() - start_time) * 1000
                    self.stats.record_hit(latency)
                    output.append(json.loads(result_map[key]))
                else:
                    self.stats.record_miss()
                    output.append(None)
            
            return output
        except Exception as error:
            logger.warning("[RedisCache] batch get classifications failed: %s", error)
            self._record_failure()
            return [None] * len(texts)

    def batch_set_classifications(self, items: List[Tuple[str, dict]]) -> None:
        """
        Set multiple classifications in a single Redis operation.
        
        Args:
            items: List of (text, payload) tuples
        """
        if not self.available or not items:
            return
        
        try:
            pipe = self._client.pipeline()
            for text, payload in items:
                cache_key = _text_key(CLASSIFICATION_PREFIX, text)
                if cache_key:
                    pipe.setex(cache_key, self.ttl_seconds, json.dumps(payload))
            pipe.execute()
        except Exception as error:
            logger.warning("[RedisCache] batch set classifications failed: %s", error)
            self._record_failure()

    def batch_get_embeddings(self, texts: List[str]) -> List[list[float] | None]:
        """
        Fetch multiple embeddings in a single Redis operation.
        
        Returns list of results in same order as input texts.
        """
        if not self.available or not texts:
            return [None] * len(texts)
        
        start_time = time.time()
        keys = [_text_key(EMBEDDING_PREFIX, text) for text in texts]
        valid_keys = [k for k in keys if k is not None]
        
        try:
            pipe = self._client.pipeline()
            for key in valid_keys:
                pipe.get(key)
            results = pipe.execute()
            
            result_map = {k: v for k, v in zip(valid_keys, results) if v}
            output = []
            for key in keys:
                if key and key in result_map:
                    latency = (time.time() - start_time) * 1000
                    self.stats.record_hit(latency)
                    values = json.loads(result_map[key])
                    output.append([float(v) for v in values])
                else:
                    self.stats.record_miss()
                    output.append(None)
            
            return output
        except Exception as error:
            logger.warning("[RedisCache] batch get embeddings failed: %s", error)
            self._record_failure()
            return [None] * len(texts)

    def batch_set_embeddings(self, items: List[Tuple[str, list[float]]]) -> None:
        """
        Set multiple embeddings in a single Redis operation.
        
        Args:
            items: List of (text, embedding) tuples
        """
        if not self.available or not items:
            return
        
        try:
            pipe = self._client.pipeline()
            for text, embedding in items:
                cache_key = _text_key(EMBEDDING_PREFIX, text)
                if cache_key:
                    pipe.setex(cache_key, self.ttl_seconds, json.dumps(embedding))
            pipe.execute()
        except Exception as error:
            logger.warning("[RedisCache] batch set embeddings failed: %s", error)
            self._record_failure()

    # -------------------------------------------------------------------------
    # Cache management
    # -------------------------------------------------------------------------

    def invalidate_classification(self, text: str) -> bool:
        """Remove a specific classification from cache."""
        if not self.available:
            return False
        cache_key = _text_key(CLASSIFICATION_PREFIX, text)
        if not cache_key:
            return False
        try:
            return bool(self._client.delete(cache_key))
        except Exception as error:
            logger.warning("[RedisCache] invalidate classification failed: %s", error)
            return False

    def invalidate_embedding(self, text: str) -> bool:
        """Remove a specific embedding from cache."""
        if not self.available:
            return False
        cache_key = _text_key(EMBEDDING_PREFIX, text)
        if not cache_key:
            return False
        try:
            return bool(self._client.delete(cache_key))
        except Exception as error:
            logger.warning("[RedisCache] invalidate embedding failed: %s", error)
            return False

    def clear_all_classifications(self) -> int:
        """Remove all classification entries from cache."""
        if not self.available:
            return 0
        try:
            keys = self._client.keys(f"{CLASSIFICATION_PREFIX}*")
            if keys:
                return int(self._client.delete(*keys))
            return 0
        except Exception as error:
            logger.warning("[RedisCache] clear all classifications failed: %s", error)
            return 0

    def clear_all_embeddings(self) -> int:
        """Remove all embedding entries from cache."""
        if not self.available:
            return 0
        try:
            keys = self._client.keys(f"{EMBEDDING_PREFIX}*")
            if keys:
                return int(self._client.delete(*keys))
            return 0
        except Exception as error:
            logger.warning("[RedisCache] clear all embeddings failed: %s", error)
            return 0

    # -------------------------------------------------------------------------
    # Statistics and monitoring
    # -------------------------------------------------------------------------

    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics."""
        stats = self.stats.to_dict()
        
        # Add Redis server info if available
        if self.available:
            try:
                info = self._client.info("memory")
                stats["redis_memory_used_mb"] = round(info.get("used_memory", 0) / 1024 / 1024, 2)
                
                # Count cache entries
                cls_keys = len(self._client.keys(f"{CLASSIFICATION_PREFIX}*"))
                emb_keys = len(self._client.keys(f"{EMBEDDING_PREFIX}*"))
                stats["classification_entries"] = cls_keys
                stats["embedding_entries"] = emb_keys
            except Exception:
                pass
        
        stats["circuit_breaker_open"] = self._circuit_open
        stats["circuit_failures"] = self._circuit_failures
        
        return stats

    def reset_stats(self) -> None:
        """Reset cache statistics."""
        self.stats = CacheStats()

    # -------------------------------------------------------------------------
    # Distributed locking
    # -------------------------------------------------------------------------

    @contextmanager
    def distributed_lock(self, lock_name: str, timeout: int = 10):
        """
        Acquire a distributed lock.
        
        Usage:
            with cache.distributed_lock("my_resource") as locked:
                if locked:
                    # Do work
                    pass
        """
        if not self.available:
            yield False
            return
        
        lock_key = f"{LOCK_PREFIX}{lock_name}"
        lock_value = f"{os.getpid()}:{time.time()}"
        
        try:
            # Try to acquire lock with timeout
            acquired = self._client.set(
                lock_key,
                lock_value,
                nx=True,  # Only set if not exists
                ex=timeout,  # Auto-expire after timeout
            )
            
            yield bool(acquired)
            
            # Release lock if we acquired it
            if acquired:
                # Only delete if we still own the lock
                current_value = self._client.get(lock_key)
                if current_value == lock_value:
                    self._client.delete(lock_key)
        except Exception as error:
            logger.warning("[RedisCache] distributed lock failed: %s", error)
            yield False


# Global instance
distributed_cache = DistributedRedisCache()
