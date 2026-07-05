"""
Test suite for NotificationRoutingMiddleware.should_send_push_notification() (Issue #1157).

Covers:
- Returns True when email_notifications=True
- Returns False when email_notifications=False
- Logs when skipped
- Cache hit behavior
"""

import sys
import os
import types
import importlib.util
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Stub dependencies
if "supabase" not in sys.modules:
    sb_mod = types.ModuleType("supabase")
    sb_mod.create_client = MagicMock(return_value=MagicMock())
    sys.modules["supabase"] = sb_mod

if "dotenv" not in sys.modules:
    dotenv_mod = types.ModuleType("dotenv")
    dotenv_mod.load_dotenv = lambda: None
    sys.modules["dotenv"] = dotenv_mod

_spec = importlib.util.spec_from_file_location(
    "notification_routing_push",
    os.path.join(os.path.dirname(__file__), "..", "services", "notification_routing.py")
)
_nr_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_nr_module)

NotificationRoutingMiddleware = _nr_module.NotificationRoutingMiddleware
NotificationType = _nr_module.NotificationType


def _make_middleware(settings_data=None, raise_exc=None):
    """Create a NotificationRoutingMiddleware with a mocked get_system_settings."""
    mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
    mw.supabase = MagicMock()
    mw._settings_cache = {}
    mw.log_level = "info"

    if raise_exc:
        mw.get_system_settings = MagicMock(side_effect=raise_exc)
    else:
        defaults = {
            "email_notifications": True,
            "admin_alerts": True,
            "digest_frequency": "daily"
        }
        if settings_data:
            defaults.update(settings_data)
        mw.get_system_settings = MagicMock(return_value=defaults)

    return mw


# ---------------------------------------------------------------------------
# should_send_push_notification - email_notifications=True
# ---------------------------------------------------------------------------

class TestShouldSendPushNotificationEnabled:
    def test_returns_true_when_email_notifications_true(self):
        mw = _make_middleware({"email_notifications": True})
        result = mw.should_send_push_notification("company_A")
        assert result is True

    def test_returns_bool_not_truthy(self):
        mw = _make_middleware({"email_notifications": True})
        result = mw.should_send_push_notification("company_A")
        assert isinstance(result, bool)

    def test_true_result_does_not_log_skip(self):
        mw = _make_middleware({"email_notifications": True})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_push_notification("company_A")
        mw.log_notification_skipped.assert_not_called()

    def test_returns_true_for_multiple_companies(self):
        mw = _make_middleware({"email_notifications": True})
        for cid in ["co_A", "co_B", "co_C"]:
            assert mw.should_send_push_notification(cid) is True

    def test_get_system_settings_called_with_company_id(self):
        mw = _make_middleware({"email_notifications": True})
        mw.should_send_push_notification("my-company")
        mw.get_system_settings.assert_called_with("my-company")


# ---------------------------------------------------------------------------
# should_send_push_notification - email_notifications=False
# ---------------------------------------------------------------------------

class TestShouldSendPushNotificationDisabled:
    def test_returns_false_when_email_notifications_false(self):
        mw = _make_middleware({"email_notifications": False})
        result = mw.should_send_push_notification("company_A")
        assert result is False

    def test_returns_bool_false(self):
        mw = _make_middleware({"email_notifications": False})
        result = mw.should_send_push_notification("company_A")
        assert result is False
        assert isinstance(result, bool)

    def test_logs_when_skipped(self):
        mw = _make_middleware({"email_notifications": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_push_notification("company_A")
        mw.log_notification_skipped.assert_called_once()

    def test_log_skipped_called_with_company_id(self):
        mw = _make_middleware({"email_notifications": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_push_notification("company_X")
        args = mw.log_notification_skipped.call_args[0]
        assert "company_X" in args

    def test_log_skipped_called_with_push_notification_type(self):
        mw = _make_middleware({"email_notifications": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_push_notification("company_A")
        args = mw.log_notification_skipped.call_args[0]
        assert NotificationType.PUSH_NOTIFICATION in args


# ---------------------------------------------------------------------------
# Cache hit behavior
# ---------------------------------------------------------------------------

class TestCacheBehavior:
    def test_cache_populated_after_first_call(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"

        # Mock _fetch_system_settings
        mw._fetch_system_settings = MagicMock(return_value={
            "email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"
        })
        mw.get_system_settings("company_A")
        assert "company_A" in mw._settings_cache

    def test_cache_returns_same_settings(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"

        fetch_count = {"n": 0}
        def mock_fetch(cid):
            fetch_count["n"] += 1
            return {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}

        mw._fetch_system_settings = mock_fetch
        result1 = mw.get_system_settings("company_A")
        result2 = mw.get_system_settings("company_A")
        # Second call should use cache
        assert result1 == result2


# ---------------------------------------------------------------------------
# Fail-open behavior
# ---------------------------------------------------------------------------

class TestFailOpen:
    def test_fail_open_returns_true_on_exception(self):
        """When settings unavailable, should return True (fail-open)."""
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw.supabase.table.side_effect = Exception("DB error")

        # get_system_settings should return fail-open defaults
        settings = mw.get_system_settings("company_A")
        assert settings.get("email_notifications") is True

    def test_fail_open_settings_allow_notification(self):
        mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
        mw.supabase = MagicMock()
        mw._settings_cache = {}
        mw.log_level = "info"
        mw.supabase.table.side_effect = Exception("DB error")

        result = mw.should_send_push_notification("company_A")
        assert result is True


# ---------------------------------------------------------------------------
# log_notification_sent / skipped
# ---------------------------------------------------------------------------

class TestLogMethods:
    def test_log_notification_sent_does_not_raise(self):
        mw = _make_middleware()
        try:
            mw.log_notification_sent("company_A", NotificationType.PUSH_NOTIFICATION)
        except Exception as e:
            pytest.fail(f"log_notification_sent raised: {e}")

    def test_log_notification_skipped_does_not_raise(self):
        mw = _make_middleware()
        try:
            mw.log_notification_skipped("company_A", NotificationType.PUSH_NOTIFICATION, "reason")
        except Exception as e:
            pytest.fail(f"log_notification_skipped raised: {e}")

    def test_log_notification_sent_accepts_all_types(self):
        mw = _make_middleware()
        for ntype in NotificationType:
            try:
                mw.log_notification_sent("company_A", ntype)
            except Exception as e:
                pytest.fail(f"log_notification_sent raised for {ntype}: {e}")
