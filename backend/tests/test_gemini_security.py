import os
import pytest
from fastapi import HTTPException

# Set dummy key so service attempts initialization
os.environ["GEMINI_API_KEY"] = "dummy_key_12345"

from backend.services.gemini_service import GeminiService, SUPPORTED_MODELS, DEFAULT_MODEL

def test_model_name_default(monkeypatch):
    monkeypatch.delenv("GEMINI_MODEL_NAME", raising=False)
    service = GeminiService()
    assert service.model_name == DEFAULT_MODEL

def test_model_name_configured(monkeypatch):
    monkeypatch.setenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
    service = GeminiService()
    assert service.model_name == "gemini-2.0-flash"

def test_model_name_fallback_unsupported(monkeypatch):
    monkeypatch.setenv("GEMINI_MODEL_NAME", "gemini-unsupported-9.9")
    service = GeminiService()
    assert service.model_name == DEFAULT_MODEL

def test_validate_and_decode_empty():
    service = GeminiService()
    bytes_out, err = service._validate_and_decode("")
    assert bytes_out is None
    assert "Empty image" in err

def test_validate_and_decode_too_large():
    service = GeminiService()
    # 5MB + 1 char of base64
    large_payload = "a" * (5 * 1024 * 1024 + 1)
    bytes_out, err = service._validate_and_decode(large_payload)
    assert bytes_out is None
    assert "Image Too Large" in err

def test_validate_and_decode_invalid_type():
    service = GeminiService()
    payload = "data:image/xyz;base64,YWJjZA=="
    bytes_out, err = service._validate_and_decode(payload)
    assert bytes_out is None
    assert "Unsupported content type" in err

def test_validate_and_decode_malformed():
    service = GeminiService()
    payload = "data:image/png;base64,invalid!!!$$$"
    bytes_out, err = service._validate_and_decode(payload)
    assert bytes_out is None
    assert "Malformed base64" in err

def test_validate_and_decode_decoded_too_large():
    service = GeminiService()
    # 5000004 chars decodes to 3,750,003 bytes (which exceeds the 3,750,000 cap and is divisible by 4)
    large_base64 = "A" * 5000004
    bytes_out, err = service._validate_and_decode(large_base64)
    assert bytes_out is None
    assert "Image Too Large" in err


def test_api_key_redaction():
    service = GeminiService()
    service.api_key = "secret_key_12345"
    exc = Exception("API key secret_key_12345 has expired.")
    safe_msg = service._safe_error_msg(exc)
    assert "secret_key_12345" not in safe_msg
    assert "[REDACTED]" in safe_msg

def test_handle_genai_error_quota():
    service = GeminiService()
    service.api_key = "dummy_key"
    exc = Exception("ResourceExhausted: 429 Quota exceeded.")
    with pytest.raises(HTTPException) as exc_info:
        service._handle_genai_error(exc, "TestContext")
    assert exc_info.value.status_code == 429
    assert "quota exceeded" in exc_info.value.detail

def test_handle_genai_error_invalid_model():
    service = GeminiService()
    service.api_key = "dummy_key"
    exc = Exception("InvalidArgument: model gemini-unsupported was not found.")
    with pytest.raises(HTTPException) as exc_info:
        service._handle_genai_error(exc, "TestContext")
    assert exc_info.value.status_code == 500
    assert "not available" in exc_info.value.detail

def test_handle_genai_error_auth():
    service = GeminiService()
    service.api_key = "dummy_key"
    exc = Exception("PermissionDenied: API key not valid.")
    with pytest.raises(HTTPException) as exc_info:
        service._handle_genai_error(exc, "TestContext")
    assert exc_info.value.status_code == 401
    assert "Invalid Gemini API key" in exc_info.value.detail

def test_handle_genai_error_unavailable():
    service = GeminiService()
    service.api_key = "dummy_key"
    exc = Exception("ServiceUnavailable: 503 Backend error.")
    with pytest.raises(HTTPException) as exc_info:
        service._handle_genai_error(exc, "TestContext")
    assert exc_info.value.status_code == 503
    assert "unavailable" in exc_info.value.detail

def test_handle_genai_error_other():
    service = GeminiService()
    service.api_key = "dummy_key"
    exc = Exception("Some unknown system failure.")
    with pytest.raises(HTTPException) as exc_info:
        service._handle_genai_error(exc, "TestContext")
    assert exc_info.value.status_code == 500
    assert "unknown system failure" in exc_info.value.detail
