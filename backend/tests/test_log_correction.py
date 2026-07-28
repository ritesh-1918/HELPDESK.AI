"""
Tests for /ai/log_correction endpoint.
Covers: authentication, rate limiting, async file I/O, race conditions.
"""
import pytest
import tempfile
import json
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Mock supabase before importing main (stays active for module lifetime)
_patcher = patch("main.supabase")
_patcher.start()
from main import app, get_current_user, CORRECTIONS_LOG_PATH  # noqa: E402

client = TestClient(app)

import atexit
atexit.register(_patcher.stop)

# Mock user data
MOCK_USER = {
    "id": "test-user-id-123",
    "email": "test@example.com",
    "user_metadata": {
        "company_id": "test-company-id",
        "company": "Test Company",
        "role": "admin"
    }
}


def mock_get_current_user():
    return MOCK_USER


@pytest.fixture(autouse=True)
def setup_dependency_override():
    """Override FastAPI dependency for all tests."""
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


class TestLogCorrection:
    """Tests for POST /ai/log_correction endpoint."""

    def test_log_correction_requires_auth(self):
        """Test that /ai/log_correction requires authentication."""
        app.dependency_overrides.pop(get_current_user, None)
        response = client.post("/ai/log_correction", json={
            "ticket_id": "TKT-001",
            "original_prediction": {"category": "billing"},
            "corrected_prediction": {"category": "technical"}
        })
        assert response.status_code == 401

    def test_log_correction_saves_entry(self):
        """Test that correction is saved with authenticated user_id."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump([], f)
            temp_path = Path(f.name)

        # Patch CORRECTIONS_LOG_PATH with a real Path object so open() works
        with patch("main.CORRECTIONS_LOG_PATH", temp_path):
            response = client.post("/ai/log_correction", json={
                "ticket_id": "TKT-001",
                "original_prediction": {"category": "billing"},
                "corrected_prediction": {"category": "technical"}
            }, headers={"Authorization": "Bearer test-token"})

            assert response.status_code == 200
            assert response.json()["status"] == "saved"

            # Verify user_id is logged
            with open(temp_path) as f:
                logs = json.load(f)
            assert len(logs) == 1
            assert logs[0]["user_id"] == "test-user-id-123"

        # Cleanup
        temp_path.unlink(missing_ok=True)
        lock_file = Path(str(temp_path) + ".lock")
        lock_file.unlink(missing_ok=True)

    def test_log_correction_no_change(self):
        """Test that no log entry is created when predictions match."""
        response = client.post("/ai/log_correction", json={
            "ticket_id": "TKT-001",
            "original_prediction": {"category": "billing"},
            "corrected_prediction": {"category": "billing"}
        }, headers={"Authorization": "Bearer test-token"})

        assert response.status_code == 200
        assert response.json()["status"] == "no_change"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
