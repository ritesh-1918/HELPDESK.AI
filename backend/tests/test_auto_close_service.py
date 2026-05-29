"""
Unit tests for Auto-Close Service.
Covers configuration, settings retrieval, ticket closing logic,
and scheduling.
"""

import pytest
import os
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.auto_close_service import AutoCloseService


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def auto_svc():
    """Return AutoCloseService with mocked Supabase."""
    with patch.dict(os.environ, {
        "SUPABASE_URL": "https://fake.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "fake-key",
        "AUTO_CLOSE_ENABLED": "true",
        "AUTO_CLOSE_DAYS": "7"
    }):
        with patch("services.auto_close_service.create_client") as mock_cc:
            mock_sb = MagicMock()
            mock_cc.return_value = mock_sb
            svc = AutoCloseService()
    return svc, mock_sb


# ---------------------------------------------------------------------------
# Tests: Initialization
# ---------------------------------------------------------------------------
class TestAutoCloseInit:
    def test_enabled_by_default(self, auto_svc):
        svc, _ = auto_svc
        assert svc.enabled is True

    def test_default_auto_close_days(self, auto_svc):
        svc, _ = auto_svc
        assert svc.default_auto_close_days == 7

    def test_default_cron_schedule(self, auto_svc):
        svc, _ = auto_svc
        assert svc.cron_schedule == "0 2 * * *"

    def test_can_be_disabled(self):
        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://fake.supabase.co",
            "SUPABASE_SERVICE_ROLE_KEY": "fake-key",
            "AUTO_CLOSE_ENABLED": "false"
        }):
            with patch("services.auto_close_service.create_client"):
                svc = AutoCloseService()
                assert svc.enabled is False

    def test_custom_auto_close_days(self):
        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://fake.supabase.co",
            "SUPABASE_SERVICE_ROLE_KEY": "fake-key",
            "AUTO_CLOSE_DAYS": "14"
        }):
            with patch("services.auto_close_service.create_client"):
                svc = AutoCloseService()
                assert svc.default_auto_close_days == 14


# ---------------------------------------------------------------------------
# Tests: get_system_settings
# ---------------------------------------------------------------------------
class TestGetSystemSettings:
    def test_returns_db_settings(self, auto_svc):
        svc, mock_sb = auto_svc
        mock_response = MagicMock()
        mock_response.data = {"auto_close_days": 14, "auto_close_enabled": True}
        mock_sb.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        result = svc.get_system_settings("company-123")
        assert result["auto_close_days"] == 14
        assert result["auto_close_enabled"] is True

    def test_falls_back_to_defaults_on_error(self, auto_svc):
        svc, mock_sb = auto_svc
        mock_sb.table.side_effect = Exception("DB error")
        
        result = svc.get_system_settings("company-123")
        assert result["auto_close_days"] == 7
        assert result["auto_close_enabled"] is True

    def test_falls_back_when_no_data(self, auto_svc):
        svc, mock_sb = auto_svc
        mock_response = MagicMock()
        mock_response.data = None
        mock_sb.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        result = svc.get_system_settings("company-123")
        assert result["auto_close_days"] == 7


# ---------------------------------------------------------------------------
# Tests: _close_ticket
# ---------------------------------------------------------------------------
class TestCloseTicket:
    def test_close_updates_status(self, auto_svc):
        svc, mock_sb = auto_svc
        mock_response = MagicMock()
        mock_response.data = [{"id": "ticket-1", "status": "closed"}]
        mock_sb.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
        
        stats = {"closed": 0, "errors": 0}
        result = svc._close_ticket("ticket-1", "company-123", stats)
        assert result is True
        assert stats["closed"] == 1

    def test_close_handles_error(self, auto_svc):
        svc, mock_sb = auto_svc
        mock_sb.table.side_effect = Exception("Update failed")
        
        stats = {"closed": 0, "errors": 0}
        result = svc._close_ticket("ticket-1", "company-123", stats)
        assert result is False
        assert stats["errors"] == 1
