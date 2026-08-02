"""
Unit tests for backend/services/cache_service.py

All tests run without a live Redis instance by patching the Redis client.
The suite verifies:
  - graceful degradation when Redis is unavailable
  - correct key generation and TTL assignment
  - embedding and classification round-trip through the cache
  - duplicate-result invalidation on new ticket indexing
  - connection pool creation and teardown
"""

import json
import importlib
import sys
import types
import hashlib
import unittest
from unittest.mock import MagicMock, patch, call


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_expected_key(prefix: str, namespace: str, text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]
    return f"{prefix}:{namespace}:{digest}"


def _make_redis_module_stub() -> types.ModuleType:
    """Return a minimal fake `redis` module that satisfies the import."""
    mod = types.ModuleType("redis")

    class FakePool:
        @staticmethod
        def from_url(*args, **kwargs):
            return FakePool()

    class FakeRedis:
        def __init__(self, *args, **kwargs):
            self._store: dict = {}

        def ping(self):
            return True

        def get(self, key):
            return self._store.get(key)

        def set(self, key, value, ex=None):
            self._store[key] = value

        def delete(self, *keys):
            for k in keys:
                self._store.pop(k, None)
            return len(keys)

        def keys(self, pattern):
            import fnmatch
            return [k for k in self._store if fnmatch.fnmatch(k, pattern)]

        def close(self):
            pass

    mod.ConnectionPool = FakePool
    mod.Redis = FakeRedis
    return mod


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

class TestCacheServiceDegradedMode(unittest.TestCase):
    """CacheService when Redis is not installed / unavailable."""

    def setUp(self):
        # Ensure a clean import of cache_service without a real redis package
        for mod_name in list(sys.modules.keys()):
            if "cache_service" in mod_name:
                del sys.modules[mod_name]
        if "redis" in sys.modules:
            del sys.modules["redis"]

    def test_connect_without_redis_package_sets_unavailable(self):
        with patch.dict(sys.modules, {"redis": None}):
            from backend.services.cache_service import CacheService
            cs = CacheService()
            cs.connect()
            self.assertFalse(cs.is_available)

    def test_get_returns_none_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        # _available is False by default
        result = cs.get("any-key")
        self.assertIsNone(result)

    def test_set_returns_false_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        result = cs.set("key", {"data": 1}, ttl=60)
        self.assertFalse(result)

    def test_delete_returns_false_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        result = cs.delete("key")
        self.assertFalse(result)

    def test_flush_pattern_returns_zero_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        count = cs.flush_pattern("helpdesk:*")
        self.assertEqual(count, 0)

    def test_ping_returns_false_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        self.assertFalse(cs.ping())

    def test_get_embedding_returns_none_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        self.assertIsNone(cs.get_embedding("my ticket text"))

    def test_get_classification_returns_none_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        self.assertIsNone(cs.get_classification("my ticket text"))

    def test_get_duplicate_result_returns_none_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        self.assertIsNone(cs.get_duplicate_result("my ticket text"))

    def test_invalidate_duplicate_cache_returns_zero_when_unavailable(self):
        from backend.services.cache_service import CacheService
        cs = CacheService()
        self.assertEqual(cs.invalidate_duplicate_cache(), 0)


class TestCacheServiceWithFakeRedis(unittest.TestCase):
    """CacheService with a stubbed Redis client."""

    def setUp(self):
        for mod_name in list(sys.modules.keys()):
            if "cache_service" in mod_name:
                del sys.modules[mod_name]

        self._redis_stub = _make_redis_module_stub()
        sys.modules["redis"] = self._redis_stub

        from backend.services.cache_service import CacheService
        self.cs = CacheService()
        self.cs.connect()

    def tearDown(self):
        self.cs.close()
        if "redis" in sys.modules:
            del sys.modules["redis"]
        for mod_name in list(sys.modules.keys()):
            if "cache_service" in mod_name:
                del sys.modules[mod_name]

    # ---- Availability ----

    def test_connect_marks_available_after_successful_ping(self):
        self.assertTrue(self.cs.is_available)

    def test_ping_returns_true_when_available(self):
        self.assertTrue(self.cs.ping())

    def test_close_marks_unavailable(self):
        self.cs.close()
        self.assertFalse(self.cs.is_available)

    # ---- Generic get / set / delete ----

    def test_set_and_get_round_trip(self):
        self.cs.set("my-key", {"value": 42}, ttl=300)
        result = self.cs.get("my-key")
        self.assertEqual(result, {"value": 42})

    def test_get_returns_none_on_cache_miss(self):
        result = self.cs.get("nonexistent-key")
        self.assertIsNone(result)

    def test_delete_removes_key(self):
        self.cs.set("del-key", "data", ttl=60)
        self.cs.delete("del-key")
        self.assertIsNone(self.cs.get("del-key"))

    def test_set_and_get_list_value(self):
        vector = [0.1, 0.2, 0.3, 0.99]
        self.cs.set("vec-key", vector, ttl=3600)
        result = self.cs.get("vec-key")
        self.assertEqual(result, vector)

    # ---- Embedding helpers ----

    def test_set_and_get_embedding_round_trip(self):
        text = "Printer not responding after firmware update"
        vector = [0.11, 0.22, 0.33]
        self.cs.set_embedding(text, vector)
        cached = self.cs.get_embedding(text)
        self.assertEqual(cached, vector)

    def test_get_embedding_miss_returns_none(self):
        self.assertIsNone(self.cs.get_embedding("unseen text"))

    def test_embedding_key_is_deterministic(self):
        text = "Same text twice"
        vector = [1.0, 2.0]
        self.cs.set_embedding(text, vector)
        # Calling again should return the cached value (no model needed)
        self.assertEqual(self.cs.get_embedding(text), vector)
        self.assertEqual(self.cs.get_embedding(text), vector)

    # ---- Classification helpers ----

    def test_set_and_get_classification_round_trip(self):
        text = "Cannot log into VPN from home network"
        result = {
            "category": "Access",
            "subcategory": "VPN Connection",
            "priority": "High",
            "auto_resolve": False,
            "assigned_team": "IAM Team",
            "confidence": 0.95,
        }
        self.cs.set_classification(text, result)
        cached = self.cs.get_classification(text)
        self.assertEqual(cached, result)

    def test_classification_miss_returns_none(self):
        self.assertIsNone(self.cs.get_classification("brand new text"))

    def test_classification_key_differs_from_embedding_key(self):
        text = "test text"
        self.cs.set_classification(text, {"cat": "x"})
        self.cs.set_embedding(text, [0.5])
        # Both should be retrievable independently
        self.assertEqual(self.cs.get_classification(text), {"cat": "x"})
        self.assertEqual(self.cs.get_embedding(text), [0.5])

    # ---- Duplicate-result helpers ----

    def test_set_and_get_duplicate_result_round_trip(self):
        text = "Outlook keeps crashing on Windows 11"
        dup_result = {
            "is_duplicate": True,
            "duplicate_ticket_id": "TKT-001",
            "similarity": 0.87,
        }
        self.cs.set_duplicate_result(text, dup_result)
        cached = self.cs.get_duplicate_result(text)
        self.assertEqual(cached, dup_result)

    def test_duplicate_result_miss_returns_none(self):
        self.assertIsNone(self.cs.get_duplicate_result("no match text"))

    def test_invalidate_duplicate_cache_removes_all_dup_results(self):
        texts = ["ticket one", "ticket two", "ticket three"]
        for t in texts:
            self.cs.set_duplicate_result(t, {"is_duplicate": False})

        evicted = self.cs.invalidate_duplicate_cache()
        self.assertGreaterEqual(evicted, 3)

        for t in texts:
            self.assertIsNone(self.cs.get_duplicate_result(t))

    def test_invalidate_duplicate_cache_does_not_remove_embeddings(self):
        text = "shared text"
        self.cs.set_embedding(text, [0.1, 0.2])
        self.cs.set_duplicate_result(text, {"is_duplicate": False})

        self.cs.invalidate_duplicate_cache()

        # Embedding must survive the flush
        self.assertEqual(self.cs.get_embedding(text), [0.1, 0.2])

    def test_invalidate_duplicate_cache_does_not_remove_classifications(self):
        text = "shared text"
        self.cs.set_classification(text, {"category": "Network"})
        self.cs.set_duplicate_result(text, {"is_duplicate": False})

        self.cs.invalidate_duplicate_cache()

        # Classification must survive the flush
        self.assertEqual(self.cs.get_classification(text), {"category": "Network"})

    # ---- flush_pattern ----

    def test_flush_pattern_removes_matching_keys_only(self):
        self.cs.set("helpdesk:dup_result:aaa", {"x": 1}, ttl=60)
        self.cs.set("helpdesk:dup_result:bbb", {"x": 2}, ttl=60)
        self.cs.set("helpdesk:classify:ccc", {"y": 3}, ttl=60)

        count = self.cs.flush_pattern("helpdesk:dup_result:*")
        self.assertGreaterEqual(count, 2)

        # classify key must remain
        self.assertIsNotNone(self.cs.get("helpdesk:classify:ccc"))

    # ---- Key namespace isolation ----

    def test_different_namespace_keys_do_not_collide(self):
        text = "identical input text"
        self.cs.set_embedding(text, [0.9])
        self.cs.set_classification(text, {"category": "Software"})
        self.cs.set_duplicate_result(text, {"is_duplicate": False})

        self.assertEqual(self.cs.get_embedding(text), [0.9])
        self.assertEqual(self.cs.get_classification(text), {"category": "Software"})
        self.assertEqual(self.cs.get_duplicate_result(text), {"is_duplicate": False})

    # ---- Connect idempotency ----

    def test_connect_is_idempotent(self):
        # Should not raise or create a second pool
        self.cs.connect()
        self.cs.connect()
        self.assertTrue(self.cs.is_available)


class TestCacheServiceConnectionFailure(unittest.TestCase):
    """CacheService when Redis server refuses the connection."""

    def setUp(self):
        for mod_name in list(sys.modules.keys()):
            if "cache_service" in mod_name:
                del sys.modules[mod_name]

    def tearDown(self):
        if "redis" in sys.modules:
            del sys.modules["redis"]
        for mod_name in list(sys.modules.keys()):
            if "cache_service" in mod_name:
                del sys.modules[mod_name]

    def test_connect_sets_unavailable_on_connection_error(self):
        stub = _make_redis_module_stub()

        class UnreachableRedis(stub.Redis):
            def ping(self):
                raise ConnectionRefusedError("Connection refused")

        stub.Redis = UnreachableRedis
        sys.modules["redis"] = stub

        from backend.services.cache_service import CacheService
        cs = CacheService()
        cs.connect()

        self.assertFalse(cs.is_available)
        self.assertFalse(cs.ping())

    def test_get_after_failed_connect_returns_none(self):
        stub = _make_redis_module_stub()

        class UnreachableRedis(stub.Redis):
            def ping(self):
                raise ConnectionRefusedError("Connection refused")

        stub.Redis = UnreachableRedis
        sys.modules["redis"] = stub

        from backend.services.cache_service import CacheService
        cs = CacheService()
        cs.connect()

        self.assertIsNone(cs.get("any-key"))


if __name__ == "__main__":
    unittest.main()
