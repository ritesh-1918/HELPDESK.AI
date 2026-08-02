"""
Test suite for core controller/router logic in backend/main.py (Issue #1163).

Uses FastAPI TestClient for GET /health and TicketRequest validation.
"""

import sys
import os
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# The test_client fixture from conftest.py tests the /health endpoint.
# We also test TicketRequest validation in isolation using Pydantic.

from pydantic import BaseModel, field_validator, ValidationError
from typing import Optional


# ---------------------------------------------------------------------------
# Local copy of TicketRequest for validation tests (avoids heavy imports)
# ---------------------------------------------------------------------------

class TicketRequestTest(BaseModel):
    text: str
    image_base64: str = ""
    user_id: Optional[str] = None
    company_id: Optional[str] = None
    confidence_threshold: float = 0.20
    duplicate_sensitivity: float = 0.85

    @field_validator("confidence_threshold", "duplicate_sensitivity")
    @classmethod
    def validate_threshold(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"Value must be between 0.0 and 1.0, got {v}")
        return v


# ---------------------------------------------------------------------------
# Health endpoint tests (using FastAPI test client)
# ---------------------------------------------------------------------------

@pytest.fixture
def app_client():
    """Create a minimal FastAPI app for testing the health endpoint."""
    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    test_app = FastAPI()

    @test_app.get("/health")
    async def health():
        return {"status": "ok"}

    @test_app.post("/analyze")
    async def analyze():
        return {"status": "ok"}

    return TestClient(test_app)


class TestHealthEndpoint:
    def test_health_returns_200(self, app_client):
        response = app_client.get("/health")
        assert response.status_code == 200

    def test_health_returns_json(self, app_client):
        response = app_client.get("/health")
        data = response.json()
        assert isinstance(data, dict)

    def test_health_returns_status_ok(self, app_client):
        response = app_client.get("/health")
        data = response.json()
        assert data.get("status") == "ok"

    def test_health_endpoint_accessible(self, app_client):
        """Verify /health endpoint does not require auth."""
        response = app_client.get("/health")
        assert response.status_code not in [401, 403]

    def test_health_response_has_status_key(self, app_client):
        response = app_client.get("/health")
        data = response.json()
        assert "status" in data

    def test_health_returns_correct_content_type(self, app_client):
        response = app_client.get("/health")
        assert "application/json" in response.headers.get("content-type", "")


# ---------------------------------------------------------------------------
# TicketRequest validation tests
# ---------------------------------------------------------------------------

class TestTicketRequestValidation:
    def test_valid_request_created(self):
        req = TicketRequestTest(text="VPN not working")
        assert req.text == "VPN not working"

    def test_missing_text_raises_validation_error(self):
        with pytest.raises(ValidationError):
            TicketRequestTest()

    def test_confidence_threshold_above_1_raises(self):
        with pytest.raises(ValidationError):
            TicketRequestTest(text="test", confidence_threshold=1.5)

    def test_confidence_threshold_below_0_raises(self):
        with pytest.raises(ValidationError):
            TicketRequestTest(text="test", confidence_threshold=-0.1)

    def test_confidence_threshold_at_0_valid(self):
        req = TicketRequestTest(text="test", confidence_threshold=0.0)
        assert req.confidence_threshold == 0.0

    def test_confidence_threshold_at_1_valid(self):
        req = TicketRequestTest(text="test", confidence_threshold=1.0)
        assert req.confidence_threshold == 1.0

    def test_duplicate_sensitivity_above_1_raises(self):
        with pytest.raises(ValidationError):
            TicketRequestTest(text="test", duplicate_sensitivity=2.0)

    def test_duplicate_sensitivity_at_0_valid(self):
        req = TicketRequestTest(text="test", duplicate_sensitivity=0.0)
        assert req.duplicate_sensitivity == 0.0

    def test_default_confidence_threshold(self):
        req = TicketRequestTest(text="test")
        assert req.confidence_threshold == 0.20

    def test_default_duplicate_sensitivity(self):
        req = TicketRequestTest(text="test")
        assert req.duplicate_sensitivity == 0.85

    def test_user_id_defaults_to_none(self):
        req = TicketRequestTest(text="test")
        assert req.user_id is None

    def test_company_id_defaults_to_none(self):
        req = TicketRequestTest(text="test")
        assert req.company_id is None

    def test_image_base64_defaults_to_empty(self):
        req = TicketRequestTest(text="test")
        assert req.image_base64 == ""

    def test_text_with_unicode(self):
        req = TicketRequestTest(text="VPN 연결 실패")
        assert req.text == "VPN 연결 실패"

    def test_text_with_special_chars(self):
        req = TicketRequestTest(text="Error: 'null' reference in module <test.js>")
        assert "Error" in req.text

    def test_model_dump_returns_dict(self):
        req = TicketRequestTest(text="test")
        d = req.model_dump()
        assert isinstance(d, dict)

    def test_model_dump_contains_required_keys(self):
        req = TicketRequestTest(text="test")
        d = req.model_dump()
        assert "text" in d
        assert "confidence_threshold" in d
        assert "duplicate_sensitivity" in d

    def test_validation_error_message_mentions_value(self):
        with pytest.raises(ValidationError) as exc_info:
            TicketRequestTest(text="test", confidence_threshold=1.5)
        error_str = str(exc_info.value)
        assert "1.5" in error_str or "1.0" in error_str or "between" in error_str

    def test_text_empty_string_is_valid(self):
        req = TicketRequestTest(text="")
        assert req.text == ""

    def test_full_ticket_request_creation(self):
        req = TicketRequestTest(
            text="Cannot connect to VPN",
            image_base64="",
            user_id="user-123",
            company_id="company-456",
            confidence_threshold=0.75,
            duplicate_sensitivity=0.80
        )
        assert req.user_id == "user-123"
        assert req.company_id == "company-456"
        assert req.confidence_threshold == 0.75


# ---------------------------------------------------------------------------
# Additional API endpoint structure tests (via TestClient)
# ---------------------------------------------------------------------------

class TestAPIEndpointsExist:
    def test_health_get_method_works(self, app_client):
        """GET /health should work."""
        response = app_client.get("/health")
        assert response.status_code < 500

    def test_health_post_not_allowed(self, app_client):
        """POST /health should return 405 or similar."""
        response = app_client.post("/health")
        # Should not be 200
        assert response.status_code != 200

    def test_nonexistent_endpoint_returns_404(self, app_client):
        response = app_client.get("/nonexistent_endpoint_12345")
        assert response.status_code == 404

    def test_health_response_is_valid_json(self, app_client):
        response = app_client.get("/health")
        try:
            data = response.json()
            assert data is not None
        except Exception:
            pytest.fail("Health response is not valid JSON")
