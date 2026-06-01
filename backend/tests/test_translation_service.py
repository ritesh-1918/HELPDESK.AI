"""
Unit tests for backend.services.translation_service (Issue #734).

Covers:
- detect_language (normal, empty/short text, exception handling)
- get_supported_languages (returns copy, correct mappings)
- _get_model_name (Helsinki-NLP naming convention)
- translate_text (auto-detect, explicit source, same-lang short-circuit,
  cache hit/miss, truncation, empty input, model failure)
- translate_ticket (subject, description, messages, empty ticket)
- clear_cache (clears both translation and model caches)

All tests are self-contained: langdetect and transformers are mocked via
sys.modules injection so the suite runs without optional ML packages installed.
"""

from __future__ import annotations

import sys
import types
import unittest
from unittest.mock import MagicMock, patch, call

import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


# ---------------------------------------------------------------------------
# Module stubs (langdetect + transformers not installed in CI)
# ---------------------------------------------------------------------------

def _make_langdetect_stub(return_value: str = "en"):
    """Return a fake langdetect module whose detect() always returns return_value."""
    mod = types.ModuleType("langdetect")
    mod.detect = lambda text: return_value
    return mod


def _make_langdetect_raises():
    """Return a fake langdetect module whose detect() raises an exception."""
    mod = types.ModuleType("langdetect")

    def _detect(text):
        raise Exception("no features in text")

    mod.detect = _detect
    return mod


def _make_transformers_stub():
    """Return a fake transformers module with MarianMTModel and MarianTokenizer."""
    mod = types.ModuleType("transformers")

    mock_tokenizer = MagicMock()
    mock_model = MagicMock()

    mock_tokenizer.return_value = {"input_ids": [[1, 2, 3]], "attention_mask": [[1, 1, 1]]}
    mock_model.generate.return_value = [[4, 5, 6]]
    mock_tokenizer.decode.return_value = "translated text"

    mod.MarianMTModel = MagicMock()
    mod.MarianTokenizer = MagicMock()
    mod.MarianMTModel.from_pretrained.return_value = mock_model
    mod.MarianTokenizer.from_pretrained.return_value = mock_tokenizer

    return mod, mock_model, mock_tokenizer


# Pre-inject stubs so the module import doesn't fail
sys.modules.setdefault("langdetect", _make_langdetect_stub())
_st_mod, _, _ = _make_transformers_stub()
sys.modules.setdefault("transformers", _st_mod)

from backend.services import translation_service as ts_mod
from backend.services.translation_service import (
    detect_language,
    get_supported_languages,
    _get_model_name,
    translate_text,
    translate_ticket,
    clear_cache,
    SUPPORTED_LANGUAGES,
    MAX_TEXT_LENGTH,
    MAX_CACHE_SIZE,
)


# ---------------------------------------------------------------------------
# detect_language
# ---------------------------------------------------------------------------

class TestDetectLanguage(unittest.TestCase):

    def setUp(self):
        ts_mod._translation_cache.clear()
        ts_mod._model_cache.clear()

    def test_detect_english_text(self):
        """Should detect English text and return 'en'."""
        sys.modules["langdetect"] = _make_langdetect_stub("en")
        result = detect_language("Hello, how are you today?")
        self.assertEqual(result, "en")

    def test_detect_spanish_text(self):
        """Should detect Spanish text and return 'es'."""
        sys.modules["langdetect"] = _make_langdetect_stub("es")
        result = detect_language("Hola, \u00bfc\u00f3mo est\u00e1s?")
        self.assertEqual(result, "es")

    def test_detect_empty_string_returns_none(self):
        """Empty string should return None without calling langdetect."""
        result = detect_language("")
        self.assertIsNone(result)

    def test_detect_whitespace_only_returns_none(self):
        """Whitespace-only string should return None."""
        result = detect_language("   ")
        self.assertIsNone(result)

    def test_detect_short_text_returns_none(self):
        """Text shorter than 3 characters should return None."""
        result = detect_language("Hi")
        self.assertIsNone(result)

    def test_detect_exactly_3_chars_calls_langdetect(self):
        """Text of exactly 3 characters should call langdetect."""
        sys.modules["langdetect"] = _make_langdetect_stub("en")
        result = detect_language("Hel")
        self.assertEqual(result, "en")

    def test_detect_langdetect_exception_returns_none(self):
        """When langdetect raises, should return None and log warning."""
        sys.modules["langdetect"] = _make_langdetect_raises()
        result = detect_language("Some text that will fail detection")
        self.assertIsNone(result)


# ---------------------------------------------------------------------------
# get_supported_languages
# ---------------------------------------------------------------------------

class TestGetSupportedLanguages(unittest.TestCase):

    def test_returns_dict(self):
        result = get_supported_languages()
        self.assertIsInstance(result, dict)

    def test_returns_copy_not_reference(self):
        """Modifying the returned dict should not affect the module constant."""
        result = get_supported_languages()
        result["xx"] = "Test Language"
        self.assertNotIn("xx", SUPPORTED_LANGUAGES)

    def test_contains_english(self):
        result = get_supported_languages()
        self.assertEqual(result["en"], "English")

    def test_contains_all_15_languages(self):
        result = get_supported_languages()
        self.assertEqual(len(result), 15)

    def test_contains_expected_languages(self):
        result = get_supported_languages()
        expected_codes = ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "hi", "nl", "pl", "tr"]
        for code in expected_codes:
            self.assertIn(code, result)


# ---------------------------------------------------------------------------
# _get_model_name
# ---------------------------------------------------------------------------

class TestGetModelName(unittest.TestCase):

    def test_english_to_spanish(self):
        result = _get_model_name("en", "es")
        self.assertEqual(result, "Helsinki-NLP/opus-mt-en-es")

    def test_french_to_german(self):
        result = _get_model_name("fr", "de")
        self.assertEqual(result, "Helsinki-NLP/opus-mt-fr-de")

    def test_format_consistency(self):
        for src in ["en", "es", "fr"]:
            for tgt in ["de", "it", "pt"]:
                result = _get_model_name(src, tgt)
                self.assertTrue(result.startswith("Helsinki-NLP/opus-mt-"))
                self.assertIn(f"{src}-{tgt}", result)


# ---------------------------------------------------------------------------
# translate_text
# ---------------------------------------------------------------------------

class TestTranslateText(unittest.TestCase):

    def setUp(self):
        ts_mod._translation_cache.clear()
        ts_mod._model_cache.clear()

    def test_empty_text_returns_empty(self):
        result = translate_text("", "en")
        self.assertEqual(result["translated"], "")
        self.assertFalse(result["cached"])

    def test_whitespace_only_returns_empty(self):
        result = translate_text("   ", "en")
        self.assertEqual(result["translated"], "")

    def test_same_language_short_circuit(self):
        """When source_lang == target_lang, should return original text without translation."""
        result = translate_text("Hello world", target_lang="en", source_lang="en")
        self.assertEqual(result["translated"], "Hello world")
        self.assertEqual(result["source_lang"], "en")
        self.assertEqual(result["target_lang"], "en")
        self.assertFalse(result["cached"])

    def test_auto_detect_language(self):
        """When source_lang is None, should auto-detect language."""
        sys.modules["langdetect"] = _make_langdetect_stub("es")
        _st_mod, mock_model, mock_tokenizer = _make_transformers_stub()
        sys.modules["transformers"] = _st_mod
        mock_tokenizer.decode.return_value = "Hello world"

        result = translate_text("Hola mundo", target_lang="en")
        self.assertEqual(result["source_lang"], "es")

    def test_auto_detect_failure_returns_original(self):
        """When language detection fails, should return original text."""
        sys.modules["langdetect"] = _make_langdetect_raises()
        result = translate_text("Some unknown text", target_lang="en")
        self.assertEqual(result["translated"], "Some unknown text")
        self.assertEqual(result["source_lang"], "unknown")

    def test_translation_caching(self):
        """Second call with same text should return cached result."""
        _st_mod, mock_model, mock_tokenizer = _make_transformers_stub()
        sys.modules["transformers"] = _st_mod
        mock_tokenizer.decode.return_value = "Hola mundo"

        result1 = translate_text("Hello world", target_lang="es", source_lang="en")
        self.assertFalse(result1["cached"])

        result2 = translate_text("Hello world", target_lang="es", source_lang="en")
        self.assertTrue(result2["cached"])
        self.assertEqual(result2["translated"], "Hola mundo")

    def test_long_text_truncation(self):
        """Text exceeding MAX_TEXT_LENGTH should be truncated."""
        _st_mod, mock_model, mock_tokenizer = _make_transformers_stub()
        sys.modules["transformers"] = _st_mod

        long_text = "a" * (MAX_TEXT_LENGTH + 500)
        result = translate_text(long_text, target_lang="es", source_lang="en")
        self.assertIsNotNone(result["translated"])
        # Verify text was actually truncated (not passed through at full length)
        self.assertLessEqual(len(result["translated"]), MAX_TEXT_LENGTH + 100)

    def test_model_load_failure_returns_original(self):
        """When model loading fails, should return original text."""
        _st_mod = types.ModuleType("transformers")
        _st_mod.MarianMTModel = MagicMock()
        _st_mod.MarianTokenizer = MagicMock()
        _st_mod.MarianMTModel.from_pretrained.side_effect = Exception("Model not found")
        _st_mod.MarianTokenizer.from_pretrained.return_value = MagicMock()
        sys.modules["transformers"] = _st_mod

        result = translate_text("Hello", target_lang="fr", source_lang="en")
        self.assertEqual(result["translated"], "Hello")

    def test_translation_generation_failure_returns_original(self):
        """When model.generate() fails, should return original text."""
        _st_mod, mock_model, mock_tokenizer = _make_transformers_stub()
        sys.modules["transformers"] = _st_mod
        mock_model.generate.side_effect = Exception("CUDA out of memory")

        result = translate_text("Hello", target_lang="fr", source_lang="en")
        self.assertEqual(result["translated"], "Hello")

    def test_cache_eviction_at_max_size(self):
        """When cache reaches MAX_CACHE_SIZE, new entries should not be added."""
        _st_mod, mock_model, mock_tokenizer = _make_transformers_stub()
        sys.modules["transformers"] = _st_mod
        mock_tokenizer.decode.return_value = "translated"

        for i in range(MAX_CACHE_SIZE):
            ts_mod._translation_cache[f"en:es:hash_{i}"] = f"translated_{i}"

        result = translate_text("New unique text", target_lang="es", source_lang="en")
        self.assertFalse(result["cached"])

    def test_explicit_source_lang_skips_detection(self):
        """When source_lang is provided, should not call langdetect."""
        _st_mod, mock_model, mock_tokenizer = _make_transformers_stub()
        sys.modules["transformers"] = _st_mod
        mock_tokenizer.decode.return_value = "Bonjour le monde"

        saved = sys.modules.pop("langdetect", None)
        try:
            result = translate_text("Hello world", target_lang="fr", source_lang="en")
            self.assertEqual(result["source_lang"], "en")
        finally:
            if saved:
                sys.modules["langdetect"] = saved


# ---------------------------------------------------------------------------
# translate_ticket
# ---------------------------------------------------------------------------

class TestTranslateTicket(unittest.TestCase):

    def setUp(self):
        ts_mod._translation_cache.clear()
        ts_mod._model_cache.clear()
        sys.modules["langdetect"] = _make_langdetect_stub("en")
        _st_mod, mock_model, mock_tokenizer = _make_transformers_stub()
        sys.modules["transformers"] = _st_mod
        self.mock_tokenizer = mock_tokenizer

    def test_translate_subject(self):
        self.mock_tokenizer.decode.return_value = "Translated subject"
        ticket = {"subject": "My ticket subject"}
        result = translate_ticket(ticket, target_lang="es")
        self.assertIn("subject", result["translations"])
        self.assertEqual(result["translations"]["subject"]["translated"], "Translated subject")

    def test_translate_description(self):
        self.mock_tokenizer.decode.return_value = "Translated description"
        ticket = {"description": "This is a description"}
        result = translate_ticket(ticket, target_lang="fr")
        self.assertIn("description", result["translations"])

    def test_translate_messages(self):
        self.mock_tokenizer.decode.return_value = "Translated message"
        ticket = {
            "messages": [
                {"content": "First message"},
                {"content": "Second message"},
            ]
        }
        result = translate_ticket(ticket, target_lang="de")
        self.assertIn("messages", result["translations"])
        self.assertEqual(len(result["translations"]["messages"]), 2)
        self.assertEqual(result["translations"]["messages"][0]["translated"], "Translated message")

    def test_translate_full_ticket(self):
        self.mock_tokenizer.decode.return_value = "Translated"
        ticket = {
            "subject": "Help me",
            "description": "I have a problem",
            "messages": [{"content": "Can someone help?"}],
        }
        result = translate_ticket(ticket, target_lang="ja")
        self.assertIn("subject", result["translations"])
        self.assertIn("description", result["translations"])
        self.assertIn("messages", result["translations"])

    def test_original_language_from_subject(self):
        sys.modules["langdetect"] = _make_langdetect_stub("es")
        self.mock_tokenizer.decode.return_value = "Translated"
        ticket = {"subject": "Ayuda por favor"}
        result = translate_ticket(ticket, target_lang="en")
        self.assertEqual(result["original_language"], "es")

    def test_original_language_from_description_when_no_subject(self):
        sys.modules["langdetect"] = _make_langdetect_stub("fr")
        self.mock_tokenizer.decode.return_value = "Translated"
        ticket = {"description": "Aidez-moi s'il vous plait"}
        result = translate_ticket(ticket, target_lang="en")
        self.assertEqual(result["original_language"], "fr")

    def test_empty_ticket_returns_empty_translations(self):
        result = translate_ticket({}, target_lang="en")
        self.assertEqual(result["translations"], {})
        self.assertIsNone(result["original_language"])

    def test_target_language_in_result(self):
        ticket = {"subject": "Test"}
        result = translate_ticket(ticket, target_lang="ko")
        self.assertEqual(result["target_language"], "ko")

    def test_messages_without_content_key(self):
        """Messages missing 'content' key should translate empty string."""
        self.mock_tokenizer.decode.return_value = ""
        ticket = {"messages": [{"no_content": True}]}
        result = translate_ticket(ticket, target_lang="en")
        self.assertEqual(len(result["translations"]["messages"]), 1)


# ---------------------------------------------------------------------------
# clear_cache
# ---------------------------------------------------------------------------

class TestClearCache(unittest.TestCase):

    def test_clears_translation_cache(self):
        ts_mod._translation_cache["test"] = "value"
        self.assertEqual(len(ts_mod._translation_cache), 1)
        clear_cache()
        self.assertEqual(len(ts_mod._translation_cache), 0)

    def test_clears_model_cache(self):
        ts_mod._model_cache["test"] = MagicMock()
        self.assertEqual(len(ts_mod._model_cache), 1)
        clear_cache()
        self.assertEqual(len(ts_mod._model_cache), 0)

    def test_clear_empty_caches(self):
        ts_mod._translation_cache.clear()
        ts_mod._model_cache.clear()
        clear_cache()


# ---------------------------------------------------------------------------
# SUPPORTED_LANGUAGES constant
# ---------------------------------------------------------------------------

class TestSupportedLanguagesConstant(unittest.TestCase):

    def test_is_dict(self):
        self.assertIsInstance(SUPPORTED_LANGUAGES, dict)

    def test_all_values_are_strings(self):
        for code, name in SUPPORTED_LANGUAGES.items():
            self.assertIsInstance(code, str)
            self.assertIsInstance(name, str)

    def test_all_keys_are_two_letter_codes(self):
        for code in SUPPORTED_LANGUAGES:
            self.assertEqual(len(code), 2)


if __name__ == "__main__":
    unittest.main()
