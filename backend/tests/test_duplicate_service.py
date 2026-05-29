"""
Unit tests for DuplicateService check_duplicate method.
Uses mocking to avoid sentence-transformers dependency issues.
"""
import pytest
import sys
import os
from unittest.mock import MagicMock


def setup_mock_imports():
    """Setup mock for sentence_transformers module."""
    mock_st = MagicMock()
    mock_st.SentenceTransformer = MagicMock()
    mock_st.util = MagicMock()
    sys.modules['sentence_transformers'] = mock_st
    return mock_st


class TestCheckDuplicate:
    """Test DuplicateService.check_duplicate method."""

    def setup_method(self):
        """Set up test fixtures."""
        mock_st = setup_mock_imports()
        sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
        from services import duplicate_service
        self.module = duplicate_service
        self.SIMILARITY_THRESHOLD = self.module.SIMILARITY_THRESHOLD
        self.service = self.module.DuplicateService()

    def test_check_duplicate_returns_no_match_when_store_empty(self):
        """When ticket store is empty, should return no duplicate."""
        self.service._tickets = []
        self.service._loaded = True
        self.service._load_failed = False
        self.service.model = MagicMock()

        result = self.service.check_duplicate("Test ticket text")

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.0

    def test_check_duplicate_uses_custom_threshold(self):
        """Custom threshold should override default threshold."""
        self.service._tickets = []
        self.service._loaded = True
        self.service._load_failed = False
        self.service.model = MagicMock()

        result = self.service.check_duplicate("Test text", threshold=0.99)

        assert result["is_duplicate"] is False

    def test_check_duplicate_handles_degraded_mode(self):
        """When model is not available, should return degraded response."""
        self.service._loaded = False
        self.service._load_failed = True

        result = self.service.check_duplicate("Test ticket text")

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.0

    def test_check_duplicate_empty_tickets_list(self):
        """Empty tickets list should return no duplicate."""
        self.service._loaded = True
        self.service._load_failed = False
        self.service._tickets = []
        self.service.model = MagicMock()

        result = self.service.check_duplicate("Some text")

        assert result["is_duplicate"] is False
        assert result["similarity"] == 0.0

    def test_check_duplicate_vectorized_matches_best(self):
        """Should correctly find duplicate when tickets exist in store."""
        mock_torch = MagicMock()
        sys.modules['torch'] = mock_torch

        self.service._loaded = True
        self.service._load_failed = False
        
        self.service.model = MagicMock()
        self.service.model.encode.return_value = MagicMock()
        
        self.service._tickets = [
            ("T-1", MagicMock(), "orthogonal"),
            ("T-2", MagicMock(), "identical"),
            ("T-3", MagicMock(), "close")
        ]
        
        mock_score_tensor = MagicMock()
        mock_score_tensor.item.return_value = 0.95
        
        mock_index_tensor = MagicMock()
        mock_index_tensor.item.return_value = 1
        
        mock_torch.max.return_value = (mock_score_tensor, mock_index_tensor)
        
        result = self.service.check_duplicate("identical text")
        
        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "T-2"
        assert result["similarity"] == 0.95


if __name__ == "__main__":
    pytest.main([__file__, "-v"])