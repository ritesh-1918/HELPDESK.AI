import importlib
import sys

import pytest


def _reload_config(monkeypatch, env):
    for key in ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_ANON_KEY", "ALLOW_DEGRADED_STARTUP"]:
        monkeypatch.delenv(key, raising=False)

    monkeypatch.setenv("ALLOW_DEGRADED_STARTUP", env.get("ALLOW_DEGRADED_STARTUP", "0"))
    for key, value in env.items():
        monkeypatch.setenv(key, value)

    sys.modules.pop("backend.config", None)
    module = importlib.import_module("backend.config")
    return module


def test_config_allows_degraded_startup_without_supabase(monkeypatch):
    module = _reload_config(monkeypatch, {"ALLOW_DEGRADED_STARTUP": "1"})

    assert module.settings.ALLOW_DEGRADED_STARTUP is True
    assert module.settings.supabase_ready is False
    assert module.settings.should_init_supabase is False


def test_config_initializes_supabase_when_credentials_exist(monkeypatch):
    module = _reload_config(
        monkeypatch,
        {
            "ALLOW_DEGRADED_STARTUP": "0",
            "SUPABASE_URL": "https://example.supabase.co",
            "SUPABASE_SERVICE_KEY": "service-key",
        },
    )

    assert module.settings.supabase_ready is True
    assert module.settings.should_init_supabase is True


def test_config_requires_supabase_credentials_when_not_degraded(monkeypatch):
    with pytest.raises(ValueError) as exc:
        _reload_config(monkeypatch, {"ALLOW_DEGRADED_STARTUP": "0"})

    assert "SUPABASE_URL" in str(exc.value)
    assert "SUPABASE_SERVICE_KEY" in str(exc.value)
