"""
Unit tests for backend.language_pipeline.

All tests are self-contained: langdetect and transformers are mocked via
sys.modules injection so the suite runs without optional ML packages installed.
"""
from __future__ import annotations

import sys
import types
import unittest
from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_langdetect_stub(return_value: str):
    """Return a fake langdetect module whose detect() always returns return_value."""
    mod = types.ModuleType("langdetect")
    mod.detect = lambda text: return_value
    mod.LangDetectException = Exception
    return mod


def _make_langdetect_raises():
    """Return a fake langdetect module whose detect() raises LangDetectException."""
    mod = types.ModuleType("langdetect")
    exc_cls = type("LangDetectException", (Exception,), {})
    mod.LangDetectException = exc_cls

    def _detect(text):
        raise exc_cls("no features in text")

    mod.detect = _detect
    return mod


# ---------------------------------------------------------------------------
# detect_language
# ---------------------------------------------------------------------------

class TestDetectLanguage(unittest.TestCase):

    def _call(self, text, langdetect_stub=None):
        # Inject stub before calling; remove cached module so the in-function
        # `from langdetect import detect` picks up our stub.
        if langdetect_stub is not None:
            sys.modules["langdetect"] = langdetect_stub
        else:
            sys.modules.pop("langdetect", None)
        from backend.language_pipeline import detect_language
        return detect_language(text)

    def tearDown(self):
        sys.modules.pop("langdetect", None)

    def test_empty_string_returns_english(self):
        self.assertEqual(self._call(""), "en")

    def test_whitespace_returns_english(self):
        self.assertEqual(self._call("   "), "en")

    def test_very_short_text_returns_english(self):
        self.assertEqual(self._call("hi"), "en")

    def test_hindi_detected(self):
        result = self._call(
            "मेरा इंटरनेट काम नहीं कर रहा है",
            _make_langdetect_stub("hi"),
        )
        self.assertEqual(result, "hi")

    def test_spanish_detected(self):
        result = self._call(
            "Mi computadora no enciende y necesito ayuda urgente",
            _make_langdetect_stub("es"),
        )
        self.assertEqual(result, "es")

    def test_french_detected(self):
        result = self._call(
            "Mon ordinateur ne démarre pas après la mise à jour",
            _make_langdetect_stub("fr"),
        )
        self.assertEqual(result, "fr")

    def test_german_detected(self):
        result = self._call(
            "Mein Computer startet nicht mehr nach dem Update",
            _make_langdetect_stub("de"),
        )
        self.assertEqual(result, "de")

    def test_arabic_detected(self):
        result = self._call(
            "جهاز الكمبيوتر الخاص بي لا يعمل بعد التحديث",
            _make_langdetect_stub("ar"),
        )
        self.assertEqual(result, "ar")

    def test_portuguese_detected(self):
        result = self._call(
            "Meu computador não liga após a atualização do sistema",
            _make_langdetect_stub("pt"),
        )
        self.assertEqual(result, "pt")

    def test_japanese_detected(self):
        result = self._call(
            "コンピューターが起動しない問題があります",
            _make_langdetect_stub("ja"),
        )
        self.assertEqual(result, "ja")

    def test_code_normalised_to_two_chars(self):
        # langdetect may return 'zh-cn' – we must strip to 'zh'
        result = self._call("我的电脑无法启动，请帮帮我", _make_langdetect_stub("zh-cn"))
        self.assertEqual(result, "zh")

    def test_langdetect_exception_falls_back_to_english_for_ascii(self):
        # ASCII-dominant text + broken langdetect → 'en'
        result = self._call(
            "My laptop is not working properly",
            _make_langdetect_raises(),
        )
        self.assertEqual(result, "en")

    def test_langdetect_missing_falls_back(self):
        # No langdetect in sys.modules at all
        sys.modules.pop("langdetect", None)
        from backend.language_pipeline import detect_language
        result = detect_language("My laptop screen is flickering")
        # ASCII text → heuristic returns 'en'
        self.assertEqual(result, "en")


# ---------------------------------------------------------------------------
# translate_to_english
# ---------------------------------------------------------------------------

class TestTranslateToEnglish(unittest.TestCase):

    def setUp(self):
        import backend.language_pipeline as lp
        lp._MODEL_CACHE.clear()

    def test_english_input_unchanged(self):
        from backend.language_pipeline import translate_to_english
        text = "My printer is not working"
        self.assertEqual(translate_to_english(text, "en"), text)

    def test_empty_text_returns_empty(self):
        from backend.language_pipeline import translate_to_english
        self.assertEqual(translate_to_english("", "hi"), "")

    def test_hindi_uses_correct_model(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="translated") as m:
            translate_to_english("मेरा इंटरनेट काम नहीं कर रहा", "hi")
            m.assert_called_once_with(
                "मेरा इंटरनेट काम नहीं कर रहा",
                "Helsinki-NLP/opus-mt-hi-en",
            )

    def test_spanish_uses_correct_model(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="translated") as m:
            translate_to_english("Mi computadora no enciende", "es")
            m.assert_called_once_with(
                "Mi computadora no enciende",
                "Helsinki-NLP/opus-mt-es-en",
            )

    def test_french_uses_correct_model(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="translated") as m:
            translate_to_english("Mon ordinateur ne démarre pas", "fr")
            m.assert_called_once_with(
                "Mon ordinateur ne démarre pas",
                "Helsinki-NLP/opus-mt-fr-en",
            )

    def test_german_uses_correct_model(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="translated") as m:
            translate_to_english("Mein Computer startet nicht", "de")
            m.assert_called_once_with(
                "Mein Computer startet nicht",
                "Helsinki-NLP/opus-mt-de-en",
            )

    def test_arabic_uses_correct_model(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="translated") as m:
            translate_to_english("الكمبيوتر لا يعمل", "ar")
            m.assert_called_once_with(
                "الكمبيوتر لا يعمل",
                "Helsinki-NLP/opus-mt-ar-en",
            )

    def test_portuguese_uses_correct_model(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="translated") as m:
            translate_to_english("Meu computador não liga", "pt")
            m.assert_called_once_with(
                "Meu computador não liga",
                "Helsinki-NLP/opus-mt-pt-en",
            )

    def test_failure_returns_original_text(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", side_effect=OSError("model not found")):
            result = translate_to_english("बोलो", "hi")
            self.assertEqual(result, "बोलो")

    def test_returns_translation_result(self):
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="My computer does not start"):
            result = translate_to_english("Mi computadora no enciende", "es")
            self.assertEqual(result, "My computer does not start")

    def test_lang_code_normalised(self):
        """zh-cn should produce Helsinki-NLP/opus-mt-zh-en (not zh-cn-en)."""
        from backend.language_pipeline import translate_to_english
        with patch("backend.language_pipeline._run_translation", return_value="translated") as m:
            translate_to_english("你好世界", "zh-cn")
            m.assert_called_once_with("你好世界", "Helsinki-NLP/opus-mt-zh-en")


# ---------------------------------------------------------------------------
# translate_from_english
# ---------------------------------------------------------------------------

class TestTranslateFromEnglish(unittest.TestCase):

    def setUp(self):
        import backend.language_pipeline as lp
        lp._MODEL_CACHE.clear()

    def test_english_target_unchanged(self):
        from backend.language_pipeline import translate_from_english
        text = "Your ticket has been resolved."
        self.assertEqual(translate_from_english(text, "en"), text)

    def test_empty_text_returns_empty(self):
        from backend.language_pipeline import translate_from_english
        self.assertEqual(translate_from_english("", "hi"), "")

    def test_hindi_uses_correct_model(self):
        from backend.language_pipeline import translate_from_english
        with patch("backend.language_pipeline._run_translation", return_value="आपका टिकट हल हो गया") as m:
            translate_from_english("Your ticket has been resolved", "hi")
            m.assert_called_once_with(
                "Your ticket has been resolved",
                "Helsinki-NLP/opus-mt-en-hi",
            )

    def test_spanish_uses_correct_model(self):
        from backend.language_pipeline import translate_from_english
        with patch("backend.language_pipeline._run_translation", return_value="Su ticket ha sido resuelto") as m:
            translate_from_english("Your ticket has been resolved", "es")
            m.assert_called_once_with(
                "Your ticket has been resolved",
                "Helsinki-NLP/opus-mt-en-es",
            )

    def test_failure_returns_original_text(self):
        from backend.language_pipeline import translate_from_english
        with patch("backend.language_pipeline._run_translation", side_effect=Exception("no model")):
            result = translate_from_english("Ticket resolved", "fr")
            self.assertEqual(result, "Ticket resolved")


if __name__ == "__main__":
    unittest.main()
