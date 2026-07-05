"""
Unit tests for backend/services/redis_cache.py edge cases.

Covers the internal _truthy and _text_key helpers, and the
RedisInferenceCache behaviour when disabled, when Redis is unavailable,
and the swallowing of errors in get/set helpers.
"""

import os
import sys
import unittest
from unittest import mock

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.services.redis_cache import (
    _truthy,
    _text_key,
    CLASSIFICATION_PREFIX,
    EMBEDDING_PREFIX,
    RedisInferenceCache,
)


class TestTruthy(unittest.TestCase):
    def test_none(self):
        self.assertFalse(_truthy(None))

    def test_empty_string(self):
        self.assertFalse(_truthy(""))

    def test_whitespace(self):
        self.assertFalse(_truthy("   "))

    def test_truthy_values(self):
        for v in ["1", "true", "TRUE", "yes", "on", "Yes", "ON"]:
            self.assertTrue(_truthy(v), f"expected {v!r} to be truthy")

    def test_falsy_other(self):
        for v in ["0", "false", "no", "off", "garbage", "2"]:
            self.assertFalse(_truthy(v), f"expected {v!r} to be falsy")


class TestTextKey(unittest.TestCase):
    def test_empty_text(self):
        self.assertIsNone(_text_key("pfx:", ""))

    def test_whitespace_only(self):
        self.assertIsNone(_text_key("pfx:", "   "))

    def test_normal_text(self):
        key = _text_key("pfx:", "Hello World")
        self.assertTrue(key.startswith("pfx:"))
        self.assertEqual(len(key), len("pfx:") + 32)  # md5 hex digest

    def test_text_lowercased(self):
        k1 = _text_key("pfx:", "Hello")
        k2 = _text_key("pfx:", "HELLO")
        self.assertEqual(k1, k2)

    def test_text_stripped(self):
        k1 = _text_key("pfx:", "Hello")
        k2 = _text_key("pfx:", "  Hello  ")
        self.assertEqual(k1, k2)


class TestRedisInferenceCacheInit(unittest.TestCase):
    def test_default_disabled(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            cache = RedisInferenceCache()
        self.assertFalse(cache.enabled)
        self.assertFalse(cache.available)
        self.assertEqual(cache.ttl_seconds, 3600)

    def test_enabled_via_env(self):
        with mock.patch.dict(os.environ, {"USE_REDIS_CACHE": "true"}):
            cache = RedisInferenceCache()
        self.assertTrue(cache.enabled)
        # But not available because connect() hasn't been called
        self.assertFalse(cache.available)

    def test_custom_ttl(self):
        with mock.patch.dict(
            os.environ, {"USE_REDIS_CACHE": "true", "REDIS_CACHE_TTL_SECONDS": "120"}
        ):
            cache = RedisInferenceCache()
        self.assertEqual(cache.ttl_seconds, 120)


class TestRedisInferenceCacheConnect(unittest.TestCase):
    def test_disabled_logs_and_returns(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            cache = RedisInferenceCache()
        # Should not raise; just logs
        cache.connect()
        self.assertIsNone(cache._client)

    def test_enabled_but_no_redis(self):
        with mock.patch.dict(os.environ, {"USE_REDIS_CACHE": "true", "ALLOW_DEGRADED_STARTUP": "1"}):
            cache = RedisInferenceCache()
        # Force the redis import to fail
        import builtins
        original_import = builtins.__import__

        def mock_import(name, *args, **kwargs):
            if name == "redis":
                raise ImportError("no redis")
            return original_import(name, *args, **kwargs)

        with mock.patch.object(builtins, "__import__", side_effect=mock_import):
            cache.connect()
        self.assertIsNone(cache._client)
        self.assertFalse(cache.available)

    def test_enabled_raises_when_not_degraded(self):
        with mock.patch.dict(
            os.environ,
            {"USE_REDIS_CACHE": "true", "ALLOW_DEGRADED_STARTUP": ""},
        ):
            cache = RedisInferenceCache()
        import builtins
        original_import = builtins.__import__

        def mock_import(name, *args, **kwargs):
            if name == "redis":
                raise ImportError("no redis")
            return original_import(name, *args, **kwargs)

        with mock.patch.object(builtins, "__import__", side_effect=mock_import):
            with self.assertRaises(RuntimeError):
                cache.connect()


class TestGetSetMethodsUnavailable(unittest.TestCase):
    def test_get_classification_when_unavailable(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            cache = RedisInferenceCache()
        self.assertIsNone(cache.get_classification("hello"))

    def test_set_classification_when_unavailable(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            cache = RedisInferenceCache()
        # Should not raise
        cache.set_classification("hello", {"label": "x"})

    def test_get_embedding_when_unavailable(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            cache = RedisInferenceCache()
        self.assertIsNone(cache.get_embedding("hello"))

    def test_set_embedding_when_unavailable(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            cache = RedisInferenceCache()
        cache.set_embedding("hello", [0.1, 0.2, 0.3])

    def test_get_classification_empty_text(self):
        with mock.patch.dict(os.environ, {"USE_REDIS_CACHE": "true"}):
            cache = RedisInferenceCache()
        # Even with a fake client, empty text returns None
        cache._client = mock.MagicMock()
        self.assertIsNone(cache.get_classification(""))

    def test_set_classification_empty_text(self):
        with mock.patch.dict(os.environ, {"USE_REDIS_CACHE": "true"}):
            cache = RedisInferenceCache()
        cache._client = mock.MagicMock()
        # Should not raise
        cache.set_classification("", {"label": "x"})
        cache._client.setex.assert_not_called()


class TestGetSetMethodsWithMockedClient(unittest.TestCase):
    def setUp(self):
        with mock.patch.dict(os.environ, {"USE_REDIS_CACHE": "true"}):
            self.cache = RedisInferenceCache()
        self.mock_client = mock.MagicMock()
        self.cache._client = self.mock_client

    def test_get_classification_hit(self):
        self.mock_client.get.return_value = '{"label":"x"}'
        result = self.cache.get_classification("hello")
        self.assertEqual(result, {"label": "x"})

    def test_get_classification_miss(self):
        self.mock_client.get.return_value = None
        self.assertIsNone(self.cache.get_classification("hello"))

    def test_get_classification_error_swallowed(self):
        self.mock_client.get.side_effect = Exception("redis down")
        self.assertIsNone(self.cache.get_classification("hello"))

    def test_set_classification_error_swallowed(self):
        self.mock_client.setex.side_effect = Exception("redis down")
        # Should not raise
        self.cache.set_classification("hello", {"label": "x"})

    def test_get_embedding_hit(self):
        self.mock_client.get.return_value = "[0.1, 0.2, 0.3]"
        result = self.cache.get_embedding("hello")
        self.assertEqual(result, [0.1, 0.2, 0.3])

    def test_get_embedding_miss(self):
        self.mock_client.get.return_value = None
        self.assertIsNone(self.cache.get_embedding("hello"))

    def test_set_embedding_error_swallowed(self):
        self.mock_client.setex.side_effect = Exception("redis down")
        self.cache.set_embedding("hello", [0.1, 0.2])


class TestPrefixes(unittest.TestCase):
    def test_classification_prefix(self):
        self.assertTrue(CLASSIFICATION_PREFIX.startswith("helpdesk:"))

    def test_embedding_prefix(self):
        self.assertTrue(EMBEDDING_PREFIX.startswith("helpdesk:"))


if __name__ == "__main__":
    unittest.main()
