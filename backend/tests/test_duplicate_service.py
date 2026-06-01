"""
Unit tests for DuplicateService.check_duplicate method (Issue #297).

Covers:
- check_duplicate with empty ticket store
- check_duplicate with stored tickets and cosine-sim matches
- Custom threshold overrides
- Degraded / unavailable model handling
- _build_result helper
- is_available states
- save_to_disk persistence
- add_ticket in both available and degraded modes
- find_semantic_duplicate local fallback
"""

import json
import os
import sys
import tempfile
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# sentence-transformers mock (module not installed in CI)
# ---------------------------------------------------------------------------
_mock_st = MagicMock()
_mock_st.SentenceTransformer = MagicMock()
_mock_st.util = MagicMock()
sys.modules.setdefault("sentence_transformers", _mock_st)

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.services import duplicate_service as dup_mod
from backend.services.duplicate_service import DuplicateService, SIMILARITY_THRESHOLD


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_service(loaded=True, tickets=None):
    """Return a DuplicateService pre-configured for unit testing."""
    svc = DuplicateService()
    svc._loaded = loaded
    svc._load_failed = not loaded
    svc.model = MagicMock()
    svc._tickets = tickets if tickets is not None else []
    return svc


def _fake_embedding(text: str, dim: int = 384):
    """Deterministic pseudo-embedding based on text hash."""
    seed = sum(ord(c) for c in text) % 1000
    return [float((seed + i) % 100) / 100.0 for i in range(dim)]


# ---------------------------------------------------------------------------
# Test classes
# ---------------------------------------------------------------------------

class TestIsAvailable:
    """DuplicateService.is_available() state transitions."""

    def test_available_after_successful_load(self):
        svc = _make_service(loaded=True)
        assert svc.is_available() is True

    def test_unavailable_when_load_failed(self):
        svc = DuplicateService()
        svc._loaded = False
        svc._load_failed = True
        assert svc.is_available() is False

    def test_unavailable_before_load(self):
        svc = DuplicateService()
        assert svc.is_available() is False


class TestBuildResult:
    """DuplicateService._build_result() helper."""

    def test_duplicate_result_structure(self):
        svc = _make_service()
        result = svc._build_result(
            is_duplicate=True,
            duplicate_ticket_id="T-100",
            similarity=0.92,
        )
        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "T-100"
        assert result["parent_ticket_id"] == "T-100"
        assert result["is_potential_duplicate"] is True
        assert result["similarity"] == 0.9200

    def test_non_duplicate_result_structure(self):
        svc = _make_service()
        result = svc._build_result(
            is_duplicate=False,
            duplicate_ticket_id=None,
            similarity=0.35,
        )
        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["parent_ticket_id"] is None
        assert result["is_potential_duplicate"] is False
        assert result["similarity"] == 0.3500

    def test_similarity_is_rounded_to_four_decimals(self):
        svc = _make_service()
        result = svc._build_result(
            is_duplicate=False,
            duplicate_ticket_id=None,
            similarity=0.123456789,
        )
        assert result["similarity"] == 0.1235


class TestCheckDuplicate:
    """DuplicateService.check_duplicate — core detection logic."""

    def test_empty_store_returns_no_match(self):
        svc = _make_service(tickets=[])
        result = svc.check_duplicate("anything")
        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.0

    def test_degraded_mode_returns_no_match(self):
        svc = DuplicateService()
        svc._loaded = False
        svc._load_failed = True
        result = svc.check_duplicate("test")
        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.0

    def test_match_found_above_default_threshold(self):
        """When cosine similarity >= default threshold, flag as duplicate."""
        mock_tensor = MagicMock()
        svc = _make_service(
            tickets=[("T-1", mock_tensor, "original ticket text")]
        )
        svc.model.encode.return_value = mock_tensor

        # cos_sim returning 0.85 (> 0.70 default)
        cosine_result = MagicMock()
        cosine_result.item.return_value = 0.85
        _mock_st.util.cos_sim.return_value = cosine_result

        result = svc.check_duplicate("similar ticket text")
        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "T-1"
        assert result["similarity"] == 0.85

    def test_match_below_default_threshold(self):
        """When cosine similarity < default threshold, not a duplicate."""
        mock_tensor = MagicMock()
        svc = _make_service(
            tickets=[("T-2", mock_tensor, "completely different topic")]
        )
        svc.model.encode.return_value = mock_tensor

        cosine_result = MagicMock()
        cosine_result.item.return_value = 0.40
        _mock_st.util.cos_sim.return_value = cosine_result

        result = svc.check_duplicate("unrelated text")
        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.40

    def test_custom_threshold_overrides_default(self):
        """Passing a custom threshold should change the detection boundary."""
        mock_tensor = MagicMock()
        svc = _make_service(
            tickets=[("T-3", mock_tensor, "some text")]
        )
        svc.model.encode.return_value = mock_tensor

        cosine_result = MagicMock()
        cosine_result.item.return_value = 0.75
        _mock_st.util.cos_sim.return_value = cosine_result

        # Default threshold (0.70) would match, but 0.80 should not
        result = svc.check_duplicate("some text", threshold=0.80)
        assert result["is_duplicate"] is False
        assert result["similarity"] == 0.75

    def test_custom_threshold_matching(self):
        """Lower custom threshold makes matching easier."""
        mock_tensor = MagicMock()
        svc = _make_service(
            tickets=[("T-4", mock_tensor, "text")]
        )
        svc.model.encode.return_value = mock_tensor

        cosine_result = MagicMock()
        cosine_result.item.return_value = 0.55
        _mock_st.util.cos_sim.return_value = cosine_result

        result = svc.check_duplicate("text", threshold=0.50)
        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "T-4"

    def test_picks_best_match_among_multiple_tickets(self):
        """Should return the ticket with the highest similarity score."""
        mock_tensor = MagicMock()
        svc = _make_service(
            tickets=[
                ("T-10", mock_tensor, "low match"),
                ("T-20", mock_tensor, "high match"),
                ("T-30", mock_tensor, "mid match"),
            ]
        )
        svc.model.encode.return_value = mock_tensor

        # Return different scores for each comparison
        scores = [0.50, 0.95, 0.72]
        call_count = {"n": 0}

        def fake_cos_sim(a, b):
            result = MagicMock()
            result.item.return_value = scores[call_count["n"]]
            call_count["n"] += 1
            return result

        _mock_st.util.cos_sim.side_effect = fake_cos_sim

        result = svc.check_duplicate("test query")
        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "T-20"
        assert result["similarity"] == 0.95

    def test_threshold_boundary_exactly_at(self):
        """Score exactly equal to threshold should count as duplicate."""
        mock_tensor = MagicMock()
        svc = _make_service(
            tickets=[("T-50", mock_tensor, "boundary text")]
        )
        svc.model.encode.return_value = mock_tensor

        cosine_result = MagicMock()
        cosine_result.item.return_value = SIMILARITY_THRESHOLD
        _mock_st.util.cos_sim.return_value = cosine_result

        result = svc.check_duplicate("boundary text")
        assert result["is_duplicate"] is True

    def test_threshold_boundary_just_below(self):
        """Score just below threshold should not be a duplicate."""
        mock_tensor = MagicMock()
        svc = _make_service(
            tickets=[("T-51", mock_tensor, "just below")]
        )
        svc.model.encode.return_value = mock_tensor

        cosine_result = MagicMock()
        cosine_result.item.return_value = SIMILARITY_THRESHOLD - 0.001
        _mock_st.util.cos_sim.return_value = cosine_result

        result = svc.check_duplicate("just below")
        assert result["is_duplicate"] is False

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


class TestSaveToDisk:
    """DuplicateService.save_to_disk persistence."""

    def test_creates_new_storage_file(self, tmp_path):
        svc = _make_service()
        svc.storage_file = str(tmp_path / "test_history.json")

        svc.save_to_disk("T-1", "some ticket text")

        with open(svc.storage_file) as f:
            data = json.load(f)
        assert len(data) == 1
        assert data[0]["ticket_id"] == "T-1"
        assert data[0]["text"] == "some ticket text"

    def test_appends_to_existing_file(self, tmp_path):
        svc = _make_service()
        svc.storage_file = str(tmp_path / "test_history.json")

        svc.save_to_disk("T-1", "first")
        svc.save_to_disk("T-2", "second")

        with open(svc.storage_file) as f:
            data = json.load(f)
        assert len(data) == 2
        assert data[1]["ticket_id"] == "T-2"

    def test_handles_corrupt_json_file(self, tmp_path):
        svc = _make_service()
        svc.storage_file = str(tmp_path / "corrupt.json")
        svc.storage_file = str(tmp_path / "corrupt.json")

        # Write invalid JSON
        with open(svc.storage_file, "w") as f:
            f.write("not valid json{{{")

        # Should not raise; should reset and write fresh data
        svc.save_to_disk("T-1", "recovery text")

        with open(svc.storage_file) as f:
            data = json.load(f)
        assert len(data) == 1
        assert data[0]["ticket_id"] == "T-1"


class TestAddTicket:
    """DuplicateService.add_ticket method."""

    @patch.object(DuplicateService, "load")
    @patch.object(DuplicateService, "save_to_disk")
    def test_add_ticket_when_available(self, mock_save, mock_load):
        svc = _make_service(loaded=True)
        mock_embedding = MagicMock()
        svc.model.encode.return_value = mock_embedding

        svc.add_ticket("T-99", "new ticket text")

        assert len(svc._tickets) == 1
        assert svc._tickets[0] == ("T-99", mock_embedding, "new ticket text")
        svc.model.encode.assert_called_once_with("new ticket text", convert_to_tensor=True)
        mock_save.assert_called_once_with("T-99", "new ticket text")

    @patch.object(DuplicateService, "load")
    def test_add_ticket_degraded_skips_embedding(self, mock_load):
        svc = DuplicateService()
        svc._loaded = False
        svc._load_failed = True
        svc.model = MagicMock()

        svc.add_ticket("T-100", "ignored")

        assert len(svc._tickets) == 0
        svc.model.encode.assert_not_called()


class TestFindSemanticDuplicateFallback:
    """find_semantic_duplicate local fallback when Supabase is unavailable."""

    @patch.object(DuplicateService, "generate_embedding", return_value=None)
    @patch.object(DuplicateService, "check_duplicate")
    def test_falls_back_to_local_when_embedding_unavailable(
        self, mock_check, mock_emb
    ):
        mock_check.return_value = {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "similarity": 0.0,
        }
        svc = _make_service()

        result = svc.find_semantic_duplicate("test text")

        mock_check.assert_called_once_with("test text", threshold=SIMILARITY_THRESHOLD)
        assert result["is_duplicate"] is False

    @patch.object(DuplicateService, "generate_embedding", return_value=None)
    @patch.object(DuplicateService, "check_duplicate")
    def test_fallback_populates_parent_and_potential_fields(
        self, mock_check, mock_emb
    ):
        mock_check.return_value = {
            "is_duplicate": True,
            "duplicate_ticket_id": "T-5",
            "similarity": 0.90,
        }
        svc = _make_service()

        result = svc.find_semantic_duplicate("dup text")

        assert result["parent_ticket_id"] == "T-5"
        assert result["is_potential_duplicate"] is True


class TestDefaultThresholdConstant:
    """Verify the module-level threshold constant."""

    def test_threshold_is_070(self):
        assert SIMILARITY_THRESHOLD == 0.70
