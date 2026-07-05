"""
Unit tests for backend/services/notification_routing.py

Covers:
- NotificationType enum values
- _fetch_system_settings (mocked supabase)
- get_system_settings (caching)
- should_send_email_notification (global gate, digest frequency)
- should_send_admin_alert (False/None/True)
- should_send_push_notification
- Logging methods
- invalidate_cache
- Singleton pattern: load(), get_instance()
"""

import pytest
import os
import logging
from unittest.mock import patch, MagicMock, call

# ---------------------------------------------------------------------------
# Mock supabase before importing the module under test
# We must patch environment and supabase so NotificationRoutingMiddleware.__init__
# does not try to connect.
# ---------------------------------------------------------------------------

os.environ.setdefault("SUPABASE_URL", "https://mock.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "mock-key")


@pytest.fixture(autouse=True)
def mock_supabase_client():
    """Patch create_client globally for all tests."""
    with patch("backend.services.notification_routing.create_client") as m:
        m.return_value = MagicMock()
        yield m


# ---------------------------------------------------------------------------
# Helper: create a fresh middleware with a mocked supabase
# ---------------------------------------------------------------------------

def _make_middleware(mock_create_client):
    """Return a NotificationRoutingMiddleware with mocked supabase."""
    from backend.services.notification_routing import NotificationRoutingMiddleware
    client = MagicMock()
    mock_create_client.return_value = client
    mw = NotificationRoutingMiddleware()
    return mw, client


# ---------------------------------------------------------------------------
# 1. NotificationType Enum
# ---------------------------------------------------------------------------

class TestNotificationTypeEnum:
    """Tests for NotificationType enum."""

    def test_enum_values(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        assert NotificationType.DAILY_DIGEST.value == "daily_digest"
        assert NotificationType.WEEKLY_DIGEST.value == "weekly_digest"
        assert NotificationType.TICKET_ALERT.value == "ticket_alert"
        assert NotificationType.ADMIN_ALERT.value == "admin_alert"
        assert NotificationType.PUSH_NOTIFICATION.value == "push_notification"

    def test_enum_is_string(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        assert isinstance(NotificationType.DAILY_DIGEST, str)

    def test_enum_count(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        assert len(NotificationType) == 5


# ---------------------------------------------------------------------------
# 2. NotificationRoutingMiddleware - init
# ---------------------------------------------------------------------------

class TestMiddlewareInit:
    """Tests for NotificationRoutingMiddleware.__init__."""

    def test_init_creates_supabase_client(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationRoutingMiddleware
        mw = NotificationRoutingMiddleware()
        mock_supabase_client.assert_called_once()
        assert mw.supabase is not None

    def test_init_empty_cache(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationRoutingMiddleware
        mw = NotificationRoutingMiddleware()
        assert mw._settings_cache == {}

    def test_init_default_log_level(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationRoutingMiddleware
        mw = NotificationRoutingMiddleware()
        assert mw.log_level in ("info", "debug", "warning", "error")

    def test_init_custom_log_level(self, mock_supabase_client):
        with patch.dict(os.environ, {"NOTIFICATION_ROUTING_LOG_LEVEL": "debug"}):
            from backend.services.notification_routing import NotificationRoutingMiddleware
            mw = NotificationRoutingMiddleware()
            assert mw.log_level == "debug"


# ---------------------------------------------------------------------------
# 3. _fetch_system_settings
# ---------------------------------------------------------------------------

class TestFetchSystemSettings:
    """Tests for _fetch_system_settings method."""

    def test_fetch_returns_settings(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {
            "email_notifications": True,
            "admin_alerts": False,
            "digest_frequency": "weekly",
        }
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        result = mw._fetch_system_settings("company-1")
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is False
        assert result["digest_frequency"] == "weekly"

    def test_fetch_defaults_missing_fields(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        result = mw._fetch_system_settings("company-1")
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is True
        assert result["digest_frequency"] == "daily"

    def test_fetch_db_error_fail_open(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        chain = MagicMock()
        chain.execute.side_effect = Exception("DB connection refused")
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        result = mw._fetch_system_settings("company-1")
        # Fail-open: all notifications enabled
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is True
        assert result["digest_frequency"] == "daily"

    def test_fetch_None_data_fail_open(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = None
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        result = mw._fetch_system_settings("company-1")
        assert result["email_notifications"] is True
        assert result["admin_alerts"] is True
        assert result["digest_frequency"] == "daily"

    def test_fetch_queries_system_settings_table(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        mw._fetch_system_settings("company-1")
        client.table.assert_called_with("system_settings")


# ---------------------------------------------------------------------------
# 4. get_system_settings (caching)
# ---------------------------------------------------------------------------

class TestGetSystemSettings:
    """Tests for get_system_settings with caching."""

    def test_first_call_fetches(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        result = mw.get_system_settings("company-1")
        assert result["email_notifications"] is True
        client.table.assert_called_once()

    def test_second_call_uses_cache(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        mw.get_system_settings("company-1")
        mw.get_system_settings("company-1")
        # DB queried only once (second call from cache)
        assert client.table.call_count == 1

    def test_caches_separate_companies(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)

        def setup_response(data):
            mock_resp = MagicMock()
            mock_resp.data = data
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            single = MagicMock()
            single.single.return_value = chain
            eq_mock = MagicMock()
            eq_mock.eq.return_value = single
            select_mock = MagicMock()
            select_mock.select.return_value = eq_mock
            return select_mock

        client.table.side_effect = [
            setup_response({"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}),
            setup_response({"email_notifications": False, "admin_alerts": False, "digest_frequency": "weekly"}),
        ]

        r1 = mw.get_system_settings("company-A")
        r2 = mw.get_system_settings("company-B")
        assert r1["email_notifications"] is True
        assert r2["email_notifications"] is False
        assert client.table.call_count == 2


# ---------------------------------------------------------------------------
# 5. should_send_email_notification
# ---------------------------------------------------------------------------

class TestShouldSendEmailNotification:
    """Tests for should_send_email_notification gating logic."""

    def test_allows_when_enabled(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.TICKET_ALERT) is True

    def test_blocks_when_email_notifications_disabled(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.TICKET_ALERT) is False

    def test_blocks_daily_digest_when_disabled(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "disabled"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST) is False

    def test_blocks_weekly_digest_when_disabled(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "disabled"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.WEEKLY_DIGEST) is False

    def test_weekly_digest_blocked_when_frequency_daily(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.WEEKLY_DIGEST) is False

    def test_weekly_digest_allowed_when_frequency_weekly(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "weekly"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.WEEKLY_DIGEST) is True

    def test_daily_digest_allowed_when_frequency_daily(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.DAILY_DIGEST) is True

    def test_allows_push_notification_when_email_enabled(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_email_notification("company-1", NotificationType.PUSH_NOTIFICATION) is True

    def test_cache_used_for_repeated_checks(self, mock_supabase_client):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        mw.should_send_email_notification("company-1", NotificationType.TICKET_ALERT)
        mw.should_send_email_notification("company-1", NotificationType.ADMIN_ALERT)
        # Only one DB fetch for same company
        assert client.table.call_count == 1


# ---------------------------------------------------------------------------
# 6. should_send_admin_alert
# ---------------------------------------------------------------------------

class TestShouldSendAdminAlert:
    """Tests for should_send_admin_alert."""

    def test_allows_when_enabled(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_admin_alert("company-1") is True

    def test_blocks_when_admin_alerts_false(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": False, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_admin_alert("company-1") is False

    def test_blocks_when_admin_alerts_None(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": None, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_admin_alert("company-1") is False

    def test_allows_when_admin_alerts_not_in_response(self, mock_supabase_client):
        """Missing admin_alerts key: settings.get returns None → should block."""
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_admin_alert("company-1") is False


# ---------------------------------------------------------------------------
# 7. should_send_push_notification
# ---------------------------------------------------------------------------

class TestShouldSendPushNotification:
    """Tests for should_send_push_notification."""

    def test_allows_when_email_enabled(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_push_notification("company-1") is True

    def test_blocks_when_email_disabled(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_push_notification("company-1") is False

    def test_ignores_admin_alert_setting(self, mock_supabase_client):
        """Push notifications should not be gated by admin_alerts."""
        mw, client = _make_middleware(mock_supabase_client)
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": False, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        assert mw.should_send_push_notification("company-1") is True


# ---------------------------------------------------------------------------
# 8. Logging Methods
# ---------------------------------------------------------------------------

class TestLoggingMethods:
    """Tests for log_notification_sent, log_notification_skipped, log_notification_error."""

    def test_log_sent_in_debug_mode(self, mock_supabase_client, caplog):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)

        with patch.object(mw, "log_level", "debug"):
            with caplog.at_level(logging.INFO):
                mw.log_notification_sent("company-1", NotificationType.TICKET_ALERT)

        assert "Notification sent" in caplog.text
        assert "company-1" in caplog.text

    def test_log_sent_silent_in_error_mode(self, mock_supabase_client, caplog):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)

        with patch.object(mw, "log_level", "error"):
            with caplog.at_level(logging.INFO):
                mw.log_notification_sent("company-1", NotificationType.TICKET_ALERT)

        assert "Notification sent" not in caplog.text

    def test_log_skipped_in_warning_mode(self, mock_supabase_client, caplog):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)

        with patch.object(mw, "log_level", "warning"):
            with caplog.at_level(logging.WARNING):
                mw.log_notification_skipped("company-1", NotificationType.DAILY_DIGEST, "disabled")

        assert "Notification skipped" in caplog.text
        assert "reason=disabled" in caplog.text

    def test_log_skipped_with_reason(self, mock_supabase_client, caplog):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)

        with patch.object(mw, "log_level", "info"):
            with caplog.at_level(logging.WARNING):
                mw.log_notification_skipped("co-xyz", NotificationType.WEEKLY_DIGEST, "digest_frequency_mismatch")

        assert "Notification skipped" in caplog.text
        assert "co-xyz" in caplog.text
        assert "digest_frequency_mismatch" in caplog.text

    def test_log_error(self, mock_supabase_client, caplog):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)

        with caplog.at_level(logging.ERROR):
            mw.log_notification_error("company-1", NotificationType.ADMIN_ALERT, Exception("timeout"))

        assert "Notification error" in caplog.text
        assert "timeout" in caplog.text

    def test_log_sent_includes_timestamp(self, mock_supabase_client, caplog):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)

        with patch.object(mw, "log_level", "info"):
            with caplog.at_level(logging.INFO):
                mw.log_notification_sent("company-1", NotificationType.ADMIN_ALERT)

        log_text = caplog.text
        assert "timestamp=" in log_text

    def test_log_skipped_silent_in_error_mode(self, mock_supabase_client, caplog):
        from backend.services.notification_routing import NotificationType
        mw, client = _make_middleware(mock_supabase_client)

        with patch.object(mw, "log_level", "error"):
            with caplog.at_level(logging.WARNING):
                mw.log_notification_skipped("company-1", NotificationType.DAILY_DIGEST, "test")

        assert "Notification skipped" not in caplog.text


# ---------------------------------------------------------------------------
# 9. invalidate_cache
# ---------------------------------------------------------------------------

class TestInvalidateCache:
    """Tests for invalidate_cache."""

    def test_removes_existing_company_from_cache(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        mw._settings_cache["company-1"] = {"email_notifications": True}

        mw.invalidate_cache("company-1")
        assert "company-1" not in mw._settings_cache

    def test_does_nothing_for_nonexistent_company(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)
        cache_before = dict(mw._settings_cache)
        mw._settings_cache["company-1"] = {"email_notifications": True}

        mw.invalidate_cache("company-999")
        assert "company-1" in mw._settings_cache

    def test_next_get_after_invalidate_refetches(self, mock_supabase_client):
        mw, client = _make_middleware(mock_supabase_client)

        # First fetch
        mock_resp = MagicMock()
        mock_resp.data = {"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        chain = MagicMock()
        chain.execute.return_value = mock_resp
        single = MagicMock()
        single.single.return_value = chain
        eq_mock = MagicMock()
        eq_mock.eq.return_value = single
        select_mock = MagicMock()
        select_mock.select.return_value = eq_mock
        client.table.return_value = select_mock

        mw.get_system_settings("company-1")
        assert client.table.call_count == 1

        mw.invalidate_cache("company-1")

        # Second fetch should re-query
        mock_resp2 = MagicMock()
        mock_resp2.data = {"email_notifications": False, "admin_alerts": True, "digest_frequency": "weekly"}
        chain2 = MagicMock()
        chain2.execute.return_value = mock_resp2
        single2 = MagicMock()
        single2.single.return_value = chain2
        eq_mock2 = MagicMock()
        eq_mock2.eq.return_value = single2
        select_mock2 = MagicMock()
        select_mock2.select.return_value = eq_mock2
        client.table.return_value = select_mock2

        mw.get_system_settings("company-1")
        assert client.table.call_count == 2


# ---------------------------------------------------------------------------
# 10. Singleton Pattern
# ---------------------------------------------------------------------------

class TestSingletonPattern:
    """Tests for load() and get_instance()."""

    def test_load_creates_instance(self, mock_supabase_client):
        import backend.services.notification_routing as nr
        # Reset singleton for test isolation
        nr._instance = None

        inst = nr.load()
        assert inst is not None
        from backend.services.notification_routing import NotificationRoutingMiddleware
        assert isinstance(inst, NotificationRoutingMiddleware)

    def test_load_returns_same_instance(self, mock_supabase_client):
        import backend.services.notification_routing as nr
        nr._instance = None

        inst1 = nr.load()
        inst2 = nr.load()
        assert inst1 is inst2

    def test_get_instance_returns_None_before_load(self, mock_supabase_client):
        import backend.services.notification_routing as nr
        nr._instance = None
        assert nr.get_instance() is None

    def test_get_instance_returns_instance_after_load(self, mock_supabase_client):
        import backend.services.notification_routing as nr
        nr._instance = None

        inst = nr.load()
        assert nr.get_instance() is inst

    def test_load_initializes_supabase(self, mock_supabase_client):
        import backend.services.notification_routing as nr
        nr._instance = None
        mock_supabase_client.reset_mock()

        nr.load()
        mock_supabase_client.assert_called_once()
