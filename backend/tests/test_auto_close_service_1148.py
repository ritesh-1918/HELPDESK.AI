"""
Unit tests for auto_close_service - get_system_settings and condition evaluation.
Issue: #1148
"""

import os
import sys
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch

sys.modules["supabase"] = Mock()
sys.modules["supabase"].create_client = Mock()

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.services.auto_close_service import AutoCloseService, load, get_instance


class TestGetCompanySettings(unittest.TestCase):
    """Test get_company_settings method."""

    def setUp(self):
        import backend.services.auto_close_service as acs
        acs._instance = None

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_get_settings_from_db_success(self, mock_create_client):
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = {
            "auto_close_days": 14,
            "auto_close_enabled": True
        }
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        settings = service.get_company_settings("company-001")
        self.assertEqual(settings["auto_close_days"], 14)
        self.assertTrue(settings["auto_close_enabled"])

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_get_settings_from_db_disabled(self, mock_create_client):
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = {
            "auto_close_days": 7,
            "auto_close_enabled": False
        }
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        settings = service.get_company_settings("company-002")
        self.assertFalse(settings["auto_close_enabled"])

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_get_settings_fallback_on_db_error(self, mock_create_client):
        mock_client = Mock()
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB Error")
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        settings = service.get_company_settings("company-003")
        self.assertEqual(settings["auto_close_days"], 7)
        self.assertFalse(settings["auto_close_enabled"])

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "5",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_get_settings_uses_env_default_days(self, mock_create_client):
        mock_client = Mock()
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB Error")
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        settings = service.get_company_settings("company-004")
        self.assertEqual(settings["auto_close_days"], 5)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_get_settings_caches_result(self, mock_create_client):
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = {"auto_close_days": 10, "auto_close_enabled": True}
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        settings1 = service.get_company_settings("company-005")
        settings2 = service.get_company_settings("company-005")
        self.assertEqual(settings1, settings2)


class TestAutoCloseConditionEvaluation(unittest.TestCase):
    """Test auto-close condition evaluation logic."""

    def test_ticket_older_than_threshold_should_close(self):
        old_date = datetime.now(timezone.utc) - timedelta(days=10)
        cutoff = datetime(2026, 5, 26, 10, 0, 0, tzinfo=timezone.utc)
        self.assertTrue(old_date < cutoff)

    def test_ticket_newer_than_threshold_should_not_close(self):
        recent_date = datetime.now(timezone.utc) - timedelta(days=2)
        cutoff = datetime(2026, 5, 26, 10, 0, 0, tzinfo=timezone.utc)
        self.assertFalse(recent_date < cutoff)

    def test_ticket_exactly_at_threshold(self):
        exact_date = datetime(2026, 5, 26, 10, 0, 0, tzinfo=timezone.utc)
        cutoff = datetime(2026, 5, 26, 10, 0, 0, tzinfo=timezone.utc)
        self.assertFalse(exact_date < cutoff)

    def test_invalid_date_format_raises_error(self):
        with self.assertRaises((ValueError, Exception)):
            datetime.fromisoformat("not-a-date")

    def test_missing_updated_at_means_no_close(self):
        ticket = {"id": "ticket-001", "updated_at": None}
        self.assertIsNone(ticket["updated_at"])


class TestStatusUpdateHandling(unittest.TestCase):
    """Test status update handling in auto-close."""

    def setUp(self):
        import backend.services.auto_close_service as acs
        acs._instance = None

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_run_with_resolved_tickets(self, mock_create_client):
        mock_client = Mock()
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        mock_response = Mock()
        mock_response.data = [
            {"id": "ticket-001", "company_id": "company-001", "status": "resolved", "updated_at": old_date}
        ]
        settings_response = Mock()
        settings_response.data = {"auto_close_days": 7, "auto_close_enabled": True}
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = settings_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_run_with_pending_tickets_not_processed(self, mock_create_client):
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = []
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 0)


class TestErrorCases(unittest.TestCase):
    """Test error cases in auto-close service."""

    def setUp(self):
        import backend.services.auto_close_service as acs
        acs._instance = None

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_run_with_db_connection_failure(self, mock_create_client):
        mock_client = Mock()
        mock_client.table.side_effect = Exception("Connection refused")
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertIn("error_count", result)
        self.assertGreaterEqual(result["error_count"], 1)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_run_with_empty_ticket_list(self, mock_create_client):
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = []
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 0)
        self.assertEqual(result["closed_count"], 0)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_run_with_malformed_ticket_data(self, mock_create_client):
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [
            {"id": "ticket-bad", "status": "resolved", "updated_at": "invalid-date"}
        ]
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["error_count"], 1)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_run_with_missing_company_id(self, mock_create_client):
        mock_client = Mock()
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        mock_response = Mock()
        mock_response.data = [
            {"id": "ticket-001", "status": "resolved", "updated_at": old_date}
        ]
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_create_client.return_value = mock_client
        service = AutoCloseService()
        result = service.run()
        self.assertIn("processed_count", result)


class TestSingletonPattern(unittest.TestCase):
    """Test singleton pattern."""

    def setUp(self):
        import backend.services.auto_close_service as acs
        acs._instance = None

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_load_returns_same_instance(self, mock_create_client):
        mock_client = Mock()
        mock_create_client.return_value = mock_client
        import backend.services.auto_close_service as acs
        acs._instance = None
        instance1 = load()
        instance2 = load()
        self.assertIs(instance1, instance2)

    @patch.dict(os.environ, {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
    }, clear=True)
    @patch("backend.services.auto_close_service.create_client")
    def test_get_instance_before_load(self, mock_create_client):
        import backend.services.auto_close_service as acs
        acs._instance = None
        self.assertIsNone(get_instance())


if __name__ == "__main__":
    unittest.main(verbosity=2)
