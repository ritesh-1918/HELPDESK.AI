"""
Unit tests for DuplicateService (backend/services/duplicate_service.py).

Tests cover:
- check_duplicate: empty store returns no match
- check_duplicate: custom threshold override
- check_duplicate: degraded mode when model is unavailable
- check_duplicate: with stored tickets and varying similarity
- add_ticket: degraded mode skips embedding
- save_to_disk: persistence behavior
"""

import os
import json
import pytest
from unittest.mock import patch, MagicMock


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_model():
    """Return a MagicMock SentenceTransformer model."""
    model = MagicMock()
    # encode returns a tensor-like object
    import torch
    model.encode = MagicMock(side_effect=lambda text, convert_to_tensor=True: torch.randn(384))
    return model


@pytest.fixture
def service():
    """Create a fresh DuplicateService instance."""
    from services.duplicate_service import DuplicateService
    return DuplicateService()


@pytest.fixture
def service_with_model(service, mock_model):
    """Create a DuplicateService with model pre-loaded."""
    service.model = mock_model
    service._loaded = True
    service._load_failed = False
    return service


# ── check_duplicate tests ─────────────────────────────────────────────────────

class TestCheckDuplicate:
    def test_empty_store_returns_no_match(self, service):
        """With no stored tickets, should always return is_duplicate=False."""
        # Force model unavailable to avoid actual model loading
        service._load_failed = True

        result = service.check_duplicate("some ticket text")

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.0

    def test_degraded_mode_returns_no_duplicate(self, service):
        """When model is unavailable, should return no duplicate (degraded mode)."""
        service._loaded = False
        service._load_failed = True

        result = service.check_duplicate("any text")

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.0

    def test_custom_threshold_override(self, service_with_model):
        """Custom threshold should override the default SIMILARITY_THRESHOLD."""
        import torch
        svc = service_with_model

        # Add a ticket with known embedding
        fixed_emb = torch.ones(384)
        svc.model.encode = MagicMock(return_value=fixed_emb)
        svc._tickets = [("t1", fixed_emb, "stored text")]

        # Query with same embedding → similarity = 1.0
        # Default threshold is 0.70, custom 0.99 should still match
        result = svc.check_duplicate("stored text", threshold=0.99)
        assert result["is_duplicate"] is True

        # Very high custom threshold should NOT match
        result2 = svc.check_duplicate("stored text", threshold=1.01)
        assert result2["is_duplicate"] is False

    def test_empty_store_with_available_model(self, service_with_model):
        """With model available but no tickets, should return no match."""
        svc = service_with_model
        svc._tickets = []

        result = svc.check_duplicate("some text")

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.0

    def test_similarity_below_threshold(self, service_with_model):
        """Tickets with similarity below threshold should not be flagged as duplicates."""
        import torch
        svc = service_with_model

        # Create two very different embeddings
        emb1 = torch.zeros(384)
        emb1[0] = 1.0
        emb2 = torch.zeros(384)
        emb2[-1] = 1.0

        svc._tickets = [("t1", emb1, "completely different text")]

        # Mock encode to return the second embedding
        svc.model.encode = MagicMock(return_value=emb2)

        result = svc.check_duplicate("new ticket text")

        # Orthogonal vectors → similarity ≈ 0.0
        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None

    def test_similarity_above_threshold(self, service_with_model):
        """Tickets with similarity above threshold should be flagged as duplicates."""
        import torch
        svc = service_with_model

        # Same embedding → similarity = 1.0
        emb = torch.ones(384)
        svc._tickets = [("t1", emb, "same text")]

        svc.model.encode = MagicMock(return_value=emb)

        result = svc.check_duplicate("same text")

        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "t1"
        assert result["similarity"] == 1.0

    def test_returns_best_match(self, service_with_model):
        """Should return the ticket with highest similarity."""
        import torch
        svc = service_with_model

        emb_low = torch.zeros(384)
        emb_low[0] = 0.1
        emb_high = torch.ones(384)

        svc._tickets = [
            ("t-low", emb_low, "low similarity"),
            ("t-high", emb_high, "high similarity"),
        ]

        svc.model.encode = MagicMock(return_value=emb_high)

        result = svc.check_duplicate("high similarity")

        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "t-high"


# ── add_ticket tests ─────────────────────────────────────────────────────────

class TestAddTicket:
    def test_add_ticket_degraded_mode(self, service):
        """In degraded mode, add_ticket should skip embedding and not crash."""
        service._loaded = False
        service._load_failed = True

        # Should not raise
        service.add_ticket("t1", "some text")

        # Ticket should NOT be added to in-memory store
        assert len(service._tickets) == 0

    def test_add_ticket_success(self, service_with_model, tmp_path):
        """Normal mode should add ticket to memory and save to disk."""
        import torch
        svc = service_with_model
        svc.storage_file = str(tmp_path / "test_cache.json")
        svc.model.encode = MagicMock(return_value=torch.ones(384))

        svc.add_ticket("t1", "test ticket text")

        assert len(svc._tickets) == 1
        assert svc._tickets[0][0] == "t1"


# ── save_to_disk tests ────────────────────────────────────────────────────────

class TestSaveToDisk:
    def test_save_creates_file(self, service, tmp_path):
        """save_to_disk should create the JSON file if it doesn't exist."""
        service.storage_file = str(tmp_path / "new_cache.json")

        service.save_to_disk("t1", "test text")

        assert os.path.exists(service.storage_file)
        with open(service.storage_file) as f:
            data = json.load(f)
        assert len(data) == 1
        assert data[0]["ticket_id"] == "t1"

    def test_save_appends_to_existing(self, service, tmp_path):
        """save_to_disk should append to existing file, not overwrite."""
        service.storage_file = str(tmp_path / "cache.json")

        service.save_to_disk("t1", "text 1")
        service.save_to_disk("t2", "text 2")

        with open(service.storage_file) as f:
            data = json.load(f)
        assert len(data) == 2
        assert data[0]["ticket_id"] == "t1"
        assert data[1]["ticket_id"] == "t2"

    def test_save_handles_corrupt_file(self, service, tmp_path):
        """Corrupt JSON file should be reset to empty list."""
        service.storage_file = str(tmp_path / "corrupt.json")

        # Write corrupt data
        with open(service.storage_file, "w") as f:
            f.write("not valid json{")

        service.save_to_disk("t1", "test")

        with open(service.storage_file) as f:
            data = json.load(f)
        assert len(data) == 1
