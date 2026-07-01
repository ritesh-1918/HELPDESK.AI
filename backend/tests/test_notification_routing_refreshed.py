"""
Test suite for backend/services/notification_routing.py (Issue #1162 - refreshed).

Covers:
- should_send_admin_alert AND should_send_push_notification
- Cache invalidation
- log_notification_sent/skipped
- get_system_settings
"""

import sys
import os
import types
import importlib.util
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

if "supabase" not in sys.modules:
    sb_mod = types.ModuleType("supabase")
    sb_mod.create_client = MagicMock(return_value=MagicMock())
    sys.modules["supabase"] = sb_mod

if "dotenv" not in sys.modules:
    dotenv_mod = types.ModuleType("dotenv")
    dotenv_mod.load_dotenv = lambda: None
    sys.modules["dotenv"] = dotenv_mod

_spec = importlib.util.spec_from_file_location(
    "notification_routing_refreshed",
    os.path.join(os.path.dirname(__file__), "..", "services", "notification_routing.py")
)
_nr_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_nr_module)

NotificationRoutingMiddleware = _nr_module.NotificationRoutingMiddleware
NotificationType = _nr_module.NotificationType


def _make_mw(settings=None):
    mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
    mw.supabase = MagicMock()
    mw._settings_cache = {}
    mw.log_level = "info"
    defaults = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
    if settings:
        defaults.update(settings)
    mw.get_system_settings = MagicMock(return_value=defaults)
    return mw


# ---------------------------------------------------------------------------
# should_send_admin_alert comprehensive
# ---------------------------------------------------------------------------

class TestShouldSendAdminAlertComprehensive:
    def test_true_when_admin_alerts_true(self):
        mw = _make_mw({"admin_alerts": True})
        assert mw.should_send_admin_alert("co_A") is True

    def test_false_when_admin_alerts_false(self):
        mw = _make_mw({"admin_alerts": False})
        assert mw.should_send_admin_alert("co_A") is False

    def test_false_when_admin_alerts_none(self):
        mw = _make_mw({"admin_alerts": None})
        assert mw.should_send_admin_alert("co_A") is False

    def test_skips_notification_when_false(self):
        mw = _make_mw({"admin_alerts": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_admin_alert("co_A")
        mw.log_notification_skipped.assert_called_once()

    def test_sends_notification_when_true(self):
        mw = _make_mw({"admin_alerts": True})
        mw.log_notification_sent = MagicMock()
        mw.should_send_admin_alert("co_A")
        mw.log_notification_sent.assert_called_once()

    def test_returns_bool_type(self):
        mw = _make_mw({"admin_alerts": True})
        result = mw.should_send_admin_alert("co_A")
        assert isinstance(result, bool)


# ---------------------------------------------------------------------------
# should_send_push_notification comprehensive
# ---------------------------------------------------------------------------

class TestShouldSendPushNotificationComprehensive:
    def test_true_when_email_notifications_true(self):
        mw = _make_mw({"email_notifications": True})
        assert mw.should_send_push_notification("co_A") is True

    def test_false_when_email_notifications_false(self):
        mw = _make_mw({"email_notifications": False})
        assert mw.should_send_push_notification("co_A") is False

    def test_skips_when_email_notifications_false(self):
        mw = _make_mw({"email_notifications": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_push_notification("co_A")
        mw.log_notification_skipped.assert_called_once()

    def test_sends_when_email_notifications_true(self):
        mw = _make_mw({"email_notifications": True})
        mw.log_notification_sent = MagicMock()
        mw.should_send_push_notification("co_A")
        mw.log_notification_sent.assert_called_once()

    def test_returns_bool_type(self):
        mw = _make_mw({"email_notifications": True})
        result = mw.should_send_push_notification("co_A")
        assert isinstance(result, bool)


# ---------------------------------------------------------------------------
# Cache invalidation / get_system_settings
# ---------------------------------------------------------------------------

class TestCacheInvalidation:
    def test_cache_populated_on_first_fetch(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw._fetch_system_settings = MagicMock(return_value={
            "email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"
        })
        mw.get_system_settings("co_A")
        assert "co_A" in mw._settings_cache

    def test_second_call_uses_cache(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        call_count = {"n": 0}
        def fake_fetch(cid):
            call_count["n"] += 1
            return {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        mw._fetch_system_settings = fake_fetch
        mw.get_system_settings("co_A")
        mw.get_system_settings("co_A")
        assert call_count["n"] == 1

    def test_fail_open_defaults_when_db_error(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw.supabase.table.side_effect = Exception("DB error")
        settings = mw.get_system_settings("co_A")
        assert settings.get("email_notifications") is True
        assert settings.get("admin_alerts") is True


# ---------------------------------------------------------------------------
# log_notification_sent/skipped
# ---------------------------------------------------------------------------

class TestLogNotificationMethods:
    def test_log_notification_sent_does_not_raise(self):
        mw = _make_mw()
        for ntype in NotificationType:
            mw.log_notification_sent("co_A", ntype)

    def test_log_notification_skipped_does_not_raise(self):
        mw = _make_mw()
        for ntype in NotificationType:
            mw.log_notification_skipped("co_A", ntype, "test_reason")

    def test_log_notification_sent_called_correctly(self):
        mw = _make_mw({"admin_alerts": True})
        log_calls = []
        mw.log_notification_sent = MagicMock(side_effect=lambda cid, nt: log_calls.append((cid, nt)))
        mw.should_send_admin_alert("co_X")
        assert len(log_calls) == 1
        assert log_calls[0][0] == "co_X"

    def test_log_notification_skipped_called_correctly(self):
        mw = _make_mw({"admin_alerts": False})
        log_calls = []
        mw.log_notification_skipped = MagicMock(side_effect=lambda cid, nt, reason: log_calls.append((cid, nt)))
        mw.should_send_admin_alert("co_Y")
        assert len(log_calls) == 1
        assert log_calls[0][0] == "co_Y"

    def test_notification_type_admin_alert_value(self):
        assert NotificationType.ADMIN_ALERT.value == "admin_alert"

    def test_notification_type_push_value(self):
        assert NotificationType.PUSH_NOTIFICATION.value == "push_notification"


# ---------------------------------------------------------------------------
# get_system_settings tests
# ---------------------------------------------------------------------------

class TestGetSystemSettings:
    def test_returns_dict(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw._fetch_system_settings = MagicMock(return_value={
            "email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"
        })
        result = mw.get_system_settings("co_A")
        assert isinstance(result, dict)

    def test_returns_email_notifications_key(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw._fetch_system_settings = MagicMock(return_value={
            "email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"
        })
        result = mw.get_system_settings("co_A")
        assert "email_notifications" in result

    def test_returns_admin_alerts_key(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw._fetch_system_settings = MagicMock(return_value={
            "email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"
        })
        result = mw.get_system_settings("co_A")
        assert "admin_alerts" in result

    def test_returns_digest_frequency_key(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw._fetch_system_settings = MagicMock(return_value={
            "email_notifications": True, "admin_alerts": True, "digest_frequency": "weekly"
        })
        result = mw.get_system_settings("co_A")
        assert "digest_frequency" in result
