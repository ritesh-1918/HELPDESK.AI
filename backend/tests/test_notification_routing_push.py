"""
Unit tests for NotificationRoutingMiddleware.

Coverage for issue: Add unit tests for notification_routing
    should_send_push_notification method
"""

import os
from unittest import mock

import pytest

from backend.services.notification_routing import (
    NotificationRoutingMiddleware,
    NotificationType,
)


@pytest.fixture
def middleware():
    """Fresh instance with a mocked Supabase client and pending env."""
    with mock.patch.dict(os.environ, {}, clear=False):
        with mock.patch("backend.services.notification_routing.create_client") as fake_create:
            fake_client = mock.MagicMock()
            fake_create.return_value = fake_client
            mw = NotificationRoutingMiddleware()
            mw.supabase = fake_client
            yield mw


# ── should_send_push_notification ──────────────────────────────────────────


class TestShouldSendPushNotification:
    def test_sends_when_email_notifications_enabled(self, middleware):
        middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock.MagicMock(
            data={"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        )

        assert middleware.should_send_push_notification("company-abc") is True

    def test_blocks_when_email_notifications_disabled(self, middleware):
        middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock.MagicMock(
            data={"email_notifications": False, "admin_alerts": True, "digest_frequency": "daily"}
        )

        assert middleware.should_send_push_notification("company-abc") is False

    def test_fail_open_when_supabase_raises(self, middleware):
        middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB down")

        assert middleware.should_send_push_notification("company-abc") is True

    def test_cache_reuse_skips_supabase(self, middleware):
        middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock.MagicMock(
            data={"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        )

        middleware.should_send_push_notification("company-cache")
        middleware.should_send_push_notification("company-cache")

        assert middleware.supabase.table.call_count == 1

    def test_invalidate_cache_refetches(self, middleware):
        middleware.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock.MagicMock(
            data={"email_notifications": True, "admin_alerts": True, "digest_frequency": "daily"}
        )

        middleware.should_send_push_notification("company-cache2")
        middleware.invalidate_cache("company-cache2")
        middleware.supabase.reset_mock()
        middleware.should_send_push_notification("company-cache2")

        assert middleware.supabase.table.call_count >= 1
