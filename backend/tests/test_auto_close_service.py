"""
Unit tests for AutoCloseService run method.
Issue: #1154
"""

import os
import sys
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch

sys.modules['supabase'] = Mock()
sys.modules['supabase'].create_client = Mock()
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.services.auto_close_service import AutoCloseService, load, get_instance


class TestAutoCloseServiceRun(unittest.TestCase):

    def setUp(self):
        import backend.services.auto_close_service as acs
        acs._instance = None

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_no_resolved_tickets(self, mock_create_client):
        """Test run() with no resolved tickets returns zero counts."""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = []
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 0)
        self.assertEqual(result["closed_count"], 0)
        self.assertEqual(result["error_count"], 0)
        self.assertEqual(result["skipped_count"], 0)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_closes_old_resolved_tickets(self, mock_create_client):
        """Test that tickets older than auto_close_days are closed."""
        mock_client = Mock()
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        mock_tickets_response = Mock()
        mock_tickets_response.data = [{"id": "ticket-001", "company_id": "company-001", "status": "resolved", "updated_at": old_date}]
        mock_settings_response = Mock()
        mock_settings_response.data = {"auto_close_days": 7, "auto_close_enabled": True}
        tickets_eq_mock = Mock()
        tickets_eq_mock.execute.return_value = mock_tickets_response
        tickets_select_mock = Mock()
        tickets_select_mock.eq.return_value = tickets_eq_mock
        tickets_table_mock = Mock()
        tickets_table_mock.select.return_value = tickets_select_mock
        settings_eq_mock = Mock()
        settings_eq_mock.single.return_value = Mock()
        settings_eq_mock.single.return_value.execute.return_value = mock_settings_response
        settings_select_mock = Mock()
        settings_select_mock.eq.return_value = settings_eq_mock
        settings_table_mock = Mock()
        settings_table_mock.select.return_value = settings_select_mock
        def table_side_effect(name):
            if name == "tickets": return tickets_table_mock
            elif name == "system_settings": return settings_table_mock
            return Mock()
        mock_client.table.side_effect = table_side_effect
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["closed_count"], 1)
        self.assertEqual(result["skipped_count"], 0)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_skips_recent_tickets(self, mock_create_client):
        """Test that tickets newer than auto_close_days are skipped."""
        mock_client = Mock()
        recent_date = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        mock_tickets_response = Mock()
        mock_tickets_response.data = [{"id": "ticket-002", "company_id": "company-002", "status": "resolved", "updated_at": recent_date}]
        mock_settings_response = Mock()
        mock_settings_response.data = {"auto_close_days": 7, "auto_close_enabled": True}
        tickets_eq_mock = Mock()
        tickets_eq_mock.execute.return_value = mock_tickets_response
        tickets_select_mock = Mock()
        tickets_select_mock.eq.return_value = tickets_eq_mock
        tickets_table_mock = Mock()
        tickets_table_mock.select.return_value = tickets_select_mock
        settings_eq_mock = Mock()
        settings_eq_mock.single.return_value = Mock()
        settings_eq_mock.single.return_value.execute.return_value = mock_settings_response
        settings_select_mock = Mock()
        settings_select_mock.eq.return_value = settings_eq_mock
        settings_table_mock = Mock()
        settings_table_mock.select.return_value = settings_select_mock
        def table_side_effect(name):
            if name == "tickets": return tickets_table_mock
            elif name == "system_settings": return settings_table_mock
            return Mock()
        mock_client.table.side_effect = table_side_effect
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["closed_count"], 0)
        self.assertEqual(result["skipped_count"], 1)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_skips_when_company_disabled(self, mock_create_client):
        """Test that tickets are skipped when auto-close is disabled for company."""
        mock_client = Mock()
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        mock_tickets_response = Mock()
        mock_tickets_response.data = [{"id": "ticket-003", "company_id": "company-003", "status": "resolved", "updated_at": old_date}]
        mock_settings_response = Mock()
        mock_settings_response.data = {"auto_close_days": 7, "auto_close_enabled": False}
        tickets_eq_mock = Mock()
        tickets_eq_mock.execute.return_value = mock_tickets_response
        tickets_select_mock = Mock()
        tickets_select_mock.eq.return_value = tickets_eq_mock
        tickets_table_mock = Mock()
        tickets_table_mock.select.return_value = tickets_select_mock
        settings_eq_mock = Mock()
        settings_eq_mock.single.return_value = Mock()
        settings_eq_mock.single.return_value.execute.return_value = mock_settings_response
        settings_select_mock = Mock()
        settings_select_mock.eq.return_value = settings_eq_mock
        settings_table_mock = Mock()
        settings_table_mock.select.return_value = settings_select_mock
        def table_side_effect(name):
            if name == "tickets": return tickets_table_mock
            elif name == "system_settings": return settings_table_mock
            return Mock()
        mock_client.table.side_effect = table_side_effect
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["closed_count"], 0)
        self.assertEqual(result["skipped_count"], 1)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_handles_missing_updated_at(self, mock_create_client):
        """Test that tickets with missing updated_at are handled gracefully."""
        mock_client = Mock()
        mock_tickets_response = Mock()
        mock_tickets_response.data = [{"id": "ticket-004", "company_id": "company-004", "status": "resolved", "updated_at": None}]
        mock_settings_response = Mock()
        mock_settings_response.data = {"auto_close_days": 7, "auto_close_enabled": True}
        tickets_eq_mock = Mock()
        tickets_eq_mock.execute.return_value = mock_tickets_response
        tickets_select_mock = Mock()
        tickets_select_mock.eq.return_value = tickets_eq_mock
        tickets_table_mock = Mock()
        tickets_table_mock.select.return_value = tickets_select_mock
        settings_eq_mock = Mock()
        settings_eq_mock.single.return_value = Mock()
        settings_eq_mock.single.return_value.execute.return_value = mock_settings_response
        settings_select_mock = Mock()
        settings_select_mock.eq.return_value = settings_eq_mock
        settings_table_mock = Mock()
        settings_table_mock.select.return_value = settings_select_mock
        def table_side_effect(name):
            if name == "tickets": return tickets_table_mock
            elif name == "system_settings": return settings_table_mock
            return Mock()
        mock_client.table.side_effect = table_side_effect
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["closed_count"], 0)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_handles_invalid_timestamp(self, mock_create_client):
        """Test that invalid timestamps are counted as errors."""
        mock_client = Mock()
        mock_tickets_response = Mock()
        mock_tickets_response.data = [{"id": "ticket-005", "company_id": "company-005", "status": "resolved", "updated_at": "not-a-valid-date"}]
        mock_settings_response = Mock()
        mock_settings_response.data = {"auto_close_days": 7, "auto_close_enabled": True}
        tickets_eq_mock = Mock()
        tickets_eq_mock.execute.return_value = mock_tickets_response
        tickets_select_mock = Mock()
        tickets_select_mock.eq.return_value = tickets_eq_mock
        tickets_table_mock = Mock()
        tickets_table_mock.select.return_value = tickets_select_mock
        settings_eq_mock = Mock()
        settings_eq_mock.single.return_value = Mock()
        settings_eq_mock.single.return_value.execute.return_value = mock_settings_response
        settings_select_mock = Mock()
        settings_select_mock.eq.return_value = settings_eq_mock
        settings_table_mock = Mock()
        settings_table_mock.select.return_value = settings_select_mock
        def table_side_effect(name):
            if name == "tickets": return tickets_table_mock
            elif name == "system_settings": return settings_table_mock
            return Mock()
        mock_client.table.side_effect = table_side_effect
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["error_count"], 1)
        self.assertEqual(result["closed_count"], 0)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_uses_default_settings_on_db_error(self, mock_create_client):
        """Test that DB error fallback returns disabled (safe default)."""
        mock_client = Mock()
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        mock_tickets_response = Mock()
        mock_tickets_response.data = [{"id": "ticket-006", "company_id": "company-006", "status": "resolved", "updated_at": old_date}]
        settings_eq_mock = Mock()
        settings_eq_mock.single.return_value = Mock()
        settings_eq_mock.single.return_value.execute.side_effect = Exception("DB Error")
        settings_select_mock = Mock()
        settings_select_mock.eq.return_value = settings_eq_mock
        settings_table_mock = Mock()
        settings_table_mock.select.return_value = settings_select_mock
        tickets_eq_mock = Mock()
        tickets_eq_mock.execute.return_value = mock_tickets_response
        tickets_select_mock2 = Mock()
        tickets_select_mock2.eq.return_value = tickets_eq_mock
        tickets_table_mock = Mock()
        tickets_table_mock.select.return_value = tickets_select_mock2
        def table_side_effect(name):
            if name == "tickets": return tickets_table_mock
            elif name == "system_settings": return settings_table_mock
            return Mock()
        mock_client.table.side_effect = table_side_effect
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        # DB fallback returns auto_close_enabled=False (safe default), so tickets are skipped
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["closed_count"], 0)
        self.assertEqual(result["skipped_count"], 1)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "5",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_respects_custom_auto_close_days(self, mock_create_client):
        """Test that custom AUTO_CLOSE_DAYS env var is respected."""
        mock_client = Mock()
        old_date = (datetime.now(timezone.utc) - timedelta(days=6)).isoformat()
        mock_tickets_response = Mock()
        mock_tickets_response.data = [{"id": "ticket-007", "company_id": "company-007", "status": "resolved", "updated_at": old_date}]
        mock_settings_response = Mock()
        mock_settings_response.data = {"auto_close_days": 5, "auto_close_enabled": True}
        tickets_eq_mock = Mock()
        tickets_eq_mock.execute.return_value = mock_tickets_response
        tickets_select_mock = Mock()
        tickets_select_mock.eq.return_value = tickets_eq_mock
        tickets_table_mock = Mock()
        tickets_table_mock.select.return_value = tickets_select_mock
        settings_eq_mock = Mock()
        settings_eq_mock.single.return_value = Mock()
        settings_eq_mock.single.return_value.execute.return_value = mock_settings_response
        settings_select_mock = Mock()
        settings_select_mock.eq.return_value = settings_eq_mock
        settings_table_mock = Mock()
        settings_table_mock.select.return_value = settings_select_mock
        def table_side_effect(name):
            if name == "tickets": return tickets_table_mock
            elif name == "system_settings": return settings_table_mock
            return Mock()
        mock_client.table.side_effect = table_side_effect
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["closed_count"], 1)
        self.assertEqual(result["skipped_count"], 0)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_run_handles_fatal_error_gracefully(self, mock_create_client):
        """Test that fatal errors in run() are handled and stats returned."""
        mock_client = Mock()
        mock_client.table.side_effect = Exception("Connection refused")
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertIn("error_count", result)
        self.assertGreaterEqual(result["error_count"], 1)


class TestAutoCloseServiceInit(unittest.TestCase):

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://test.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key-123",
        "AUTO_CLOSE_DAYS": "14",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 0 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_init_reads_env_vars(self, mock_create_client):
        """Test that constructor reads environment variables correctly."""
        mock_client = Mock()
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        self.assertEqual(service.default_auto_close_days, 14)
        self.assertEqual(service.cron_schedule, "0 0 * * *")
        mock_create_client.assert_called_once_with("http://test.supabase.co", "test-key-123")

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_init_defaults(self, mock_create_client):
        """Test default values when env vars are not set."""
        mock_client = Mock()
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        self.assertEqual(service.default_auto_close_days, 7)
        self.assertEqual(service.cron_schedule, "0 2 * * *")


class TestAutoCloseServiceGetCompanySettings(unittest.TestCase):

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_get_company_settings_from_db(self, mock_create_client):
        """Test fetching settings from database."""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = {"auto_close_days": 10, "auto_close_enabled": False}
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        settings = service.get_company_settings("company-001")
        self.assertEqual(settings["auto_close_days"], 10)
        self.assertEqual(settings["auto_close_enabled"], False)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_get_company_settings_fallback_on_error(self, mock_create_client):
        """Test fallback to safe disabled defaults when DB query fails."""
        mock_client = Mock()
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB Error")
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        settings = service.get_company_settings("company-002")
        # Per code: fallback is safe default (disabled) to prevent accidental auto-closes
        self.assertEqual(settings["auto_close_days"], 7)
        self.assertEqual(settings["auto_close_enabled"], False)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_is_auto_close_enabled_method(self, mock_create_client):
        """Test is_auto_close_enabled method reads from company settings."""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = {"auto_close_days": 7, "auto_close_enabled": True}
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        self.assertTrue(service.is_auto_close_enabled("company-003"))

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_get_auto_close_days_method(self, mock_create_client):
        """Test get_auto_close_days method reads from company settings."""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = {"auto_close_days": 10, "auto_close_enabled": True}
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        self.assertEqual(service.get_auto_close_days("company-004"), 10)


class TestAutoCloseServiceHelpers(unittest.TestCase):

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_load_singleton(self, mock_create_client):
        """Test that load() returns a singleton instance."""
        mock_client = Mock()
        mock_create_client.return_value = mock_client
        import backend.services.auto_close_service as acs
        acs._instance = None
        instance1 = load()
        instance2 = load()
        self.assertIs(instance1, instance2)
        self.assertIsNotNone(get_instance())
        self.assertIs(get_instance(), instance1)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch('backend.services.auto_close_service.create_client')
    def test_get_instance_before_load(self, mock_create_client):
        """Test get_instance() returns None before load() is called."""
        import backend.services.auto_close_service as acs
        acs._instance = None
        self.assertIsNone(get_instance())


class TestGetCompanySettingsCaching(_AutoCloseTestBase):
    """Tests for get_company_settings caching behavior (Issue #1155)."""

    def _mock_db_response(self, data):
        """Configure mock Supabase to return specific settings data."""
        mock_resp = MagicMock()
        mock_resp.data = data
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

    def test_cache_hit_skips_db_query(self):
        """Second call for same company should use cache, not query DB."""
        self._mock_db_response({"auto_close_days": 14, "auto_close_enabled": True})

        # First call — populates cache
        result1 = self.service.get_company_settings("c-cache")
        # Second call — should hit cache
        result2 = self.service.get_company_settings("c-cache")

        self.assertEqual(result1["auto_close_days"], 14)
        self.assertEqual(result2["auto_close_days"], 14)
        # DB should only be queried once (first call)
        self.assertEqual(self.mock_supabase.table.call_count, 1)

    def test_different_companies_get_separate_cache_entries(self):
        """Each company should have its own cache entry."""
        resp_a = MagicMock()
        resp_a.data = {"auto_close_days": 5, "auto_close_enabled": True}
        resp_b = MagicMock()
        resp_b.data = {"auto_close_days": 10, "auto_close_enabled": False}

        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.side_effect = [resp_a, resp_b]

        result_a = self.service.get_company_settings("c-A")
        result_b = self.service.get_company_settings("c-B")

        self.assertEqual(result_a["auto_close_days"], 5)
        self.assertEqual(result_b["auto_close_days"], 10)
        self.assertTrue(result_a["auto_close_enabled"])
        self.assertFalse(result_b["auto_close_enabled"])

    def test_expired_cache_refreshes_from_db(self):
        """After TTL expires, should query DB again."""
        self._mock_db_response({"auto_close_days": 7, "auto_close_enabled": True})

        # First call
        self.service.get_company_settings("c-expire")

        # Manually expire the cache entry
        self.service._settings_cache["c-expire"]["_cached_at"] = 0

        # Mock new response
        resp_new = MagicMock()
        resp_new.data = {"auto_close_days": 21, "auto_close_enabled": False}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = resp_new

        result = self.service.get_company_settings("c-expire")

        self.assertEqual(result["auto_close_days"], 21)
        self.assertFalse(result["auto_close_enabled"])
        # DB should have been called twice
        self.assertEqual(self.mock_supabase.table.call_count, 2)

    def test_clear_cache_forces_db_query(self):
        """clear_cache() should force next call to query DB."""
        self._mock_db_response({"auto_close_days": 7, "auto_close_enabled": True})

        # Populate cache
        self.service.get_company_settings("c-clear")
        self.assertEqual(self.mock_supabase.table.call_count, 1)

        # Clear cache
        self.service.clear_cache()

        # Next call should query DB again
        resp_new = MagicMock()
        resp_new.data = {"auto_close_days": 30, "auto_close_enabled": True}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = resp_new

        result = self.service.get_company_settings("c-clear")
        self.assertEqual(result["auto_close_days"], 30)
        self.assertEqual(self.mock_supabase.table.call_count, 2)

    def test_cached_at_timestamp_is_stored(self):
        """Cache entry should include _cached_at timestamp."""
        self._mock_db_response({"auto_close_days": 7, "auto_close_enabled": True})

        self.service.get_company_settings("c-ts")
        cached = self.service._settings_cache.get("c-ts")

        self.assertIsNotNone(cached)
        self.assertIn("_cached_at", cached)
        self.assertGreater(cached["_cached_at"], 0)

    def test_db_error_does_not_cache_defaults(self):
        """When DB fails, defaults should be returned but NOT cached."""
        self.mock_supabase.table.side_effect = Exception("connection refused")

        result = self.service.get_company_settings("c-err")

        self.assertEqual(result["auto_close_days"], 7)
        self.assertFalse(result["auto_close_enabled"])
        # Defaults should NOT be cached — next call should retry DB
        self.assertNotIn("c-err", self.service._settings_cache)

    def test_fallback_defaults_are_disabled(self):
        """DB error fallback should default to auto_close_enabled=False (safe)."""
        self.mock_supabase.table.side_effect = Exception("timeout")

        result = self.service.get_company_settings("c-safe")
        self.assertFalse(result["auto_close_enabled"],
                         "Fallback should disable auto-close for safety")


class TestIsAutoCloseEnabled(_AutoCloseTestBase):
    """Tests for is_auto_close_enabled helper (Issue #1155)."""

    def test_returns_true_when_db_enabled(self):
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_enabled": True, "auto_close_days": 7}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        self.assertTrue(self.service.is_auto_close_enabled("c-1"))

    def test_returns_false_when_db_disabled(self):
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_enabled": False, "auto_close_days": 7}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        self.assertFalse(self.service.is_auto_close_enabled("c-2"))

    def test_returns_false_on_db_error(self):
        self.mock_supabase.table.side_effect = Exception("db down")
        self.assertFalse(self.service.is_auto_close_enabled("c-err"))


class TestGetAutoCloseDays(_AutoCloseTestBase):
    """Tests for get_auto_close_days helper (Issue #1155)."""

    def test_returns_db_value(self):
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 14, "auto_close_enabled": True}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        self.assertEqual(self.service.get_auto_close_days("c-1"), 14)

    def test_returns_default_on_db_error(self):
        self.mock_supabase.table.side_effect = Exception("db down")
        self.assertEqual(self.service.get_auto_close_days("c-err"), 7)

    def test_returns_default_when_missing_from_response(self):
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_enabled": True}  # no auto_close_days
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        self.assertEqual(self.service.get_auto_close_days("c-partial"), 7)


if __name__ == "__main__":
    unittest.main(verbosity=2)
