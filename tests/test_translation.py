"""
Tests for translation routes and service — Fixes #1236.
Covers: BCP-47 validation, duplicate model removal, all-None body rejection,
       MessageSchema, safe error messages, response models, caching.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient

from backend.routes.translation import (
    router,
    TranslateTextRequest,
    TranslateTicketRequest,
    DetectLanguageRequest,
    MessageSchema,
    _LANG_TAG_RE,
    _cached_supported_languages,
)
from backend.services.translation_service import (
    detect_locale,
    translate_text,
    translate_ticket,
    get_supported_languages,
    clear_cache,
)


# --- BCP-47 Validation ---

class TestBCP47Validation:
    """Test BCP-47 language tag regex."""

    @pytest.mark.parametrize("tag", ["en", "en-US", "zh-Hant", "pt-BR", "de", "fr", "es-419", "zh-Hans"])
    def test_valid_tags(self, tag):
        assert _LANG_TAG_RE.match(tag), f"'{tag}' should be valid BCP-47"

    @pytest.mark.parametrize("tag", ["xy99", "toolong", "e", "123", "en-", "-US", "en-US-"])
    def test_invalid_tags(self, tag):
        assert not _LANG_TAG_RE.match(tag), f"'{tag}' should be invalid BCP-47"

    def test_translate_text_request_rejects_invalid_lang(self):
        with pytest.raises(Exception):  # ValidationError
            TranslateTextRequest(text="hello", target_lang="xy99")

    def test_translate_text_request_accepts_valid_lang(self):
        req = TranslateTextRequest(text="hello", target_lang="en-US")
        assert req.target_lang == "en-US"

    def test_translate_ticket_request_rejects_invalid_lang(self):
        with pytest.raises(Exception):
            TranslateTicketRequest(subject="hello", target_lang="invalid!")


# --- Duplicate Model Removal ---

class TestNoDuplicateModels:
    """Ensure DetectLanguageRequest is defined exactly once."""

    def test_detect_request_has_text_field(self):
        req = DetectLanguageRequest(text="hello world")
        assert req.text == "hello world"

    def test_detect_request_requires_text(self):
        with pytest.raises(Exception):
            DetectLanguageRequest()


# --- All-None Body Rejection ---

class TestAllNoneBodyRejection:
    """TranslateTicketRequest should reject when all translatable fields are None."""

    def test_all_none_raises(self):
        with pytest.raises(Exception) as exc_info:
            TranslateTicketRequest(target_lang="en")
        assert "at least one" in str(exc_info.value).lower() or "subject" in str(exc_info.value).lower()

    def test_subject_only_passes(self):
        req = TranslateTicketRequest(subject="Hello", target_lang="en")
        assert req.subject == "Hello"

    def test_description_only_passes(self):
        req = TranslateTicketRequest(description="World", target_lang="en")
        assert req.description == "World"

    def test_messages_only_passes(self):
        req = TranslateTicketRequest(
            messages=[MessageSchema(body="test message")],
            target_lang="en",
        )
        assert len(req.messages) == 1

    def test_empty_messages_list_raises(self):
        with pytest.raises(Exception):
            TranslateTicketRequest(messages=[], target_lang="en")


# --- MessageSchema ---

class TestMessageSchema:
    """Messages must have required 'body' field."""

    def test_valid_message(self):
        msg = MessageSchema(body="Hello", id="1", author="user")
        assert msg.body == "Hello"

    def test_missing_body_raises(self):
        with pytest.raises(Exception):
            MessageSchema(id="1")

    def test_empty_body_raises(self):
        with pytest.raises(Exception):
            MessageSchema(body="")


# --- Response Models ---

class TestResponseModels:
    """Routes should return typed response models."""

    def test_translate_text_returns_typed_response(self):
        with patch("backend.routes.translation.translate_text") as mock:
            mock.return_value = {
                "translated": "hola",
                "source_lang": "en",
                "target_lang": "es",
                "cached": False,
            }
            from fastapi import FastAPI
            app = FastAPI()
            app.include_router(router)
            client = TestClient(app)
            resp = client.post("/api/translation/translate", json={"text": "hello", "target_lang": "es"})
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "translated" in data["data"]

    def test_detect_returns_typed_response(self):
        with patch("backend.routes.translation.detect_language", return_value="en"):
            from fastapi import FastAPI
            app = FastAPI()
            app.include_router(router)
            client = TestClient(app)
            resp = client.post("/api/translation/detect", json={"text": "hello world"})
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "language" in data["data"]
            assert "supported" in data["data"]


# --- Safe Error Messages ---

class TestSafeErrorMessages:
    """HTTPExceptions should not leak internal error details."""

    def test_translate_error_hides_details(self):
        with patch("backend.routes.translation.translate_text", side_effect=RuntimeError("internal secret")):
            from fastapi import FastAPI
            app = FastAPI()
            app.include_router(router)
            client = TestClient(app)
            resp = client.post("/api/translation/translate", json={"text": "hello", "target_lang": "es"})
            assert resp.status_code == 500
            assert "internal secret" not in resp.json()["detail"]
            assert "temporarily unavailable" in resp.json()["detail"]


# --- Caching ---

class TestSupportedLanguagesCaching:
    """get_supported_languages should be cached."""

    def test_cache_returns_same_dict(self):
        clear_cache()
        result1 = get_supported_languages()
        result2 = get_supported_languages()
        assert result1 is result2

    def test_cached_wrapper_works(self):
        _cached_supported_languages.cache_clear()
        result = _cached_supported_languages()
        assert "en" in result
        assert "es" in result


# --- Translation Service ---

class TestTranslationService:
    """Test the translation service functions."""

    def test_detect_locale_ascii(self):
        lang, conf = detect_locale("hello world")
        assert lang == "en"
        assert conf > 0.5

    def test_detect_locale_empty(self):
        lang, conf = detect_locale("")
        assert lang == "en"

    def test_translate_text_empty(self):
        result = translate_text("", target_lang="es")
        assert result["translated"] == ""

    def test_translate_text_same_lang(self):
        result = translate_text("hello", target_lang="en", source_lang="en")
        assert result["translated"] == "hello"
        assert result["source_lang"] == "en"

    def test_translate_ticket_empty(self):
        result = translate_ticket({}, target_lang="en")
        assert result["translations"] == {}

    def test_translate_ticket_subject_only(self):
        with patch("backend.services.translation_service.translate_text") as mock:
            mock.return_value = {"translated": "hola", "source_lang": "en", "target_lang": "es", "cached": False}
            result = translate_ticket({"subject": "hello"}, target_lang="es")
            assert "subject" in result["translations"]
            mock.assert_called_once_with("hello", target_lang="es")

    def test_translate_ticket_description_sets_original_language(self):
        with patch("backend.services.translation_service.translate_text") as mock:
            mock.return_value = {"translated": "hola", "source_lang": "es", "target_lang": "en", "cached": False}
            result = translate_ticket({"description": "hola"}, target_lang="en")
            assert result["original_language"] == "es"
            assert result["translations"]["description"]["translated"] == "hola"

    def test_translate_text_non_200_response_falls_back(self):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"responseStatus": 403, "responseDetails": "quota exceeded"}

        with patch("backend.services.translation_service._requests_lib.get", return_value=mock_response):
            result = translate_text("hello", target_lang="es", source_lang="en")

        assert result["translated"] == "hello"
        assert result["source_lang"] == "en"
        assert result["target_lang"] == "es"
