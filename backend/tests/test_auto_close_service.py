"""
Unit tests for AutoCloseService (backend/services/auto_close_service.py).

Tests cover:
- get_system_settings: DB lookup with fallback to defaults
- _close_ticket: ticket closing with stats tracking
- run(): disabled state, no tickets, old tickets close, recent tickets skip
- Edge cases: missing updated_at, invalid timestamps, company errors
"""

import os
import pytest
from unittest.mock import patch, MagicMock, PropertyMock
from datetime import datetime, timedelta, timezone


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def mock_env(monkeypatch):
    """Set required env vars so AutoCloseService.__init__ doesn't crash."""
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-key")
    monkeypatch.setenv("AUTO_CLOSE_ENABLED", "true")
    monkeypatch.setenv("AUTO_CLOSE_DAYS", "7")


@pytest.fixture
def mock_supabase():
    """Return a MagicMock Supabase client."""
    return MagicMock()


@pytest.fixture
def service(mock_supabase):
    """Create AutoCloseService with mocked Supabase."""
    with patch("services.auto_close_service.create_client", return_value=mock_supabase):
        from services.auto_close_service import AutoCloseService
        svc = AutoCloseService()
        svc.supabase = mock_supabase
        return svc


# ── get_system_settings tests ─────────────────────────────────────────────────

class TestGetSystemSettings:
    def test_returns_db_settings_when_found(self, service, mock_supabase):
        """Settings from DB should be returned when the row exists."""
        mock_response = MagicMock()
        mock_response.data = {"auto_close_days": 14, "auto_close_enabled": False}
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = service.get_system_settings("company-123")

        assert result == {"auto_close_days": 14, "auto_close_enabled": False}

    def test_returns_defaults_on_exception(self, service, mock_supabase):
        """Should fall back to defaults when DB query raises."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB error")

        result = service.get_system_settings("company-err")

        assert result["auto_close_days"] == service.default_auto_close_days
        assert result["auto_close_enabled"] is True

    def test_returns_defaults_when_data_is_none(self, service, mock_supabase):
        """Should fall back to defaults when response.data is None."""
        mock_response = MagicMock()
        mock_response.data = None
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = service.get_system_settings("company-none")

        assert result["auto_close_days"] == service.default_auto_close_days
        assert result["auto_close_enabled"] is True


# ── _close_ticket tests ───────────────────────────────────────────────────────

class TestCloseTicket:
    def test_close_ticket_success(self, service, mock_supabase):
        """Successful close should increment closed_count and return True."""
        stats = {"closed_count": 0, "error_count": 0}
        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock()

        result = service._close_ticket("ticket-1", "company-1", stats)

        assert result is True
        assert stats["closed_count"] == 1
        assert stats["error_count"] == 0

    def test_close_ticket_failure(self, service, mock_supabase):
        """DB error should increment error_count and return False."""
        stats = {"closed_count": 0, "error_count": 0}
        mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.side_effect = Exception("DB write error")

        result = service._close_ticket("ticket-err", "company-1", stats)

        assert result is False
        assert stats["closed_count"] == 0
        assert stats["error_count"] == 1


# ── run() tests ───────────────────────────────────────────────────────────────

class TestRun:
    def test_run_disabled(self, service, monkeypatch):
        """When AUTO_CLOSE_ENABLED=false, should return disabled status."""
        service.enabled = False

        result = service.run()

        assert result == {"status": "disabled"}

    def test_run_no_resolved_tickets(self, service, mock_supabase):
        """No resolved tickets should return zero counts."""
        mock_response = MagicMock()
        mock_response.data = []
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        result = service.run()

        assert result["processed_count"] == 0
        assert result["closed_count"] == 0
        assert result["error_count"] == 0

    def test_run_closes_old_tickets(self, service, mock_supabase):
        """Tickets older than auto_close_days should be closed."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": old_date}
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        # Mock get_system_settings
        service.get_system_settings = MagicMock(return_value={"auto_close_days": 7, "auto_close_enabled": True})
        service._close_ticket = MagicMock(return_value=True)

        result = service.run()

        assert result["processed_count"] == 1
        service._close_ticket.assert_called_once_with("t1", "c1", result)

    def test_run_skips_recent_tickets(self, service, mock_supabase):
        """Tickets newer than auto_close_days should be skipped."""
        recent_date = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "t2", "company_id": "c1", "status": "resolved", "updated_at": recent_date}
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        service.get_system_settings = MagicMock(return_value={"auto_close_days": 7, "auto_close_enabled": True})

        result = service.run()

        assert result["skipped_count"] == 1
        assert result["closed_count"] == 0

    def test_run_skips_when_company_disabled(self, service, mock_supabase):
        """Tickets from companies with auto_close_enabled=False should be skipped."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "t3", "company_id": "c2", "status": "resolved", "updated_at": old_date}
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        service.get_system_settings = MagicMock(return_value={"auto_close_days": 7, "auto_close_enabled": False})

        result = service.run()

        assert result["skipped_count"] == 1
        assert result["closed_count"] == 0

    def test_run_handles_missing_updated_at(self, service, mock_supabase):
        """Tickets with missing updated_at should be skipped gracefully."""
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "t4", "company_id": "c1", "status": "resolved", "updated_at": None}
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        service.get_system_settings = MagicMock(return_value={"auto_close_days": 7, "auto_close_enabled": True})

        result = service.run()

        # Ticket with missing updated_at is skipped (not counted in any bucket)
        assert result["processed_count"] == 1

    def test_run_handles_invalid_timestamp(self, service, mock_supabase):
        """Tickets with unparseable timestamps should count as errors."""
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "t5", "company_id": "c1", "status": "resolved", "updated_at": "not-a-date"}
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        service.get_system_settings = MagicMock(return_value={"auto_close_days": 7, "auto_close_enabled": True})

        result = service.run()

        assert result["error_count"] == 1

    def test_run_handles_fatal_error(self, service, mock_supabase):
        """Fatal exception in the main query should be caught and counted."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("Fatal DB error")

        result = service.run()

        assert result["error_count"] >= 1


# ── Singleton tests ───────────────────────────────────────────────────────────

class TestSingleton:
    def test_load_returns_singleton(self, mock_supabase):
        """load() should return the same instance on repeated calls."""
        with patch("services.auto_close_service.create_client", return_value=mock_supabase):
            import services.auto_close_service as mod
            mod._instance = None  # Reset
            inst1 = mod.load()
            inst2 = mod.load()
            assert inst1 is inst2

    def test_get_instance_returns_none_before_load(self):
        """get_instance() should return None before load() is called."""
        import services.auto_close_service as mod
        mod._instance = None
        assert mod.get_instance() is None
