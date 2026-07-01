"""
Unit tests for AutoCloseService auto-close toggle behavior (Issue #913).

Verifies that:
- get_system_settings reads from DB when available
- Fallback defaults auto_close_enabled to False (safe default)
- run() respects per-company auto_close_enabled setting
- run() skips companies when auto_close_enabled is False in DB
- run() does NOT auto-close tickets when DB query fails (fail-safe)
"""

import os
import sys
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

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

from backend.services.auto_close_service import AutoCloseService


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


class TestAutoCloseToggle(_AutoCloseTestBase):
    """Issue #913: Auto-close toggle should read from DB, not hardcode defaults."""

    def test_returns_db_value_when_enabled_true(self):
        """When DB says auto_close_enabled=True, respect it."""
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 3, "auto_close_enabled": True}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        result = self.service.get_system_settings("company-abc")
        self.assertTrue(result["auto_close_enabled"])
        self.assertEqual(result["auto_close_days"], 3)

    def test_returns_db_value_when_enabled_false(self):
        """When DB says auto_close_enabled=False, respect it."""
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 14, "auto_close_enabled": False}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        result = self.service.get_system_settings("company-abc")
        self.assertFalse(result["auto_close_enabled"])
        self.assertEqual(result["auto_close_days"], 14)

    def test_fallback_defaults_enabled_to_false(self):
        """When DB query fails, default auto_close_enabled to False (safe default)."""
        self.mock_supabase.table.side_effect = Exception("connection refused")

        result = self.service.get_system_settings("company-bad")
        self.assertFalse(result["auto_close_enabled"])
        self.assertEqual(result["auto_close_days"], 7)

    def test_fallback_when_data_is_none(self):
        """When DB returns None data, default auto_close_enabled to False."""
        mock_resp = MagicMock()
        mock_resp.data = None
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        result = self.service.get_system_settings("company-empty")
        self.assertFalse(result["auto_close_enabled"])

    def test_missing_column_defaults_to_false(self):
        """When DB row exists but auto_close_enabled column is missing, default to False."""
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 10}  # no auto_close_enabled key
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_resp

        result = self.service.get_system_settings("company-partial")
        self.assertFalse(result["auto_close_enabled"])
        self.assertEqual(result["auto_close_days"], 10)


class TestRunRespectsToggle(_AutoCloseTestBase):
    """Verify run() skips auto-close when toggle is disabled."""

    def _setup_tickets(self, tickets):
        """Helper to mock Supabase ticket query."""
        mock_resp = MagicMock()
        mock_resp.data = tickets
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_resp

    def _setup_settings(self, settings):
        """Helper to mock Supabase settings query."""
        mock_settings_resp = MagicMock()
        mock_settings_resp.data = settings
        chain = self.mock_supabase.table.return_value
        # First .table() call is for tickets, second is for settings
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

    def test_run_skips_when_db_fails(self):
        """When DB query for settings fails, tickets should NOT be auto-closed (fail-safe)."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        self._setup_tickets([
            {"id": "t-1", "company_id": "c-1", "status": "resolved", "updated_at": old_date}
        ])
        # Settings query raises exception
        self.mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("db down")

        stats = self.service.run()
        # Should NOT close any tickets — fallback is False
        self.assertEqual(stats["closed_count"], 0)
        self.assertEqual(stats["skipped_count"], 1)

    def test_run_skips_when_company_disabled(self):
        """When company has auto_close_enabled=False in DB, skip their tickets."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        self._setup_tickets([
            {"id": "t-1", "company_id": "c-1", "status": "resolved", "updated_at": old_date}
        ])

        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": False}
        chain = self.mock_supabase.table.return_value
        # The settings call path
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        stats = self.service.run()
        self.assertEqual(stats["closed_count"], 0)
        self.assertEqual(stats["skipped_count"], 1)

    def test_run_closes_when_company_enabled(self):
        """When company has auto_close_enabled=True in DB, close old tickets."""
        old_date = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        self._setup_tickets([
            {"id": "t-1", "company_id": "c-1", "status": "resolved", "updated_at": old_date}
        ])

        mock_settings_resp = MagicMock()
        mock_settings_resp.data = {"auto_close_days": 7, "auto_close_enabled": True}
        chain = self.mock_supabase.table.return_value
        chain.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_settings_resp

        stats = self.service.run()
        self.assertEqual(stats["closed_count"], 1)


if __name__ == "__main__":
    unittest.main()
