import pytest
import sys
from unittest.mock import patch, MagicMock

sys.modules['supabase'] = MagicMock()
sys.modules['dotenv'] = MagicMock()

from backend.services.notification_routing import NotificationRoutingMiddleware, NotificationType


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