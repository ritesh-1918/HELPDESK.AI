"""
Unit tests for redis_cache service.
Issue: #1106
"""

import os
import sys
import unittest
from unittest.mock import Mock, patch

sys.modules["redis"] = Mock()
sys.modules["dotenv"] = Mock()
sys.modules["dotenv"].load_dotenv = Mock()

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.services.redis_cache import (
    RedisInferenceCache,
    _truthy,
    _text_key,
    CLASSIFICATION_PREFIX,
    EMBEDDING_PREFIX,
)


class TestTruthFunction(unittest.TestCase):
    def test_truthy_true_values(self):
        for val in ["1", "true", "True", "TRUE", "yes", "Yes", "YES", "on", "On", "ON"]:
            self.assertTrue(_truthy(val))

    def test_truthy_false_values(self):
        for val in ["0", "false", "False", "FALSE", "no", "No", "NO", "off", "Off", "OFF", "", " ", None]:
            self.assertFalse(_truthy(val))

    def test_truthy_whitespace(self):
        self.assertTrue(_truthy("  true  "))
        self.assertFalse(_truthy("  false  "))


class TestTextKeyFunction(unittest.TestCase):
    def test_valid_text(self):
        key = _text_key("prefix:", "Hello World")
        self.assertTrue(key.startswith("prefix:"))
        self.assertEqual(len(key), len("prefix:") + 32)

    def test_empty_text(self):
        with self.assertRaises(ValueError):
            _text_key("prefix:", "")
        with self.assertRaises(ValueError):
            _text_key("prefix:", "   ")

    def test_none_text(self):
        with self.assertRaises(ValueError):
            _text_key("prefix:", None)

    def test_whitespace_stripped(self):
        key1 = _text_key("prefix:", "Hello")
        key2 = _text_key("prefix:", "  Hello  ")
        self.assertEqual(key1, key2)

    def test_case_insensitive(self):
        key1 = _text_key("prefix:", "Hello")
        key2 = _text_key("prefix:", "HELLO")
        self.assertEqual(key1, key2)

    def test_different_prefixes(self):
        key1 = _text_key("cls:", "test")
        key2 = _text_key("emb:", "test")
        self.assertNotEqual(key1, key2)


class TestRedisInferenceCacheInit(unittest.TestCase):
    @patch.dict(os.environ, {"USE_REDIS_CACHE": "true", "ALLOW_DEGRADED_STARTUP": "true", "REDIS_CACHE_TTL_SECONDS": "7200"}, clear=True)
    def test_init_with_env_vars(self):
        cache = RedisInferenceCache()
        self.assertTrue(cache.enabled)
        self.assertTrue(cache.allow_degraded)
        self.assertEqual(cache.ttl_seconds, 7200)

    @patch.dict(os.environ, {"USE_REDIS_CACHE": "false", "ALLOW_DEGRADED_STARTUP": "false"}, clear=True)
    def test_init_disabled(self):
        cache = RedisInferenceCache()
        self.assertFalse(cache.enabled)
        self.assertFalse(cache.allow_degraded)

    @patch.dict(os.environ, {}, clear=True)
    def test_init_defaults(self):
        cache = RedisInferenceCache()
        self.assertFalse(cache.enabled)
        self.assertFalse(cache.allow_degraded)
        self.assertEqual(cache.ttl_seconds, 3600)


class TestAvailableProperty(unittest.TestCase):
    @patch.dict(os.environ, {"USE_REDIS_CACHE": "true"}, clear=True)
    def test_available_when_enabled_and_connected(self):
        cache = RedisInferenceCache()
        cache._client = Mock()
        self.assertTrue(cache.available)

    @patch.dict(os.environ, {"USE_REDIS_CACHE": "true"}, clear=True)
    def test_not_available_when_no_client(self):
        cache = RedisInferenceCache()
        cache._client = None
        self.assertFalse(cache.available)

    @patch.dict(os.environ, {"USE_REDIS_CACHE": "false"}, clear=True)
    def test_not_available_when_disabled(self):
        cache = RedisInferenceCache()
        cache._client = Mock()
        self.assertFalse(cache.available)


class TestConnectMethod(unittest.TestCase):
    @patch.dict(os.environ, {"USE_REDIS_CACHE": "false"}, clear=True)
    def test_connect_when_disabled(self):
        cache = RedisInferenceCache()
        cache.connect()
        self.assertIsNone(cache._client)

    @patch.dict(os.environ, {"USE_REDIS_CACHE": "true", "REDIS_URL": "redis://localhost:6379/0"}, clear=True)
    def test_connect_success(self):
        mock_redis = Mock()
        mock_client = Mock()
        mock_client.ping.return_value = True
        mock_redis.from_url.return_value = mock_client
        sys.modules["redis"] = mock_redis
        cache = RedisInferenceCache()
        cache.connect()
        self.assertIsNotNone(cache._client)

    @patch.dict(os.environ, {"USE_REDIS_CACHE": "true", "ALLOW_DEGRADED_STARTUP": "true"}, clear=True)
    def test_connect_failure_with_degraded(self):
        mock_redis = Mock()
        mock_redis.from_url.side_effect = Exception("Connection refused")
        sys.modules["redis"] = mock_redis
        cache = RedisInferenceCache()
        cache.connect()
        self.assertIsNone(cache._client)

    @patch.dict(os.environ, {"USE_REDIS_CACHE": "true", "ALLOW_DEGRADED_STARTUP": "false"}, clear=True)
    def test_connect_failure_without_degraded(self):
        mock_redis = Mock()
        mock_redis.from_url.side_effect = Exception("Connection refused")
        sys.modules["redis"] = mock_redis
        cache = RedisInferenceCache()
        with self.assertRaises(RuntimeError):
            cache.connect()


class TestClassificationCache(unittest.TestCase):
    def setUp(self):
        self.cache = RedisInferenceCache()
        self.cache.enabled = True
        self.cache._client = Mock()

    def test_get_classification_cache_hit(self):
        self.cache._client.get.return_value = '{"type": "bug", "confidence": 0.95}'
        result = self.cache.get_classification("Test ticket")
        self.assertEqual(result, {"type": "bug", "confidence": 0.95})

    def test_get_classification_cache_miss(self):
        self.cache._client.get.return_value = None
        result = self.cache.get_classification("Test ticket")
        self.assertIsNone(result)

    def test_get_classification_when_unavailable(self):
        self.cache.enabled = False
        result = self.cache.get_classification("Test ticket")
        self.assertIsNone(result)

    def test_get_classification_empty_text(self):
        result = self.cache.get_classification("")
        self.assertIsNone(result)

    def test_get_classification_whitespace_text(self):
        result = self.cache.get_classification("   ")
        self.assertIsNone(result)

    def test_get_classification_exception(self):
        self.cache._client.get.side_effect = Exception("Redis error")
        result = self.cache.get_classification("Test ticket")
        self.assertIsNone(result)

    def test_set_classification_success(self):
        self.cache.set_classification("Test ticket", {"type": "bug"})
        self.cache._client.setex.assert_called_once()

    def test_set_classification_when_unavailable(self):
        self.cache.enabled = False
        self.cache.set_classification("Test ticket", {"type": "bug"})
        self.cache._client.setex.assert_not_called()

    def test_set_classification_empty_text(self):
        self.cache.set_classification("", {"type": "bug"})
        self.cache._client.setex.assert_not_called()

    def test_set_classification_exception(self):
        self.cache._client.setex.side_effect = Exception("Redis error")
        self.cache.set_classification("Test ticket", {"type": "bug"})


class TestEmbeddingCache(unittest.TestCase):
    def setUp(self):
        self.cache = RedisInferenceCache()
        self.cache.enabled = True
        self.cache._client = Mock()

    def test_get_embedding_cache_hit(self):
        self.cache._client.get.return_value = "[0.1, 0.2, 0.3]"
        result = self.cache.get_embedding("Test text")
        self.assertEqual(result, [0.1, 0.2, 0.3])

    def test_get_embedding_float_conversion(self):
        self.cache._client.get.return_value = "[1, 2, 3]"
        result = self.cache.get_embedding("Test text")
        self.assertEqual(result, [1.0, 2.0, 3.0])

    def test_get_embedding_cache_miss(self):
        self.cache._client.get.return_value = None
        result = self.cache.get_embedding("Test text")
        self.assertIsNone(result)

    def test_get_embedding_when_unavailable(self):
        self.cache.enabled = False
        result = self.cache.get_embedding("Test text")
        self.assertIsNone(result)

    def test_get_embedding_empty_text(self):
        result = self.cache.get_embedding("")
        self.assertIsNone(result)

    def test_get_embedding_exception(self):
        self.cache._client.get.side_effect = Exception("Redis error")
        result = self.cache.get_embedding("Test text")
        self.assertIsNone(result)

    def test_set_embedding_success(self):
        self.cache.set_embedding("Test text", [0.1, 0.2, 0.3])
        self.cache._client.setex.assert_called_once()

    def test_set_embedding_when_unavailable(self):
        self.cache.enabled = False
        self.cache.set_embedding("Test text", [0.1, 0.2, 0.3])
        self.cache._client.setex.assert_not_called()

    def test_set_embedding_empty_text(self):
        self.cache.set_embedding("", [0.1, 0.2, 0.3])
        self.cache._client.setex.assert_not_called()


if __name__ == "__main__":
    unittest.main(verbosity=2)
