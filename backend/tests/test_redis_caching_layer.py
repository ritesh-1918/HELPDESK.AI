"""
Test suite for Redis caching layer (Issue #1164).

Tests backend/services/cache_service.py:
- get/set/delete operations
- TTL handling
- cache miss returns None
- cache hit returns value
- key formatting (_make_key)
"""

import sys
import os
import json
import hashlib
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Stub redis module to prevent connection errors
import types

redis_mod = types.ModuleType("redis")


class FakeRedisClient:
    """In-memory Redis stub for testing."""

    def __init__(self):
        self._store = {}
        self._ttls = {}

    def get(self, key):
        return self._store.get(key)

    def set(self, key, value, ex=None):
        self._store[key] = value
        if ex is not None:
            self._ttls[key] = ex
        return True

    def delete(self, *keys):
        count = 0
        for key in keys:
            if key in self._store:
                del self._store[key]
                self._ttls.pop(key, None)
                count += 1
        return count

    def keys(self, pattern="*"):
        import fnmatch
        return [k for k in self._store.keys() if fnmatch.fnmatch(k, pattern)]

    def ping(self):
        return True


class FakeConnectionPool:
    @staticmethod
    def from_url(*args, **kwargs):
        return FakeConnectionPool()


class FakeRedisModule:
    Redis = MagicMock()
    ConnectionPool = FakeConnectionPool

    @staticmethod
    def Redis(connection_pool=None):
        return FakeRedisClient()


sys.modules["redis"] = FakeRedisModule


# Now import cache_service
from backend.services.cache_service import CacheService, _make_key, _KEY_PREFIX


# ---------------------------------------------------------------------------
# _make_key tests
# ---------------------------------------------------------------------------

class TestMakeKey:
    def test_key_starts_with_prefix(self):
        key = _make_key("test", "some_value")
        assert key.startswith(_KEY_PREFIX)

    def test_key_contains_namespace(self):
        key = _make_key("embedding", "some_text")
        assert "embedding" in key

    def test_key_format_has_three_parts(self):
        key = _make_key("classify", "text")
        parts = key.split(":")
        assert len(parts) == 3

    def test_different_values_produce_different_keys(self):
        key1 = _make_key("embedding", "text one")
        key2 = _make_key("embedding", "text two")
        assert key1 != key2

    def test_same_value_produces_same_key(self):
        key1 = _make_key("embedding", "consistent_text")
        key2 = _make_key("embedding", "consistent_text")
        assert key1 == key2

    def test_different_namespaces_produce_different_keys(self):
        key1 = _make_key("ns1", "text")
        key2 = _make_key("ns2", "text")
        assert key1 != key2

    def test_key_is_string(self):
        key = _make_key("embedding", "test")
        assert isinstance(key, str)

    def test_hash_portion_is_24_chars(self):
        key = _make_key("embedding", "test")
        hash_part = key.split(":")[-1]
        assert len(hash_part) == 24


# ---------------------------------------------------------------------------
# CacheService.get() tests
# ---------------------------------------------------------------------------

class TestCacheServiceGet:
    def _make_available_service(self):
        svc = CacheService()
        svc._client = FakeRedisClient()
        svc._available = True
        return svc

    def test_get_returns_none_when_not_available(self):
        svc = CacheService()
        svc._available = False
        result = svc.get("any_key")
        assert result is None

    def test_get_returns_none_on_cache_miss(self):
        svc = self._make_available_service()
        result = svc.get("nonexistent_key")
        assert result is None

    def test_get_returns_value_on_cache_hit(self):
        svc = self._make_available_service()
        value = {"category": "Network", "priority": "High"}
        svc._client.set("test_key", json.dumps(value))
        result = svc.get("test_key")
        assert result == value

    def test_get_returns_string_value(self):
        svc = self._make_available_service()
        svc._client.set("str_key", json.dumps("hello"))
        result = svc.get("str_key")
        assert result == "hello"

    def test_get_returns_list_value(self):
        svc = self._make_available_service()
        items = [1, 2, 3, 4, 5]
        svc._client.set("list_key", json.dumps(items))
        result = svc.get("list_key")
        assert result == items

    def test_get_returns_none_on_client_exception(self):
        svc = self._make_available_service()
        svc._client.get = MagicMock(side_effect=Exception("Redis error"))
        result = svc.get("test_key")
        assert result is None

    def test_get_returns_none_for_invalid_json(self):
        svc = self._make_available_service()
        # Manually set invalid JSON
        svc._client._store["bad_key"] = "INVALID JSON {{"
        result = svc.get("bad_key")
        assert result is None


# ---------------------------------------------------------------------------
# CacheService.set() tests
# ---------------------------------------------------------------------------

class TestCacheServiceSet:
    def _make_available_service(self):
        svc = CacheService()
        svc._client = FakeRedisClient()
        svc._available = True
        return svc

    def test_set_returns_false_when_not_available(self):
        svc = CacheService()
        svc._available = False
        result = svc.set("key", "value", 3600)
        assert result is False

    def test_set_returns_true_on_success(self):
        svc = self._make_available_service()
        result = svc.set("key", {"data": "value"}, 3600)
        assert result is True

    def test_set_stores_value_retrievable_by_get(self):
        svc = self._make_available_service()
        value = {"category": "Software", "priority": "Medium"}
        svc.set("my_key", value, 3600)
        retrieved = svc.get("my_key")
        assert retrieved == value

    def test_set_with_ttl(self):
        svc = self._make_available_service()
        svc.set("ttl_key", "value", 60)
        assert svc._client._ttls.get("ttl_key") == 60

    def test_set_overwrites_existing_value(self):
        svc = self._make_available_service()
        svc.set("key", "original", 3600)
        svc.set("key", "updated", 3600)
        result = svc.get("key")
        assert result == "updated"

    def test_set_returns_false_on_client_exception(self):
        svc = self._make_available_service()
        svc._client.set = MagicMock(side_effect=Exception("Redis error"))
        result = svc.set("key", "value", 3600)
        assert result is False

    def test_set_stores_list_correctly(self):
        svc = self._make_available_service()
        embedding = [0.1] * 384
        svc.set("emb_key", embedding, 86400)
        result = svc.get("emb_key")
        assert len(result) == 384


# ---------------------------------------------------------------------------
# CacheService.delete() tests
# ---------------------------------------------------------------------------

class TestCacheServiceDelete:
    def _make_available_service(self):
        svc = CacheService()
        svc._client = FakeRedisClient()
        svc._available = True
        return svc

    def test_delete_returns_false_when_not_available(self):
        svc = CacheService()
        svc._available = False
        result = svc.delete("any_key")
        assert result is False

    def test_delete_returns_true_when_key_exists(self):
        svc = self._make_available_service()
        svc.set("del_key", "value", 3600)
        result = svc.delete("del_key")
        assert result is True

    def test_delete_makes_key_unavailable(self):
        svc = self._make_available_service()
        svc.set("del_key", "value", 3600)
        svc.delete("del_key")
        result = svc.get("del_key")
        assert result is None

    def test_delete_nonexistent_key_returns_true(self):
        svc = self._make_available_service()
        result = svc.delete("nonexistent_key")
        assert result is True

    def test_delete_returns_false_on_exception(self):
        svc = self._make_available_service()
        svc._client.delete = MagicMock(side_effect=Exception("Redis error"))
        result = svc.delete("key")
        assert result is False


# ---------------------------------------------------------------------------
# Domain helper tests
# ---------------------------------------------------------------------------

class TestDomainHelpers:
    def _make_available_service(self):
        svc = CacheService()
        svc._client = FakeRedisClient()
        svc._available = True
        return svc

    def test_get_embedding_returns_none_when_not_available(self):
        svc = CacheService()
        svc._available = False
        result = svc.get_embedding("some text")
        assert result is None

    def test_set_embedding_stores_vector(self):
        svc = self._make_available_service()
        vector = [0.1] * 384
        svc.set_embedding("test text", vector)
        result = svc.get_embedding("test text")
        assert result == vector

    def test_get_classification_returns_none_on_miss(self):
        svc = self._make_available_service()
        result = svc.get_classification("unseen text")
        assert result is None

    def test_set_classification_stores_result(self):
        svc = self._make_available_service()
        classify_result = {"category": "Network", "priority": "High", "confidence": 0.95}
        svc.set_classification("VPN broken", classify_result)
        retrieved = svc.get_classification("VPN broken")
        assert retrieved == classify_result

    def test_get_duplicate_returns_none_on_miss(self):
        svc = self._make_available_service()
        result = svc.get_duplicate_result("some ticket text")
        assert result is None

    def test_set_duplicate_stores_result(self):
        svc = self._make_available_service()
        dup_result = {"is_duplicate": False, "similarity": 0.0}
        svc.set_duplicate_result("ticket text", dup_result)
        retrieved = svc.get_duplicate_result("ticket text")
        assert retrieved == dup_result


# ---------------------------------------------------------------------------
# CacheService connection tests
# ---------------------------------------------------------------------------

class TestCacheServiceConnection:
    def test_available_false_before_connect(self):
        svc = CacheService()
        assert svc._available is False

    def test_client_none_before_connect(self):
        svc = CacheService()
        assert svc._client is None

    def test_connect_succeeds_with_mock_redis(self):
        svc = CacheService()
        svc.connect()
        assert svc._available is True

    def test_connect_idempotent_when_already_connected(self):
        svc = CacheService()
        svc._available = True
        svc._client = FakeRedisClient()
        svc.connect()  # Should be no-op
        assert svc._available is True
