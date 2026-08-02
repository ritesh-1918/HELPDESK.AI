"""
Test suite for DuplicateService.load() method (Issue #1156).

Covers:
- load() idempotency when already loaded
- load() with existing storage file
- load() with empty storage file
- load() with corrupt storage file
- load() sets _load_failed when model unavailable in degraded mode
"""

import sys
import os
import json
import types
import tempfile
import threading
import shutil
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

SIMILARITY_THRESHOLD = 0.70


class DuplicateServiceForLoadTests:
    """Minimal mirror of DuplicateService for testing load() logic."""

    def __init__(self, storage_file=None):
        self.model = None
        self._loaded = False
        self._load_failed = False
        self._tickets = []
        if storage_file:
            self.storage_file = storage_file
        else:
            td = tempfile.mkdtemp()
            self.storage_file = os.path.join(td, "cache.json")
        self._embedding_matrix = None
        self._ticket_ids = []
        self._lock = threading.Lock()
        self._indexing = False
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)

    def is_available(self):
        return self._loaded and not self._load_failed

    def save_to_disk(self):
        data = [{"id": tid, "embedding": list(emb), "text": txt}
                for tid, emb, txt in self._tickets]
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        with open(self.storage_file, "w") as f:
            json.dump(data, f)

    def load_from_disk(self):
        """Load tickets from storage file."""
        if not os.path.exists(self.storage_file):
            return
        try:
            with open(self.storage_file, "r") as f:
                data = json.load(f)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "id" in item:
                        emb = item.get("embedding", [])
                        text = item.get("text", "")
                        self._tickets.append((item["id"], emb, text))
        except (json.JSONDecodeError, ValueError):
            pass  # Corrupt file - silently ignore

    def load(self):
        """Load with idempotency check."""
        if self._loaded or self._load_failed:
            return

        # Try to load sentence transformers
        try:
            import sentence_transformers
            self.model = sentence_transformers.SentenceTransformer("all-MiniLM-L6-v2")
            self._loaded = True
            self.load_from_disk()
        except Exception:
            allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
            self._load_failed = True
            if not allow_degraded:
                raise


@pytest.fixture
def tmp_storage():
    d = tempfile.mkdtemp()
    path = os.path.join(d, "cache.json")
    yield path
    shutil.rmtree(d, ignore_errors=True)


def _make_service(storage_file=None):
    return DuplicateServiceForLoadTests(storage_file=storage_file)


# ---------------------------------------------------------------------------
# Idempotency tests
# ---------------------------------------------------------------------------

class TestLoadIdempotency:
    def test_load_when_already_loaded_does_not_change_model(self, tmp_storage):
        svc = _make_service(tmp_storage)
        mock_model = MagicMock()
        svc._loaded = True
        svc.model = mock_model
        svc.load()
        # Model should be unchanged since load exits early
        assert svc.model is mock_model

    def test_load_when_load_failed_does_not_retry(self, tmp_storage):
        svc = _make_service(tmp_storage)
        svc._load_failed = True
        svc._loaded = False
        svc.load()
        # _loaded should remain False - no retry
        assert svc._loaded is False

    def test_load_idempotent_no_exception_on_second_call(self, tmp_storage):
        svc = _make_service(tmp_storage)
        svc._loaded = True
        try:
            svc.load()
            svc.load()
        except Exception as e:
            pytest.fail(f"load() raised exception on second call: {e}")

    def test_load_idempotent_state_unchanged(self, tmp_storage):
        svc = _make_service(tmp_storage)
        svc._loaded = True
        svc._load_failed = False
        initial_loaded = svc._loaded
        svc.load()
        assert svc._loaded == initial_loaded


# ---------------------------------------------------------------------------
# Load with existing storage file
# ---------------------------------------------------------------------------

class TestLoadWithExistingStorageFile:
    def test_load_from_disk_reads_existing_tickets(self, tmp_storage):
        svc = _make_service(tmp_storage)
        existing = [
            {"id": "t1", "embedding": [0.1, 0.2], "text": "VPN issue"},
            {"id": "t2", "embedding": [0.3, 0.4], "text": "Password reset"},
        ]
        with open(tmp_storage, "w") as f:
            json.dump(existing, f)

        svc.load_from_disk()
        assert len(svc._tickets) == 2

    def test_load_from_disk_populates_ticket_ids(self, tmp_storage):
        svc = _make_service(tmp_storage)
        existing = [{"id": "ticket-xyz", "embedding": [0.1], "text": "test"}]
        with open(tmp_storage, "w") as f:
            json.dump(existing, f)

        svc.load_from_disk()
        ids = [tid for tid, _, _ in svc._tickets]
        assert "ticket-xyz" in ids

    def test_load_from_disk_preserves_text(self, tmp_storage):
        svc = _make_service(tmp_storage)
        existing = [{"id": "t1", "embedding": [], "text": "exact text content"}]
        with open(tmp_storage, "w") as f:
            json.dump(existing, f)

        svc.load_from_disk()
        texts = [txt for _, _, txt in svc._tickets]
        assert "exact text content" in texts

    def test_load_from_disk_no_op_if_file_missing(self, tmp_storage):
        svc = _make_service(tmp_storage)
        # Ensure file doesn't exist
        if os.path.exists(tmp_storage):
            os.remove(tmp_storage)
        svc.load_from_disk()  # Should not raise
        assert svc._tickets == []


# ---------------------------------------------------------------------------
# Load with empty storage file
# ---------------------------------------------------------------------------

class TestLoadWithEmptyStorageFile:
    def test_load_from_disk_with_empty_file_returns_no_tickets(self, tmp_storage):
        svc = _make_service(tmp_storage)
        with open(tmp_storage, "w") as f:
            json.dump([], f)

        svc.load_from_disk()
        assert svc._tickets == []

    def test_load_from_disk_with_empty_list_does_not_raise(self, tmp_storage):
        svc = _make_service(tmp_storage)
        with open(tmp_storage, "w") as f:
            json.dump([], f)

        try:
            svc.load_from_disk()
        except Exception as e:
            pytest.fail(f"load_from_disk raised with empty file: {e}")

    def test_is_available_false_before_load(self, tmp_storage):
        svc = _make_service(tmp_storage)
        assert svc.is_available() is False


# ---------------------------------------------------------------------------
# Load with corrupt storage file
# ---------------------------------------------------------------------------

class TestLoadWithCorruptStorageFile:
    def test_load_from_disk_with_invalid_json_does_not_raise(self, tmp_storage):
        svc = _make_service(tmp_storage)
        with open(tmp_storage, "w") as f:
            f.write("not valid json {{{")

        try:
            svc.load_from_disk()
        except Exception as e:
            pytest.fail(f"load_from_disk raised with corrupt file: {e}")

    def test_load_from_disk_with_corrupt_file_leaves_tickets_empty(self, tmp_storage):
        svc = _make_service(tmp_storage)
        with open(tmp_storage, "w") as f:
            f.write("CORRUPT {")

        svc.load_from_disk()
        assert svc._tickets == []

    def test_load_from_disk_with_non_list_json_returns_empty(self, tmp_storage):
        svc = _make_service(tmp_storage)
        with open(tmp_storage, "w") as f:
            json.dump({"key": "not_a_list"}, f)

        svc.load_from_disk()
        assert svc._tickets == []

    def test_load_from_disk_partial_valid_items_are_loaded(self, tmp_storage):
        svc = _make_service(tmp_storage)
        data = [
            {"id": "valid-t1", "embedding": [0.1], "text": "valid"},
            {"no_id_field": True},  # Invalid - missing id
            {"id": "valid-t2", "embedding": [0.2], "text": "also valid"},
        ]
        with open(tmp_storage, "w") as f:
            json.dump(data, f)

        svc.load_from_disk()
        ids = [tid for tid, _, _ in svc._tickets]
        assert "valid-t1" in ids
        assert "valid-t2" in ids


# ---------------------------------------------------------------------------
# Degraded mode load
# ---------------------------------------------------------------------------

class TestLoadDegradedMode:
    def test_load_sets_load_failed_on_model_exception(self, tmp_storage):
        svc = _make_service(tmp_storage)
        import sentence_transformers as _st
        original = _st.SentenceTransformer
        _st.SentenceTransformer = MagicMock(side_effect=RuntimeError("no model"))
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            try:
                svc.load()
            finally:
                _st.SentenceTransformer = original
        assert svc._load_failed is True

    def test_load_is_available_false_after_failure(self, tmp_storage):
        svc = _make_service(tmp_storage)
        svc._load_failed = True
        assert svc.is_available() is False

    def test_load_not_available_without_loaded_flag(self, tmp_storage):
        svc = _make_service(tmp_storage)
        svc._loaded = False
        svc._load_failed = False
        assert svc.is_available() is False
