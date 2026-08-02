"""
Unit tests for the text_preprocessor module.

Covers: Hinglish detection, token normalization, Devanagari stripping,
and the main preprocess_for_classifier pipeline.

Reference: Bug #5 / D-005 — Classifier V3 failing on mixed-language tickets.
"""

import pytest
import sys
import os

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.text_preprocessor import (
    detect_code_mixed,
    normalize_hinglish,
    strip_devanagari,
    preprocess_for_classifier,
    HINGLISH_TOKEN_MAP,
)


# ── detect_code_mixed tests ──────────────────────────────────────────


class TestDetectCodeMixed:
    """Tests for code-mixed language detection."""

    def test_pure_english_not_detected(self):
        """Plain English text should not be flagged as code-mixed."""
        assert detect_code_mixed("My laptop keeps restarting") is False

    def test_pure_hinglish_detected(self):
        """Romanized Hindi with enough patterns is detected."""
        assert detect_code_mixed("mera laptop kaam nahi kar raha hai") is True

    def test_devanagari_mixed_with_latin(self):
        """Devanagari script mixed with Latin characters is detected."""
        assert detect_code_mixed("मेरा laptop काम नहीं कर रहा") is True

    def test_pure_devanagari_no_latin(self):
        """Pure Devanagari without Latin is not code-mixed."""
        assert detect_code_mixed("मेरा लैपटॉप काम नहीं कर रहा") is False

    def test_single_hinglish_word_below_threshold(self):
        """Single Hinglish word below threshold should not trigger detection."""
        assert detect_code_mixed("The system hai working fine") is False

    def test_multiple_hinglish_words_above_threshold(self):
        """Multiple Hinglish words should trigger detection."""
        assert detect_code_mixed("kya laptop hai working nahi") is True

    def test_empty_string(self):
        """Empty string should not be detected as code-mixed."""
        assert detect_code_mixed("") is False

    def test_none_input(self):
        """None input should not be detected as code-mixed."""
        assert detect_code_mixed(None) is False

    def test_whitespace_only(self):
        """Whitespace-only input should not be detected."""
        assert detect_code_mixed("   ") is False

    def test_numbers_only(self):
        """Numbers-only input should not be detected."""
        assert detect_code_mixed("12345 67890") is False

    def test_case_insensitive_detection(self):
        """Detection should be case-insensitive."""
        assert detect_code_mixed("MERA LAPTOP KAAM NAHI KARTA") is True

    def test_hinglish_it_support_phrase(self):
        """Common IT support Hinglish phrase should be detected."""
        assert detect_code_mixed(
            "mera password reset nahi ho raha hai, kya karu?"
        ) is True


# ── normalize_hinglish tests ─────────────────────────────────────────


class TestNormalizeHinglish:
    """Tests for Hinglish token normalization."""

    def test_basic_normalization(self):
        """Basic Hinglish tokens should be replaced with English."""
        result = normalize_hinglish("mera laptop hai")
        assert "my" in result
        assert "is" in result

    def test_pure_english_unchanged(self):
        """Pure English text should pass through unchanged."""
        text = "My laptop is not working"
        assert normalize_hinglish(text) == text

    def test_preserves_punctuation(self):
        """Punctuation around Hinglish tokens should be preserved."""
        result = normalize_hinglish("kya hai?")
        assert result == "what is?"

    def test_mixed_sentence(self):
        """Mixed Hinglish-English sentence is normalized correctly."""
        result = normalize_hinglish("mera laptop restart nahi ho raha")
        assert "my" in result
        assert "laptop" in result
        assert "restart" in result
        assert "not" in result

    def test_empty_string(self):
        """Empty string returns empty string."""
        assert normalize_hinglish("") == ""

    def test_none_input(self):
        """None input returns empty string."""
        assert normalize_hinglish(None) == ""

    def test_multi_word_phrase_replacement(self):
        """Multi-word phrases in the token map are replaced."""
        result = normalize_hinglish("mera laptop kaam nahi kar raha")
        assert "not working" in result

    def test_case_preservation_in_non_hinglish(self):
        """Non-Hinglish words should keep their original case."""
        result = normalize_hinglish("URGENT aur problem")
        assert "URGENT" in result
        assert "and" in result

    def test_it_support_common_phrases(self):
        """Common IT support Hinglish phrases normalize correctly."""
        result = normalize_hinglish("password reset kaise karu, madad chahiye")
        assert "how" in result
        assert "help" in result
        assert "need" in result

    def test_hinglish_token_map_not_empty(self):
        """Token map should have a reasonable number of entries."""
        assert len(HINGLISH_TOKEN_MAP) >= 50


# ── strip_devanagari tests ───────────────────────────────────────────


class TestStripDevanagari:
    """Tests for Devanagari character removal."""

    def test_removes_devanagari(self):
        """Devanagari characters should be removed."""
        result = strip_devanagari("मेरा laptop काम नहीं कर रहा")
        assert "मेरा" not in result
        assert "laptop" in result

    def test_pure_latin_unchanged(self):
        """Pure Latin text should pass through unchanged."""
        assert strip_devanagari("hello world") == "hello world"

    def test_empty_string(self):
        """Empty string returns empty string."""
        assert strip_devanagari("") == ""

    def test_none_input(self):
        """None input returns empty string."""
        assert strip_devanagari(None) == ""

    def test_whitespace_normalization(self):
        """Resulting whitespace from Devanagari removal is normalized."""
        result = strip_devanagari("test मेरा  word")
        assert "  " not in result


# ── preprocess_for_classifier tests ──────────────────────────────────


class TestPreprocessForClassifier:
    """Tests for the main preprocessing pipeline."""

    def test_english_passes_through(self):
        """Pure English text passes through the pipeline unchanged."""
        text = "My laptop is not working properly"
        result = preprocess_for_classifier(text)
        assert result == text

    def test_hinglish_normalized(self):
        """Hinglish text is detected and normalized."""
        result = preprocess_for_classifier(
            "mera laptop kaam nahi kar raha hai, kya karu?"
        )
        assert "my" in result
        assert "not working" in result or "not" in result

    def test_mixed_script_cleaned(self):
        """Mixed Devanagari + Latin text is cleaned."""
        result = preprocess_for_classifier("मेरा laptop restart nahi ho raha")
        assert "laptop" in result
        assert "not" in result
        # Devanagari should be stripped
        assert "मेरा" not in result

    def test_empty_string(self):
        """Empty string returns empty string."""
        assert preprocess_for_classifier("") == ""

    def test_none_input(self):
        """None input returns empty string."""
        assert preprocess_for_classifier(None) == ""

    def test_whitespace_only(self):
        """Whitespace-only input returns empty-ish string."""
        result = preprocess_for_classifier("   ")
        assert result.strip() == ""

    def test_whitespace_normalized(self):
        """Extra whitespace in output is normalized."""
        result = preprocess_for_classifier("mera   laptop   hai   slow")
        assert "  " not in result

    def test_special_characters_preserved(self):
        """Special characters in English text are preserved."""
        text = "Error #404: page not found! (urgent)"
        result = preprocess_for_classifier(text)
        assert result == text

    def test_emoji_preserved(self):
        """Emoji in text should be preserved."""
        text = "System is down 🔥 help needed"
        result = preprocess_for_classifier(text)
        assert "🔥" in result

    def test_real_world_hinglish_ticket(self):
        """Real-world Hinglish IT support ticket is preprocessed correctly."""
        ticket = "mera laptop baar baar restart ho raha hai aur screen pe error aa raha hai, kya karu?"
        result = preprocess_for_classifier(ticket)
        # Should contain English equivalents
        assert "my" in result
        assert "laptop" in result
        assert "restart" in result
        # Should not contain raw Hinglish tokens
        assert "mera" not in result.split()
