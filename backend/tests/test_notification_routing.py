import pytest
from unittest.mock import patch, MagicMock
import sys

supabase_mock = MagicMock()
sys.modules["supabase"] = supabase_mock

from backend.services.notification_routing import (
    NotificationRoutingMiddleware,
    NotificationType,
)


class TestNotificationRoutingMiddleware:
    @pytest.fixture
    def middleware(self):
        with patch("backend.services.notification_routing.create_client") as mock_create:
            m = NotificationRoutingMiddleware()
            m.supabase = MagicMock()
            m._settings_cache = {}
            return m

    def test_fetch_system_settings_returns_defaults_on_empty_response(self, middleware):
        mock_response = MagicMock()
        mock_response.data = None
        middleware.supabase.table().select().eq().single().execute.return_value = mock_response

        result = middleware._fetch_system_settings("company-1")
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is True
        assert result["digest_frequency"] == "daily"

    def test_fetch_system_settings_returns_db_values(self, middleware):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": False, "admin_alerts": False, "digest_frequency": "weekly"}
        middleware.supabase.table().select().eq().single().execute.return_value = mock_response

        result = middleware._fetch_system_settings("company-1")
        assert result["email_notifications"] is False
        assert result["admin_alerts"] is False
        assert result["digest_frequency"] == "weekly"

    def test_fetch_system_settings_falls_back_on_error(self, middleware):
        middleware.supabase.table().select().eq().single().execute.side_effect = Exception("DB error")

        result = middleware._fetch_system_settings("company-1")
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is True
        assert result["digest_frequency"] == "daily"

    def test_get_system_settings_caches_results(self, middleware):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        middleware.supabase.table().select().eq().single().execute.return_value = mock_response

        result1 = middleware.get_system_settings("company-1")
        result2 = middleware.get_system_settings("company-1")
        assert result1 == result2
        assert middleware.supabase.table().select().eq().single().execute.call_count == 1

    def test_should_send_email_notification_returns_false_when_disabled(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}):
            result = middleware.should_send_email_notification("company-1", NotificationType.TICKET_ALERT)
            assert result is False

    def test_should_send_email_notification_returns_true_when_enabled(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}):
            result = middleware.should_send_email_notification("company-1", NotificationType.TICKET_ALERT)
            assert result is True

    def test_should_send_email_notification_digest_disabled(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": True, "admin_alerts": True, "digest_frequency": "disabled"}):
            result = middleware.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST)
            assert result is False

    def test_should_send_email_notification_weekly_mismatch(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}):
            result = middleware.should_send_email_notification("company-1", NotificationType.WEEKLY_DIGEST)
            assert result is False

    def test_should_send_admin_alert_returns_false_when_disabled(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": True, "admin_alerts": False, "digest_frequency": "daily"}):
            result = middleware.should_send_admin_alert("company-1")
            assert result is False

    def test_should_send_admin_alert_returns_true_when_enabled(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}):
            result = middleware.should_send_admin_alert("company-1")
            assert result is True

    def test_should_send_push_notification_returns_false_when_disabled(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}):
            result = middleware.should_send_push_notification("company-1")
            assert result is False

    def test_should_send_push_notification_returns_true_when_enabled(self, middleware):
        with patch.object(middleware, "get_system_settings", return_value={"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}):
            result = middleware.should_send_push_notification("company-1")
            assert result is True

    def test_invalidate_cache_removes_entry(self, middleware):
        middleware._settings_cache["company-1"] = {"email_notifications": True}
        middleware.invalidate_cache("company-1")
        assert "company-1" not in middleware._settings_cache

    def test_invalidate_cache_noop_for_missing(self, middleware):
        middleware.invalidate_cache("nonexistent")
        assert middleware._settings_cache == {}
