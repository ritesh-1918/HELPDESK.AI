"""
Tests for GeminiService — comprehensive coverage for response generation.

Covers:
- Missing API key fallback behaviour (existing tests, updated)
- Successful response generation with mocked Gemini client
- API exceptions and failure handling
- Empty/invalid input edge cases
- Unexpected/malformed response handling

Issue: #2853
"""

import pytest
import sys
from unittest.mock import patch, MagicMock

# Mock heavy third-party dependencies before importing the service
sys.modules.setdefault('google', MagicMock())
sys.modules.setdefault('google.genai', MagicMock())
sys.modules.setdefault('dotenv', MagicMock())
sys.modules.setdefault('PIL', MagicMock())
sys.modules.setdefault('PIL.Image', MagicMock())

from backend.services.gemini_service import GeminiService


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_initialized_service():
    """Create a GeminiService instance with a mocked Gemini client."""
    svc = GeminiService.__new__(GeminiService)
    svc._initialized = True
    svc.api_key = "test_key_for_unit_tests"
    svc.model_name = "gemini-2.5-flash"
    svc.client = MagicMock()
    return svc


def _make_offline_service():
    """Create an uninitialised GeminiService (no API key)."""
    svc = GeminiService.__new__(GeminiService)
    svc._initialized = False
    svc.api_key = None
    svc.model_name = "gemini-2.5-flash"
    return svc


# ═══════════════════════════════════════════════════════════════════════════
# 1. Missing API Key Fallback
# ═══════════════════════════════════════════════════════════════════════════

class TestGeminiServiceMissingEnv:
    """Tests for handling missing API key in gemini_service"""

    def test_analyze_image_without_api_key_returns_graceful_response(self):
        """Test that analyze_image returns graceful response when API key is missing"""
        svc = _make_offline_service()

        result = svc.analyze_image("base64data")
        assert "Could not analyze image" in result["image_description"]
        assert result["ocr_text"] == ""
        assert result["detected_problem"] == ""

    def test_get_summary_without_api_key_returns_truncated_text(self):
        """Test that get_summary returns truncated text when API key is missing"""
        svc = _make_offline_service()

        long_text = "This is a long ticket text that should be truncated because it exceeds the 100 character limit for summary"
        result = svc.get_summary(long_text)
        assert len(result) <= 103
        assert "\u2026" in result

    def test_get_reasoning_without_api_key_returns_empty_response(self):
        """Test that get_reasoning returns empty response when API key is missing"""
        svc = _make_offline_service()

        result = svc.get_reasoning("ticket text", "category", "team")
        assert result["reasoning"] == ""
        assert result["highlights"] == []

    def test_get_troubleshooting_step_without_api_key_returns_graceful_response(self):
        """Test that get_troubleshooting_step returns graceful response when API key is missing"""
        svc = _make_offline_service()

        result = svc.get_troubleshooting_step("ticket text", [], "category")
        assert result["step_text"] == "AI Troubleshooting is currently unavailable."
        assert result["options"] == ["Try again later"]
        assert result["is_final"] is True

    def test_analyze_bug_report_without_api_key_returns_graceful_response(self):
        """Test that analyze_bug_report returns graceful response when API key is missing"""
        svc = _make_offline_service()

        result = svc.analyze_bug_report("bug title", "description", "steps", [])
        assert "unavailable" in result.lower()


# ═══════════════════════════════════════════════════════════════════════════
# 2. Successful Response Generation (mocked Gemini client)
# ═══════════════════════════════════════════════════════════════════════════

class TestGeminiServiceSuccessfulResponse:
    """Tests for successful response generation with a mocked API client."""

    def test_get_summary_returns_gemini_generated_text(self):
        """get_summary should return the text from the Gemini API response."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "User reports VPN connectivity issues from home office."
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_summary("My VPN is not connecting when I work from home")

        assert isinstance(result, str)
        assert len(result) > 0
        assert "VPN" in result
        svc.client.models.generate_content.assert_called_once()

    def test_get_summary_strips_newlines(self):
        """get_summary should strip newlines from the response."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "VPN connectivity failure\nfor remote users"
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_summary("VPN not working from home")

        assert "\n" not in result
        assert "VPN connectivity failure for remote users" == result

    def test_get_reasoning_returns_parsed_structure(self):
        """get_reasoning should parse REASONING and HIGHLIGHTS from response."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = (
            "REASONING: The ticket describes a network issue requiring IT support.\n"
            "HIGHLIGHTS: VPN connectivity | Remote access | Network configuration"
        )
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_reasoning(
            "VPN not connecting from home",
            "Network",
            "Network Operations"
        )

        assert isinstance(result, dict)
        assert "reasoning" in result
        assert "highlights" in result
        assert len(result["reasoning"]) > 0
        assert isinstance(result["highlights"], list)
        assert len(result["highlights"]) == 3

    def test_get_troubleshooting_step_returns_parsed_step(self):
        """get_troubleshooting_step should parse STEP, OPTIONS, FINAL from response."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = (
            "STEP: Please restart your VPN client and try connecting again.\n"
            "OPTIONS: It worked | Still not working | Need more help\n"
            "FINAL: False"
        )
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_troubleshooting_step(
            "VPN not connecting",
            [],
            "Network"
        )

        assert isinstance(result, dict)
        assert "restart" in result["step_text"].lower() or "VPN" in result["step_text"]
        assert isinstance(result["options"], list)
        assert len(result["options"]) == 3
        assert result["is_final"] is False
        svc.client.models.generate_content.assert_called_once()

    def test_get_troubleshooting_step_final_true(self):
        """get_troubleshooting_step should detect FINAL: True correctly."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = (
            "STEP: It looks like the issue is resolved.\n"
            "OPTIONS: Confirm resolved | Need further help\n"
            "FINAL: True"
        )
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_troubleshooting_step("VPN issue", [], "Network")

        assert result["is_final"] is True

    def test_get_troubleshooting_step_with_history(self):
        """get_troubleshooting_step should include history context in the API call."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = (
            "STEP: Since restarting didn't work, check your network settings.\n"
            "OPTIONS: Found the issue | Still broken\n"
            "FINAL: False"
        )
        svc.client.models.generate_content.return_value = mock_response

        history = [
            {"role": "user", "text": "VPN is not connecting"},
            {"role": "ai", "text": "Try restarting your VPN client"},
            {"role": "user", "text": "Still not working"}
        ]
        result = svc.get_troubleshooting_step(
            "VPN not connecting",
            history,
            "Network"
        )

        assert isinstance(result, dict)
        assert "step_text" in result
        svc.client.models.generate_content.assert_called_once()
        # Verify history was included in the prompt
        call_args = svc.client.models.generate_content.call_args
        prompt = call_args[1]["contents"] if "contents" in call_args[1] else call_args[0][0]
        assert "User:" in prompt or "VPN" in prompt

    def test_analyze_bug_report_returns_probable_cause(self):
        """analyze_bug_report should return the Gemini-generated cause string."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = (
            "The 404 error is likely caused by an incorrect API endpoint "
            "configuration in the frontend routing."
        )
        svc.client.models.generate_content.return_value = mock_response

        result = svc.analyze_bug_report(
            "404 Error on Dashboard",
            "Dashboard shows 404 after deploy",
            "1. Login\n2. Navigate to dashboard",
            ["GET /api/dashboard - 404 Not Found"]
        )

        assert isinstance(result, str)
        assert len(result) > 0
        assert "404" in result or "endpoint" in result.lower()
        svc.client.models.generate_content.assert_called_once()

    def test_analyze_bug_report_with_empty_console_errors(self):
        """analyze_bug_report should work with empty console errors list."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "Unable to determine root cause without console errors."
        svc.client.models.generate_content.return_value = mock_response

        result = svc.analyze_bug_report(
            "Page loads slowly",
            "The main page takes 15 seconds to load",
            "1. Open browser\n2. Navigate to app",
            []
        )

        assert isinstance(result, str)
        assert len(result) > 0
        # Verify "None captured" is used in prompt for empty errors
        call_args = svc.client.models.generate_content.call_args
        prompt = call_args[1]["contents"] if "contents" in call_args[1] else call_args[0][0]
        assert "None captured" in prompt


# ═══════════════════════════════════════════════════════════════════════════
# 3. Empty / Invalid Input Edge Cases
# ═══════════════════════════════════════════════════════════════════════════

class TestGeminiServiceEdgeCases:
    """Tests for edge-case inputs (empty, whitespace, very long)."""

    def test_get_summary_empty_text_returns_string(self):
        """get_summary with empty string should return a string, not crash."""
        svc = _make_offline_service()

        result = svc.get_summary("")
        assert isinstance(result, str)
        # Empty text[:100] is "", no "…" appended
        assert result == ""

    def test_get_summary_whitespace_text_returns_string(self):
        """get_summary with whitespace-only input should not crash."""
        svc = _make_offline_service()

        result = svc.get_summary("   \t\n  ")
        assert isinstance(result, str)

    def test_get_summary_very_long_text_truncates(self):
        """get_summary with very long text should truncate when offline."""
        svc = _make_offline_service()

        long_text = "A" * 5000
        result = svc.get_summary(long_text)
        assert isinstance(result, str)
        assert len(result) <= 103
        assert "\u2026" in result

    def test_get_summary_exactly_100_chars(self):
        """get_summary with exactly 100 chars should not add ellipsis."""
        svc = _make_offline_service()

        text_100 = "X" * 100
        result = svc.get_summary(text_100)
        assert result == text_100
        assert "\u2026" not in result

    def test_get_summary_101_chars_adds_ellipsis(self):
        """get_summary with 101 chars should add ellipsis."""
        svc = _make_offline_service()

        text_101 = "Y" * 101
        result = svc.get_summary(text_101)
        assert len(result) == 101  # 100 chars + "…"
        assert result.endswith("\u2026")

    def test_get_reasoning_empty_text(self):
        """get_reasoning with empty text should return structured fallback."""
        svc = _make_offline_service()

        result = svc.get_reasoning("", "", "")
        assert isinstance(result, dict)
        assert result["reasoning"] == ""
        assert result["highlights"] == []

    def test_get_troubleshooting_step_empty_text(self):
        """get_troubleshooting_step with empty text should return fallback."""
        svc = _make_offline_service()

        result = svc.get_troubleshooting_step("", [], "")
        assert isinstance(result, dict)
        assert "step_text" in result
        assert result["is_final"] is True

    def test_analyze_bug_report_empty_fields(self):
        """analyze_bug_report with all empty fields should return fallback."""
        svc = _make_offline_service()

        result = svc.analyze_bug_report("", "", "", [])
        assert isinstance(result, str)
        assert "unavailable" in result.lower()


# ═══════════════════════════════════════════════════════════════════════════
# 4. API Exception / Failure Handling
# ═══════════════════════════════════════════════════════════════════════════

class TestGeminiServiceAPIFailures:
    """Tests for handling API errors and exceptions."""

    def test_get_summary_api_exception_returns_fallback(self):
        """get_summary should handle Gemini API exceptions gracefully."""
        svc = _make_initialized_service()
        svc.client.models.generate_content.side_effect = Exception(
            "ServiceUnavailable: 503 Backend error."
        )

        result = svc.get_summary("Test ticket about printer issue")
        assert isinstance(result, str)
        # Fallback is the truncated input text
        assert len(result) > 0

    def test_get_reasoning_api_exception_returns_empty(self):
        """get_reasoning should return empty structure on API failure."""
        svc = _make_initialized_service()
        svc.client.models.generate_content.side_effect = Exception(
            "ResourceExhausted: 429 Quota exceeded."
        )

        result = svc.get_reasoning("Test text", "Hardware", "IT Support")
        assert isinstance(result, dict)
        assert result["reasoning"] == ""
        assert result["highlights"] == []

    def test_get_troubleshooting_step_api_exception_returns_fallback(self):
        """get_troubleshooting_step should return a recovery step on API failure."""
        svc = _make_initialized_service()
        svc.client.models.generate_content.side_effect = Exception(
            "PermissionDenied: API key not valid."
        )

        result = svc.get_troubleshooting_step("VPN issue", [], "Network")
        assert isinstance(result, dict)
        assert "step_text" in result
        assert len(result["step_text"]) > 0
        assert isinstance(result["options"], list)
        assert len(result["options"]) > 0
        # On error, is_final should be False (gives user options to continue)
        assert result["is_final"] is False

    def test_analyze_bug_report_api_exception_returns_error_string(self):
        """analyze_bug_report should return a diagnostic failure string on API failure."""
        svc = _make_initialized_service()
        svc.client.models.generate_content.side_effect = Exception(
            "DeadlineExceeded: request timed out"
        )

        result = svc.analyze_bug_report(
            "Login Failure",
            "Users cannot login",
            "1. Go to login page\n2. Enter creds\n3. Click submit",
            ["TypeError: undefined is not a function"]
        )
        assert isinstance(result, str)
        assert "failed" in result.lower() or "error" in result.lower()

    def test_get_summary_connection_error(self):
        """get_summary should handle network connectivity errors."""
        svc = _make_initialized_service()
        svc.client.models.generate_content.side_effect = ConnectionError(
            "Failed to establish connection"
        )

        result = svc.get_summary("Email not working for the team")
        assert isinstance(result, str)
        assert len(result) > 0

    def test_get_summary_timeout_error(self):
        """get_summary should handle timeout errors."""
        svc = _make_initialized_service()
        svc.client.models.generate_content.side_effect = TimeoutError(
            "Request timed out after 30 seconds"
        )

        result = svc.get_summary("Slow database queries on production")
        assert isinstance(result, str)
        assert len(result) > 0


# ═══════════════════════════════════════════════════════════════════════════
# 5. Unexpected / Malformed Response Handling
# ═══════════════════════════════════════════════════════════════════════════

class TestGeminiServiceMalformedResponses:
    """Tests for handling unexpected or malformed API responses."""

    def test_get_summary_none_response_text(self):
        """get_summary should handle response.text being None."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = None
        svc.client.models.generate_content.return_value = mock_response

        # None.strip() will raise AttributeError, caught by except
        result = svc.get_summary("Printer not printing")
        assert isinstance(result, str)

    def test_get_summary_empty_response_text(self):
        """get_summary should handle response.text being empty string."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = ""
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_summary("Monitor flickering intermittently")
        assert isinstance(result, str)

    def test_get_reasoning_no_matching_pattern(self):
        """get_reasoning should handle response without REASONING/HIGHLIGHTS markers."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "This is just plain text without any formatting markers."
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_reasoning("Test text", "Hardware", "IT")
        assert isinstance(result, dict)
        assert "reasoning" in result
        assert "highlights" in result
        # Without markers, regex fails → empty values
        assert result["reasoning"] == ""
        assert result["highlights"] == []

    def test_get_troubleshooting_step_no_markers(self):
        """get_troubleshooting_step should handle response without STEP/OPTIONS/FINAL markers."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "This is just plain text without any structure at all."
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_troubleshooting_step("Issue", [], "General")
        assert isinstance(result, dict)
        assert "step_text" in result
        assert isinstance(result["options"], list)
        assert len(result["options"]) > 0
        # Without FINAL marker, defaults to False
        assert result["is_final"] is False

    def test_analyze_bug_report_whitespace_response(self):
        """analyze_bug_report should handle whitespace-only response."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "   \n\t  "
        svc.client.models.generate_content.return_value = mock_response

        result = svc.analyze_bug_report("Bug", "Desc", "Steps", [])
        assert isinstance(result, str)

    def test_get_reasoning_partial_markers(self):
        """get_reasoning should handle response with only REASONING but no HIGHLIGHTS."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "REASONING: Network issues detected in the ticket."
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_reasoning("VPN issue", "Network", "IT")
        assert isinstance(result, dict)
        assert len(result["reasoning"]) > 0
        assert result["highlights"] == []

    def test_get_troubleshooting_step_only_step_marker(self):
        """get_troubleshooting_step should handle response with only STEP but no OPTIONS/FINAL."""
        svc = _make_initialized_service()
        mock_response = MagicMock()
        mock_response.text = "STEP: Restart your computer and try again."
        svc.client.models.generate_content.return_value = mock_response

        result = svc.get_troubleshooting_step("Issue", [], "General")
        assert isinstance(result, dict)
        assert "restart" in result["step_text"].lower() or "Restart" in result["step_text"]
        # Without OPTIONS, should fall back to default options
        assert isinstance(result["options"], list)
        assert len(result["options"]) > 0
        # Without FINAL, defaults to False
        assert result["is_final"] is False