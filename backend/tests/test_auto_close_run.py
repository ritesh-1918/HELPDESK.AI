"""
Test suite for AutoCloseService.run() method (Issue #1154).

Covers:
- run() return value schema
- run() when enabled=False returns early with skipped tickets
- run() processes multiple companies
- run() handles ticket close errors gracefully
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

_spec = importlib.util.spec_from_file_location(
    "auto_close_service_run",
    os.path.join(os.path.dirname(__file__), "..", "services", "auto_close_service.py")
)
_ac_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ac_module)
AutoCloseService = _ac_module.AutoCloseService


def _make_service():
    svc = AutoCloseService.__new__(AutoCloseService)
    svc.supabase = MagicMock()
    svc.default_auto_close_days = 7
    svc.cron_schedule = "0 2 * * *"
    svc._settings_cache = {}
    svc._cache_ttl = 300
    return svc


def _make_select_builder(data):
    result = MagicMock()
    result.data = data
    builder = MagicMock()
    builder.select.return_value = builder
    builder.eq.return_value = builder
    builder.execute.return_value = result
    return builder


def _make_update_builder(success=True):
    result = MagicMock()
    result.data = [{"id": "t1", "status": "closed"}] if success else None
    builder = MagicMock()
    builder.update.return_value = builder
    builder.eq.return_value = builder
    builder.execute.return_value = result
    return builder


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------

class TestRunReturnSchema:
    def test_run_returns_dict(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert isinstance(result, dict)

    def test_run_has_processed_count(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert "processed_count" in result

    def test_run_has_closed_count(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert "closed_count" in result

    def test_run_has_error_count(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert "error_count" in result

    def test_run_has_skipped_count(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert "skipped_count" in result

    def test_run_has_companies_processed(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert "companies_processed" in result

    def test_run_has_companies_disabled(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert "companies_disabled" in result

    def test_run_all_counts_are_integers(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        for key in ["processed_count", "closed_count", "error_count", "skipped_count"]:
            assert isinstance(result[key], int)


# ---------------------------------------------------------------------------
# enabled=False returns early
# ---------------------------------------------------------------------------

class TestRunDisabled:
    def test_run_skips_tickets_when_disabled(self):
        svc = _make_service()
        old_ticket = {
            "id": "t1", "company_id": "company_A", "status": "resolved",
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        }
        svc.supabase.table.return_value = _make_select_builder([old_ticket])
        svc.get_company_settings = lambda cid: {"auto_close_enabled": False, "auto_close_days": 7}

        result = svc.run()
        assert result["closed_count"] == 0
        assert result["skipped_count"] >= 1

    def test_run_increments_companies_disabled_when_disabled(self):
        svc = _make_service()
        old_ticket = {
            "id": "t1", "company_id": "company_A", "status": "resolved",
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        }
        svc.supabase.table.return_value = _make_select_builder([old_ticket])
        svc.get_company_settings = lambda cid: {"auto_close_enabled": False, "auto_close_days": 7}

        result = svc.run()
        assert result["companies_disabled"] >= 1

    def test_run_with_no_tickets_returns_zero_counts(self):
        svc = _make_service()
        svc.supabase.table.return_value = _make_select_builder([])
        result = svc.run()
        assert result["closed_count"] == 0
        assert result["processed_count"] == 0


# ---------------------------------------------------------------------------
# Multiple companies
# ---------------------------------------------------------------------------

class TestRunMultipleCompanies:
    def test_run_processes_tickets_from_two_companies(self):
        svc = _make_service()
        old_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        tickets = [
            {"id": "t1", "company_id": "company_A", "status": "resolved", "updated_at": old_date},
            {"id": "t2", "company_id": "company_B", "status": "resolved", "updated_at": old_date},
        ]

        call_count = {"n": 0}
        def table_side_effect(name):
            call_count["n"] += 1
            builder = MagicMock()
            builder.select.return_value = builder
            builder.eq.return_value = builder
            builder.update.return_value = builder
            result = MagicMock()
            result.data = tickets if call_count["n"] == 1 else [{"id": "t1", "status": "closed"}]
            builder.execute.return_value = result
            return builder

        svc.supabase.table.side_effect = table_side_effect
        svc.get_company_settings = lambda cid: {"auto_close_enabled": True, "auto_close_days": 7}
        svc.is_auto_close_enabled = lambda cid: True
        svc.get_auto_close_days = lambda cid: 7

        result = svc.run()
        assert result["companies_processed"] >= 2 or result["processed_count"] >= 2

    def test_run_companies_processed_count_accurate(self):
        svc = _make_service()
        old_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        tickets = [
            {"id": "t1", "company_id": "co_1", "status": "resolved", "updated_at": old_date},
            {"id": "t2", "company_id": "co_2", "status": "resolved", "updated_at": old_date},
            {"id": "t3", "company_id": "co_3", "status": "resolved", "updated_at": old_date},
        ]
        svc.supabase.table.return_value = _make_select_builder(tickets)
        svc.get_company_settings = lambda cid: {"auto_close_enabled": False, "auto_close_days": 7}

        result = svc.run()
        assert result["companies_processed"] == 3


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------

class TestRunErrorHandling:
    def test_run_returns_dict_on_exception(self):
        svc = _make_service()
        svc.supabase.table.side_effect = Exception("fatal DB error")
        result = svc.run()
        assert isinstance(result, dict)
        assert "error_count" in result

    def test_run_increments_error_count_on_close_failure(self):
        svc = _make_service()
        old_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        tickets = [
            {"id": "t1", "company_id": "co_A", "status": "resolved", "updated_at": old_date},
        ]
        svc.supabase.table.return_value = _make_select_builder(tickets)
        svc.get_company_settings = lambda cid: {"auto_close_enabled": True, "auto_close_days": 7}
        svc.is_auto_close_enabled = lambda cid: True
        svc.get_auto_close_days = lambda cid: 7
        # Force _close_ticket to fail
        svc._close_ticket = lambda tid, cid, stats: (
            stats.__setitem__("error_count", stats["error_count"] + 1) or False
        )
        result = svc.run()
        assert result["error_count"] >= 1

    def test_run_handles_invalid_timestamp_gracefully(self):
        svc = _make_service()
        tickets = [
            {"id": "t1", "company_id": "co_A", "status": "resolved", "updated_at": "INVALID_DATE"},
        ]
        svc.supabase.table.return_value = _make_select_builder(tickets)
        svc.get_company_settings = lambda cid: {"auto_close_enabled": True, "auto_close_days": 7}
        svc.is_auto_close_enabled = lambda cid: True
        svc.get_auto_close_days = lambda cid: 7

        # Should not raise
        result = svc.run()
        assert isinstance(result, dict)

    def test_run_handles_missing_updated_at(self):
        svc = _make_service()
        tickets = [
            {"id": "t1", "company_id": "co_A", "status": "resolved"},  # No updated_at
        ]
        svc.supabase.table.return_value = _make_select_builder(tickets)
        svc.get_company_settings = lambda cid: {"auto_close_enabled": True, "auto_close_days": 7}
        svc.is_auto_close_enabled = lambda cid: True
        svc.get_auto_close_days = lambda cid: 7

        result = svc.run()
        assert isinstance(result, dict)

    def test_run_skips_recent_tickets(self):
        svc = _make_service()
        recent_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        tickets = [
            {"id": "t1", "company_id": "co_A", "status": "resolved", "updated_at": recent_date},
        ]
        svc.supabase.table.return_value = _make_select_builder(tickets)
        svc.get_company_settings = lambda cid: {"auto_close_enabled": True, "auto_close_days": 7}
        svc.is_auto_close_enabled = lambda cid: True
        svc.get_auto_close_days = lambda cid: 7

        result = svc.run()
        assert result["closed_count"] == 0
        assert result["skipped_count"] >= 1
