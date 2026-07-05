"""
Tests for backend/routes/voice.py

Covers: happy path transcribe + create-ticket, empty/oversized audio,
invalid language tag, missing audio field, service ValueError/RuntimeError,
no_speech_detected path, /health endpoint, suggested_title robustness.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

# FIX 11: Top-level imports — deferred imports inside create_test_app() hid
#          missing dependencies until the first test ran.
from fastapi import FastAPI
from fastapi.testclient import TestClient
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from backend.routes.voice import router, MAX_UPLOAD_SIZE
from backend.services.rate_limit_config import limiter


# ─── App fixture ─────────────────────────────────────────────────────────────
# FIX 1+13: Single shared TestClient via pytest fixture — previously
#            create_test_app() + TestClient were rebuilt inside every test.

@pytest.fixture(scope="module")
def client():
    """Single FastAPI TestClient shared across all voice route tests."""
    app = FastAPI()
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.include_router(router)
    return TestClient(app, raise_server_exceptions=False)


# ─── Service result factory ───────────────────────────────────────────────────
# FIX 14: Shared factory replaces duplicated inline dicts.

def _transcription_result(
    text: str = "My laptop will not connect to Wi-Fi.",
    language: str = "en",
    confidence: float = 0.95,
    duration: float = 1.2,
) -> dict:
    return {
        "transcribed_text": text,
        "detected_language": language,
        "confidence": confidence,
        "duration_seconds": duration,
    }


# ─── /transcribe happy path ───────────────────────────────────────────────────

def test_transcribe_returns_200_for_valid_audio(client):
    result = _transcription_result()
    with patch(
        "backend.routes.voice.transcribe_audio_async",
        new=AsyncMock(return_value=result),
    ) as mock:
        response = client.post(
            "/api/voice/transcribe",
            files={"audio": ("issue.wav", b"fake audio bytes", "audio/wav")},
            data={"language": "en"},
        )

    assert response.status_code == 200
    assert response.json() == result
    mock.assert_awaited_once_with(
        file_bytes=b"fake audio bytes",
        filename="issue.wav",
        language="en",
    )


# ─── /transcribe error paths ──────────────────────────────────────────────────
# FIX 2: Empty audio body must return 400.

def test_transcribe_rejects_empty_audio(client):
    with patch("backend.routes.voice.transcribe_audio_async", new=AsyncMock()):
        response = client.post(
            "/api/voice/transcribe",
            files={"audio": ("empty.wav", b"", "audio/wav")},
        )
    assert response.status_code == 400


# FIX 3: Oversized file must return 413.

def test_transcribe_rejects_oversized_file(client):
    oversized = b"x" * (MAX_UPLOAD_SIZE + 1)
    with patch("backend.routes.voice.transcribe_audio_async", new=AsyncMock()):
        response = client.post(
            "/api/voice/transcribe",
            files={"audio": ("big.wav", oversized, "audio/wav")},
        )
    assert response.status_code == 413


# FIX 4: Invalid BCP-47 language tag must return 422.

@pytest.mark.parametrize("bad_lang", ["english", "123", "toolongvalue99"])
def test_transcribe_rejects_invalid_language_tag(client, bad_lang):
    with patch("backend.routes.voice.transcribe_audio_async", new=AsyncMock()):
        response = client.post(
            "/api/voice/transcribe",
            files={"audio": ("a.wav", b"bytes", "audio/wav")},
            data={"language": bad_lang},
        )
    assert response.status_code == 422


# FIX 12: Missing audio field entirely must return 422.

def test_transcribe_rejects_missing_audio_field(client):
    response = client.post("/api/voice/transcribe", data={"language": "en"})
    assert response.status_code == 422


# FIX 5: ValueError from service must return 400.

def test_transcribe_returns_400_on_value_error(client):
    with patch(
        "backend.routes.voice.transcribe_audio_async",
        new=AsyncMock(side_effect=ValueError("unsupported format")),
    ):
        response = client.post(
            "/api/voice/transcribe",
            files={"audio": ("a.wav", b"bytes", "audio/wav")},
        )
    assert response.status_code == 400


# FIX 6: RuntimeError from service must return 500 with safe message.

def test_transcribe_returns_500_on_runtime_error(client):
    with patch(
        "backend.routes.voice.transcribe_audio_async",
        new=AsyncMock(side_effect=RuntimeError("model crashed")),
    ):
        response = client.post(
            "/api/voice/transcribe",
            files={"audio": ("a.wav", b"bytes", "audio/wav")},
        )
    assert response.status_code == 500
    # FIX 6 cont: internal error message must not leak to client.
    assert "model crashed" not in response.text


# ─── /create-ticket happy path ────────────────────────────────────────────────

def test_create_ticket_returns_success_draft(client):
    result = _transcription_result(
        text="VPN disconnects every few minutes during calls."
    )
    with patch(
        "backend.routes.voice.transcribe_audio_async",
        new=AsyncMock(return_value=result),
    ) as mock:
        response = client.post(
            "/api/voice/create-ticket",
            files={"audio": ("vpn.webm", b"voice bytes", "audio/webm")},
            data={"language": "en", "user_id": "user-1", "company": "Acme"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["transcription"] == result
    assert data["transcribed_text"] == result["transcribed_text"]
    # FIX 10: Assert suggested_title is a non-empty string, not the exact
    #          sentence — _extract_title is an implementation detail that may
    #          truncate or reformat the text.
    assert isinstance(data["suggested_title"], str)
    assert len(data["suggested_title"]) > 0
    mock.assert_awaited_once_with(
        file_bytes=b"voice bytes",
        filename="vpn.webm",
        language="en",
    )


# ─── /create-ticket error + edge paths ───────────────────────────────────────
# FIX 7: Empty transcription must return no_speech_detected status.

def test_create_ticket_returns_no_speech_detected_when_text_empty(client):
    result = _transcription_result(text="")
    with patch(
        "backend.routes.voice.transcribe_audio_async",
        new=AsyncMock(return_value=result),
    ):
        response = client.post(
            "/api/voice/create-ticket",
            files={"audio": ("silent.wav", b"bytes", "audio/wav")},
        )
    assert response.status_code == 200
    assert response.json()["status"] == "no_speech_detected"


def test_create_ticket_rejects_empty_audio(client):
    with patch("backend.routes.voice.transcribe_audio_async", new=AsyncMock()):
        response = client.post(
            "/api/voice/create-ticket",
            files={"audio": ("e.wav", b"", "audio/wav")},
        )
    assert response.status_code == 400


def test_create_ticket_rejects_oversized_file(client):
    oversized = b"x" * (MAX_UPLOAD_SIZE + 1)
    with patch("backend.routes.voice.transcribe_audio_async", new=AsyncMock()):
        response = client.post(
            "/api/voice/create-ticket",
            files={"audio": ("big.webm", oversized, "audio/webm")},
        )
    assert response.status_code == 413


def test_create_ticket_rejects_missing_audio_field(client):
    response = client.post("/api/voice/create-ticket", data={"language": "en"})
    assert response.status_code == 422


def test_create_ticket_returns_400_on_value_error(client):
    with patch(
        "backend.routes.voice.transcribe_audio_async",
        new=AsyncMock(side_effect=ValueError("bad audio")),
    ):
        response = client.post(
            "/api/voice/create-ticket",
            files={"audio": ("a.webm", b"bytes", "audio/webm")},
        )
    assert response.status_code == 400


def test_create_ticket_returns_500_on_runtime_error(client):
    with patch(
        "backend.routes.voice.transcribe_audio_async",
        new=AsyncMock(side_effect=RuntimeError("gpu oom")),
    ):
        response = client.post(
            "/api/voice/create-ticket",
            files={"audio": ("a.webm", b"bytes", "audio/webm")},
        )
    assert response.status_code == 500
    assert "gpu oom" not in response.text


# ─── /health ──────────────────────────────────────────────────────────────────
# FIX 8: /health was completely untested.

def test_health_returns_200_when_model_loaded(client):
    with patch(
        "backend.routes.voice.get_voice_service_health",
        return_value={"model_loaded": True},
    ):
        response = client.get("/api/voice/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True


def test_health_returns_unavailable_when_model_not_loaded(client):
    with patch(
        "backend.routes.voice.get_voice_service_health",
        return_value={"model_loaded": False},
    ):
        response = client.get("/api/voice/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unavailable"
    assert data["model_loaded"] is False


def test_health_returns_unavailable_on_import_error(client):
    with patch(
        "backend.routes.voice.get_voice_service_health",
        side_effect=ImportError("whisper not installed"),
    ):
        response = client.get("/api/voice/health")
    assert response.status_code == 200
    assert response.json()["status"] == "unavailable"