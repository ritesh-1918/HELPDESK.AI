"""
Unit tests for AutoCloseService (Issue #279).

Covers:
- __init__ with various env-var configurations
- get_system_settings success / fallback
- _close_ticket success / failure
- run() when service is disabled
- run() with no resolved tickets
- run() closing old resolved tickets
- run() skipping tickets within auto_close window
- run() skipping companies with auto_close disabled
- run() handling missing updated_at fields
- run() handling invalid timestamps
- run() handling exception during company processing
- run() fatal error handling
- test_query success / error
- Singleton pattern (load / get_instance)
"""

import os
import sys
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch, PropertyMock

# Prevent namespace shadowing of supabase library
_cwd = os.getcwd()
sys.path = [p for p in sys.path if p not in ("", _cwd, os.path.dirname(_cwd))]
try:
    import supabase
finally:
    sys.path.insert(0, _cwd)
    _backend_root = os.path.join(_cwd, "backend") if "backend" not in _cwd else _cwd
    sys.path.insert(0, _backend_root)
    sys.path.insert(0, os.path.dirname(_backend_root))

os.environ["SUPABASE_URL"] = "https://example.supabase.co"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock_service_key"

from backend.services.auto_close_service import (
    AutoCloseService,
    load as load_service,
    get_instance,
)


class _AutoCloseTestBase(unittest.TestCase):
    """Shared setup: patches create_client so no real Supabase calls happen."""

    def setUp(self):
        self.patcher = patch("backend.services.auto_close_service.create_client")
        self.mock_create_client = self.patcher.start()
        self.mock_supabase = MagicMock()
        self.mock_create_client.return_value = self.mock_supabase
        self.service = AutoCloseService()

    def tearDown(self):
        self.patcher.stop()


# ---------------------------------------------------------------------------
# __init__ / configuration
# ---------------------------------------------------------------------------

class TestAutoCloseInit(_AutoCloseTestBase):

    def test_defaults_from_env(self):
        self.assertTrue(self.service.enabled)
        self.assertEqual(self.service.default_auto_close_days, 7)
        self.assertEqual(self.service.cron_schedule, "0 2 * * *")
        self.mock_create_client.assert_called_once_with(
            "https://example.supabase.co", "mock_service_key"
        )

    @patch.dict(os.environ, {"AUTO_CLOSE_ENABLED": "false"})
    def test_disabled_via_env(self):
        svc = AutoCloseService()
        self.assertFalse(svc.enabled)

    @patch.dict(os.environ, {"AUTO_CLOSE_ENABLED": "FALSE"})
    def test_disabled_case_insensitive(self):
        svc = AutoCloseService()
        self.assertFalse(svc.enabled)

    @patch.dict(os.environ, {"AUTO_CLOSE_DAYS": "14"})
    def test_custom_auto_close_days(self):
        svc = AutoCloseService()
        self.assertEqual(svc.default_auto_close_days, 14)

    @patch.dict(os.environ, {"AUTO_CLOSE_CRON_SCHEDULE": "0 5 * * 1"})
    def test_custom_cron_schedule(self):
        svc = AutoCloseService()
        self.assertEqual(svc.cron_schedule, "0 5 * * 1")


# ---------------------------------------------------------------------------
# get_system_settings
# ---------------------------------------------------------------------------

class TestGetSystemSettings(_AutoCloseTestBase):

    def test_returns_db_settings_when_found(self):
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 5, "auto_close_enabled": False}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        result = self.service.get_system_settings("company-123")
        self.assertEqual(result["auto_close_days"], 5)
        self.assertFalse(result["auto_close_enabled"])

    def test_falls_back_to_defaults_on_exception(self):
        self.mock_supabase.table.side_effect = Exception("connection refused")

        result = self.service.get_system_settings("company-bad")
        self.assertEqual(result["auto_close_days"], 7)
        self.assertTrue(result["auto_close_enabled"])

    def test_falls_back_when_data_is_none(self):
        mock_resp = MagicMock()
        mock_resp.data = None
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        result = self.service.get_system_settings("company-empty")
        # When data is None, the code returns defaults because `if response.data:` is falsy
        self.assertEqual(result["auto_close_days"], 7)
        self.assertTrue(result["auto_close_enabled"])


# ---------------------------------------------------------------------------
# _close_ticket
# ---------------------------------------------------------------------------

class TestCloseTicket(_AutoCloseTestBase):

    def test_successful_close(self):
        stats = {"closed_count": 0, "error_count": 0}
        self.mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock()

        result = self.service._close_ticket("t-1", "c-1", stats)
        self.assertTrue(result)
        self.assertEqual(stats["closed_count"], 1)
        self.assertEqual(stats["error_count"], 0)

    def test_failed_close(self):
        stats = {"closed_count": 0, "error_count": 0}
        self.mock_supabase.table.side_effect = Exception("db down")

        result = self.service._close_ticket("t-1", "c-1", stats)
        self.assertFalse(result)
        self.assertEqual(stats["closed_count"], 0)
        self.assertEqual(stats["error_count"], 1)

    def test_multiple_successes_increment_counter(self):
        stats = {"closed_count": 0, "error_count": 0}
        self.mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock()

        self.service._close_ticket("t-1", "c-1", stats)
        self.service._close_ticket("t-2", "c-1", stats)
        self.assertEqual(stats["closed_count"], 2)


# ---------------------------------------------------------------------------
# run()
# ---------------------------------------------------------------------------

class TestRun(_AutoCloseTestBase):

    def test_returns_disabled_status(self):
        self.service.enabled = False
        result = self.service.run()
        self.assertEqual(result, {"status": "disabled"})

    def test_no_resolved_tickets(self):
        self.service.enabled = True
        mock_resp = MagicMock()
        mock_resp.data = []
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_resp

        result = self.service.run()
        self.assertEqual(result["processed_count"], 0)
        self.assertEqual(result["closed_count"], 0)
        self.assertEqual(result["skipped_count"], 0)

    def test_closes_old_resolved_tickets(self):
        """Tickets resolved more than auto_close_days ago should be closed."""
        self.service.enabled = True
        old_time = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        tickets = [
            {"id": "t-1", "company_id": "c-1", "status": "resolved", "updated_at": old_time},
        ]
        # First call: fetch resolved tickets
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = tickets
        # Second call: get_system_settings for c-1
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": True}
        # Third call: close ticket
        mock_close_resp = MagicMock()

        table_mock = self.mock_supabase.table
        # Chain for tickets select ... eq ... execute
        tickets_chain = MagicMock()
        tickets_chain.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp
        # Chain for system_settings select ... eq ... single ... execute
        settings_chain = MagicMock()
        settings_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp
        # Chain for tickets update ... eq ... eq ... execute
        close_chain = MagicMock()
        close_chain.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_close_resp

        call_sequence = [tickets_chain, settings_chain, close_chain]
        call_idx = {"i": 0}
        def table_side_effect(name):
            idx = call_idx["i"]
            call_idx["i"] += 1
            return call_sequence[idx]
        table_mock.side_effect = table_side_effect

        result = self.service.run()
        self.assertEqual(result["closed_count"], 1)

    def test_skips_tickets_within_window(self):
        """Recently resolved tickets should NOT be closed."""
        self.service.enabled = True
        recent_time = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        tickets = [
            {"id": "t-2", "company_id": "c-1", "status": "resolved", "updated_at": recent_time},
        ]
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = tickets
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": True}

        tickets_chain = MagicMock()
        tickets_chain.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp
        settings_chain = MagicMock()
        settings_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        call_sequence = [tickets_chain, settings_chain]
        call_idx = {"i": 0}
        def table_side_effect(name):
            idx = call_idx["i"]
            call_idx["i"] += 1
            return call_sequence[idx]
        self.mock_supabase.table.side_effect = table_side_effect

        result = self.service.run()
        self.assertEqual(result["closed_count"], 0)
        self.assertEqual(result["skipped_count"], 1)

    def test_skips_company_with_auto_close_disabled(self):
        """When auto_close_enabled is False for a company, all its tickets are skipped."""
        self.service.enabled = True
        old_time = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        tickets = [
            {"id": "t-3", "company_id": "c-2", "status": "resolved", "updated_at": old_time},
        ]
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = tickets
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": False}

        tickets_chain = MagicMock()
        tickets_chain.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp
        settings_chain = MagicMock()
        settings_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        call_sequence = [tickets_chain, settings_chain]
        call_idx = {"i": 0}
        def table_side_effect(name):
            idx = call_idx["i"]
            call_idx["i"] += 1
            return call_sequence[idx]
        self.mock_supabase.table.side_effect = table_side_effect

        result = self.service.run()
        self.assertEqual(result["closed_count"], 0)
        self.assertEqual(result["skipped_count"], 1)

    def test_handles_missing_updated_at(self):
        """Tickets without updated_at should be skipped gracefully."""
        self.service.enabled = True
        tickets = [
            {"id": "t-4", "company_id": "c-1", "status": "resolved", "updated_at": None},
        ]
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = tickets
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": True}

        tickets_chain = MagicMock()
        tickets_chain.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp
        settings_chain = MagicMock()
        settings_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        call_sequence = [tickets_chain, settings_chain]
        call_idx = {"i": 0}
        def table_side_effect(name):
            idx = call_idx["i"]
            call_idx["i"] += 1
            return call_sequence[idx]
        self.mock_supabase.table.side_effect = table_side_effect

        result = self.service.run()
        # Ticket was neither closed nor explicitly skipped — the continue skips it
        self.assertEqual(result["closed_count"], 0)

    def test_handles_invalid_timestamp(self):
        """Malformed timestamp should increment error_count."""
        self.service.enabled = True
        tickets = [
            {"id": "t-5", "company_id": "c-1", "status": "resolved", "updated_at": "not-a-date"},
        ]
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = tickets
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": True}

        tickets_chain = MagicMock()
        tickets_chain.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp
        settings_chain = MagicMock()
        settings_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        call_sequence = [tickets_chain, settings_chain]
        call_idx = {"i": 0}
        def table_side_effect(name):
            idx = call_idx["i"]
            call_idx["i"] += 1
            return call_sequence[idx]
        self.mock_supabase.table.side_effect = table_side_effect

        result = self.service.run()
        self.assertGreaterEqual(result["error_count"], 1)

    def test_handles_z_suffix_in_timestamp(self):
        """ISO timestamps with 'Z' suffix should be parsed correctly."""
        self.service.enabled = True
        old_time = (datetime.now(timezone.utc) - timedelta(days=10)).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
        tickets = [
            {"id": "t-6", "company_id": "c-1", "status": "resolved", "updated_at": old_time},
        ]
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = tickets
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": True}
        mock_close_resp = MagicMock()

        tickets_chain = MagicMock()
        tickets_chain.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp
        settings_chain = MagicMock()
        settings_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp
        close_chain = MagicMock()
        close_chain.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_close_resp

        call_sequence = [tickets_chain, settings_chain, close_chain]
        call_idx = {"i": 0}
        def table_side_effect(name):
            idx = call_idx["i"]
            call_idx["i"] += 1
            return call_sequence[idx]
        self.mock_supabase.table.side_effect = table_side_effect

        result = self.service.run()
        self.assertEqual(result["closed_count"], 1)

    def test_fatal_error_returns_error_stats(self):
        """Top-level exception should be caught and counted."""
        self.service.enabled = True
        self.mock_supabase.table.side_effect = Exception("catastrophic failure")

        result = self.service.run()
        self.assertGreaterEqual(result["error_count"], 1)

    def test_multi_company_grouping(self):
        """Tickets from different companies should be grouped and processed separately."""
        self.service.enabled = True
        old_time = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        tickets = [
            {"id": "t-10", "company_id": "c-A", "status": "resolved", "updated_at": old_time},
            {"id": "t-11", "company_id": "c-B", "status": "resolved", "updated_at": old_time},
        ]
        mock_tickets_resp = MagicMock()
        mock_tickets_resp.data = tickets

        mock_settings_A = MagicMock()
        mock_settings_A.data = {"auto_close_days": 7, "auto_close_enabled": True}
        mock_settings_B = MagicMock()
        mock_settings_B.data = {"auto_close_days": 3, "auto_close_enabled": True}

        mock_close = MagicMock()

        tickets_chain = MagicMock()
        tickets_chain.select.return_value.eq.return_value.execute.return_value = mock_tickets_resp

        settings_A_chain = MagicMock()
        settings_A_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_A
        close_A_chain = MagicMock()
        close_A_chain.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_close

        settings_B_chain = MagicMock()
        settings_B_chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_B
        close_B_chain = MagicMock()
        close_B_chain.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_close

        # tickets -> settings_A -> close_A -> settings_B -> close_B
        chains = [tickets_chain, settings_A_chain, close_A_chain, settings_B_chain, close_B_chain]
        call_idx = {"i": 0}

        def table_side_effect(name):
            idx = call_idx["i"]
            call_idx["i"] += 1
            return chains[idx]
        self.mock_supabase.table.side_effect = table_side_effect

        result = self.service.run()
        self.assertEqual(result["processed_count"], 2)
        self.assertEqual(result["closed_count"], 2)


# ---------------------------------------------------------------------------
# test_query
# ---------------------------------------------------------------------------

class TestQuery(_AutoCloseTestBase):

    def test_returns_resolved_tickets(self):
        mock_resp = MagicMock()
        mock_resp.data = [
            {"id": "t-1", "company_id": "c-1", "status": "resolved", "updated_at": "2025-01-01T00:00:00Z", "title": "Issue"},
        ]
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.limit.return_value.execute.return_value = mock_resp

        result = self.service.test_query()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "t-1")

    def test_returns_empty_on_error(self):
        self.mock_supabase.table.side_effect = Exception("query failed")

        result = self.service.test_query()
        self.assertEqual(result, [])

    def test_returns_empty_when_no_data(self):
        mock_resp = MagicMock()
        mock_resp.data = None
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.limit.return_value.execute.return_value = mock_resp

        result = self.service.test_query()
        self.assertEqual(result, [])


# ---------------------------------------------------------------------------
# Singleton pattern
# ---------------------------------------------------------------------------

class TestSingleton(unittest.TestCase):

    def tearDown(self):
        # Reset module-level singleton
        import backend.services.auto_close_service as mod
        mod._instance = None

    @patch("backend.services.auto_close_service.create_client")
    def test_load_returns_instance(self, mock_create):
        mock_create.return_value = MagicMock()
        import backend.services.auto_close_service as mod
        mod._instance = None  # ensure clean state

        instance = load_service()
        self.assertIsInstance(instance, AutoCloseService)

    @patch("backend.services.auto_close_service.create_client")
    def test_load_returns_same_instance(self, mock_create):
        mock_create.return_value = MagicMock()
        import backend.services.auto_close_service as mod
        mod._instance = None

        a = load_service()
        b = load_service()
        self.assertIs(a, b)

    def test_get_instance_none_before_load(self):
        import backend.services.auto_close_service as mod
        mod._instance = None
        self.assertIsNone(get_instance())

    @patch("backend.services.auto_close_service.create_client")
    def test_get_instance_after_load(self, mock_create):
        mock_create.return_value = MagicMock()
        import backend.services.auto_close_service as mod
        mod._instance = None

        load_service()
        self.assertIsNotNone(get_instance())


if __name__ == "__main__":
    unittest.main()
