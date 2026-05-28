"""Unit tests for DuplicateService.

Tests are designed to work without a real sentence-transformers model by
mocking the model loading and encoding. This avoids downloading model
artifacts in CI/test environments.
"""

import sys
import json
import os
import tempfile
from unittest.mock import MagicMock, patch, PropertyMock

# Mock sentence_transformers BEFORE importing the service module
# Prevents ModuleNotFoundError when sentence-transformers is not installed
sys.modules["sentence_transformers"] = MagicMock()
sys.modules["sentence_transformers.util"] = MagicMock()

# Ensure the backend directory is on sys.path for service imports
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, os.path.abspath(BACKEND_DIR))

from services.duplicate_service import DuplicateService, SIMILARITY_THRESHOLD


class TestDuplicateService:
    """Tests for the DuplicateService class."""

    def setup_method(self):
        """Create a fresh service instance per test with a temp storage file."""
        self.temp_dir = tempfile.mkdtemp()
        self.storage_path = os.path.join(self.temp_dir, "test_cache.json")
        self.service = DuplicateService()
        self.service.storage_file = self.storage_path
        # Override to avoid the real model load path
        self.service._loaded = True
        self.service._load_failed = False
        self.service.model = MagicMock()

    def teardown_method(self):
        """Clean up temp files."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    # ── is_available ──────────────────────────────────────────────

    def test_is_available_true_when_loaded(self):
        """is_available returns True when model is loaded successfully."""
        assert self.service.is_available() is True

    def test_is_available_false_when_not_loaded(self):
        """is_available returns False when model failed to load."""
        self.service._loaded = False
        self.service._load_failed = True
        assert self.service.is_available() is False

    def test_is_available_false_when_load_failed(self):
        """is_available returns False when _load_failed is True."""
        self.service._loaded = True
        self.service._load_failed = True
        assert self.service.is_available() is False

    # ── check_duplicate (model available) ────────────────────────

    def test_check_duplicate_no_tickets_stored(self):
        """Returns no duplicate when no tickets exist."""
        self.service._tickets = []
        result = self.service.check_duplicate("Some text")
        assert result == {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "similarity": 0.0,
        }

    def test_check_duplicate_below_threshold(self):
        """Returns no duplicate when similarity below threshold."""
        mock_emb = MagicMock()
        self.service.model.encode.return_value = mock_emb
        self.service._tickets = [("id-1", MagicMock(), "Stored ticket text")]

        with patch("services.duplicate_service.util.cos_sim") as mock_cos:
            mock_cos.return_value.item.return_value = 0.3
            result = self.service.check_duplicate("New ticket text")

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None
        assert result["similarity"] == 0.3

    def test_check_duplicate_above_threshold(self):
        """Returns duplicate when similarity above threshold."""
        self.service.model.encode.return_value = MagicMock()
        self.service._tickets = [("dup-id-123", MagicMock(), "Original ticket")]

        with patch("services.duplicate_service.util.cos_sim") as mock_cos:
            mock_cos.return_value.item.return_value = 0.85
            result = self.service.check_duplicate("Similar ticket text")

        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "dup-id-123"
        assert result["similarity"] == 0.85

    def test_check_duplicate_custom_threshold(self):
        """Uses custom threshold when provided."""
        self.service.model.encode.return_value = MagicMock()
        self.service._tickets = [("id-2", MagicMock(), "Some text")]

        with patch("services.duplicate_service.util.cos_sim") as mock_cos:
            mock_cos.return_value.item.return_value = 0.6
            # Default threshold is 0.70, but we pass 0.5 -> should be duplicate
            result = self.service.check_duplicate("New text", threshold=0.5)

        assert result["is_duplicate"] is True

    def test_check_duplicate_picks_highest_score(self):
        """Returns the highest scoring duplicate among stored tickets."""
        self.service.model.encode.return_value = MagicMock()
        self.service._tickets = [
            ("low-match", MagicMock(), "Unrelated ticket"),
            ("high-match", MagicMock(), "Very similar ticket"),
        ]

        with patch("services.duplicate_service.util.cos_sim") as mock_cos:
            # cos_sim called for each stored ticket - return increasing scores
            mock_cos.return_value.item.side_effect = [0.2, 0.92]
            result = self.service.check_duplicate("Customer query text")

        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "high-match"

    # ── check_duplicate (degraded / no model) ────────────────────

    def test_check_duplicate_degraded_no_model(self):
        """Returns no duplicate when model is not available (degraded mode)."""
        self.service._loaded = False
        self.service._load_failed = True
        self.service.model = None
        result = self.service.check_duplicate("Some text")
        assert result == {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "similarity": 0.0,
        }

    # ── add_ticket ───────────────────────────────────────────────

    def test_add_ticket_appends_to_store(self):
        """add_ticket appends the embedding and persists to disk."""
        mock_emb = MagicMock()
        self.service.model.encode.return_value = mock_emb
        self.service._tickets = []
        self.service.save_to_disk = MagicMock()

        self.service.add_ticket("ticket-abc", "Customer issue description")

        assert len(self.service._tickets) == 1
        ticket_id, emb, text = self.service._tickets[0]
        assert ticket_id == "ticket-abc"
        assert emb is mock_emb
        assert text == "Customer issue description"
        self.service.save_to_disk.assert_called_once_with(
            "ticket-abc", "Customer issue description"
        )

    def test_add_ticket_degraded(self):
        """add_ticket skips embedding when model is unavailable."""
        self.service._loaded = False
        self.service._load_failed = True
        self.service.model = None
        self.service._tickets = []
        self.service.save_to_disk = MagicMock()

        self.service.add_ticket("ticket-xyz", "Some text")

        assert len(self.service._tickets) == 0
        self.service.save_to_disk.assert_not_called()

    def test_add_ticket_triggers_load(self):
        """add_ticket calls load() before encoding."""
        with patch.object(self.service, "load") as mock_load:
            self.service.model.encode.return_value = MagicMock()
            self.service.save_to_disk = MagicMock()
            self.service.add_ticket("t-1", "Text")
            mock_load.assert_called_once()

    # ── save_to_disk ─────────────────────────────────────────────

    def test_save_to_disk_creates_file(self):
        """save_to_disk writes ticket data to JSON file."""
        self.service.save_to_disk("t-1", "Issue text")

        assert os.path.exists(self.storage_path)
        with open(self.storage_path) as f:
            data = json.load(f)
        assert data == [{"ticket_id": "t-1", "text": "Issue text"}]

    def test_save_to_disk_appends_existing(self):
        """save_to_disk appends to existing JSON file."""
        with open(self.storage_path, "w") as f:
            json.dump([{"ticket_id": "t-1", "text": "First"}], f)

        self.service.save_to_disk("t-2", "Second")

        with open(self.storage_path) as f:
            data = json.load(f)
        assert len(data) == 2
        assert data[1] == {"ticket_id": "t-2", "text": "Second"}

    def test_save_to_disk_handles_corrupt_file(self):
        """save_to_disk handles a corrupt JSON file gracefully."""
        with open(self.storage_path, "w") as f:
            f.write("not valid json")

        self.service.save_to_disk("t-1", "New data")

        with open(self.storage_path) as f:
            data = json.load(f)
        assert data == [{"ticket_id": "t-1", "text": "New data"}]

    # ── load ──────────────────────────────────────────────────────

    @patch("services.duplicate_service.SentenceTransformer")
    def test_load_downloads_model(self, mock_st):
        """load downloads the default HuggingFace model when no local path set."""
        self.service._loaded = False
        self.service._load_failed = False

        with patch.dict(os.environ, {}, clear=True):
            self.service.load()

        mock_st.assert_called_once_with("all-MiniLM-L6-v2")
        assert self.service._loaded is True

    @patch("services.duplicate_service.SentenceTransformer")
    def test_load_local_path(self, mock_st):
        """load uses a local model path when env var is set."""
        self.service._loaded = False
        self.service._load_failed = False
        local_path = "/tmp/fake-model-path"
        os.makedirs(local_path, exist_ok=True)

        try:
            with patch.dict(os.environ,
                            {"SENTENCE_TRANSFORMER_MODEL_PATH": local_path}):
                self.service.load()
            mock_st.assert_called_once_with(local_path)
        finally:
            os.rmdir(local_path)

    @patch("services.duplicate_service.SentenceTransformer",
           side_effect=Exception("Download failed"))
    def test_load_failure_allowed_degraded(self, mock_st):
        """load doesn't raise when ALLOW_DEGRADED_STARTUP=1."""
        self.service._loaded = False
        self.service._load_failed = False

        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            self.service.load()  # Should not raise

        assert self.service.is_available() is False
        assert self.service._load_failed is True

    @patch("services.duplicate_service.SentenceTransformer",
           side_effect=Exception("Download failed"))
    def test_load_failure_strict_raises(self, mock_st):
        """load raises when ALLOW_DEGRADED_STARTUP is not set."""
        self.service._loaded = False
        self.service._load_failed = False

        import pytest
        with pytest.raises(Exception, match="Download failed"):
            self.service.load()

    def test_load_is_idempotent(self):
        """load does nothing if already loaded."""
        self.service._loaded = True
        with patch.object(self.service.model, "encode") as mock_encode:
            self.service.load()
            mock_encode.assert_not_called()

    # ── Edge cases ────────────────────────────────────────────────

    def test_check_duplicate_empty_string(self):
        """Handles empty string gracefully."""
        self.service.model.encode.return_value = MagicMock()
        self.service._tickets = [("id-1", MagicMock(), "Something")]

        with patch("services.duplicate_service.util.cos_sim") as mock_cos:
            mock_cos.return_value.item.return_value = 0.0
            result = self.service.check_duplicate("")

        assert result["is_duplicate"] is False
        assert result["similarity"] == 0.0

    def test_check_duplicate_exact_at_threshold(self):
        """Exact match at threshold boundary is considered duplicate."""
        self.service.model.encode.return_value = MagicMock()
        self.service._tickets = [("id-1", MagicMock(), "Text")]

        with patch("services.duplicate_service.util.cos_sim") as mock_cos:
            mock_cos.return_value.item.return_value = SIMILARITY_THRESHOLD
            result = self.service.check_duplicate("Text")

        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "id-1"
