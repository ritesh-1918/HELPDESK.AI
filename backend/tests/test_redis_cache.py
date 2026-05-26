"""Tests for Redis inference cache (issue #131)."""

from unittest.mock import MagicMock, patch

import pytest

from backend.services.redis_cache import RedisInferenceCache, _text_key, CLASSIFICATION_PREFIX, EMBEDDING_PREFIX


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.delenv("USE_REDIS_CACHE", raising=False)
    monkeypatch.delenv("REDIS_URL", raising=False)
    monkeypatch.delenv("ALLOW_DEGRADED_STARTUP", raising=False)
    monkeypatch.delenv("REDIS_CACHE_TTL_SECONDS", raising=False)


def test_text_key_is_stable():
    assert _text_key(CLASSIFICATION_PREFIX, "Hello") == _text_key(CLASSIFICATION_PREFIX, " hello ")
    assert _text_key(CLASSIFICATION_PREFIX, "A") != _text_key(EMBEDDING_PREFIX, "A")


def test_cache_disabled_by_default():
    cache = RedisInferenceCache()
    cache.connect()
    assert cache.available is False
    assert cache.get_classification("ticket") is None


def test_classification_roundtrip(monkeypatch):
    monkeypatch.setenv("USE_REDIS_CACHE", "true")
    client = MagicMock()
    client.ping.return_value = True
    store = {}

    def setex(key, ttl, value):
        store[key] = value

    client.get.side_effect = lambda key: store.get(key)
    client.setex.side_effect = setex

    cache = RedisInferenceCache()
    with patch("redis.from_url", return_value=client):
        cache.connect()

    payload = {"category": "Billing", "priority": "High"}
    assert cache.get_classification("payment failed") is None
    cache.set_classification("payment failed", payload)
    assert cache.get_classification("payment failed") == payload


def test_embedding_roundtrip(monkeypatch):
    monkeypatch.setenv("USE_REDIS_CACHE", "true")
    client = MagicMock()
    client.ping.return_value = True
    store = {}

    client.get.side_effect = lambda key: store.get(key)
    client.setex.side_effect = lambda key, ttl, value: store.update({key: value})

    cache = RedisInferenceCache()
    with patch("redis.from_url", return_value=client):
        cache.connect()

    vector = [0.1, 0.2, 0.3]
    cache.set_embedding("duplicate ticket", vector)
    assert cache.get_embedding("duplicate ticket") == vector


def test_degraded_startup_bypasses_redis(monkeypatch):
    monkeypatch.setenv("USE_REDIS_CACHE", "true")
    monkeypatch.setenv("ALLOW_DEGRADED_STARTUP", "1")

    cache = RedisInferenceCache()
    with patch("redis.from_url", side_effect=ConnectionError("down")):
        cache.connect()

    assert cache.available is False
    assert cache.get_embedding("x") is None
