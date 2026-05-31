import pytest
from unittest.mock import patch, MagicMock


class TestTranslationService:
    def setup_method(self):
        self.import_translation_service()

    def import_translation_service(self):
        import importlib
        self.ts = importlib.import_module("services.translation_service")

    def test_supported_languages_contains_english(self):
        langs = self.ts.get_supported_languages()
        assert "en" in langs
        assert langs["en"] == "English"

    def test_supported_languages_contains_major_languages(self):
        langs = self.ts.get_supported_languages()
        major = {"en", "es", "fr", "de", "zh", "ja", "ar", "ru"}
        assert major.issubset(langs.keys())

    def test_detect_language_returns_english_for_english_text(self):
        with patch("services.translation_service.detect") as mock_detect:
            mock_detect.return_value = "en"
            result = self.ts.detect_language("Hello, how are you?")
            assert result == "en"

    def test_detect_language_returns_none_for_empty_text(self):
        result = self.ts.detect_language("")
        assert result is None

    def test_detect_language_returns_none_for_short_text(self):
        result = self.ts.detect_language("ab")
        assert result is None

    def test_detect_language_returns_none_on_exception(self):
        with patch("services.translation_service.detect") as mock_detect:
            mock_detect.side_effect = Exception("Detection failed")
            result = self.ts.detect_language("Some text here")
            assert result is None

    def test_translate_text_same_language_returns_original(self):
        result = self.ts.translate_text("Hello", target_lang="en", source_lang="en")
        assert result["translated"] == "Hello"
        assert result["cached"] is False

    def test_translate_text_empty_string(self):
        result = self.ts.translate_text("", target_lang="en")
        assert result["translated"] == ""

    def test_translate_text_unknown_language_returns_original(self):
        with patch("services.translation_service.detect_language") as mock_detect:
            mock_detect.return_value = None
            result = self.ts.translate_text("Some text", target_lang="en")
            assert result["translated"] == "Some text"
            assert result["source_lang"] == "unknown"

    @patch("services.translation_service._load_translation_model")
    def test_translate_text_uses_cache(self, mock_load):
        mock_load.return_value = (MagicMock(), MagicMock())
        key = "es:en:" + str(hash("Hola"))
        self.ts._translation_cache[key] = "Hello"

        result = self.ts.translate_text("Hola", source_lang="es", target_lang="en")
        assert result["cached"] is True
        assert result["translated"] == "Hello"

    def test_translate_text_truncates_long_text(self):
        long_text = "a" * 6000
        result = self.ts.translate_text(long_text, source_lang="en", target_lang="en")
        assert len(result["translated"]) < 6000

    def test_translate_ticket_with_subject_and_description(self):
        ticket = {"subject": "Hola mundo", "description": "Esto es una prueba"}
        with patch("services.translation_service.translate_text") as mock_translate:
            mock_translate.return_value = {
                "translated": "Hello world",
                "source_lang": "es",
                "target_lang": "en",
                "cached": False,
            }
            result = self.ts.translate_ticket(ticket, target_lang="en")
            assert "translations" in result
            assert "subject" in result["translations"]
            assert "description" in result["translations"]

    def test_translate_ticket_with_messages(self):
        ticket = {
            "subject": "Hello",
            "messages": [{"content": "Bonjour"}, {"content": "Hola"}],
        }
        with patch("services.translation_service.translate_text") as mock_translate:
            mock_translate.return_value = {
                "translated": "translated",
                "source_lang": "fr",
                "target_lang": "en",
                "cached": False,
            }
            result = self.ts.translate_ticket(ticket, target_lang="en")
            assert len(result["translations"]["messages"]) == 2

    def test_get_supported_languages_returns_copy(self):
        langs = self.ts.get_supported_languages()
        langs["en"] = "Modified"
        langs2 = self.ts.get_supported_languages()
        assert langs2["en"] == "English"

    def test_clear_cache_empties_caches(self):
        self.ts._translation_cache["key"] = "value"
        self.ts._model_cache["key"] = "value"
        self.ts.clear_cache()
        assert len(self.ts._translation_cache) == 0
        assert len(self.ts._model_cache) == 0

    @patch("services.translation_service.detect_language")
    def test_translate_ticket_detects_language(self, mock_detect):
        mock_detect.return_value = "es"
        ticket = {"subject": "Hola", "description": "Mundo"}
        with patch("services.translation_service.translate_text") as mock_translate:
            mock_translate.return_value = {
                "translated": "Hello",
                "source_lang": "es",
                "target_lang": "en",
                "cached": False,
            }
            result = self.ts.translate_ticket(ticket)
            assert result["original_language"] == "es"

    def test_get_model_name_format(self):
        name = self.ts._get_model_name("en", "fr")
        assert name == "Helsinki-NLP/opus-mt-en-fr"
