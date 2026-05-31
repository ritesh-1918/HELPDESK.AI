import pytest
from unittest.mock import MagicMock, patch
from services.auto_close_service import AutoCloseService
from services.notification_routing import NotificationRoutingMiddleware, NotificationType


class TestAutoCloseService:
    def setup_method(self):
        with patch("services.auto_close_service.create_client") as mock_create:
            mock_client = MagicMock()
            mock_create.return_value = mock_client
            self.service = AutoCloseService()
            self.service.supabase = mock_client

    def test_get_system_settings_success(self):
        mock_response = MagicMock()
        mock_response.data = {"auto_close_days": 3, "auto_close_enabled": True}
        self.service.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.service.get_system_settings("company-123")
        assert result["auto_close_days"] == 3
        assert result["auto_close_enabled"] is True

    def test_get_system_settings_fallback_on_error(self):
        self.service.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB error")

        result = self.service.get_system_settings("company-123")
        assert result["auto_close_days"] == 7
        assert result["auto_close_enabled"] is True

    def test_get_system_settings_missing_data(self):
        mock_response = MagicMock()
        mock_response.data = None
        self.service.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.service.get_system_settings("company-123")
        assert result["auto_close_days"] == 7

    def test_get_system_settings_uses_default_when_field_missing(self):
        mock_response = MagicMock()
        mock_response.data = {"auto_close_days": None, "auto_close_enabled": True}
        self.service.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.service.get_system_settings("company-123")
        assert result["auto_close_days"] == 7

    def test_disabled_service_returns_disabled_status(self):
        self.service.enabled = False
        result = self.service.run()
        assert result["status"] == "disabled"

    def test_close_ticket_success(self):
        mock_response = MagicMock()
        self.service.supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response

        stats = {"closed_count": 0, "error_count": 0}
        result = self.service._close_ticket("ticket-1", "company-1", stats)
        assert result is True
        assert stats["closed_count"] == 1

    def test_close_ticket_failure(self):
        self.service.supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.side_effect = Exception("Update failed")

        stats = {"closed_count": 0, "error_count": 0}
        result = self.service._close_ticket("ticket-1", "company-1", stats)
        assert result is False
        assert stats["error_count"] == 1

    def test_run_with_no_resolved_tickets(self):
        mock_response = MagicMock()
        mock_response.data = []
        self.service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        result = self.service.run()
        assert result["processed_count"] == 0
        assert result["status"] != "disabled"


class TestNotificationRoutingMiddleware:
    def setup_method(self):
        with patch("services.notification_routing.create_client") as mock_create:
            mock_client = MagicMock()
            mock_create.return_value = mock_client
            self.middleware = NotificationRoutingMiddleware()
            self.middleware.supabase = mock_client
            self.middleware._settings_cache = {}

    def test_should_send_email_when_enabled(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST)
        assert result is True

    def test_should_not_send_email_when_disabled(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST)
        assert result is False

    def test_should_not_send_email_when_digest_disabled(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "disabled"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST)
        assert result is False

    def test_weekly_digest_rejected_when_daily_frequency(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_email_notification("company-1", NotificationType.WEEKLY_DIGEST)
        assert result is False

    def test_should_send_admin_alert_when_enabled(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_admin_alert("company-1")
        assert result is True

    def test_should_not_send_admin_alert_when_disabled(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": False, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_admin_alert("company-1")
        assert result is False

    def test_fail_open_when_settings_unavailable(self):
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB error")

        result = self.middleware.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST)
        assert result is True

    def test_cache_used_on_second_call(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        self.middleware.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST)
        assert "company-1" in self.middleware._settings_cache

    def test_invalidate_cache_removes_entry(self):
        self.middleware._settings_cache["company-1"] = {"email_notifications": True}
        self.middleware.invalidate_cache("company-1")
        assert "company-1" not in self.middleware._settings_cache

    def test_should_send_push_when_email_enabled(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_push_notification("company-1")
        assert result is True

    def test_should_not_send_push_when_email_disabled(self):
        mock_response = MagicMock()
        mock_response.data = {"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = self.middleware.should_send_push_notification("company-1")
        assert result is False

    def test_fetch_system_settings_returns_defaults_on_error(self):
        self.middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("Network error")

        result = self.middleware._fetch_system_settings("company-1")
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is True
        assert result["digest_frequency"] == "daily"
