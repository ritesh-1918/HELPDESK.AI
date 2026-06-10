from unittest.mock import MagicMock, patch
from backend.services.auto_close_service import AutoCloseService, load


@patch("backend.services.auto_close_service.create_client")
def test_service_disabled(mock_create_client):
    """Verify the service exits early when auto-close is disabled."""
    
    service = AutoCloseService()
    service.enabled = False

    result = service.run()

    assert result == {"status": "disabled"}


@patch("backend.services.auto_close_service.create_client")
def test_default_settings_returned_on_failure(mock_create_client):
    """Verify default settings are returned when the database query fails."""

    mock_supabase = MagicMock()
    mock_create_client.return_value = mock_supabase

    # Simulate a database failure while fetching settings
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception(
        "DB Error"
    )

    service = AutoCloseService()

    settings = service.get_system_settings("company-1")

    assert settings["auto_close_days"] == service.default_auto_close_days
    assert settings["auto_close_enabled"] is True


@patch("backend.services.auto_close_service.create_client")
def test_close_ticket_updates_stats(mock_create_client):
    """Verify successful ticket closure updates statistics correctly."""

    mock_supabase = MagicMock()
    mock_create_client.return_value = mock_supabase

    service = AutoCloseService()

    stats = {
        "closed_count": 0,
        "error_count": 0,
    }

    result = service._close_ticket(
        "ticket-1",
        "company-1",
        stats,
    )

    assert result is True
    assert stats["closed_count"] == 1


@patch("backend.services.auto_close_service.create_client")
def test_test_query_returns_empty_list_on_failure(mock_create_client):
    """Verify test_query returns an empty list when database access fails."""

    mock_supabase = MagicMock()
    mock_create_client.return_value = mock_supabase

    # Simulate database failure during sample query execution
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.side_effect = Exception(
        "DB Error"
    )

    service = AutoCloseService()

    result = service.test_query()

    assert result == []


@patch("backend.services.auto_close_service.create_client")
def test_load_returns_singleton(mock_create_client):
    """Verify load() returns the same singleton instance."""

    first = load()
    second = load()

    assert first is second