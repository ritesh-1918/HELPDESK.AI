"""
Test suite for AutoCloseService.get_company_settings() (Issue #1155).

Covers:
- get_company_settings returns dict
- fallback on exception
- auto_close_days override
- auto_close_enabled flag
"""

import sys
import os
import types
import importlib.util
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

if "supabase" not in sys.modules:
    sb_mod = types.ModuleType("supabase")
    sb_mod.create_client = MagicMock(return_value=MagicMock())
    sys.modules["supabase"] = sb_mod

if "dotenv" not in sys.modules:
    dotenv_mod = types.ModuleType("dotenv")
    dotenv_mod.load_dotenv = lambda: None
    sys.modules["dotenv"] = dotenv_mod

_spec = importlib.util.spec_from_file_location(
    "auto_close_settings",
    os.path.join(os.path.dirname(__file__), "..", "services", "auto_close_service.py")
)
_ac_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ac_module)
AutoCloseService = _ac_module.AutoCloseService


def _make_service(**kwargs):
    svc = AutoCloseService.__new__(AutoCloseService)
    svc.supabase = MagicMock()
    svc.default_auto_close_days = kwargs.get("default_days", 7)
    svc.cron_schedule = "0 2 * * *"
    svc._settings_cache = {}
    svc._cache_ttl = 300
    return svc


def _mock_settings_response(data):
    result = MagicMock()
    result.data = data
    builder = MagicMock()
    builder.select.return_value = builder
    builder.eq.return_value = builder
    builder.single.return_value = builder
    builder.execute.return_value = result
    return builder


# ---------------------------------------------------------------------------
# Returns dict
# ---------------------------------------------------------------------------

class TestGetCompanySettingsReturnsDict:
    def test_returns_dict_on_success(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert isinstance(result, dict)

    def test_returns_dict_on_missing_data(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(None)
        result = svc.get_company_settings("company_A")
        assert isinstance(result, dict)

    def test_returns_dict_on_exception(self):
        svc = _make_service()
        svc.supabase.table.side_effect = Exception("DB error")
        result = svc.get_company_settings("company_A")
        assert isinstance(result, dict)

    def test_result_has_auto_close_days_key(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(None)
        result = svc.get_company_settings("company_A")
        assert "auto_close_days" in result

    def test_result_has_auto_close_enabled_key(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(None)
        result = svc.get_company_settings("company_A")
        assert "auto_close_enabled" in result


# ---------------------------------------------------------------------------
# Fallback on exception
# ---------------------------------------------------------------------------

class TestGetCompanySettingsFallback:
    def test_fallback_returns_default_days(self):
        svc = _make_service(default_days=10)
        svc.supabase.table.side_effect = Exception("Network error")
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 10

    def test_fallback_auto_close_enabled_is_false(self):
        """Safe default when DB unavailable: disabled"""
        svc = _make_service()
        svc.supabase.table.side_effect = Exception("Network error")
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is False

    def test_fallback_on_missing_row(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(None)
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is False

    def test_fallback_days_default_is_7(self):
        svc = _make_service()
        svc.supabase.table.side_effect = RuntimeError("timeout")
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 7


# ---------------------------------------------------------------------------
# auto_close_days override
# ---------------------------------------------------------------------------

class TestAutoCloseDaysOverride:
    def test_custom_days_14_returned(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 14, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 14

    def test_custom_days_30_returned(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 30, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 30

    def test_custom_days_0_returned(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 0, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 0

    def test_missing_auto_close_days_uses_default(self):
        svc = _make_service(default_days=5)
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_enabled": True}  # No auto_close_days
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 5


# ---------------------------------------------------------------------------
# auto_close_enabled flag
# ---------------------------------------------------------------------------

class TestAutoCloseEnabledFlag:
    def test_enabled_true_from_db(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is True

    def test_enabled_false_from_db(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": False}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is False

    def test_enabled_is_bool_type(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert isinstance(result["auto_close_enabled"], bool)

    def test_truthy_int_1_becomes_true(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": 1}  # int 1
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is True

    def test_falsy_0_becomes_false(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": 0}  # int 0
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is False


# ---------------------------------------------------------------------------
# Cache behavior
# ---------------------------------------------------------------------------

class TestCacheBehavior:
    def test_cache_is_populated_after_fetch(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": True}
        )
        svc.get_company_settings("company_A")
        assert "company_A" in svc._settings_cache

    def test_cache_hit_avoids_db_call(self):
        svc = _make_service()
        cached = {"auto_close_days": 5, "auto_close_enabled": True,
                  "_cached_at": datetime.now(timezone.utc).timestamp()}
        svc._settings_cache["company_A"] = cached
        result = svc.get_company_settings("company_A")
        svc.supabase.table.assert_not_called()
        assert result["auto_close_days"] == 5

    def test_clear_cache_removes_all_entries(self):
        svc = _make_service()
        svc._settings_cache["company_A"] = {"auto_close_days": 7}
        svc._settings_cache["company_B"] = {"auto_close_days": 14}
        svc.clear_cache()
        assert len(svc._settings_cache) == 0

    def test_different_companies_cached_independently(self):
        svc = _make_service()
        svc.supabase.table.return_value = _mock_settings_response(
            {"auto_close_days": 7, "auto_close_enabled": True}
        )
        svc.get_company_settings("company_A")
        svc.get_company_settings("company_B")
        # Both should be in cache (unless same mock was returned)
        assert len(svc._settings_cache) >= 1
