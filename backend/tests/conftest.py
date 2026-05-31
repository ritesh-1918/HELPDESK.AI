import os
import pytest
from unittest.mock import MagicMock, patch


def mock_supabase_response(data=None, error=None):
    response = MagicMock()
    if data is not None:
        response.data = data
    if error:
        response.error = error
    return response


@pytest.fixture
def mock_supabase_client():
    with patch("supabase.create_client") as mock_create:
        client = MagicMock()
        mock_create.return_value = client
        yield client


@pytest.fixture
def mock_env_vars():
    with patch.dict(os.environ, {
        "SUPABASE_URL": "https://test.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "test-key",
        "SUPABASE_SERVICE_KEY": "test-key",
        "AUTO_CLOSE_ENABLED": "true",
        "AUTO_CLOSE_DAYS": "7",
        "AUTO_CLOSE_CRON_SCHEDULE": "0 2 * * *",
        "NOTIFICATION_ROUTING_LOG_LEVEL": "info",
    }):
        yield
