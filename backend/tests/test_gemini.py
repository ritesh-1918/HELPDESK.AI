from backend.services.gemini_service import GeminiService
from unittest.mock import patch, MagicMock

def test_gemini_service_initialization_no_key():
    with patch.dict("os.environ", {}, clear=True):
        service = GeminiService()
        assert service._initialized == False

def test_gemini_service_troubleshoot_fallback():
    with patch.dict("os.environ", {}, clear=True):
        service = GeminiService()
        result = service.get_troubleshooting_step("Help me", [], "General")
        assert "step_text" in result
        assert result["is_final"] == True
        assert "unable to generate" in result["step_text"].lower() or "unavailable" in result["step_text"].lower()

def test_gemini_service_analyze_bug_fallback():
    with patch.dict("os.environ", {}, clear=True):
        service = GeminiService()
        result = service.analyze_bug_report("Bug", "Description", "", [])
        assert "unavailable" in result.lower() or "unable" in result.lower()
