"""
Unit tests for NotificationRoutingMiddleware.

These tests validate notification gating behavior,
fallback handling, cache invalidation, and singleton loading.
"""

from unittest.mock import MagicMock, patch

from backend.services.notification_routing import (
    NotificationRoutingMiddleware,
    NotificationType,
    load,
)


@patch("backend.services.notification_routing.create_client")
def test_email_notifications_disabled(mock_create_client):
    """Verify email notifications are blocked when disabled."""

    mock_create_client.return_value = MagicMock()

    middleware = NotificationRoutingMiddleware()
    middleware._settings_cache["company-1"] = {
        "email_notifications": False,
        "admin_alerts": True,
        "digest_frequency": "daily",
    }

    result = middleware.should_send_email_notification(
        "company-1",
        NotificationType.TICKET_ALERT,
    )

    assert result is False


@patch("backend.services.notification_routing.create_client")
def test_admin_alerts_disabled(mock_create_client):
    """Verify admin alerts are blocked when disabled."""

    mock_create_client.return_value = MagicMock()

    middleware = NotificationRoutingMiddleware()
    middleware._settings_cache["company-1"] = {
        "email_notifications": True,
        "admin_alerts": False,
        "digest_frequency": "daily",
    }

    result = middleware.should_send_admin_alert("company-1")

    assert result is False


@patch("backend.services.notification_routing.create_client")
def test_default_settings_returned_on_failure(mock_create_client):
    """Verify fail-open behavior when settings lookup fails."""

    mock_supabase = MagicMock()
    mock_create_client.return_value = mock_supabase

    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception(
        "DB Error"
    )

    middleware = NotificationRoutingMiddleware()

    settings = middleware.get_system_settings("company-1")

    assert settings["email_notifications"] is True
    assert settings["admin_alerts"] is True
    assert settings["digest_frequency"] == "daily"


@patch("backend.services.notification_routing.create_client")
def test_cache_invalidation(mock_create_client):
    """Verify cached company settings can be invalidated."""

    mock_create_client.return_value = MagicMock()

    middleware = NotificationRoutingMiddleware()

    middleware._settings_cache["company-1"] = {
        "email_notifications": True,
        "admin_alerts": True,
        "digest_frequency": "daily",
    }

    middleware.invalidate_cache("company-1")

    assert "company-1" not in middleware._settings_cache


@patch("backend.services.notification_routing.create_client")
def test_load_returns_singleton(mock_create_client):
    """Verify load() returns the same singleton instance."""

    first = load()
    second = load()

    assert first is second