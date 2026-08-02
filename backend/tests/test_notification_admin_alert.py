"""
Test suite for NotificationRoutingMiddleware.should_send_admin_alert() (Issue #1158).

Covers:
- Returns True when admin_alerts=True
- Returns False when admin_alerts=False
- Logs correctly when skipped or sent
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
    "notification_routing_admin",
    os.path.join(os.path.dirname(__file__), "..", "services", "notification_routing.py")
)
_nr_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_nr_module)

NotificationRoutingMiddleware = _nr_module.NotificationRoutingMiddleware
NotificationType = _nr_module.NotificationType


def _make_middleware(settings_data=None):
    mw = NotificationRoutingMiddleware.__new__(NotificationRoutingMiddleware)
    mw.supabase = MagicMock()
    mw._settings_cache = {}
    mw.log_level = "info"
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
# should_send_admin_alert - True when admin_alerts=True
# ---------------------------------------------------------------------------

class TestAdminAlertEnabled:
    def test_returns_true_when_admin_alerts_true(self):
        mw = _make_middleware({"admin_alerts": True})
        result = mw.should_send_admin_alert("company_A")
        assert result is True

    def test_returns_bool(self):
        mw = _make_middleware({"admin_alerts": True})
        result = mw.should_send_admin_alert("company_A")
        assert isinstance(result, bool)

    def test_true_does_not_log_skip(self):
        mw = _make_middleware({"admin_alerts": True})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_admin_alert("company_A")
        mw.log_notification_skipped.assert_not_called()

    def test_calls_get_system_settings_with_company_id(self):
        mw = _make_middleware({"admin_alerts": True})
        mw.should_send_admin_alert("company_X")
        mw.get_system_settings.assert_called_with("company_X")

    def test_returns_true_for_multiple_companies(self):
        mw = _make_middleware({"admin_alerts": True})
        for cid in ["co1", "co2", "co3"]:
            assert mw.should_send_admin_alert(cid) is True


# ---------------------------------------------------------------------------
# should_send_admin_alert - False when admin_alerts=False
# ---------------------------------------------------------------------------

class TestAdminAlertDisabled:
    def test_returns_false_when_admin_alerts_false(self):
        mw = _make_middleware({"admin_alerts": False})
        result = mw.should_send_admin_alert("company_A")
        assert result is False

    def test_returns_bool_false(self):
        mw = _make_middleware({"admin_alerts": False})
        result = mw.should_send_admin_alert("company_A")
        assert result is False
        assert isinstance(result, bool)

    def test_logs_when_admin_alerts_false(self):
        mw = _make_middleware({"admin_alerts": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_admin_alert("company_A")
        mw.log_notification_skipped.assert_called_once()

    def test_log_skipped_has_company_id(self):
        mw = _make_middleware({"admin_alerts": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_admin_alert("company_Y")
        args = mw.log_notification_skipped.call_args[0]
        assert "company_Y" in args

    def test_log_skipped_called_with_admin_alert_type(self):
        mw = _make_middleware({"admin_alerts": False})
        mw.log_notification_skipped = MagicMock()
        mw.should_send_admin_alert("company_A")
        args = mw.log_notification_skipped.call_args[0]
        assert NotificationType.ADMIN_ALERT in args


# ---------------------------------------------------------------------------
# should_send_admin_alert - None admin_alerts
# ---------------------------------------------------------------------------

class TestAdminAlertNone:
    def test_returns_false_when_admin_alerts_none(self):
        mw = _make_middleware({"admin_alerts": None})
        result = mw.should_send_admin_alert("company_A")
        assert result is False

    def test_none_does_not_raise(self):
        mw = _make_middleware({"admin_alerts": None})
        try:
            mw.should_send_admin_alert("company_A")
        except Exception as e:
            pytest.fail(f"should_send_admin_alert raised for admin_alerts=None: {e}")


# ---------------------------------------------------------------------------
# Logging behavior
# ---------------------------------------------------------------------------

class TestLoggingBehavior:
    def test_log_sent_called_when_returning_true(self):
        mw = _make_middleware({"admin_alerts": True})
        mw.log_notification_sent = MagicMock()
        mw.should_send_admin_alert("company_A")
        mw.log_notification_sent.assert_called_once()

    def test_log_sent_has_company_id(self):
        mw = _make_middleware({"admin_alerts": True})
        mw.log_notification_sent = MagicMock()
        mw.should_send_admin_alert("company_Z")
        args = mw.log_notification_sent.call_args[0]
        assert "company_Z" in args

    def test_log_sent_has_admin_alert_type(self):
        mw = _make_middleware({"admin_alerts": True})
        mw.log_notification_sent = MagicMock()
        mw.should_send_admin_alert("company_A")
        args = mw.log_notification_sent.call_args[0]
        assert NotificationType.ADMIN_ALERT in args

    def test_log_notification_sent_does_not_raise(self):
        mw = _make_middleware()
        try:
            mw.log_notification_sent("company_A", NotificationType.ADMIN_ALERT)
        except Exception as e:
            pytest.fail(f"log_notification_sent raised: {e}")

    def test_log_notification_skipped_does_not_raise(self):
        mw = _make_middleware()
        try:
            mw.log_notification_skipped("company_A", NotificationType.ADMIN_ALERT, "disabled")
        except Exception as e:
            pytest.fail(f"log_notification_skipped raised: {e}")


# ---------------------------------------------------------------------------
# NotificationType enum
# ---------------------------------------------------------------------------

class TestNotificationType:
    def test_admin_alert_in_notification_types(self):
        assert hasattr(NotificationType, "ADMIN_ALERT")

    def test_push_notification_in_notification_types(self):
        assert hasattr(NotificationType, "PUSH_NOTIFICATION")

    def test_admin_alert_value_is_string(self):
        assert isinstance(NotificationType.ADMIN_ALERT.value, str)

    def test_all_type_values_are_strings(self):
        for ntype in NotificationType:
            assert isinstance(ntype.value, str)
