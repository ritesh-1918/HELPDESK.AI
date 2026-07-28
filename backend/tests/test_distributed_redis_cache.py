"""
Comprehensive tests for distributed Redis caching layer (Issue #1379).

Tests:
- Basic cache operations (get/set classification and embedding)
- Batch operations for improved throughput
- Cache statistics and monitoring
- Circuit breaker pattern
- Connection pooling
- Distributed locking
- Concurrency scenarios
- Performance benchmarks
"""

from __future__ import annotations

import os
import sys
import time
import json
import threading
import pytest
from unittest.mock import MagicMock, patch
from typing import Dict, Any, List, Tuple, Optional

# Setup path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Mock redis module
import types

redis_mod = types.ModuleType("redis")


class MockRedisClient:
    """Mock Redis client for testing."""

    def __init__(self):
        self._store: Dict[str, Any] = {}
        self._ttls: Dict[str, int] = {}
        self._calls = 0

    def get(self, key: str) -> str | None:
        self._calls += 1
        return self._store.get(key)

    def set(self, key: str, value: str, ex: int | None = None, nx: bool = False) -> bool:
        self._calls += 1
        if nx and key in self._store:
            return False
        self._store[key] = value
        if ex is not None:
            self._ttls[key] = ex
        return True

    def setex(self, key: str, ttl: int, value: str) -> bool:
        self._calls += 1
        self._store[key] = value
        self._ttls[key] = ttl
        return True

    def delete(self, *keys) -> int:
        self._calls += 1
        count = 0
        for key in keys:
            if key in self._store:
                del self._store[key]
                self._ttls.pop(key, None)
                count += 1
        return count

    def keys(self, pattern: str = "*") -> list:
        import fnmatch
        return [k for k in self._store.keys() if fnmatch.fnmatch(k, pattern)]

    def ping(self) -> bool:
        return True

    def pipeline(self):
        return MockPipeline(self)

    def info(self, section: str = "memory") -> Dict[str, Any]:
        return {
            "used_memory": len(json.dumps(self._store).encode()) + 1024,
        }

    @property
    def call_count(self) -> int:
        return self._calls


class MockPipeline:
    """Mock Redis pipeline for batch operations."""

    def __init__(self, client: MockRedisClient):
        self._client = client
        self._commands = []

    def get(self, key: str):
        self._commands.append(("get", key))
        return self

    def set(self, key: str, value: str, **kwargs):
        self._commands.append(("set", key, value, kwargs))
        return self

    def setex(self, key: str, ttl: int, value: str):
        self._commands.append(("setex", key, ttl, value))
        return self

    def execute(self) -> list:
        results = []
        for cmd in self._commands:
            if cmd[0] == "get":
                results.append(self._client.get(cmd[1]))
            elif cmd[0] == "set":
                results.append(self._client.set(cmd[1], cmd[2], **cmd[3]))
            elif cmd[0] == "setex":
                results.append(self._client.setex(cmd[1], cmd[2], cmd[3]))
        self._commands = []
        return results


class MockConnectionPool:
    @staticmethod
    def from_url(*args, **kwargs):
        return MockConnectionPool()

    @staticmethod
    def Redis(connection_pool=None):
        return MockRedisClient()


class MockRedisModule:
    Redis = MockRedisClient
    ConnectionPool = MockConnectionPool

    @staticmethod
    def Redis(**kwargs):
        return MockRedisClient()


sys.modules["redis"] = MockRedisModule

# Import the service
from backend.services.distributed_redis_cache import (
    DistributedRedisCache,
    CacheStats,
    CLASSIFICATION_PREFIX,
    EMBEDDING_PREFIX,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def cache():
    """Create a fresh cache instance with mock Redis."""
    os.environ["USE_REDIS_CACHE"] = "1"
    os.environ["ALLOW_DEGRADED_STARTUP"] = "1"
    
    c = DistributedRedisCache()
    c._client = MockRedisClient()
    c.enabled = True
    return c


@pytest.fixture
def sample_classification():
    return {
        "category": "Hardware",
        "subcategory": "Monitor Problem",
        "priority": "Low",
        "confidence": 0.95,
        "assigned_team": "Hardware Support",
    }


@pytest.fixture
def sample_embedding():
    return [0.1] * 384  # Standard 384-dim embedding


# ---------------------------------------------------------------------------
# Basic Operations Tests
# ---------------------------------------------------------------------------


class TestBasicOperations:
    """Test basic get/set operations."""

    def test_get_classification_miss(self, cache):
        result = cache.get_classification("unknown text")
        assert result is None

    def test_set_and_get_classification(self, cache, sample_classification):
        text = "monitor not working"
        cache.set_classification(text, sample_classification)
        result = cache.get_classification(text)
        assert result == sample_classification

    def test_get_embedding_miss(self, cache):
        result = cache.get_embedding("unknown text")
        assert result is None

    def test_set_and_get_embedding(self, cache, sample_embedding):
        text = "monitor not working"
        cache.set_embedding(text, sample_embedding)
        result = cache.get_embedding(text)
        assert result == sample_embedding
        assert len(result) == 384

    def test_empty_text_returns_none(self, cache):
        assert cache.get_classification("") is None
        assert cache.get_embedding("") is None

    def test_whitespace_text_returns_none(self, cache):
        assert cache.get_classification("   ") is None
        assert cache.get_embedding("   ") is None


# ---------------------------------------------------------------------------
# Batch Operations Tests
# ---------------------------------------------------------------------------


class TestBatchOperations:
    """Test batch operations for improved throughput."""

    def test_batch_get_classifications_empty(self, cache):
        results = cache.batch_get_classifications([])
        assert results == []

    def test_batch_get_classifications_all_miss(self, cache):
        texts = ["text1", "text2", "text3"]
        results = cache.batch_get_classifications(texts)
        assert len(results) == 3
        assert all(r is None for r in results)

    def test_batch_set_and_get_classifications(self, cache, sample_classification):
        items = [
            ("text1", {**sample_classification, "category": "Hardware"}),
            ("text2", {**sample_classification, "category": "Software"}),
            ("text3", {**sample_classification, "category": "Network"}),
        ]
        
        cache.batch_set_classifications(items)
        
        texts = [item[0] for item in items]
        results = cache.batch_get_classifications(texts)
        
        assert len(results) == 3
        assert results[0]["category"] == "Hardware"
        assert results[1]["category"] == "Software"
        assert results[2]["category"] == "Network"

    def test_batch_get_embeddings_empty(self, cache):
        results = cache.batch_get_embeddings([])
        assert results == []

    def test_batch_set_and_get_embeddings(self, cache, sample_embedding):
        items = [
            ("text1", [0.1] * 384),
            ("text2", [0.2] * 384),
            ("text3", [0.3] * 384),
        ]
        
        cache.batch_set_embeddings(items)
        
        texts = [item[0] for item in items]
        results = cache.batch_get_embeddings(texts)
        
        assert len(results) == 3
        assert results[0] == [0.1] * 384
        assert results[1] == [0.2] * 384
        assert results[2] == [0.3] * 384


# ---------------------------------------------------------------------------
# Cache Statistics Tests
# ---------------------------------------------------------------------------


class TestCacheStatistics:
    """Test cache statistics tracking."""

    def test_initial_stats(self, cache):
        stats = cache.get_stats()
        assert stats["hits"] == 0
        assert stats["misses"] == 0
        assert stats["total_requests"] == 0
        assert stats["hit_rate"] == 0.0

    def test_stats_track_hits(self, cache, sample_classification):
        cache.set_classification("test", sample_classification)
        cache.get_classification("test")
        
        stats = cache.get_stats()
        assert stats["hits"] == 1
        assert stats["total_requests"] == 1
        assert stats["hit_rate"] == 1.0

    def test_stats_track_misses(self, cache):
        cache.get_classification("unknown")
        
        stats = cache.get_stats()
        assert stats["misses"] == 1
        assert stats["total_requests"] == 1
        assert stats["hit_rate"] == 0.0

    def test_stats_hit_rate_calculation(self, cache, sample_classification):
        cache.set_classification("test1", sample_classification)
        cache.get_classification("test1")  # hit
        cache.get_classification("test2")  # miss
        cache.get_classification("test1")  # hit
        
        stats = cache.get_stats()
        assert stats["hits"] == 2
        assert stats["misses"] == 1
        assert stats["total_requests"] == 3
        assert 0.66 < stats["hit_rate"] < 0.67

    def test_reset_stats(self, cache, sample_classification):
        cache.set_classification("test", sample_classification)
        cache.get_classification("test")
        
        cache.reset_stats()
        stats = cache.get_stats()
        assert stats["hits"] == 0
        assert stats["misses"] == 0

    def test_stats_include_redis_info(self, cache, sample_classification):
        cache.set_classification("test", sample_classification)
        stats = cache.get_stats()
        assert "redis_memory_used_mb" in stats
        assert "classification_entries" in stats
        assert "embedding_entries" in stats


# ---------------------------------------------------------------------------
# Circuit Breaker Tests
# ---------------------------------------------------------------------------


class TestCircuitBreaker:
    """Test circuit breaker pattern."""

    def test_circuit_starts_closed(self, cache):
        assert not cache._circuit_open
        assert cache._circuit_failures == 0

    def test_circuit_opens_after_threshold(self, cache):
        # Simulate failures
        for _ in range(5):
            cache._record_failure()
        
        assert cache._circuit_open
        assert cache._circuit_failures == 5

    def test_circuit_prevents_operations_when_open(self, cache, sample_classification):
        cache._circuit_open = True
        cache._last_failure_time = time.time()
        
        result = cache.get_classification("test")
        assert result is None
        assert cache.stats.misses == 1

    def test_circuit_resets_after_timeout(self, cache):
        cache._circuit_open = True
        cache._circuit_failures = 5
        cache._last_failure_time = time.time() - 61  # Past reset time
        
        # Next operation should reset circuit
        assert cache.available

    def test_circuit_tracks_errors(self, cache):
        cache._record_failure()
        cache._record_failure()
        
        assert cache.stats.errors == 2


# ---------------------------------------------------------------------------
# Cache Management Tests
# ---------------------------------------------------------------------------


class TestCacheManagement:
    """Test cache invalidation and clearing."""

    def test_invalidate_classification(self, cache, sample_classification):
        cache.set_classification("test", sample_classification)
        assert cache.get_classification("test") is not None
        
        result = cache.invalidate_classification("test")
        assert result is True
        assert cache.get_classification("test") is None

    def test_invalidate_nonexistent_returns_false(self, cache):
        result = cache.invalidate_classification("nonexistent")
        assert result is False

    def test_invalidate_embedding(self, cache, sample_embedding):
        cache.set_embedding("test", sample_embedding)
        assert cache.get_embedding("test") is not None
        
        result = cache.invalidate_embedding("test")
        assert result is True
        assert cache.get_embedding("test") is None

    def test_clear_all_classifications(self, cache, sample_classification):
        cache.set_classification("test1", sample_classification)
        cache.set_classification("test2", sample_classification)
        cache.set_classification("test3", sample_classification)
        
        count = cache.clear_all_classifications()
        assert count == 3
        
        assert cache.get_classification("test1") is None
        assert cache.get_classification("test2") is None
        assert cache.get_classification("test3") is None

    def test_clear_all_embeddings(self, cache, sample_embedding):
        cache.set_embedding("test1", sample_embedding)
        cache.set_embedding("test2", sample_embedding)
        
        count = cache.clear_all_embeddings()
        assert count == 2
        
        assert cache.get_embedding("test1") is None
        assert cache.get_embedding("test2") is None


# ---------------------------------------------------------------------------
# Distributed Locking Tests
# ---------------------------------------------------------------------------


class TestDistributedLocking:
    """Test distributed locking."""

    def test_acquire_lock(self, cache):
        with cache.distributed_lock("test_resource") as locked:
            assert locked is True

    def test_lock_prevents_concurrent_access(self, cache):
        results = []
        
        def worker1():
            with cache.distributed_lock("shared", timeout=2) as locked:
                if locked:
                    results.append("worker1")
                    time.sleep(0.5)
        
        def worker2():
            time.sleep(0.1)  # Start after worker1
            with cache.distributed_lock("shared", timeout=2) as locked:
                if locked:
                    results.append("worker2")
        
        t1 = threading.Thread(target=worker1)
        t2 = threading.Thread(target=worker2)
        
        t1.start()
        t2.start()
        t1.join()
        t2.join()
        
        # Only one worker should have acquired the lock
        assert len(results) == 1

    def test_lock_released_after_context(self, cache):
        with cache.distributed_lock("test") as locked:
            assert locked is True
        
        # Lock should be released now
        with cache.distributed_lock("test") as locked:
            assert locked is True

    def test_lock_auto_expires(self, cache):
        # Manually set a lock with short timeout
        cache._client.set("helpdesk:lock:test", "value", ex=1)
        
        # Wait for expiration
        time.sleep(1.5)
        
        # Should be able to acquire now
        with cache.distributed_lock("test", timeout=5) as locked:
            assert locked is True


# ---------------------------------------------------------------------------
# Concurrency Tests
# ---------------------------------------------------------------------------


class TestConcurrency:
    """Test cache behavior under concurrent access."""

    def test_concurrent_reads(self, cache, sample_classification):
        # Set up some data
        for i in range(10):
            cache.set_classification(f"text{i}", sample_classification)
        
        results = []
        
        def reader(text):
            result = cache.get_classification(text)
            results.append(result)
        
        threads = []
        for i in range(10):
            t = threading.Thread(target=reader, args=(f"text{i}",))
            threads.append(t)
            t.start()
        
        for t in threads:
            t.join()
        
        assert len(results) == 10
        assert all(r == sample_classification for r in results)

    def test_concurrent_writes(self, cache, sample_classification):
        def writer(i):
            cache.set_classification(f"text{i}", sample_classification)
        
        threads = []
        for i in range(10):
            t = threading.Thread(target=writer, args=(i,))
            threads.append(t)
            t.start()
        
        for t in threads:
            t.join()
        
        # Verify all writes succeeded
        for i in range(10):
            result = cache.get_classification(f"text{i}")
            assert result == sample_classification

    def test_stats_thread_safe(self, cache, sample_classification):
        cache.set_classification("test", sample_classification)
        
        def worker():
            for _ in range(100):
                cache.get_classification("test")
        
        threads = []
        for _ in range(5):
            t = threading.Thread(target=worker)
            threads.append(t)
            t.start()
        
        for t in threads:
            t.join()
        
        stats = cache.get_stats()
        assert stats["hits"] == 500
        assert stats["total_requests"] == 500


# ---------------------------------------------------------------------------
# Performance Benchmarks
# ---------------------------------------------------------------------------


class TestPerformanceBenchmarks:
    """Benchmark cache performance under load."""

    def test_single_vs_batch_operations(self, cache, sample_classification):
        """Compare single vs batch operations performance."""
        texts = [f"text{i}" for i in range(100)]
        items = [(text, sample_classification) for text in texts]
        
        # Batch set
        start = time.time()
        cache.batch_set_classifications(items)
        batch_set_time = time.time() - start
        
        # Single sets
        cache.clear_all_classifications()
        start = time.time()
        for text, payload in items:
            cache.set_classification(text, payload)
        single_set_time = time.time() - start
        
        print(f"\n[Performance Benchmark]")
        print(f"  Single set (100 items): {single_set_time*1000:.2f}ms")
        print(f"  Batch set (100 items):  {batch_set_time*1000:.2f}ms")
        print(f"  Speedup: {single_set_time/batch_set_time:.2f}x")
        
        # Batch should be faster
        assert batch_set_time < single_set_time

    def test_batch_get_performance(self, cache, sample_classification):
        """Benchmark batch get operations."""
        texts = [f"text{i}" for i in range(100)]
        items = [(text, sample_classification) for text in texts]
        
        cache.batch_set_classifications(items)
        
        # Batch get
        start = time.time()
        results = cache.batch_get_classifications(texts)
        batch_time = time.time() - start
        
        # Single gets
        start = time.time()
        single_results = []
        for text in texts:
            single_results.append(cache.get_classification(text))
        single_time = time.time() - start
        
        print(f"\n[Batch Get Performance]")
        print(f"  Single get (100 items): {single_time*1000:.2f}ms")
        print(f"  Batch get (100 items):  {batch_time*1000:.2f}ms")
        print(f"  Speedup: {single_time/batch_time:.2f}x")
        
        assert len(results) == 100
        assert all(r == sample_classification for r in results)


# ---------------------------------------------------------------------------
# Integration Tests
# ---------------------------------------------------------------------------


class TestIntegration:
    """Integration tests for real-world scenarios."""

    def test_cache_workflow(self, cache, sample_classification, sample_embedding):
        """Test complete cache workflow."""
        text = "user cannot login"
        
        # 1. Cache miss
        assert cache.get_classification(text) is None
        assert cache.get_embedding(text) is None
        
        # 2. Cache set
        cache.set_classification(text, sample_classification)
        cache.set_embedding(text, sample_embedding)
        
        # 3. Cache hit
        cls_result = cache.get_classification(text)
        emb_result = cache.get_embedding(text)
        
        assert cls_result == sample_classification
        assert emb_result == sample_embedding
        
        # 4. Check stats
        stats = cache.get_stats()
        assert stats["hits"] == 2
        assert stats["misses"] == 2
        assert stats["hit_rate"] == 0.5
        
        # 5. Invalidate
        cache.invalidate_classification(text)
        assert cache.get_classification(text) is None
        
        # 6. Embedding still cached
        assert cache.get_embedding(text) is not None

    def test_batch_cache_workflow(self, cache, sample_classification):
        """Test batch cache workflow."""
        texts = [f"ticket{i}" for i in range(5)]
        items = [(text, sample_classification) for text in texts]
        
        # Batch set
        cache.batch_set_classifications(items)
        
        # Batch get
        results = cache.batch_get_classifications(texts)
        assert all(r is not None for r in results)
        
        # Verify stats
        stats = cache.get_stats()
        assert stats["hits"] == 5
        assert stats["classification_entries"] == 5


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
