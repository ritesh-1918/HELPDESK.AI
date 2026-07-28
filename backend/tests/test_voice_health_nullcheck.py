"""
Unit tests for the /api/voice/health endpoint (Issue #1115).

Tests that the endpoint correctly delegates to get_voice_service_health()
and maps its response to the correct HTTP shape.

Patch target: backend.routes.voice.get_voice_service_health
(the public function the router imports and calls — not the private
_whisper_model attribute which the router no longer reads directly).
"""

import pytest
from unittest.mock import patch, MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# FIX 11: Import the correct patch target symbol at module level so it is
#          visible and searchable in the test file.
from backend.routes.voice import router, SUPPORTED_FORMATS, MAX_UPLOAD_SIZE_MB
from backend.services.rate_limit_config import limiter

# Canonical patch path — all tests use this constant so a rename only
# needs to change one line.
_HEALTH_PATCH = "backend.routes.voice.get_voice_service_health"


# ─── Fixture ─────────────────────────────────────────────────────────────────
# FIX 6+7: Minimal app with only the voice router, module-scoped so the
#           app is built once for all 13 tests instead of 11 times.

@pytest.fixture(scope="module")
def client():
    """Minimal FastAPI TestClient — only the voice router, no full app stack."""
    app = FastAPI()
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.include_router(router)
    return TestClient(app, raise_server_exceptions=False)


# ─── Happy path ───────────────────────────────────────────────────────────────
# FIX 1+2+11: Patch get_voice_service_health(), not _whisper_model.

def test_health_returns_ok_when_model_loaded(client):
    """status=ok and model_loaded=True when service reports model ready."""
    with patch(_HEALTH_PATCH, return_value={"model_loaded": True}):
        response = client.get("/api/voice/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True


# ─── Model not loaded ─────────────────────────────────────────────────────────
# FIX 4: status must be "unavailable" (not "degraded") when model_loaded=False.

def test_health_returns_unavailable_when_model_not_loaded(client):
    """status=unavailable and model_loaded=False when service reports no model."""
    with patch(_HEALTH_PATCH, return_value={"model_loaded": False}):
        response = client.get("/api/voice/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unavailable"
    assert data["model_loaded"] is False


# ─── Exception paths ──────────────────────────────────────────────────────────
# FIX 3+5: Use real exception types — no MagicMock attribute deletion tricks.
# FIX 5: All exception paths return status="unavailable", not "error".
# FIX 12: Assert only that "message" key is present; do not hardcode the
#          internal message string.

@pytest.mark.parametrize("exc", [
    ImportError("whisper not installed"),
    AttributeError("_whisper_model not found"),
    Exception("unexpected health check failure"),
])
def test_health_returns_unavailable_on_exception(client, exc):
    """All exception types from the health helper map to status=unavailable."""
    with patch(_HEALTH_PATCH, side_effect=exc):
        response = client.get("/api/voice/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unavailable"
    assert data["model_loaded"] is False
    assert "message" in data          # message key present
    assert isinstance(data["message"], str)
    assert len(data["message"]) > 0   # non-empty, but not hardcoded


# ─── Response structure ───────────────────────────────────────────────────────
# FIX 9: Dedicated structure test — keeps field/type checks out of scenario tests.
# FIX 13: parametrize over both status paths so structure is verified for each.

@pytest.mark.parametrize("model_loaded,expected_status", [
    (True,  "ok"),
    (False, "unavailable"),
])
def test_health_response_structure(client, model_loaded, expected_status):
    """Required fields are always present with correct types."""
    with patch(_HEALTH_PATCH, return_value={"model_loaded": model_loaded}):
        response = client.get("/api/voice/health")

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == expected_status
    assert isinstance(data["status"], str)
    assert isinstance(data["model_loaded"], bool)
    assert isinstance(data["max_audio_size_mb"], int)
    assert isinstance(data["supported_formats"], list)


def test_health_supported_formats(client):
    """supported_formats contains all expected audio format strings."""
    with patch(_HEALTH_PATCH, return_value={"model_loaded": False}):
        response = client.get("/api/voice/health")

    data = response.json()
    for fmt in SUPPORTED_FORMATS:
        assert fmt in data["supported_formats"], (
            f"Expected format '{fmt}' missing from supported_formats"
        )


def test_health_max_audio_size_mb(client):
    """max_audio_size_mb matches the MAX_UPLOAD_SIZE_MB constant."""
    with patch(_HEALTH_PATCH, return_value={"model_loaded": False}):
        response = client.get("/api/voice/health")

    assert response.json()["max_audio_size_mb"] == MAX_UPLOAD_SIZE_MB


# ─── Accessibility + idempotency ──────────────────────────────────────────────
# FIX 8: Merged into plain functions — no TestClass separation needed for
#         a single endpoint with identical setup.
# FIX 10: Idempotency test now verifies the *same* result on each call, not
#          just that status_code==200 three times.

def test_health_accessible_without_auth(client):
    """Health endpoint must not require authentication."""
    with patch(_HEALTH_PATCH, return_value={"model_loaded": False}):
        response = client.get("/api/voice/health")
    assert response.status_code == 200


def test_health_is_idempotent(client):
    """Three consecutive calls return identical responses."""
    with patch(_HEALTH_PATCH, return_value={"model_loaded": True}):
        responses = [client.get("/api/voice/health") for _ in range(3)]

    bodies = [r.json() for r in responses]
    assert all(r.status_code == 200 for r in responses)
    assert bodies[0] == bodies[1] == bodies[2], (
        "Health endpoint is not idempotent — responses differ across calls"
    )