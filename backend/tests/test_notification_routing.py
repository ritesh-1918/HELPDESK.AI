import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.modules['supabase'] = MagicMock()
sys.modules['dotenv'] = MagicMock()

# Ensure we import the real service, bypassing the conftest stub
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from services.notification_routing import NotificationRoutingMiddleware, NotificationType


class TestNotificationRoutingNoneHandling:
    """Tests for handling None values in notification_routing service"""

    def test_should_send_admin_alert_with_none_admin_alerts(self):
        """Test that admin_alerts=None returns False"""
        svc = NotificationRoutingMiddleware()

        with patch.object(svc, 'get_system_settings', return_value={"admin_alerts": None}):
            result = svc.should_send_admin_alert("company-123")
            assert result is False

    def test_should_send_admin_alert_with_false_admin_alerts(self):
        """Test that admin_alerts=False returns False"""
        svc = NotificationRoutingMiddleware()

        with patch.object(svc, 'get_system_settings', return_value={"admin_alerts": False}):
            result = svc.should_send_admin_alert("company-123")
            assert result is False

    def test_should_send_admin_alert_with_true_admin_alerts(self):
        """Test that admin_alerts=True returns True"""
        svc = NotificationRoutingMiddleware()

        with patch.object(svc, 'get_system_settings', return_value={"admin_alerts": True}):
            result = svc.should_send_admin_alert("company-123")
            assert result is True


class TestNotificationRoutingEmailGating:
    """Tests for email notification gating rules"""

    def test_email_notifications_globally_disabled(self):
        """Test that when email_notifications is False, should_send_email_notification returns False"""
        svc = NotificationRoutingMiddleware()
        settings = {
            "email_notifications": False,
            "admin_alerts": True,
            "digest_frequency": "daily"
        }
        with patch.object(svc, 'get_system_settings', return_value=settings):
            result = svc.should_send_email_notification("company-123", NotificationType.DAILY_DIGEST)
            assert result is False

    def test_digest_frequency_disabled(self):
        """Test that digest email is not sent if digest frequency is set to 'disabled'"""
        svc = NotificationRoutingMiddleware()
        settings = {
            "email_notifications": True,
            "admin_alerts": True,
            "digest_frequency": "disabled"
        }
        with patch.object(svc, 'get_system_settings', return_value=settings):
            result = svc.should_send_email_notification("company-123", NotificationType.DAILY_DIGEST)
            assert result is False

    def test_digest_frequency_mismatch(self):
        """Test that weekly digest is not sent if frequency is set to daily"""
        svc = NotificationRoutingMiddleware()
        settings = {
            "email_notifications": True,
            "admin_alerts": True,
            "digest_frequency": "daily"
        }
        with patch.object(svc, 'get_system_settings', return_value=settings):
            result = svc.should_send_email_notification("company-123", NotificationType.WEEKLY_DIGEST)
            assert result is False

    def test_digest_frequency_valid(self):
        """Test that digest email is allowed when frequencies align"""
        svc = NotificationRoutingMiddleware()
        settings = {
            "email_notifications": True,
            "admin_alerts": True,
            "digest_frequency": "weekly"
        }
        with patch.object(svc, 'get_system_settings', return_value=settings):
            result = svc.should_send_email_notification("company-123", NotificationType.WEEKLY_DIGEST)
            assert result is True


class TestNotificationRoutingPushGating:
    """Tests for push notification gating rules"""

    def test_push_notifications_gate_on_global_email_setting(self):
        """Test that push notifications are disabled if global email_notifications is False"""
        svc = NotificationRoutingMiddleware()
        settings = {
            "email_notifications": False,
            "admin_alerts": True,
            "digest_frequency": "daily"
        }
        with patch.object(svc, 'get_system_settings', return_value=settings):
            result = svc.should_send_push_notification("company-123")
            assert result is False

    def test_push_notifications_allowed(self):
        """Test that push notifications are allowed if email_notifications is True"""
        svc = NotificationRoutingMiddleware()
        settings = {
            "email_notifications": True,
            "admin_alerts": True,
            "digest_frequency": "daily"
        }
        with patch.object(svc, 'get_system_settings', return_value=settings):
            result = svc.should_send_push_notification("company-123")
            assert result is True


class TestNotificationRoutingDatabaseAndCache:
    """Tests for database fetching and cache behavior"""

    def test_fetch_system_settings_success(self):
        """Test fetching system settings successfully from Supabase"""
        svc = NotificationRoutingMiddleware()
        mock_data = {
            "email_notifications": True,
            "admin_alerts": False,
            "digest_frequency": "weekly"
        }
        
        # Setup mock client behavior
        mock_execute = MagicMock()
        mock_execute.data = mock_data
        
        mock_single = MagicMock()
        mock_single.execute.return_value = mock_execute
        
        mock_eq = MagicMock()
        mock_eq.single.return_value = mock_single
        
        mock_select = MagicMock()
        mock_select.eq.return_value = mock_eq
        
        svc.supabase = MagicMock()
        svc.supabase.table.return_value.select.return_value = mock_select
        
        settings = svc._fetch_system_settings("company-123")
        assert settings["email_notifications"] is True
        assert settings["admin_alerts"] is False
        assert settings["digest_frequency"] == "weekly"

    def test_fetch_system_settings_fail_open(self):
        """Test that on database errors, the middleware degrades gracefully to fail-open"""
        svc = NotificationRoutingMiddleware()
        svc.supabase = MagicMock()
        svc.supabase.table.side_effect = Exception("DB Connection Refused")
        
        settings = svc._fetch_system_settings("company-123")
        assert settings["email_notifications"] is True
        assert settings["admin_alerts"] is True
        assert settings["digest_frequency"] == "daily"

    def test_get_system_settings_cache(self):
        """Test that settings are cached after the first fetch to avoid repeated DB hits"""
        svc = NotificationRoutingMiddleware()
        
        with patch.object(svc, '_fetch_system_settings') as mock_fetch:
            mock_fetch.return_value = {"email_notifications": True}
            
            # First call should hit DB
            settings_first = svc.get_system_settings("company-123")
            # Second call should read from cache
            settings_second = svc.get_system_settings("company-123")
            
            assert settings_first == {"email_notifications": True}
            assert settings_second == {"email_notifications": True}
            mock_fetch.assert_called_once_with("company-123")