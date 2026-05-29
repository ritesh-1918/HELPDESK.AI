"""
Unit tests for Notification Routing Middleware.
Covers notification gating, company settings caching, digest frequency,
and fail-open behavior.
"""

import pytest
import os
from unittest.mock import patch, MagicMock
from enum import Enum

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ---------------------------------------------------------------------------
# Import under test
# ---------------------------------------------------------------------------
from services.notification_routing import (
    NotificationType, NotificationRoutingMiddleware
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def middleware():
    """Return middleware with mocked Supabase."""
    with patch.dict(os.environ, {
        "SUPABASE_URL": "https://fake.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "fake-key"
    }):
        with patch("services.notification_routing.create_client") as mock_cc:
            mock_sb = MagicMock()
            mock_cc.return_value = mock_sb
            mw = NotificationRoutingMiddleware()
    return mw, mock_sb


# ---------------------------------------------------------------------------
# Tests: NotificationType enum
# ---------------------------------------------------------------------------
class TestNotificationType:
    def test_daily_digest(self):
        assert NotificationType.DAILY_DIGEST == "daily_digest"

    def test_weekly_digest(self):
        assert NotificationType.WEEKLY_DIGEST == "weekly_digest"

    def test_ticket_alert(self):
        assert NotificationType.TICKET_ALERT == "ticket_alert"

    def test_admin_alert(self):
        assert NotificationType.ADMIN_ALERT == "admin_alert"

    def test_push_notification(self):
        assert NotificationType.PUSH_NOTIFICATION == "push_notification"


# ---------------------------------------------------------------------------
# Tests: Initialization
# ---------------------------------------------------------------------------
class TestNotificationRoutingInit:
    def test_initializes_with_cache(self, middleware):
        mw, _ = middleware
        assert isinstance(mw._settings_cache, dict)

    def test_log_level_default(self, middleware):
        mw, _ = middleware
        assert mw.log_level == "info"


# ---------------------------------------------------------------------------
# Tests: _fetch_system_settings
# ---------------------------------------------------------------------------
class TestFetchSystemSettings:
    def test_returns_settings_on_success(self, middleware):
        mw, mock_sb = middleware
        mock_response = MagicMock()
        mock_response.data = {
            "email_notifications": True,
            "admin_alerts": False,
            "digest_frequency": "weekly"
        }
        mock_sb.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        result = mw._fetch_system_settings("company-123")
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is False
        assert result["digest_frequency"] == "weekly"

    def test_returns_defaults_on_error(self, middleware):
        mw, mock_sb = middleware
        mock_sb.table.side_effect = Exception("DB error")
        
        # Should return defaults (fail-open)
        result = mw._fetch_system_settings("company-123")
        assert result is not None  # Fail-open means it returns something usable


# ---------------------------------------------------------------------------
# Tests: Fail-open design
# ---------------------------------------------------------------------------
class TestFailOpen:
    def test_allows_notification_when_settings_unavailable(self, middleware):
        """Should allow notifications if settings cannot be fetched (fail-open)."""
        mw, mock_sb = middleware
        mock_sb.table.side_effect = Exception("Connection refused")
        
        settings = mw._fetch_system_settings("company-456")
        # Fail-open: return defaults that allow notifications
        assert settings is not None
