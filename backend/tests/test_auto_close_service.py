"""
Unit tests for auto_close_service.py

Tests cover:
- __init__: environment variable handling
- get_system_settings: normal, fallback, field missing
- _close_ticket: success and failure
- run: full flow, disabled, company-disabled, timestamp edge cases
- test_query / load / get_instance: utility methods

Strategy: mock supabase at import level so tests don't need a real database.
"""

import sys
import os
from unittest.mock import MagicMock, patch, PropertyMock
from datetime import datetime, timedelta, timezone

import pytest


# ── Mock supabase BEFORE importing the module under test ──
_mock_supabase_mod = MagicMock()
_mock_supabase_client = MagicMock()

# The create_client function returns the mock client
_mock_supabase_mod.create_client.return_value = _mock_supabase_client

# Insert into sys.modules so "from supabase import create_client" gets our mock
sys.modules["supabase"] = _mock_supabase_mod
# Also mock dotenv since it's imported at module level in auto_close_service.py
sys.modules["dotenv"] = MagicMock()

# Now safe to import
from backend.services.auto_close_service import (
    AutoCloseService,
    load as svc_load,
    get_instance,
    _instance,
)


# ═══════════════════════════════════════════════
#  Fixtures
# ═══════════════════════════════════════════════

@pytest.fixture(autouse=True)
def reset_singleton():
    """Reset the module-level singleton before each test."""
    import backend.services.auto_close_service as acs
    acs._instance = None
    yield


@pytest.fixture
def mock_builder():
    """
    Return a helper to easily configure the mock supabase query builder chain.
    Usage:
        mock_builder["tickets"].data = [...]  # set return data for "tickets" table
    """
    class BuilderHelper:
        def __init__(self, client):
            self._client = client
            self._builders = {}

        def __getitem__(self, table_name):
            if table_name not in self._builders:
                builder = MagicMock()
                builder.execute.return_value = type("Resp", (), {"data": None})()
                # Configure table lookup for this client
                self._client.table.side_effect = lambda name: builder
                self._builders[table_name] = builder
            return self._builders[table_name]

    _mock_supabase_client.reset_mock()
    return BuilderHelper(_mock_supabase_client)


# ═══════════════════════════════════════════════
#  __init__ tests
# ═══════════════════════════════════════════════

class TestInit:
    def test_default_values(self):
        """With no env vars, uses defaults: enabled=true, days=7, cron=0 2 * * *"""
        with patch.dict(os.environ, {}, clear=True):
            svc = AutoCloseService()
        assert svc.enabled is True
        assert svc.default_auto_close_days == 7
        assert svc.cron_schedule == "0 2 * * *"

    def test_disabled_when_env_false(self):
        """AUTO_CLOSE_ENABLED=false → enabled=False"""
        with patch.dict(os.environ, {"AUTO_CLOSE_ENABLED": "false"}, clear=True):
            svc = AutoCloseService()
        assert svc.enabled is False

    def test_custom_days(self):
        """AUTO_CLOSE_DAYS=3 → default_auto_close_days=3"""
        with patch.dict(os.environ, {"AUTO_CLOSE_DAYS": "3"}, clear=True):
            svc = AutoCloseService()
        assert svc.default_auto_close_days == 3


# ═══════════════════════════════════════════════
#  get_system_settings tests
# ═══════════════════════════════════════════════

class TestGetSystemSettings:
    def test_returns_settings_from_db(self):
        """Normal case: DB returns both fields."""
        svc = AutoCloseService()
        _mock_supabase_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = \
            type("Resp", (), {"data": {"auto_close_days": 3, "auto_close_enabled": False}})()

        result = svc.get_system_settings("company-1")
        assert result == {"auto_close_days": 3, "auto_close_enabled": False}

    def test_fallback_on_exception(self):
        """DB exception → returns defaults."""
        svc = AutoCloseService()
        _mock_supabase_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = \
            Exception("DB down")

        result = svc.get_system_settings("company-1")
        assert result == {"auto_close_days": 7, "auto_close_enabled": True}

    def test_fallback_missing_field(self):
        """DB response missing auto_close_days → uses global default."""
        svc = AutoCloseService()
        _mock_supabase_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = \
            type("Resp", (), {"data": {"auto_close_enabled": True}})()

        result = svc.get_system_settings("company-1")
        assert result["auto_close_days"] == 7
        assert result["auto_close_enabled"] is True


# ═══════════════════════════════════════════════
#  _close_ticket tests
# ═══════════════════════════════════════════════

class TestCloseTicket:
    def test_successful_close(self):
        """Normal close: increments closed_count, returns True."""
        svc = AutoCloseService()
        stats = {"closed_count": 0, "error_count": 0}

        result = svc._close_ticket("ticket-1", "company-1", stats)

        assert result is True
        assert stats["closed_count"] == 1
        assert stats["error_count"] == 0

    def test_close_failure(self):
        """DB exception: increments error_count, returns False."""
        svc = AutoCloseService()
        _mock_supabase_client.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.side_effect = \
            Exception("Update failed")
        stats = {"closed_count": 0, "error_count": 0}

        result = svc._close_ticket("ticket-1", "company-1", stats)

        assert result is False
        assert stats["closed_count"] == 0
        assert stats["error_count"] == 1


# ═══════════════════════════════════════════════
#  run() tests
# ═══════════════════════════════════════════════

class TestRun:
    def _make_client(self, tickets_data=None, update_ok=True):
        """Create a fresh mock supabase client for independent test isolation."""
        from unittest.mock import MagicMock
        c = MagicMock()
        if tickets_data is not None:
            c.table.return_value.select.return_value.eq.return_value.execute.return_value = \
                type("Resp", (), {"data": tickets_data})()
        if update_ok:
            c.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = \
                type("Resp", (), {"data": None})()
        else:
            c.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.side_effect = \
                Exception("Update failed")
        # Mock get_system_settings chain too
        c.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = \
            type("Resp", (), {"data": {"auto_close_days": 7, "auto_close_enabled": True}})()
        return c

    def test_disabled_service(self):
        """AUTO_CLOSE_ENABLED=false → returns {"status":"disabled"}."""
        client = self._make_client()
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            with patch.dict(os.environ, {"AUTO_CLOSE_ENABLED": "false"}, clear=True):
                svc = AutoCloseService()
                result = svc.run()
        assert result == {"status": "disabled"}

    def test_no_resolved_tickets(self):
        """No resolved tickets → processed_count=0."""
        client = self._make_client(tickets_data=[])
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            svc = AutoCloseService()
            result = svc.run()
        assert result["processed_count"] == 0
        assert result["closed_count"] == 0

    def test_closes_old_tickets(self):
        """Tickets older than auto_close_days are closed."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        client = self._make_client(tickets_data=[
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": old_date}
        ])
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            svc = AutoCloseService()
            result = svc.run()
        assert result["closed_count"] == 1
        assert result["processed_count"] == 1

    def test_skips_recent_tickets(self):
        """Tickets newer than auto_close_days → skipped."""
        recent_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        client = self._make_client(tickets_data=[
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": recent_date}
        ])
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            svc = AutoCloseService()
            result = svc.run()
        assert result["closed_count"] == 0
        assert result["skipped_count"] == 1

    def test_company_disabled(self):
        """Company with auto_close_enabled=False → tickets skipped."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        client = self._make_client(tickets_data=[
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": old_date}
        ], update_ok=True)
        # Override settings to return disabled
        client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = \
            type("Resp", (), {"data": {"auto_close_days": 7, "auto_close_enabled": False}})()
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            svc = AutoCloseService()
            result = svc.run()
        assert result["closed_count"] == 0
        assert result["skipped_count"] == 1

    def test_missing_updated_at_skipped(self):
        """Ticket missing updated_at field → skipped."""
        client = self._make_client(tickets_data=[
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": None}
        ])
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            svc = AutoCloseService()
            result = svc.run()
        assert result["closed_count"] == 0
        assert result["error_count"] == 0

    def test_bad_timestamp_error(self):
        """Invalid timestamp format → error_count incremented."""
        client = self._make_client(tickets_data=[
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": "not-a-date"}
        ])
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            svc = AutoCloseService()
            result = svc.run()
        assert result["error_count"] == 1

    def test_fatal_error_handled(self):
        """Supabase query fails entirely → returns stats with error."""
        client = MagicMock()
        client.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("Connection failed")
        with patch("backend.services.auto_close_service.create_client", return_value=client):
            svc = AutoCloseService()
            result = svc.run()
        assert result["error_count"] >= 1


# ═══════════════════════════════════════════════
#  test_query tests
# ═══════════════════════════════════════════════

class TestTestQuery:
    def test_returns_tickets(self):
        """Normal: returns list of tickets."""
        _mock_supabase_client.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = \
            type("Resp", (), {"data": [{"id": "t1", "title": "Test"}]})()
        svc = AutoCloseService()

        result = svc.test_query()

        assert len(result) == 1
        assert result[0]["id"] == "t1"

    def test_error_returns_empty(self):
        """Exception → returns empty list."""
        _mock_supabase_client.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.side_effect = \
            Exception("Fail")
        svc = AutoCloseService()

        result = svc.test_query()

        assert result == []


# ═══════════════════════════════════════════════
#  Singleton tests
# ═══════════════════════════════════════════════

class TestSingleton:
    def test_load_returns_instance(self):
        """load() returns an AutoCloseService instance."""
        inst = svc_load()
        assert isinstance(inst, AutoCloseService)

    def test_load_returns_same_instance(self):
        """load() called twice returns the same object."""
        import backend.services.auto_close_service as acs
        acs._instance = None
        inst1 = svc_load()
        inst2 = svc_load()
        assert inst1 is inst2

    def test_get_instance_before_load(self):
        """get_instance() before load() returns None."""
        import backend.services.auto_close_service as acs
        acs._instance = None
        assert get_instance() is None

    def test_get_instance_after_load(self):
        """get_instance() after load() returns the instance."""
        inst = svc_load()
        assert get_instance() is inst
