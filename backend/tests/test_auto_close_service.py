"""Unit tests for AutoCloseService.

Tests mock the Supabase client and environment variables to avoid
requiring a real database connection.
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch, PropertyMock

# Mock supabase module and dotenv before importing the service
sys.modules["supabase"] = MagicMock()
sys.modules["dotenv"] = MagicMock()

# Ensure the backend directory is on sys.path for service imports
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, os.path.abspath(BACKEND_DIR))

from services.auto_close_service import AutoCloseService, load, get_instance


class TestAutoCloseService:
    """Tests for the AutoCloseService class."""

    def setup_method(self):
        """Create a fresh service instance with mocked dependencies."""
        self.env_patcher = patch.dict(os.environ, {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_SERVICE_ROLE_KEY": "test-key",
            "AUTO_CLOSE_ENABLED": "true",
            "AUTO_CLOSE_DAYS": "7",
        })
        self.env_patcher.start()

        # Mock supabase create_client
        self.supabase_patcher = patch("services.auto_close_service.create_client")
        self.mock_create_client = self.supabase_patcher.start()
        self.mock_supabase = MagicMock()
        self.mock_create_client.return_value = self.mock_supabase

        self.service = AutoCloseService()

    def teardown_method(self):
        """Clean up patchers."""
        self.env_patcher.stop()
        self.supabase_patcher.stop()

    # ── Initialization ────────────────────────────────────────────

    def test_init_reads_env_vars(self):
        """AutoCloseService reads configuration from environment variables."""
        assert self.service.enabled is True
        assert self.service.default_auto_close_days == 7
        assert self.service.cron_schedule == "0 2 * * *"

    def test_init_disabled(self):
        """Service can be initialized as disabled."""
        with patch.dict(os.environ, {"AUTO_CLOSE_ENABLED": "false"}):
            s = AutoCloseService()
            assert s.enabled is False

    def test_init_custom_days(self):
        """Service reads custom auto_close_days from env."""
        with patch.dict(os.environ, {"AUTO_CLOSE_DAYS": "14"}):
            s = AutoCloseService()
            assert s.default_auto_close_days == 14

    def test_init_custom_cron(self):
        """Service reads custom cron schedule from env."""
        with patch.dict(os.environ, {"AUTO_CLOSE_CRON_SCHEDULE": "0 3 * * *"}):
            s = AutoCloseService()
            assert s.cron_schedule == "0 3 * * *"

    # ── run (disabled) ────────────────────────────────────────────

    def test_run_disabled(self):
        """run returns disabled status when service is disabled."""
        self.service.enabled = False
        result = self.service.run()
        assert result == {"status": "disabled"}

    # ── run (enabled, no tickets) ─────────────────────────────────

    def test_run_no_tickets(self):
        """run handles empty resolved tickets list."""
        mock_response = MagicMock()
        mock_response.data = []
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        result = self.service.run()

        assert result["processed_count"] == 0
        assert result["closed_count"] == 0
        assert result["error_count"] == 0
        assert result["skipped_count"] == 0

    # ── run (enabled, with tickets) ───────────────────────────────

    def test_run_closes_old_tickets(self):
        """run closes tickets older than auto_close_days."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()

        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = [
            {"id": "ticket-1", "company_id": "company-A", "status": "resolved",
             "updated_at": old_date}
        ]
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp

        # Mock system_settings response
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {
            "auto_close_days": 7,
            "auto_close_enabled": True
        }
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        # Mock update response
        mock_update_resp = MagicMock()
        self.mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_update_resp

        result = self.service.run()

        assert result["processed_count"] == 1
        assert result["closed_count"] == 1
        assert result["skipped_count"] == 0

    def test_run_skips_recent_tickets(self):
        """run skips tickets updated within auto_close_days."""
        recent_date = datetime.now(timezone.utc).isoformat()

        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = [
            {"id": "ticket-2", "company_id": "company-A", "status": "resolved",
             "updated_at": recent_date}
        ]
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp

        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {
            "auto_close_days": 7,
            "auto_close_enabled": True
        }
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        result = self.service.run()

        assert result["processed_count"] == 1
        assert result["closed_count"] == 0
        assert result["skipped_count"] == 1

    def test_run_disabled_for_company(self):
        """run skips tickets for companies with auto-close disabled."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()

        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = [
            {"id": "ticket-3", "company_id": "company-B", "status": "resolved",
             "updated_at": old_date}
        ]
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp

        # Company has auto-close disabled
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {
            "auto_close_days": 7,
            "auto_close_enabled": False
        }
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        result = self.service.run()

        assert result["processed_count"] == 1
        assert result["closed_count"] == 0
        assert result["skipped_count"] == 1

    def test_run_handles_multiple_companies(self):
        """run correctly processes tickets from multiple companies."""
        now = datetime.now(timezone.utc)
        old_date = (now - timedelta(days=10)).isoformat()

        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = [
            {"id": "t-A1", "company_id": "company-A", "status": "resolved",
             "updated_at": old_date},
            {"id": "t-B1", "company_id": "company-B", "status": "resolved",
             "updated_at": old_date},
            {"id": "t-A2", "company_id": "company-A", "status": "resolved",
             "updated_at": old_date},
        ]
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp

        def settings_side_effect(*args, **kwargs):
            resp = MagicMock()
            resp.data = {"auto_close_days": 7, "auto_close_enabled": True}
            return resp

        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = settings_side_effect

        mock_update_resp = MagicMock()
        self.mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_update_resp

        result = self.service.run()

        assert result["processed_count"] == 3
        assert result["closed_count"] == 3

    # ── get_system_settings ──────────────────────────────────────

    def test_get_system_settings_returns_values(self):
        """get_system_settings returns settings from database."""
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 5, "auto_close_enabled": False}
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        settings = self.service.get_system_settings("company-123")

        assert settings["auto_close_days"] == 5
        assert settings["auto_close_enabled"] is False

    def test_get_system_settings_fallback_to_defaults(self):
        """get_system_settings falls back to defaults when query fails."""
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB error")

        settings = self.service.get_system_settings("company-456")

        assert settings["auto_close_days"] == 7
        assert settings["auto_close_enabled"] is True

    # ── _close_ticket ─────────────────────────────────────────────

    def test_close_ticket_success(self):
        """_close_ticket updates ticket status to closed."""
        mock_resp = MagicMock()
        self.mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_resp

        stats = {"closed_count": 0, "error_count": 0}
        result = self.service._close_ticket("ticket-1", "company-A", stats)

        assert result is True
        assert stats["closed_count"] == 1

    def test_close_ticket_failure(self):
        """_close_ticket handles update failure."""
        self.mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.side_effect = Exception("Update failed")

        stats = {"closed_count": 0, "error_count": 0}
        result = self.service._close_ticket("ticket-1", "company-A", stats)

        assert result is False
        assert stats["error_count"] == 1

    # ── test_query ─────────────────────────────────────────────────

    def test_test_query_returns_tickets(self):
        """test_query returns resolved tickets."""
        mock_resp = MagicMock()
        mock_resp.data = [{"id": "t-1", "title": "Test"}]
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = mock_resp

        tickets = self.service.test_query()
        assert len(tickets) == 1
        assert tickets[0]["id"] == "t-1"

    def test_test_query_handles_empty(self):
        """test_query handles empty result."""
        mock_resp = MagicMock()
        mock_resp.data = []
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = mock_resp

        tickets = self.service.test_query()
        assert tickets == []

    def test_test_query_handles_exception(self):
        """test_query handles exceptions gracefully."""
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.side_effect = Exception("DB error")

        tickets = self.service.test_query()
        assert tickets == []

    # ── run error handling ────────────────────────────────────────

    def test_run_handles_ticket_fetch_error(self):
        """run handles errors when fetching resolved tickets."""
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("Connection failed")

        result = self.service.run()
        assert result["error_count"] >= 1

    def test_run_skips_tickets_missing_updated_at(self):
        """run skips tickets that are missing updated_at field."""
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = [
            {"id": "ticket-no-date", "company_id": "company-A",
             "status": "resolved", "updated_at": None}
        ]
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp

        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {
            "auto_close_days": 7,
            "auto_close_enabled": True
        }
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        result = self.service.run()

        assert result["processed_count"] == 1
        assert result["closed_count"] == 0

    def test_run_handles_invalid_timestamp(self):
        """run handles invalid timestamps gracefully."""
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = [
            {"id": "ticket-bad-date", "company_id": "company-A",
             "status": "resolved", "updated_at": "not-a-timestamp"}
        ]
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp

        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {
            "auto_close_days": 7,
            "auto_close_enabled": True
        }
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        result = self.service.run()

        assert result["error_count"] >= 1

    # ── Singleton functions ───────────────────────────────────────

    def test_load_creates_singleton(self):
        """load creates and returns a singleton instance."""
        # Clear the global instance
        import services.auto_close_service as acs
        acs._instance = None

        with patch("services.auto_close_service.create_client") as mock_cc:
            mock_cc.return_value = MagicMock()
            with patch.dict(os.environ, {
                "SUPABASE_URL": "https://test.supabase.co",
                "SUPABASE_SERVICE_ROLE_KEY": "test-key",
            }):
                instance = load()
                assert instance is not None
                assert isinstance(instance, AutoCloseService)

                # Second call returns same instance
                instance2 = load()
                assert instance2 is instance

    def test_get_instance_returns_none_before_load(self):
        """get_instance returns None before load() is called."""
        import services.auto_close_service as acs
        acs._instance = None
        assert get_instance() is None

    def test_get_instance_returns_instance_after_load(self):
        """get_instance returns the loaded instance after load()."""
        import services.auto_close_service as acs
        acs._instance = None

        with patch("services.auto_close_service.create_client") as mock_cc:
            mock_cc.return_value = MagicMock()
            with patch.dict(os.environ, {
                "SUPABASE_URL": "https://test.supabase.co",
                "SUPABASE_SERVICE_ROLE_KEY": "test-key",
            }):
                instance = load()
                assert get_instance() is instance
