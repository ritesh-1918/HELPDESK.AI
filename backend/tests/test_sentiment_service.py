"""
Unit tests for sentiment_service.py
Run: pytest tests/test_sentiment_service.py -v
Issue #775
"""

from unittest.mock import MagicMock, patch

from sentiment_service import ESCALATION_MAP, FRUSTRATION_LEVELS, should_auto_escalate


class TestShouldAutoEscalate:
    def test_high_frustration_low_priority_escalates(self):
        escalate, new_priority = should_auto_escalate("high", "low")
        assert escalate is True
        assert new_priority == "medium"

    def test_critical_frustration_medium_priority_escalates(self):
        escalate, new_priority = should_auto_escalate("critical", "medium")
        assert escalate is True
        assert new_priority == "high"

    def test_neutral_frustration_no_escalation(self):
        escalate, new_priority = should_auto_escalate("neutral", "low")
        assert escalate is False
        assert new_priority == "low"

    def test_mild_frustration_no_escalation(self):
        escalate, new_priority = should_auto_escalate("mild", "medium")
        assert escalate is False
        assert new_priority == "medium"

    def test_moderate_frustration_no_escalation(self):
        escalate, new_priority = should_auto_escalate("moderate", "high")
        assert escalate is False
        assert new_priority == "high"

    def test_critical_already_critical_no_change(self):
        escalate, new_priority = should_auto_escalate("critical", "critical")
        assert escalate is False
        assert new_priority == "critical"

    def test_high_frustration_high_priority_escalates_to_critical(self):
        escalate, new_priority = should_auto_escalate("high", "high")
        assert escalate is True
        assert new_priority == "critical"

    def test_empty_strings_dont_crash(self):
        escalate, new_priority = should_auto_escalate("", "")
        assert isinstance(escalate, bool)
        assert isinstance(new_priority, str)

    def test_unknown_frustration_level_no_escalation(self):
        escalate, new_priority = should_auto_escalate("unknown_level", "low")
        assert escalate is False
        assert new_priority == "low"

    def test_returns_tuple(self):
        result = should_auto_escalate("high", "medium")
        assert isinstance(result, tuple)
        assert len(result) == 2


class TestConstants:
    def test_all_five_levels_defined(self):
        assert len(FRUSTRATION_LEVELS) == 5
        for level in ["neutral", "mild", "moderate", "high", "critical"]:
            assert level in FRUSTRATION_LEVELS

    def test_escalation_map_covers_all_priorities(self):
        for priority in ["low", "medium", "high", "critical"]:
            assert priority in ESCALATION_MAP

    def test_escalation_never_goes_below_critical(self):
        assert ESCALATION_MAP["critical"] == "critical"

    def test_escalation_is_always_one_step_up(self):
        assert ESCALATION_MAP["low"] == "medium"
        assert ESCALATION_MAP["medium"] == "high"
        assert ESCALATION_MAP["high"] == "critical"


class TestAnalyzeSentiment:
    @patch("sentiment_service._gemini")
    def test_valid_response_parsed_correctly(self, mock_gemini):
        mock_gemini.generate_content.return_value.text = '''{
            "sentiment_score": -0.8,
            "frustration_level": "high",
            "detected_signals": ["repeated complaint", "all caps"],
            "recommended_action": "escalate-immediately",
            "confidence": 0.9
        }'''

        from sentiment_service import analyze_sentiment

        result = analyze_sentiment("STILL BROKEN", "This is the 5th time!")
        assert result["frustration_level"] == "high"
        assert result["sentiment_score"] == -0.8

    @patch("sentiment_service._gemini")
    def test_gemini_failure_returns_neutral(self, mock_gemini):
        mock_gemini.generate_content.side_effect = Exception("API Error")

        from sentiment_service import analyze_sentiment

        result = analyze_sentiment("My printer", "It won't print")
        assert result["frustration_level"] == "neutral"
        assert result["sentiment_score"] == 0.0

    @patch("sentiment_service._gemini")
    def test_invalid_json_returns_neutral(self, mock_gemini):
        mock_gemini.generate_content.return_value.text = "not json at all"

        from sentiment_service import analyze_sentiment

        result = analyze_sentiment("title", "body")
        assert result["frustration_level"] == "neutral"

    def test_empty_inputs_return_neutral(self):
        from sentiment_service import analyze_sentiment

        result = analyze_sentiment("", "")
        assert result["frustration_level"] == "neutral"
        assert result["sentiment_score"] == 0.0

    @patch("sentiment_service._gemini")
    def test_score_clamped_to_minus1_to_plus1(self, mock_gemini):
        mock_gemini.generate_content.return_value.text = '''{
            "sentiment_score": -99.0,
            "frustration_level": "critical",
            "detected_signals": [],
            "recommended_action": "escalate-immediately",
            "confidence": 1.0
        }'''

        from sentiment_service import analyze_sentiment

        result = analyze_sentiment("title", "body")
        assert result["sentiment_score"] >= -1.0

    @patch("sentiment_service._gemini")
    def test_invalid_frustration_level_defaults_to_neutral(self, mock_gemini):
        mock_gemini.generate_content.return_value.text = '''{
            "sentiment_score": -0.5,
            "frustration_level": "EXTREMELY_ANGRY",
            "detected_signals": [],
            "recommended_action": "standard",
            "confidence": 0.7
        }'''

        from sentiment_service import analyze_sentiment

        result = analyze_sentiment("title", "body")
        assert result["frustration_level"] == "neutral"

    @patch("sentiment_service._gemini")
    def test_max_4_signals_returned(self, mock_gemini):
        mock_gemini.generate_content.return_value.text = '''{
            "sentiment_score": -0.6,
            "frustration_level": "high",
            "detected_signals": ["a","b","c","d","e","f"],
            "recommended_action": "prioritize",
            "confidence": 0.8
        }'''

        from sentiment_service import analyze_sentiment

        result = analyze_sentiment("title", "body")
        assert len(result["detected_signals"]) <= 4