import pytest
from unittest.mock import patch, MagicMock
from backend.services.auto_close_service import AutoCloseService


class TestAutoCloseService:
    @pytest.fixture
    def service(self):
        with patch("backend.services.auto_close_service.create_client"), \
             patch("backend.services.auto_close_service.os.getenv") as mock_getenv:
            mock_getenv.side_effect = lambda key, default=None: {
                "SUPABASE_URL": "https://test.supabase.co",
                "SUPABASE_SERVICE_ROLE_KEY": "test-key",
                "AUTO_CLOSE_ENABLED": "true",
                "AUTO_CLOSE_DAYS": "7",
                "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
            }.get(key, default)
            s = AutoCloseService()
            s.supabase = MagicMock()
            return s

    def test_get_system_settings_returns_defaults_when_no_data(self, service):
        mock_response = MagicMock()
        mock_response.data = None
        service.supabase.table().select().eq().single().execute.return_value = mock_response

        result = service.get_system_settings("company-123")
        assert result["auto_close_days"] == 7
        assert result["auto_close_enabled"] is True

    def test_get_system_settings_returns_db_values(self, service):
        mock_response = MagicMock()
        mock_response.data = {"auto_close_days": 14, "auto_close_enabled": False}
        service.supabase.table().select().eq().single().execute.return_value = mock_response

        result = service.get_system_settings("company-123")
        assert result["auto_close_days"] == 14
        assert result["auto_close_enabled"] is False

    def test_get_system_settings_falls_back_on_error(self, service):
        service.supabase.table().select().eq().single().execute.side_effect = Exception("DB error")

        result = service.get_system_settings("company-123")
        assert result["auto_close_days"] == 7
        assert result["auto_close_enabled"] is True

    def test_run_returns_disabled_when_not_enabled(self, service):
        service.enabled = False
        result = service.run()
        assert result == {"status": "disabled"}

    def test_run_processes_no_tickets_when_none_resolved(self, service):
        mock_response = MagicMock()
        mock_response.data = []
        service.supabase.table().select().eq().execute.return_value = mock_response

        result = service.run()
        assert result["processed_count"] == 0
        assert result["closed_count"] == 0

    def test_close_ticket_updates_status(self, service):
        mock_response = MagicMock()
        service.supabase.table().update().eq().eq().execute.return_value = mock_response

        stats = {"closed_count": 0, "error_count": 0}
        result = service._close_ticket("ticket-1", "company-1", stats)
        assert result is True
        assert stats["closed_count"] == 1

    def test_close_ticket_handles_error(self, service):
        service.supabase.table().update().eq().eq().execute.side_effect = Exception("Update failed")

        stats = {"closed_count": 0, "error_count": 0}
        result = service._close_ticket("ticket-1", "company-1", stats)
        assert result is False
        assert stats["error_count"] == 1
