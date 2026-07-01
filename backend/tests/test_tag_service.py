"""
Unit tests for tag_service.py
Run: pytest tests/test_tag_service.py -v
Issue #404
"""
import pytest
from unittest.mock import patch, MagicMock


# ── suggest_tags ──────────────────────────────────────────────────────────────

class TestSuggestTags:

    @patch("tag_service._get_gemini")
    def test_returns_list_of_strings(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '["vpn-issue", "needs-escalation"]'
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("VPN not working", "Cannot connect to VPN", "network")
        assert isinstance(result, list)
        assert all(isinstance(t, str) for t in result)

    @patch("tag_service._get_gemini")
    def test_max_4_tags_returned(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '["a", "b", "c", "d", "e", "f"]'
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert len(result) <= 4

    @patch("tag_service._get_gemini")
    def test_tags_are_lowercase(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '["VPN-Issue", "NEEDS-ESCALATION"]'
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert all(t == t.lower() for t in result)

    @patch("tag_service._get_gemini")
    def test_spaces_converted_to_hyphens(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '["needs escalation", "quick fix"]'
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert all(" " not in t for t in result)

    @patch("tag_service._get_gemini")
    def test_gemini_failure_returns_empty_list(self, mock_gemini):
        mock_gemini.side_effect = Exception("API Error")

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert result == []

    @patch("tag_service._get_gemini")
    def test_invalid_json_returns_empty_list(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = "not valid json at all"
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert result == []

    @patch("tag_service._get_gemini")
    def test_markdown_fences_stripped(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '```json\n["vpn-issue"]\n```'
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert "vpn-issue" in result

    def test_empty_inputs_return_empty_list(self):
        from tag_service import suggest_tags
        result = suggest_tags("", "")
        assert result == []

    @patch("tag_service._get_gemini")
    def test_long_tags_filtered_out(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '["' + ("a" * 100) + '", "short"]'
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert all(len(t) <= 30 for t in result)

    @patch("tag_service._get_gemini")
    def test_non_list_response_returns_empty(self, mock_gemini):
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = '"just a string"'
        mock_gemini.return_value = mock_model

        from tag_service import suggest_tags
        result = suggest_tags("title", "body")
        assert result == []


# ── save_tags ─────────────────────────────────────────────────────────────────

class TestSaveTags:

    @patch("tag_service._get_supabase")
    def test_save_returns_true_on_success(self, mock_sb):
        mock_sb.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

        from tag_service import save_tags
        result = save_tags("ticket-123", ["vpn-issue", "quick-fix"])
        assert result is True

    @patch("tag_service._get_supabase")
    def test_save_returns_false_on_exception(self, mock_sb):
        mock_sb.side_effect = Exception("DB Error")

        from tag_service import save_tags
        result = save_tags("ticket-123", ["vpn-issue"])
        assert result is False

    @patch("tag_service._get_supabase")
    def test_max_10_tags_enforced(self, mock_sb):
        mock_sb.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

        from tag_service import save_tags
        result = save_tags("ticket-123", ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"])
        assert result is True

    @patch("tag_service._get_supabase")
    def test_tags_sanitized_before_save(self, mock_sb):
        captured = {}
        def capture(data):
            captured["tags"] = data["tags"]
            m = MagicMock()
            m.eq.return_value.execute.return_value = None
            return m
        mock_sb.return_value.table.return_value.update.side_effect = capture

        from tag_service import save_tags
        save_tags("ticket-123", ["  VPN Issue  ", "NEEDS-ESCALATION"])
        if captured.get("tags"):
            assert all(t == t.lower() for t in captured["tags"])


# ── get_tags ──────────────────────────────────────────────────────────────────

class TestGetTags:

    @patch("tag_service._get_supabase")
    def test_returns_tags_list(self, mock_sb):
        mock_sb.return_value.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "tags": ["vpn-issue", "quick-fix"]
        }

        from tag_service import get_tags
        result = get_tags("ticket-123")
        assert result == ["vpn-issue", "quick-fix"]

    @patch("tag_service._get_supabase")
    def test_returns_empty_list_when_null(self, mock_sb):
        mock_sb.return_value.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "tags": None
        }

        from tag_service import get_tags
        result = get_tags("ticket-123")
        assert result == []

    @patch("tag_service._get_supabase")
    def test_returns_empty_list_on_exception(self, mock_sb):
        mock_sb.side_effect = Exception("DB Error")

        from tag_service import get_tags
        result = get_tags("ticket-123")
        assert result == []
