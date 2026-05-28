import unittest
from unittest.mock import MagicMock, patch, mock_open
from datetime import datetime, timedelta, timezone
import os

from backend.services import auto_close_service
from backend.services.auto_close_service import AutoCloseService, load, get_instance


class TestAutoCloseService(unittest.TestCase):
    def setUp(self):
        # Patch create_client during initialization
        self.mock_create_client_patcher = patch("backend.services.auto_close_service.create_client")
        self.mock_create_client = self.mock_create_client_patcher.start()
        
        # Setup mock Supabase client
        self.mock_supabase = MagicMock()
        self.mock_create_client.return_value = self.mock_supabase
        
        # Clear singleton instance before each test
        auto_close_service._instance = None

    def tearDown(self):
        self.mock_create_client_patcher.stop()

    @patch.dict(os.environ, {
        "AUTO_CLOSE_ENABLED": "true",
        "AUTO_CLOSE_DAYS": "5",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 0 * * *"
    })
    def test_init_parses_env_variables(self):
        service = AutoCloseService()
        self.assertTrue(service.enabled)
        self.assertEqual(service.default_auto_close_days, 5)
        self.assertEqual(service.cron_schedule, "0 0 * * *")
        self.mock_create_client.assert_called_once()

    @patch.dict(os.environ, {
        "AUTO_CLOSE_ENABLED": "false",
        "AUTO_CLOSE_DAYS": "10",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 1 * * *"
    })
    def test_init_parses_disabled_env(self):
        service = AutoCloseService()
        self.assertFalse(service.enabled)
        self.assertEqual(service.default_auto_close_days, 10)
        self.assertEqual(service.cron_schedule, "0 1 * * *")

    def test_get_system_settings_success(self):
        service = AutoCloseService()
        
        # Mock database response
        mock_response = MagicMock()
        mock_response.data = {"auto_close_days": 12, "auto_close_enabled": False}
        
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        settings = service.get_system_settings("company_1")
        
        self.assertEqual(settings["auto_close_days"], 12)
        self.assertFalse(settings["auto_close_enabled"])
        self.mock_supabase.table.assert_called_with("system_settings")

    def test_get_system_settings_missing_data_uses_default(self):
        service = AutoCloseService()
        service.default_auto_close_days = 7
        
        # Mock database response returning empty dict or None fields
        mock_response = MagicMock()
        mock_response.data = {}
        
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        settings = service.get_system_settings("company_1")
        
        self.assertEqual(settings["auto_close_days"], 7)
        self.assertTrue(settings["auto_close_enabled"])

    def test_get_system_settings_exception_falls_back_to_defaults(self):
        service = AutoCloseService()
        service.default_auto_close_days = 7
        
        # Make the database query raise an exception
        self.mock_supabase.table.side_effect = Exception("DB Error")
        
        settings = service.get_system_settings("company_1")
        
        self.assertEqual(settings["auto_close_days"], 7)
        self.assertTrue(settings["auto_close_enabled"])

    def test_close_ticket_success(self):
        service = AutoCloseService()
        stats = {"closed_count": 0, "error_count": 0}
        
        # Mock execute call
        mock_execute = MagicMock()
        self.mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute = mock_execute
        
        result = service._close_ticket("ticket_1", "company_1", stats)
        
        self.assertTrue(result)
        self.assertEqual(stats["closed_count"], 1)
        self.assertEqual(stats["error_count"], 0)
        self.mock_supabase.table.assert_called_with("tickets")

    def test_close_ticket_exception(self):
        service = AutoCloseService()
        stats = {"closed_count": 0, "error_count": 0}
        
        # Make database call raise exception
        self.mock_supabase.table.side_effect = Exception("Update Failed")
        
        result = service._close_ticket("ticket_1", "company_1", stats)
        
        self.assertFalse(result)
        self.assertEqual(stats["closed_count"], 0)
        self.assertEqual(stats["error_count"], 1)

    def test_run_when_disabled(self):
        service = AutoCloseService()
        service.enabled = False
        
        result = service.run()
        self.assertEqual(result, {"status": "disabled"})

    def test_run_success_flow(self):
        service = AutoCloseService()
        service.default_auto_close_days = 5
        
        # Mock resolved tickets returned from database
        now = datetime.now(timezone.utc)
        old_time = (now - timedelta(days=6)).isoformat()  # Old enough to close
        recent_time = (now - timedelta(days=2)).isoformat()  # Too recent to close
        
        resolved_tickets = [
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": old_time},
            {"id": "t2", "company_id": "c1", "status": "resolved", "updated_at": recent_time},
            {"id": "t3", "company_id": "c2", "status": "resolved", "updated_at": old_time},
        ]
        
        # Setup table mocking logic for run()
        mock_table = MagicMock()
        self.mock_supabase.table.return_value = mock_table
        
        # Fetching tickets mock response
        mock_tickets_response = MagicMock()
        mock_tickets_response.data = resolved_tickets
        mock_table.select.return_value.eq.return_value.execute.return_value = mock_tickets_response
        
        # Mock get_system_settings responses:
        # For c1: enabled, 5 days
        # For c2: disabled
        def mock_get_system_settings(company_id):
            if company_id == "c1":
                return {"auto_close_days": 5, "auto_close_enabled": True}
            else:
                return {"auto_close_days": 5, "auto_close_enabled": False}
        
        service.get_system_settings = mock_get_system_settings
        
        # Patch the _close_ticket method
        with patch.object(service, "_close_ticket") as mock_close:
            def side_effect_close(ticket_id, company_id, stats):
                stats["closed_count"] += 1
                return True
            mock_close.side_effect = side_effect_close
            
            stats = service.run()
            
            self.assertEqual(stats["processed_count"], 3)
            self.assertEqual(stats["closed_count"], 1)  # Only t1 (t2 is recent, c2 has auto_close disabled)
            self.assertEqual(stats["skipped_count"], 2)  # t2 (recent) + t3 (company disabled)
            self.assertEqual(stats["error_count"], 0)
            mock_close.assert_called_once_with("t1", "c1", stats)

    def test_run_handles_invalid_timestamps_and_errors(self):
        service = AutoCloseService()
        service.default_auto_close_days = 5
        
        resolved_tickets = [
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": "invalid_date_format"},
            {"id": "t2", "company_id": "c1", "status": "resolved", "updated_at": None},
        ]
        
        # Setup table mocking logic
        mock_table = MagicMock()
        self.mock_supabase.table.return_value = mock_table
        
        mock_tickets_response = MagicMock()
        mock_tickets_response.data = resolved_tickets
        mock_table.select.return_value.eq.return_value.execute.return_value = mock_tickets_response
        
        service.get_system_settings = MagicMock(return_value={"auto_close_days": 5, "auto_close_enabled": True})
        
        stats = service.run()
        
        # t1 causes ValueError (invalid date) -> increments error_count
        # t2 missing updated_at is skipped but not incrementing error_count
        self.assertEqual(stats["processed_count"], 2)
        self.assertEqual(stats["error_count"], 1)
        self.assertEqual(stats["skipped_count"], 0)

    def test_run_company_level_exception_does_not_crash_whole_job(self):
        service = AutoCloseService()
        
        resolved_tickets = [
            {"id": "t1", "company_id": "c1", "status": "resolved", "updated_at": "2026-01-01T00:00:00Z"},
            {"id": "t2", "company_id": "c2", "status": "resolved", "updated_at": "2026-01-01T00:00:00Z"},
        ]
        
        mock_table = MagicMock()
        self.mock_supabase.table.return_value = mock_table
        
        mock_tickets_response = MagicMock()
        mock_tickets_response.data = resolved_tickets
        mock_table.select.return_value.eq.return_value.execute.return_value = mock_tickets_response
        
        # Make get_system_settings raise exception for c1, but work for c2
        def mock_get_system_settings(company_id):
            if company_id == "c1":
                raise Exception("Network issue")
            return {"auto_close_days": 5, "auto_close_enabled": True}
            
        service.get_system_settings = mock_get_system_settings
        
        with patch.object(service, "_close_ticket") as mock_close:
            stats = service.run()
            
            # c1 failure adds len(tickets) to error_count
            self.assertEqual(stats["processed_count"], 2)
            self.assertEqual(stats["error_count"], 1)  # c1 tickets failed (1 ticket)
            mock_close.assert_called_once_with("t2", "c2", stats)

    def test_run_fatal_exception_caught(self):
        service = AutoCloseService()
        
        # Make table select raise a fatal exception
        self.mock_supabase.table.side_effect = Exception("Fatal Database Connection Failure")
        
        stats = service.run()
        
        self.assertEqual(stats["error_count"], 1)
        self.assertEqual(stats["processed_count"], 0)

    def test_test_query_success(self):
        service = AutoCloseService()
        
        mock_tickets = [{"id": "t1", "title": "Resolved issue"}]
        mock_response = MagicMock()
        mock_response.data = mock_tickets
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = mock_response
        
        result = service.test_query()
        
        self.assertEqual(result, mock_tickets)
        self.mock_supabase.table.assert_called_with("tickets")

    def test_test_query_exception(self):
        service = AutoCloseService()
        self.mock_supabase.table.side_effect = Exception("Query Error")
        
        result = service.test_query()
        self.assertEqual(result, [])

    def test_load_and_singleton_behavior(self):
        # Verify singleton instantiates correctly
        inst1 = load()
        self.assertIsNotNone(inst1)
        self.assertIsInstance(inst1, AutoCloseService)
        
        inst2 = load()
        self.assertIs(inst1, inst2)
        
        # Verify get_instance returns the correct instance
        self.assertIs(get_instance(), inst1)


if __name__ == "__main__":
    unittest.main()
