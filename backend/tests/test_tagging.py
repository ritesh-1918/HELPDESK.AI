import pytest
from backend.services.tag_suggestion_service import TagSuggestionService

def test_suggest_tags_basic_keywords():
    service = TagSuggestionService(ner_service=None)
    tags = service.suggest_tags("Cannot connect to wifi", "My wifi is down in the office.")
    assert "wifi" in tags

def test_suggest_tags_database_error():
    service = TagSuggestionService(ner_service=None)
    tags = service.suggest_tags("Database connection timeout", "The postgres db is rejecting connections.")
    assert "database" in tags
    assert "timeout" in tags

def test_suggest_tags_with_comments():
    service = TagSuggestionService(ner_service=None)
    tags = service.suggest_tags(
        title="Printer not working", 
        description="The printer on the 3rd floor is jammed.", 
        comments=["Also there is a paper jam.", "The hardware is old."]
    )
    assert "printer" in tags
    assert "hardware" in tags

def test_suggest_tags_empty():
    service = TagSuggestionService(ner_service=None)
    tags = service.suggest_tags("Hello", "How are you doing today?")
    # No technical keywords should be found
    assert len(tags) == 0

class MockNERService:
    def extract_entities(self, text):
        if "slack" in text.lower():
            return [{"text": "slack", "type": "APPLICATION"}]
        return []

def test_suggest_tags_with_ner():
    mock_ner = MockNERService()
    service = TagSuggestionService(ner_service=mock_ner)
    tags = service.suggest_tags("Slack is down", "We cannot send messages.")
    assert "slack" in tags
    assert "collaboration" in tags # from keywords mapping
