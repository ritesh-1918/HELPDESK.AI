"""
Unit tests for Duplicate Detection Service.
Covers model loading, similarity detection, threshold behavior,
ticket storage, and edge cases.
"""

import pytest
import os
import json
import tempfile
from unittest.mock import patch, MagicMock


import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.duplicate_service import DuplicateService, SIMILARITY_THRESHOLD


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def dup_svc():
    """Return a DuplicateService with a temp storage file."""
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = os.path.join(tmpdir, "case_history_cache.json")
        with patch.object(DuplicateService, "__init__", lambda self: None):
            svc = DuplicateService.__new__(DuplicateService)
            svc.model = None
            svc._loaded = False
            svc._load_failed = False
            svc._tickets = []
            svc.storage_file = storage
        yield svc


@pytest.fixture
def loaded_svc(dup_svc):
    """Return a DuplicateService with a mocked loaded model."""
    dup_svc._loaded = True
    dup_svc.model = MagicMock()
    return dup_svc


# ---------------------------------------------------------------------------
# Tests: Initialization
# ---------------------------------------------------------------------------
class TestDuplicateServiceInit:
    def test_default_state(self, dup_svc):
        assert dup_svc._loaded is False
        assert dup_svc._load_failed is False
        assert dup_svc._tickets == []

    def test_is_available_false_when_not_loaded(self, dup_svc):
        assert dup_svc.is_available() is False


# ---------------------------------------------------------------------------
# Tests: Model Loading
# ---------------------------------------------------------------------------
class TestDuplicateServiceLoad:
    def test_load_sets_loaded(self, dup_svc):
        with patch("services.duplicate_service.SentenceTransformer") as mock_st:
            mock_st.return_value = MagicMock()
            dup_svc.load()
            assert dup_svc._loaded is True

    def test_load_from_local_path(self, dup_svc):
        with patch.dict(os.environ, {"SENTENCE_TRANSFORMER_MODEL_PATH": "/fake/model"}):
            with patch("os.path.exists", return_value=True):
                with patch("services.duplicate_service.SentenceTransformer") as mock_st:
                    mock_st.return_value = MagicMock()
                    dup_svc.load()
                    mock_st.assert_called_with("/fake/model")

    def test_load_failure_degraded(self, dup_svc):
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            with patch("services.duplicate_service.SentenceTransformer", side_effect=RuntimeError("OOM")):
                dup_svc.load()
                assert dup_svc._load_failed is True
                assert dup_svc._loaded is False

    def test_skip_if_already_loaded(self, dup_svc):
        dup_svc._loaded = True
        with patch("services.duplicate_service.SentenceTransformer") as mock_st:
            dup_svc.load()
            mock_st.assert_not_called()


# ---------------------------------------------------------------------------
# Tests: check_duplicate
# ---------------------------------------------------------------------------
class TestCheckDuplicate:
    def test_returns_none_when_not_available(self, dup_svc):
        result = dup_svc.check_duplicate("test ticket")
        assert result is None

    def test_returns_none_for_empty_tickets(self, loaded_svc):
        loaded_svc._tickets = []
        result = loaded_svc.check_duplicate("test ticket")
        assert result is None

    def test_detects_duplicate_above_threshold(self, loaded_svc):
        mock_embedding = MagicMock()
        loaded_svc.model.encode.return_value = mock_embedding
        
        # Mock util.cos_sim to return high similarity
        existing_embedding = MagicMock()
        loaded_svc._tickets = [("ticket-1", existing_embedding, "password reset issue")]
        
        with patch("services.duplicate_service.util") as mock_util:
            mock_tensor = MagicMock()
            mock_tensor.item.return_value = 0.85
            mock_util.cos_sim.return_value = [[mock_tensor]]
            
            result = loaded_svc.check_duplicate("I need to reset my password")
            assert result is not None
            assert result["ticket_id"] == "ticket-1"
            assert result["similarity"] == 0.85

    def test_returns_none_below_threshold(self, loaded_svc):
        mock_embedding = MagicMock()
        loaded_svc.model.encode.return_value = mock_embedding
        
        existing_embedding = MagicMock()
        loaded_svc._tickets = [("ticket-1", existing_embedding, "printer not working")]
        
        with patch("services.duplicate_service.util") as mock_util:
            mock_tensor = MagicMock()
            mock_tensor.item.return_value = 0.50
            mock_util.cos_sim.return_value = [[mock_tensor]]
            
            result = loaded_svc.check_duplicate("wifi connection problem")
            assert result is None


# ---------------------------------------------------------------------------
# Tests: save_to_disk
# ---------------------------------------------------------------------------
class TestSaveToDisk:
    def test_creates_file_if_not_exists(self, dup_svc):
        dup_svc.save_to_disk("ticket-1", "test issue")
        assert os.path.exists(dup_svc.storage_file)
        with open(dup_svc.storage_file) as f:
            data = json.load(f)
        assert len(data) == 1
        assert data[0]["ticket_id"] == "ticket-1"
        assert data[0]["text"] == "test issue"

    def test_appends_to_existing(self, dup_svc):
        dup_svc.save_to_disk("t1", "first")
        dup_svc.save_to_disk("t2", "second")
        with open(dup_svc.storage_file) as f:
            data = json.load(f)
        assert len(data) == 2


# ---------------------------------------------------------------------------
# Tests: add_ticket
# ---------------------------------------------------------------------------
class TestAddTicket:
    def test_adds_ticket_to_memory(self, loaded_svc):
        mock_embedding = MagicMock()
        loaded_svc.model.encode.return_value = mock_embedding
        
        loaded_svc.add_ticket("ticket-1", "password reset help")
        assert len(loaded_svc._tickets) == 1
        assert loaded_svc._tickets[0][0] == "ticket-1"
        assert loaded_svc._tickets[0][2] == "password reset help"

    def test_adds_multiple_tickets(self, loaded_svc):
        mock_embedding = MagicMock()
        loaded_svc.model.encode.return_value = mock_embedding
        
        loaded_svc.add_ticket("t1", "first ticket")
        loaded_svc.add_ticket("t2", "second ticket")
        assert len(loaded_svc._tickets) == 2


# ---------------------------------------------------------------------------
# Tests: Similarity threshold
# ---------------------------------------------------------------------------
class TestThreshold:
    def test_default_threshold(self):
        assert SIMILARITY_THRESHOLD == 0.70

    def test_threshold_boundary_exact_match(self, loaded_svc):
        mock_embedding = MagicMock()
        loaded_svc.model.encode.return_value = mock_embedding
        
        existing = MagicMock()
        loaded_svc._tickets = [("t1", existing, "test")]
        
        with patch("services.duplicate_service.util") as mock_util:
            mock_tensor = MagicMock()
            mock_tensor.item.return_value = SIMILARITY_THRESHOLD
            mock_util.cos_sim.return_value = [[mock_tensor]]
            
            result = loaded_svc.check_duplicate("test")
            assert result is not None
