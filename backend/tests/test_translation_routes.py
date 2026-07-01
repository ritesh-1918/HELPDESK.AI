"""
Unit tests for backend/routes/translation.py
Covers all 4 endpoints: /translate, /translate-ticket, /detect, /languages.
"""
import unittest
from unittest.mock import patch, MagicMock, AsyncMock
import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI


# ── Helpers ────────────────────────────────────────────────────

def create_test_app():
    """Create a FastAPI test app with the translation router mounted."""
    app = FastAPI()
    from backend.services.rate_limit_config import limiter
    from slowapi.errors import RateLimitExceeded
    from slowapi import _rate_limit_exceeded_handler
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    from backend.routes.translation import router
    app.include_router(router)
    return app



# ── POST /api/translation/translate ────────────────────────────

class TestTranslateEndpoint(unittest.TestCase):
    """Tests for POST /api/translation/translate."""

    def setUp(self):
        self.app = create_test_app()
        self.client = TestClient(self.app)

    @patch("backend.routes.translation.translate_text")
    def test_translate_success_text_target(self, mock_translate):
        """Translate text with target_lang should return translated result."""
        mock_translate.return_value = {"translated": "Hola mundo", "source_lang": "en"}
        resp = self.client.post("/api/translation/translate", json={
            "text": "Hello world", "target_lang": "es"
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["translated"], "Hola mundo")

    @patch("backend.routes.translation.translate_text")
    def test_translate_with_source_lang(self, mock_translate):
        """Translate with explicit source_lang should pass it through."""
        mock_translate.return_value = {"translated": "Hello", "source_lang": "fr"}
        resp = self.client.post("/api/translation/translate", json={
            "text": "Bonjour", "target_lang": "en", "source_lang": "fr"
        })
        self.assertEqual(resp.status_code, 200)
        mock_translate.assert_called_once_with(
            text="Bonjour", target_lang="en", source_lang="fr",
        )

    @patch("backend.routes.translation.translate_text")
    def test_translate_default_target_lang(self, mock_translate):
        """Default target_lang should be 'en'."""
        mock_translate.return_value = {"translated": "Hello", "source_lang": "es"}
        resp = self.client.post("/api/translation/translate", json={
            "text": "Hola"
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(mock_translate.call_args[1]["target_lang"], "en")

    def test_translate_empty_text_returns_422(self):
        """Empty text should return 422 validation error."""
        resp = self.client.post("/api/translation/translate", json={
            "text": "", "target_lang": "en"
        })
        self.assertEqual(resp.status_code, 422)

    def test_translate_missing_text_returns_422(self):
        """Missing text field should return 422."""
        resp = self.client.post("/api/translation/translate", json={
            "target_lang": "en"
        })
        self.assertEqual(resp.status_code, 422)

    @patch("backend.routes.translation.translate_text")
    def test_translate_service_exception_returns_500(self, mock_translate):
        """Service exception should return 500 with detail."""
        mock_translate.side_effect = RuntimeError("API quota exceeded")
        resp = self.client.post("/api/translation/translate", json={
            "text": "Hello", "target_lang": "es"
        })
        self.assertEqual(resp.status_code, 500)
        self.assertIn("temporarily unavailable", resp.json()["detail"])

    @patch("backend.routes.translation.translate_text")
    def test_translate_unicode_text(self, mock_translate):
        """Unicode text should be handled correctly."""
        mock_translate.return_value = {"translated": "Hello", "source_lang": "zh"}
        resp = self.client.post("/api/translation/translate", json={
            "text": "你好世界", "target_lang": "en"
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.translation.translate_text")
    def test_translate_long_text(self, mock_translate):
        """Long text (near max_length) should be accepted."""
        mock_translate.return_value = {"translated": "ok"}
        long_text = "A" * 5000
        resp = self.client.post("/api/translation/translate", json={
            "text": long_text, "target_lang": "fr"
        })
        self.assertEqual(resp.status_code, 200)

    def test_translate_text_too_long_returns_422(self):
        """Text exceeding max_length should return 422."""
        too_long = "A" * 5001
        resp = self.client.post("/api/translation/translate", json={
            "text": too_long, "target_lang": "fr"
        })
        self.assertEqual(resp.status_code, 422)

    def test_translate_target_lang_too_long_returns_422(self):
        """Target language code exceeding max_length should return 422."""
        resp = self.client.post("/api/translation/translate", json={
            "text": "Hello", "target_lang": "abcdef"
        })
        self.assertEqual(resp.status_code, 422)


# ── POST /api/translation/translate-ticket ─────────────────────

class TestTranslateTicketEndpoint(unittest.TestCase):
    """Tests for POST /api/translation/translate-ticket."""

    def setUp(self):
        self.app = create_test_app()
        self.client = TestClient(self.app)

    @patch("backend.routes.translation.translate_ticket")
    def test_translate_ticket_subject_description(self, mock_translate):
        """Translate ticket with subject and description."""
        mock_translate.return_value = {"subject": "Issue", "description": "Details"}
        resp = self.client.post("/api/translation/translate-ticket", json={
            "subject": "Problema", "description": "Descrizione", "target_lang": "en"
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])

    @patch("backend.routes.translation.translate_ticket")
    def test_translate_ticket_with_messages(self, mock_translate):
        """Translate ticket with messages array."""
        mock_translate.return_value = {"messages": [{"body": "Hi"}]}
        resp = self.client.post("/api/translation/translate-ticket", json={
            "messages": [{"body": "Ciao"}], "target_lang": "en"
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.translation.translate_ticket")
    def test_translate_ticket_all_fields(self, mock_translate):
        """Translate ticket with all fields present."""
        mock_translate.return_value = {}
        resp = self.client.post("/api/translation/translate-ticket", json={
            "subject": "Bug", "description": "Desc",
            "messages": [{"body": "Msg"}], "target_lang": "fr"
        })
        self.assertEqual(resp.status_code, 200)
        mock_translate.assert_called_once_with(
            {"subject": "Bug", "description": "Desc", "messages": [{"id": None, "body": "Msg", "author": None}]},
            target_lang="fr",
        )

    def test_translate_ticket_empty_body(self):
        """Empty body (no fields) should return 422."""
        resp = self.client.post("/api/translation/translate-ticket", json={
            "target_lang": "en"
        })
        self.assertEqual(resp.status_code, 422)

    @patch("backend.routes.translation.translate_ticket")
    def test_translate_ticket_service_exception(self, mock_translate):
        """Service exception should return 500."""
        mock_translate.side_effect = Exception("Service error")
        resp = self.client.post("/api/translation/translate-ticket", json={
            "subject": "Test", "target_lang": "en"
        })
        self.assertEqual(resp.status_code, 500)
        self.assertIn("temporarily unavailable", resp.json()["detail"])

    def test_translate_ticket_missing_target_lang_uses_default(self):
        """Missing target_lang should default to 'en'."""
        resp = self.client.post("/api/translation/translate-ticket", json={
            "subject": "Test"
        })
        # Should not 422 — target_lang has default "en"
        self.assertIn(resp.status_code, [200, 500])


# ── POST /api/translation/detect ───────────────────────────────

class TestDetectEndpoint(unittest.TestCase):
    """Tests for POST /api/translation/detect."""

    def setUp(self):
        self.app = create_test_app()
        self.client = TestClient(self.app)

    @patch("backend.routes.translation.detect_language")
    @patch("backend.routes.translation.get_supported_languages")
    def test_detect_success(self, mock_langs, mock_detect):
        """Detect language should return language info."""
        mock_detect.return_value = "es"
        mock_langs.return_value = {"es": "Spanish", "en": "English"}
        resp = self.client.post("/api/translation/detect", json={
            "text": "Hola mundo"
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["language"], "es")
        self.assertEqual(data["data"]["language_name"], "Spanish")
        self.assertTrue(data["data"]["supported"])

    @patch("backend.routes.translation.detect_language")
    @patch("backend.routes.translation.get_supported_languages")
    def test_detect_unsupported_language(self, mock_langs, mock_detect):
        """Detect an unsupported language should mark supported=False."""
        mock_detect.return_value = "xx"
        mock_langs.return_value = {"en": "English"}
        resp = self.client.post("/api/translation/detect", json={
            "text": "some text"
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["data"]["supported"])

    def test_detect_empty_text_returns_422(self):
        """Empty text should return 422."""
        resp = self.client.post("/api/translation/detect", json={
            "text": ""
        })
        self.assertEqual(resp.status_code, 422)

    @patch("backend.routes.translation.detect_language")
    def test_detect_no_language_detected(self, mock_detect):
        """When detect_language returns None/empty, should return 400."""
        mock_detect.return_value = None
        resp = self.client.post("/api/translation/detect", json={
            "text": "???"
        })
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Could not detect language", resp.json()["detail"])


# ── GET /api/translation/languages ─────────────────────────────

class TestLanguagesEndpoint(unittest.TestCase):
    """Tests for GET /api/translation/languages."""

    def setUp(self):
        self.app = create_test_app()
        self.client = TestClient(self.app)

    @patch("backend.routes.translation.get_supported_languages")
    def test_languages_returns_dict(self, mock_langs):
        """Should return a dictionary of supported languages."""
        from backend.routes.translation import _cached_supported_languages
        _cached_supported_languages.cache_clear()
        mock_langs.return_value = {"en": "English", "es": "Spanish", "fr": "French"}
        resp = self.client.get("/api/translation/languages")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertIn("en", data["data"])
        self.assertIn("es", data["data"])

    @patch("backend.routes.translation.get_supported_languages")
    def test_languages_empty_list(self, mock_langs):
        """Should handle empty languages dict."""
        from backend.routes.translation import _cached_supported_languages
        _cached_supported_languages.cache_clear()
        mock_langs.return_value = {}
        resp = self.client.get("/api/translation/languages")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"], {})


if __name__ == "__main__":
    unittest.main()
