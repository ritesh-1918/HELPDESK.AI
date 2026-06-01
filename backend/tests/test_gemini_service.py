import pytest
import sys
from unittest.mock import patch, MagicMock

sys.modules['google'] = MagicMock()
sys.modules['dotenv'] = MagicMock()
sys.modules['PIL'] = MagicMock()

from backend.services.gemini_service import GeminiService


class TestGeminiServiceMissingEnv:
    """Tests for handling missing API key in gemini_service"""

    def test_analyze_image_without_api_key_returns_graceful_response(self):
        """Test that analyze_image returns graceful response when API key is missing"""
        svc = GeminiService()
        svc._initialized = False

        result = svc.analyze_image("base64data")
        assert result["image_description"] == "[Gemini API Key Missing] Could not analyze image."
        assert result["ocr_text"] == ""
        assert result["detected_problem"] == ""

    def test_get_summary_without_api_key_returns_truncated_text(self):
        """Test that get_summary returns truncated text when API key is missing"""
        svc = GeminiService()
        svc._initialized = False

        long_text = "This is a long ticket text that should be truncated because it exceeds the 100 character limit for summary"
        result = svc.get_summary(long_text)
        assert len(result) <= 103
        assert "…" in result

    def test_get_reasoning_without_api_key_returns_empty_response(self):
        """Test that get_reasoning returns empty response when API key is missing"""
        svc = GeminiService()
        svc._initialized = False

        result = svc.get_reasoning("ticket text", "category", "team")
        assert result["reasoning"] == ""
        assert result["highlights"] == []

    def test_get_troubleshooting_step_without_api_key_returns_graceful_response(self):
        """Test that get_troubleshooting_step returns graceful response when API key is missing"""
        svc = GeminiService()
        svc._initialized = False

        result = svc.get_troubleshooting_step("ticket text", [], "category")
        assert result["step_text"] == "AI Troubleshooting is currently unavailable."
        assert result["options"] == ["Try again later"]
        assert result["is_final"] is True

    def test_analyze_bug_report_without_api_key_returns_graceful_response(self):
        """Test that analyze_bug_report returns graceful response when API key is missing"""
        svc = GeminiService()
        svc._initialized = False

        result = svc.analyze_bug_report("bug title", "description", "steps", [])
        assert "AI Diagnostics unavailable" in result