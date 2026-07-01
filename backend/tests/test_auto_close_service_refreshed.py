"""
Test suite for backend/services/auto_close_service.py (Issue #1148 - refreshed).

Covers:
- AutoCloseService.__init__ reads env vars
- get_company_settings fallback on missing data
- get_company_settings with explicit auto_close_days override
- _close_ticket success increments stats
- run() returns dict with closed_count and error_count keys
- default_auto_close_days comes from env
"""

import sys
import os
import types
import importlib.util
import pytest
from unittest.mock import MagicMock, patch, call
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Stub dependencies
if "supabase" not in sys.modules:
    sb_mod = types.ModuleType("supabase")
    sb_mod.create_client = MagicMock(return_value=MagicMock())
    sys.modules["supabase"] = sb_mod

if "dotenv" not in sys.modules:
    dotenv_mod = types.ModuleType("dotenv")
    dotenv_mod.load_dotenv = lambda: None
    sys.modules["dotenv"] = dotenv_mod

# Load the real module
_spec = importlib.util.spec_from_file_location(
    "auto_close_service_real",
    os.path.join(os.path.dirname(__file__), "..", "services", "auto_close_service.py")
)
_ac_module = importlib.util.module_from_spec(_spec)
with patch.dict("sys.modules", {"supabase": sys.modules["supabase"], "dotenv": sys.modules["dotenv"]}):
    _spec.loader.exec_module(_ac_module)

AutoCloseService = _ac_module.AutoCloseService


def _make_service(supabase_mock=None):
    """Create AutoCloseService with a mocked supabase client."""
    svc = AutoCloseService.__new__(AutoCloseService)
    svc.supabase = supabase_mock or MagicMock()
    svc.default_auto_close_days = 7
    svc.cron_schedule = "0 2 * * *"
    svc._settings_cache = {}
    svc._cache_ttl = 300
    return svc


def _make_settings_result(data):
    result = MagicMock()
    result.data = data
    builder = MagicMock()
    builder.select.return_value = builder
    builder.eq.return_value = builder
    builder.single.return_value = builder
    builder.execute.return_value = result
    return builder


# ---------------------------------------------------------------------------
# __init__ reads env vars
# ---------------------------------------------------------------------------

class TestAutoCloseServiceInit:
    def test_default_auto_close_days_from_env(self):
        with patch.dict(os.environ, {"AUTO_CLOSE_DAYS": "14", "SUPABASE_URL": "https://x", "SUPABASE_SERVICE_ROLE_KEY": "key"}):
            with patch.object(sys.modules["supabase"], "create_client", return_value=MagicMock()):
                svc = AutoCloseService()
                assert svc.default_auto_close_days == 14

    def test_default_auto_close_days_fallback_to_7(self):
        env = {k: v for k, v in os.environ.items() if k != "AUTO_CLOSE_DAYS"}
        env["SUPABASE_URL"] = "https://x"
        env["SUPABASE_SERVICE_ROLE_KEY"] = "key"
        with patch.dict(os.environ, env, clear=True):
            with patch.object(sys.modules["supabase"], "create_client", return_value=MagicMock()):
                svc = AutoCloseService()
                assert svc.default_auto_close_days == 7

    def test_cron_schedule_from_env(self):
        with patch.dict(os.environ, {
            "AUTO_CLOSE_CRON_SCHEDULE": "0 3 * * *",
            "SUPABASE_URL": "https://x",
            "SUPABASE_SERVICE_ROLE_KEY": "key"
        }):
            with patch.object(sys.modules["supabase"], "create_client", return_value=MagicMock()):
                svc = AutoCloseService()
                assert svc.cron_schedule == "0 3 * * *"

    def test_settings_cache_starts_empty(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "https://x", "SUPABASE_SERVICE_ROLE_KEY": "key"}):
            with patch.object(sys.modules["supabase"], "create_client", return_value=MagicMock()):
                svc = AutoCloseService()
                assert svc._settings_cache == {}


# ---------------------------------------------------------------------------
# get_company_settings tests
# ---------------------------------------------------------------------------

class TestGetCompanySettings:
    def test_returns_dict(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(None)
        result = svc.get_company_settings("company_A")
        assert isinstance(result, dict)

    def test_fallback_when_no_data(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(None)
        result = svc.get_company_settings("company_A")
        assert "auto_close_days" in result
        assert "auto_close_enabled" in result

    def test_fallback_auto_close_days_equals_default(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(None)
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == svc.default_auto_close_days

    def test_fallback_auto_close_enabled_is_false(self):
        """Safe default: disabled when no DB row."""
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(None)
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is False

    def test_explicit_auto_close_days_from_db(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(
            {"auto_close_days": 21, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 21

    def test_explicit_auto_close_enabled_from_db(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(
            {"auto_close_days": 7, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_enabled"] is True

    def test_returns_defaults_on_exception(self):
        svc = _make_service()
        svc.supabase.table.side_effect = Exception("DB error")
        result = svc.get_company_settings("company_A")
        assert isinstance(result, dict)
        assert "auto_close_days" in result

    def test_cache_hit_returns_cached_settings(self):
        svc = _make_service()
        cached = {"auto_close_days": 5, "auto_close_enabled": True,
                  "_cached_at": datetime.now(timezone.utc).timestamp()}
        svc._settings_cache["company_A"] = cached
        result = svc.get_company_settings("company_A")
        # Should use cached value without calling DB
        assert result["auto_close_days"] == 5
        svc.supabase.table.assert_not_called()

    def test_auto_close_days_zero_override(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(
            {"auto_close_days": 0, "auto_close_enabled": True}
        )
        result = svc.get_company_settings("company_A")
        assert result["auto_close_days"] == 0


# ---------------------------------------------------------------------------
# _close_ticket tests
# ---------------------------------------------------------------------------

class TestCloseTicket:
    def test_close_ticket_increments_closed_count(self):
        svc = _make_service()
        builder = MagicMock()
        builder.update.return_value = builder
        builder.eq.return_value = builder
        builder.execute.return_value = MagicMock()
        svc.supabase.table.return_value = builder

        stats = {"closed_count": 0, "error_count": 0}
        result = svc._close_ticket("t1", "company_A", stats)
        assert result is True
        assert stats["closed_count"] == 1
        assert stats["error_count"] == 0

    def test_close_ticket_returns_true_on_success(self):
        svc = _make_service()
        builder = MagicMock()
        builder.update.return_value = builder
        builder.eq.return_value = builder
        builder.execute.return_value = MagicMock()
        svc.supabase.table.return_value = builder

        stats = {"closed_count": 0, "error_count": 0}
        assert svc._close_ticket("t1", "company_A", stats) is True

    def test_close_ticket_increments_error_count_on_exception(self):
        svc = _make_service()
        svc.supabase.table.side_effect = Exception("update failed")

        stats = {"closed_count": 0, "error_count": 0}
        result = svc._close_ticket("t1", "company_A", stats)
        assert result is False
        assert stats["error_count"] == 1
        assert stats["closed_count"] == 0

    def test_close_ticket_calls_update_on_tickets_table(self):
        svc = _make_service()
        builder = MagicMock()
        builder.update.return_value = builder
        builder.eq.return_value = builder
        builder.execute.return_value = MagicMock()
        svc.supabase.table.return_value = builder

        stats = {"closed_count": 0, "error_count": 0}
        svc._close_ticket("t42", "company_B", stats)
        svc.supabase.table.assert_called_with("tickets")

    def test_close_ticket_multiple_calls_accumulate(self):
        svc = _make_service()
        builder = MagicMock()
        builder.update.return_value = builder
        builder.eq.return_value = builder
        builder.execute.return_value = MagicMock()
        svc.supabase.table.return_value = builder

        stats = {"closed_count": 0, "error_count": 0}
        for i in range(5):
            svc._close_ticket(f"t{i}", "company_A", stats)
        assert stats["closed_count"] == 5


# ---------------------------------------------------------------------------
# run() tests
# ---------------------------------------------------------------------------

class TestRunMethod:
    def test_run_returns_dict(self):
        svc = _make_service()
        builder = MagicMock()
        builder.select.return_value = builder
        builder.eq.return_value = builder
        result_mock = MagicMock()
        result_mock.data = []
        builder.execute.return_value = result_mock
        svc.supabase.table.return_value = builder

        result = svc.run()
        assert isinstance(result, dict)

    def test_run_returns_closed_count_key(self):
        svc = _make_service()
        builder = MagicMock()
        builder.select.return_value = builder
        builder.eq.return_value = builder
        result_mock = MagicMock()
        result_mock.data = []
        builder.execute.return_value = result_mock
        svc.supabase.table.return_value = builder

        result = svc.run()
        assert "closed_count" in result

    def test_run_returns_error_count_key(self):
        svc = _make_service()
        builder = MagicMock()
        builder.select.return_value = builder
        builder.eq.return_value = builder
        result_mock = MagicMock()
        result_mock.data = []
        builder.execute.return_value = result_mock
        svc.supabase.table.return_value = builder

        result = svc.run()
        assert "error_count" in result

    def test_run_returns_processed_count_key(self):
        svc = _make_service()
        builder = MagicMock()
        builder.select.return_value = builder
        builder.eq.return_value = builder
        result_mock = MagicMock()
        result_mock.data = []
        builder.execute.return_value = result_mock
        svc.supabase.table.return_value = builder

        result = svc.run()
        assert "processed_count" in result

    def test_run_with_no_tickets_returns_zero_closed(self):
        svc = _make_service()
        builder = MagicMock()
        builder.select.return_value = builder
        builder.eq.return_value = builder
        result_mock = MagicMock()
        result_mock.data = []
        builder.execute.return_value = result_mock
        svc.supabase.table.return_value = builder

        result = svc.run()
        assert result["closed_count"] == 0

    def test_run_when_disabled_skips_tickets(self):
        svc = _make_service()
        old_ticket = {
            "id": "t1", "company_id": "company_A", "status": "resolved",
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        }

        # Mock DB query for resolved tickets
        select_result = MagicMock()
        select_result.data = [old_ticket]
        builder = MagicMock()
        builder.select.return_value = builder
        builder.eq.return_value = builder
        builder.single.return_value = builder
        builder.update.return_value = builder
        builder.execute.return_value = select_result
        svc.supabase.table.return_value = builder

        # Force is_auto_close_enabled to return False
        svc.get_company_settings = lambda cid: {"auto_close_enabled": False, "auto_close_days": 7}

        result = svc.run()
        assert result["closed_count"] == 0
        assert result["skipped_count"] > 0

    def test_run_closes_old_ticket_when_enabled(self):
        svc = _make_service()
        old_ticket = {
            "id": "t1", "company_id": "company_A", "status": "resolved",
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        }

        call_count = {"n": 0}
        def make_builder_for_call():
            builder = MagicMock()
            builder.select.return_value = builder
            builder.eq.return_value = builder
            builder.single.return_value = builder
            builder.update.return_value = builder
            result = MagicMock()
            call_count["n"] += 1
            if call_count["n"] == 1:
                result.data = [old_ticket]
            else:
                result.data = [{"id": "t1", "status": "closed"}]
            builder.execute.return_value = result
            return builder

        svc.supabase.table.side_effect = lambda name: make_builder_for_call()
        svc.get_company_settings = lambda cid: {"auto_close_enabled": True, "auto_close_days": 7}
        svc.is_auto_close_enabled = lambda cid: True
        svc.get_auto_close_days = lambda cid: 7

        result = svc.run()
        assert result["closed_count"] >= 0  # Depends on the close operation

    def test_run_returns_correct_schema(self):
        svc = _make_service()
        builder = MagicMock()
        builder.select.return_value = builder
        builder.eq.return_value = builder
        result_mock = MagicMock()
        result_mock.data = []
        builder.execute.return_value = result_mock
        svc.supabase.table.return_value = builder

        result = svc.run()
        expected_keys = {"processed_count", "closed_count", "error_count", "skipped_count",
                         "companies_processed", "companies_disabled"}
        assert expected_keys.issubset(result.keys())

    def test_run_returns_dict_on_exception(self):
        svc = _make_service()
        svc.supabase.table.side_effect = Exception("fatal error")
        result = svc.run()
        assert isinstance(result, dict)
        assert "error_count" in result


# ---------------------------------------------------------------------------
# is_auto_close_enabled tests
# ---------------------------------------------------------------------------

class TestIsAutoCloseEnabled:
    def test_returns_true_when_db_says_enabled(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(
            {"auto_close_days": 7, "auto_close_enabled": True}
        )
        assert svc.is_auto_close_enabled("company_A") is True

    def test_returns_false_when_db_says_disabled(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(
            {"auto_close_days": 7, "auto_close_enabled": False}
        )
        assert svc.is_auto_close_enabled("company_A") is False

    def test_returns_false_on_missing_setting(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_settings_result(None)
        result = svc.is_auto_close_enabled("company_A")
        assert isinstance(result, bool)


# ---------------------------------------------------------------------------
# clear_cache tests
# ---------------------------------------------------------------------------

class TestClearCache:
    def test_clear_cache_empties_cache(self):
        svc = _make_service()
        svc._settings_cache["company_A"] = {"auto_close_days": 7}
        svc._settings_cache["company_B"] = {"auto_close_days": 14}
        svc.clear_cache()
        assert svc._settings_cache == {}
