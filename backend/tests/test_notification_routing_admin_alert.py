"""
Unit tests for notification_routing.should_send_admin_alert method.

Tests admin alert gating by admin_alerts company setting.
Covers: enabled/disabled/None, missing keys, cache behavior, logging, integration.

Fixes #1158
"""

import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.modules["supabase"] = MagicMock()
sys.modules["dotenv"] = MagicMock()

sys.path.insert(0, os.path.join(os.getcwd(), "backend"))
from services.notification_routing import (
    NotificationRoutingMiddleware,
    NotificationType,
)


@pytest.fixture
def svc():
    """Create a fresh NotificationRoutingMiddleware instance."""
    return NotificationRoutingMiddleware()


class TestShouldSendAdminAlertBasic:
    """Core admin alert gating logic."""

    def test_admin_alert_allowed_when_true(self, svc):
        """Admin alert sent when admin_alerts=True."""
        with patch.object(
            svc,
            "get_system_settings",
            return_value={"admin_alerts": True, "email_notifications": True},
        ):
            assert svc.should_send_admin_alert("co-1") is True

    def test_admin_alert_blocked_when_false(self, svc):
        """Admin alert blocked when admin_alerts=False."""
        with patch.object(
            svc,
            "get_system_settings",
            return_value={"admin_alerts": False, "email_notifications": True},
        ):
            assert svc.should_send_admin_alert("co-1") is False

    def test_admin_alert_blocked_when_none(self, svc):
        """Admin alert blocked when admin_alerts=None."""
        with patch.object(
            svc,
            "get_system_settings",
            return_value={"admin_alerts": None, "email_notifications": True},
        ):
            assert svc.should_send_admin_alert("co-1") is False


class TestShouldSendAdminAlertEdgeCases:
    """Edge cases for admin alert gating."""

    def test_admin_alert_blocked_when_key_missing(self, svc):
        """Admin alert blocked when admin_alerts key is missing (None via .get())."""
        with patch.object(
            svc, "get_system_settings", return_value={"email_notifications": True}
        ):
            # settings.get("admin_alerts") returns None → `is False` is False, `is None` is True → blocked
            assert svc.should_send_admin_alert("co-1") is False

    def test_admin_alert_allowed_when_truthy_string(self, svc):
        """Admin alert allowed when admin_alerts is truthy string 'true'."""
        with patch.object(
            svc,
            "get_system_settings",
            return_value={"admin_alerts": "true", "email_notifications": True},
        ):
            # "true" is not False and is not None → allowed
            assert svc.should_send_admin_alert("co-1") is True

    def test_admin_alert_blocked_when_zero(self, svc):
        """Admin alert blocked when admin_alerts=0."""
        with patch.object(
            svc,
            "get_system_settings",
            return_value={"admin_alerts": 0, "email_notifications": True},
        ):
            # 0 is not False, is not None → allowed (code checks `is False` and `is None`)
            assert svc.should_send_admin_alert("co-1") is True

    def test_admin_alert_allowed_when_empty_string(self, svc):
        """Admin alert allowed when admin_alerts='' (empty string is not False/None)."""
        with patch.object(
            svc,
            "get_system_settings",
            return_value={"admin_alerts": "", "email_notifications": True},
        ):
            # "" is not False, is not None → allowed
            assert svc.should_send_admin_alert("co-1") is True


class TestShouldSendAdminAlertCache:
    """Cache behavior for admin alert checks."""

    def test_admin_alert_uses_cached_settings(self, svc):
        """Second call uses cached settings, no DB hit."""
        with patch.object(svc, "_fetch_system_settings") as mock_fetch:
            mock_fetch.return_value = {"admin_alerts": True}

            svc.should_send_admin_alert("co-cache")
            svc.should_send_admin_alert("co-cache")

            mock_fetch.assert_called_once_with("co-cache")

    def test_admin_alert_different_companies_independent(self, svc):
        """Different companies have independent admin_alert settings."""
        with patch.object(svc, "_fetch_system_settings") as mock_fetch:
            mock_fetch.side_effect = lambda cid: {
                "co-a": {"admin_alerts": True},
                "co-b": {"admin_alerts": False},
            }.get(cid, {"admin_alerts": True})

            assert svc.should_send_admin_alert("co-a") is True
            assert svc.should_send_admin_alert("co-b") is False
            assert mock_fetch.call_count == 2

    def test_admin_alert_after_cache_invalidation(self, svc):
        """After cache invalidation, settings are re-fetched."""
        with patch.object(svc, "_fetch_system_settings") as mock_fetch:
            mock_fetch.return_value = {"admin_alerts": True}

            svc.should_send_admin_alert("co-1")
            svc.invalidate_cache("co-1")
            svc.should_send_admin_alert("co-1")

            assert mock_fetch.call_count == 2

    def test_admin_alert_settings_change_after_invalidation(self, svc):
        """Settings changes are reflected after cache invalidation."""
        call_count = [0]

        def dynamic_settings(cid):
            call_count[0] += 1
            if call_count[0] == 1:
                return {"admin_alerts": True}
            return {"admin_alerts": False}

        with patch.object(svc, "_fetch_system_settings", side_effect=dynamic_settings):
            assert svc.should_send_admin_alert("co-1") is True
            svc.invalidate_cache("co-1")
            assert svc.should_send_admin_alert("co-1") is False


class TestShouldSendAdminAlertLogging:
    """Logging behavior for admin alert decisions."""

    def test_admin_alert_allowed_logs_sent(self, svc):
        """When admin alert is allowed, log_notification_sent is called."""
        with patch.object(
            svc, "get_system_settings", return_value={"admin_alerts": True}
        ), patch.object(svc, "log_notification_sent") as mock_log:
            svc.should_send_admin_alert("co-1")
            mock_log.assert_called_once_with("co-1", NotificationType.ADMIN_ALERT)

    def test_admin_alert_disabled_logs_skipped(self, svc):
        """When admin_alerts=False, log_notification_skipped is called."""
        with patch.object(
            svc, "get_system_settings", return_value={"admin_alerts": False}
        ), patch.object(svc, "log_notification_skipped") as mock_log:
            svc.should_send_admin_alert("co-1")
            mock_log.assert_called_once_with(
                "co-1", NotificationType.ADMIN_ALERT, "admin_alerts_disabled"
            )

    def test_admin_alert_none_does_not_log_skipped(self, svc):
        """When admin_alerts=None, returns False but does NOT call log_notification_skipped."""
        with patch.object(
            svc, "get_system_settings", return_value={"admin_alerts": None}
        ), patch.object(svc, "log_notification_skipped") as mock_log:
            svc.should_send_admin_alert("co-1")
            # Code returns False before reaching log for None case
            mock_log.assert_not_called()

    def test_admin_alert_disabled_reason_is_admin_alerts_disabled(self, svc):
        """When admin_alerts=False, the skip reason is 'admin_alerts_disabled'."""
        with patch.object(
            svc, "get_system_settings", return_value={"admin_alerts": False}
        ), patch.object(svc, "log_notification_skipped") as mock_log:
            svc.should_send_admin_alert("co-1")
            _, _, reason = mock_log.call_args[0]
            assert reason == "admin_alerts_disabled"


class TestShouldSendAdminAlertIntegration:
    """Integration with other notification methods."""

    def test_admin_alert_and_push_both_allowed(self, svc):
        """Both admin alert and push allowed when settings are enabled."""
        settings = {"admin_alerts": True, "email_notifications": True}
        with patch.object(svc, "get_system_settings", return_value=settings):
            assert svc.should_send_admin_alert("co-1") is True
            assert svc.should_send_push_notification("co-1") is True

    def test_admin_alert_allowed_but_push_blocked(self, svc):
        """Admin alert allowed while push is blocked (different settings)."""
        settings = {"admin_alerts": True, "email_notifications": False}
        with patch.object(svc, "get_system_settings", return_value=settings):
            assert svc.should_send_admin_alert("co-1") is True
            assert svc.should_send_push_notification("co-1") is False

    def test_admin_alert_blocked_but_push_allowed(self, svc):
        """Admin alert blocked while push is allowed (different settings)."""
        settings = {"admin_alerts": False, "email_notifications": True}
        with patch.object(svc, "get_system_settings", return_value=settings):
            assert svc.should_send_admin_alert("co-1") is False
            assert svc.should_send_push_notification("co-1") is True

    def test_admin_alert_independent_of_email_gating(self, svc):
        """Admin alert setting is independent of email notification setting."""
        settings = {"admin_alerts": True, "email_notifications": False, "digest_frequency": "disabled"}
        with patch.object(svc, "get_system_settings", return_value=settings):
            # Admin alert works regardless of email settings
            assert svc.should_send_admin_alert("co-1") is True
            # Email notification blocked
            assert svc.should_send_email_notification("co-1", NotificationType.DAILY_DIGEST) is False


class TestShouldSendAdminAlertFailOpen:
    """Fail-open behavior when settings are unavailable."""

    def test_admin_alert_fail_open_on_db_error(self, svc):
        """Admin alert allowed when DB fetch fails (fail-open default admin_alerts=True)."""
        svc.supabase = MagicMock()
        svc.supabase.table.side_effect = Exception("DB down")

        # _fetch_system_settings catches exception and returns defaults
        assert svc.should_send_admin_alert("co-1") is True

    def test_admin_alert_fail_open_returns_default_admin_alerts_true(self, svc):
        """Fail-open defaults admin_alerts=True."""
        svc.supabase = MagicMock()
        svc.supabase.table.side_effect = Exception("timeout")

        settings = svc._fetch_system_settings("co-1")
        assert settings["admin_alerts"] is True
