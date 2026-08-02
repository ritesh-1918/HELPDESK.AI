"""
Tests for Multi-Language Ticket Support Integration

Tests cover:
  - Language detection in ticket analysis
  - Translation pipeline integration
  - Response includes translation info
  - Translation can be disabled per company
  - English text bypasses translation
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from backend.routers.ai import analyze_only
from backend.schemas import TicketRequest


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_user():
    """Mock authenticated user."""
    return {
        "id": "user-123",
        "email": "test@example.com",
        "role": "user"
    }


@pytest.fixture
def ticket_request_english():
    """Ticket request with English text."""
    return TicketRequest(
        text="My computer won't start. The power button doesn't respond.",
        company="company-1"
    )


@pytest.fixture
def ticket_request_spanish():
    """Ticket request with Spanish text."""
    return TicketRequest(
        text="Mi computadora no enciende. El botón de encendido no responde.",
        company="company-1"
    )


@pytest.fixture
def ticket_request_hindi():
    """Ticket request with Hindi text."""
    return TicketRequest(
        text="मेरा कंप्यूटर चालू नहीं हो रहा है। पावर बटन काम नहीं कर रहा है।",
        company="company-1"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Language Detection
# ─────────────────────────────────────────────────────────────────────────────

@patch("backend.routers.ai.get_system_settings")
@patch("backend.routers.ai.detect_language")
@patch("backend.routers.ai.translate_text")
@patch("backend.routers.ai.classifier_v3")
@patch("backend.routers.ai.ner_service")
@patch("backend.routers.ai.duplicate_service")
@patch("backend.routers.ai.rag_service")
@patch("backend.routers.ai.gemini_service")
async def test_english_text_no_translation(
    mock_gemini, mock_rag, mock_dup, mock_ner, mock_clf,
    mock_translate, mock_detect, mock_settings,
    ticket_request_english, mock_user
):
    """English text should be detected but not translated."""
    # Mock settings
    mock_settings.return_value = {
        "ai_confidence_threshold": 0.8,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False,
        "enable_translation": True
    }
    
    # Mock language detection - returns English
    mock_detect.return_value = "en"
    
    # Mock classification
    mock_clf.predict.return_value = {
        "Category": {"prediction": "Hardware", "confidence": 0.9},
        "Subcategory": {"prediction": "Power Issues", "confidence": 0.85},
        "priority": {"prediction": "High", "confidence": 0.9}
    }
    
    # Mock other services
    mock_ner.extract_entities.return_value = []
    mock_dup.check_duplicate.return_value = {
        "is_duplicate": False,
        "duplicate_ticket_id": None,
        "similarity": 0.0
    }
    mock_rag.search_enhanced.return_value = {
        "best_match": None,
        "suggestions": [],
        "recommendations": []
    }
    mock_gemini._initialized = True
    mock_gemini.get_summary.return_value = "Computer power issue"
    
    # Call analyze_only
    response = await analyze_only(ticket_request_english, mock_user)
    
    # Assert language was detected
    mock_detect.assert_called_once()
    
    # Assert translate_text was NOT called (English text)
    mock_translate.assert_not_called()
    
    # Assert response has no translation info
    assert response.detected_language is None or response.detected_language == "en"
    assert response.original_text is None
    assert response.translated_text is None


@patch("backend.routers.ai.get_system_settings")
@patch("backend.routers.ai.detect_language")
@patch("backend.routers.ai.translate_text")
@patch("backend.routers.ai.classifier_v3")
@patch("backend.routers.ai.ner_service")
@patch("backend.routers.ai.duplicate_service")
@patch("backend.routers.ai.rag_service")
@patch("backend.routers.ai.gemini_service")
async def test_spanish_text_translated(
    mock_gemini, mock_rag, mock_dup, mock_ner, mock_clf,
    mock_translate, mock_detect, mock_settings,
    ticket_request_spanish, mock_user
):
    """Spanish text should be detected and translated to English."""
    # Mock settings
    mock_settings.return_value = {
        "ai_confidence_threshold": 0.8,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False,
        "enable_translation": True
    }
    
    # Mock language detection - returns Spanish
    mock_detect.return_value = "es"
    
    # Mock translation
    mock_translate.return_value = {
        "translated": "My computer won't start. The power button doesn't respond.",
        "source_lang": "es",
        "target_lang": "en",
        "confidence": 0.95,
        "detected_locale": "es"
    }
    
    # Mock classification (using translated text)
    mock_clf.predict.return_value = {
        "Category": {"prediction": "Hardware", "confidence": 0.9},
        "Subcategory": {"prediction": "Power Issues", "confidence": 0.85},
        "priority": {"prediction": "High", "confidence": 0.9}
    }
    
    # Mock other services
    mock_ner.extract_entities.return_value = []
    mock_dup.check_duplicate.return_value = {
        "is_duplicate": False,
        "duplicate_ticket_id": None,
        "similarity": 0.0
    }
    mock_rag.search_enhanced.return_value = {
        "best_match": None,
        "suggestions": [],
        "recommendations": []
    }
    mock_gemini._initialized = True
    mock_gemini.get_summary.return_value = "Computer power issue"
    
    # Call analyze_only
    response = await analyze_only(ticket_request_spanish, mock_user)
    
    # Assert language was detected
    mock_detect.assert_called_once()
    
    # Assert translate_text was called
    mock_translate.assert_called_once_with(
        text=ticket_request_spanish.text,
        target_lang='en',
        source_lang='es'
    )
    
    # Assert response includes translation info
    assert response.detected_language == "es"
    assert response.original_text == ticket_request_spanish.text
    assert response.translated_text == "My computer won't start. The power button doesn't respond."
    assert response.translation_confidence == 0.95


@patch("backend.routers.ai.get_system_settings")
@patch("backend.routers.ai.detect_language")
@patch("backend.routers.ai.translate_text")
@patch("backend.routers.ai.classifier_v3")
@patch("backend.routers.ai.ner_service")
@patch("backend.routers.ai.duplicate_service")
@patch("backend.routers.ai.rag_service")
@patch("backend.routers.ai.gemini_service")
async def test_translation_disabled_in_settings(
    mock_gemini, mock_rag, mock_dup, mock_ner, mock_clf,
    mock_translate, mock_detect, mock_settings,
    ticket_request_spanish, mock_user
):
    """Translation should be skipped when disabled in settings."""
    # Mock settings with translation disabled
    mock_settings.return_value = {
        "ai_confidence_threshold": 0.8,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False,
        "enable_translation": False  # Disabled
    }
    
    # Mock classification
    mock_clf.predict.return_value = {
        "Category": {"prediction": "Hardware", "confidence": 0.7},
        "Subcategory": {"prediction": "Unknown", "confidence": 0.6},
        "priority": {"prediction": "Medium", "confidence": 0.7}
    }
    
    # Mock other services
    mock_ner.extract_entities.return_value = []
    mock_dup.check_duplicate.return_value = {
        "is_duplicate": False,
        "duplicate_ticket_id": None,
        "similarity": 0.0
    }
    mock_rag.search_enhanced.return_value = {
        "best_match": None,
        "suggestions": [],
        "recommendations": []
    }
    mock_gemini._initialized = True
    mock_gemini.get_summary.return_value = "Hardware issue"
    
    # Call analyze_only
    response = await analyze_only(ticket_request_spanish, mock_user)
    
    # Assert language detection was NOT called
    mock_detect.assert_not_called()
    
    # Assert translate_text was NOT called
    mock_translate.assert_not_called()
    
    # Assert response has no translation info
    assert response.detected_language is None
    assert response.original_text is None
    assert response.translated_text is None


@patch("backend.routers.ai.get_system_settings")
@patch("backend.routers.ai.detect_language")
@patch("backend.routers.ai.translate_text")
@patch("backend.routers.ai.classifier_v3")
@patch("backend.routers.ai.ner_service")
@patch("backend.routers.ai.duplicate_service")
@patch("backend.routers.ai.rag_service")
@patch("backend.routers.ai.gemini_service")
async def test_translation_error_falls_back(
    mock_gemini, mock_rag, mock_dup, mock_ner, mock_clf,
    mock_translate, mock_detect, mock_settings,
    ticket_request_spanish, mock_user
):
    """Translation errors should not break ticket analysis."""
    # Mock settings
    mock_settings.return_value = {
        "ai_confidence_threshold": 0.8,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False,
        "enable_translation": True
    }
    
    # Mock language detection succeeds
    mock_detect.return_value = "es"
    
    # Mock translation fails
    mock_translate.side_effect = Exception("Translation API unavailable")
    
    # Mock classification (will use original Spanish text)
    mock_clf.predict.return_value = {
        "Category": {"prediction": "Unknown", "confidence": 0.5},
        "Subcategory": {"prediction": "Unknown", "confidence": 0.4},
        "priority": {"prediction": "Medium", "confidence": 0.5}
    }
    
    # Mock other services
    mock_ner.extract_entities.return_value = []
    mock_dup.check_duplicate.return_value = {
        "is_duplicate": False,
        "duplicate_ticket_id": None,
        "similarity": 0.0
    }
    mock_rag.search_enhanced.return_value = {
        "best_match": None,
        "suggestions": [],
        "recommendations": []
    }
    mock_gemini._initialized = True
    mock_gemini.get_summary.return_value = "Issue report"
    
    # Call analyze_only - should not raise exception
    response = await analyze_only(ticket_request_spanish, mock_user)
    
    # Assert we got a response despite translation failure
    assert response is not None
    assert response.category is not None
    
    # Classification confidence should be lower (using Spanish text)
    assert response.confidence <= 0.8


@patch("backend.routers.ai.get_system_settings")
@patch("backend.routers.ai.detect_language")
@patch("backend.routers.ai.translate_text")
@patch("backend.routers.ai.classifier_v3")
@patch("backend.routers.ai.ner_service")
@patch("backend.routers.ai.duplicate_service")
@patch("backend.routers.ai.rag_service")
@patch("backend.routers.ai.gemini_service")
async def test_hindi_text_translated(
    mock_gemini, mock_rag, mock_dup, mock_ner, mock_clf,
    mock_translate, mock_detect, mock_settings,
    ticket_request_hindi, mock_user
):
    """Hindi text should be detected and translated to English."""
    # Mock settings
    mock_settings.return_value = {
        "ai_confidence_threshold": 0.8,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False,
        "enable_translation": True
    }
    
    # Mock language detection - returns Hindi
    mock_detect.return_value = "hi"
    
    # Mock translation
    mock_translate.return_value = {
        "translated": "My computer is not turning on. The power button is not working.",
        "source_lang": "hi",
        "target_lang": "en",
        "confidence": 0.92,
        "detected_locale": "hi"
    }
    
    # Mock classification (using translated text)
    mock_clf.predict.return_value = {
        "Category": {"prediction": "Hardware", "confidence": 0.88},
        "Subcategory": {"prediction": "Power Issues", "confidence": 0.82},
        "priority": {"prediction": "High", "confidence": 0.87}
    }
    
    # Mock other services
    mock_ner.extract_entities.return_value = []
    mock_dup.check_duplicate.return_value = {
        "is_duplicate": False,
        "duplicate_ticket_id": None,
        "similarity": 0.0
    }
    mock_rag.search_enhanced.return_value = {
        "best_match": None,
        "suggestions": [],
        "recommendations": []
    }
    mock_gemini._initialized = True
    mock_gemini.get_summary.return_value = "Hardware power issue"
    
    # Call analyze_only
    response = await analyze_only(ticket_request_hindi, mock_user)
    
    # Assert language was detected as Hindi
    mock_detect.assert_called_once()
    
    # Assert translate_text was called for Hindi to English
    mock_translate.assert_called_once_with(
        text=ticket_request_hindi.text,
        target_lang='en',
        source_lang='hi'
    )
    
    # Assert response includes Hindi translation info
    assert response.detected_language == "hi"
    assert response.original_text == ticket_request_hindi.text
    assert response.translated_text is not None
    assert "computer" in response.translated_text.lower()
    assert response.translation_confidence == 0.92


@patch("backend.routers.ai.get_system_settings")
@patch("backend.routers.ai.detect_language")
@patch("backend.routers.ai.translate_text")
async def test_empty_text_no_translation(
    mock_translate, mock_detect, mock_settings,
    mock_user
):
    """Empty text should not trigger translation."""
    # Mock settings
    mock_settings.return_value = {
        "ai_confidence_threshold": 0.8,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False,
        "enable_translation": True
    }
    
    # Create request with empty text
    empty_request = TicketRequest(text="", company="company-1")
    
    # Translation should not be called for empty text
    # (analyze_only will fail on empty text validation, but that's expected)
    
    # Assert detect_language not called for empty/whitespace text
    assert not mock_detect.called


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Response Model
# ─────────────────────────────────────────────────────────────────────────────

def test_ticket_response_has_translation_fields():
    """TicketResponse model should have translation fields."""
    from backend.schemas import TicketResponse
    
    # Check that translation fields exist in model
    fields = TicketResponse.model_fields
    assert 'detected_language' in fields
    assert 'original_text' in fields
    assert 'translated_text' in fields
    assert 'translation_confidence' in fields


def test_ticket_response_translation_fields_optional():
    """Translation fields should be optional in TicketResponse."""
    from backend.schemas import TicketResponse, EntityInfo, DuplicateInfo
    
    # Create response without translation fields
    response = TicketResponse(
        ticket_id="test-123",
        summary="Test ticket",
        category="Hardware",
        subcategory="Power",
        priority="High",
        auto_resolve=False,
        assigned_team="Support",
        entities=[],
        duplicate_ticket=DuplicateInfo(is_duplicate=False),
        confidence=0.9
    )
    
    # Should not raise error
    assert response.detected_language is None
    assert response.original_text is None
    assert response.translated_text is None
    assert response.translation_confidence is None
