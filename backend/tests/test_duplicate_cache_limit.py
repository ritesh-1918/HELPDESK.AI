"""
Tests for backend/services/duplicate_service.py — cache limits, atomic writes,
concurrency, load paths, and error handling.
"""

import json
import threading
from pathlib import Path
from types import SimpleNamespace

import pytest

# ─── Module load with skip guard ─────────────────────────────────────────────
# FIX 1+2: walk-up path resolution; skip if file absent.

def _find_service() -> Path | None:
    here = Path(__file__).resolve().parent
    while True:
        candidate = here / "services" / "duplicate_service.py"
        if candidate.exists():
            return candidate
        parent = here.parent
        if parent == here:
            return None
        here = parent

_MODULE_PATH = _find_service()
if _MODULE_PATH is None:
    pytest.skip("duplicate_service.py not found", allow_module_level=True)

import importlib.util
_SPEC = importlib.util.spec_from_file_location(
    "duplicate_service_under_test", _MODULE_PATH
)
duplicate_module = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(duplicate_module)
DuplicateService = duplicate_module.DuplicateService


# ─── Fixtures ─────────────────────────────────────────────────────────────────
# FIX 11: _FakeModel/_FakeEmbedding as fixtures, not module-level shared state.

class _FakeEmbedding:
    def astype(self, *_a, **_kw):
        return self


@pytest.fixture()
def fake_model():
    class _FakeModel:
        def __init__(self):
            self.encoded_texts = []
        def encode(self, text, **_kw):
            self.encoded_texts.append(text)
            return _FakeEmbedding()
    return _FakeModel()


@pytest.fixture()
def service(tmp_path):
    svc = DuplicateService()
    svc.storage_file = str(tmp_path / "cache.json")
    return svc


# ─── save_to_disk: cache limit ────────────────────────────────────────────────

def test_save_keeps_most_recent_entries(tmp_path, monkeypatch):
    monkeypatch.setattr(duplicate_module, "MAX_CACHE_ENTRIES", 2)
    f = tmp_path / "cache.json"
    f.write_text(json.dumps([
        {"ticket_id": "old-1", "text": "old one"},
        {"ticket_id": "old-2", "text": "old two"},
    ]))
    svc = DuplicateService()
    svc.storage_file = str(f)
    svc.save_to_disk("new-3", "new three")
    saved = json.loads(f.read_text())
    # FIX 6: check set membership + length, not exact ordered list.
    assert len(saved) == 2
    ids = {e["ticket_id"] for e in saved}
    assert "old-1" not in ids
    assert {"old-2", "new-3"} == ids


# ─── save_to_disk: atomic replace ────────────────────────────────────────────

def test_save_uses_atomic_replace(tmp_path, monkeypatch, service):
    replace_calls = []
    real_replace = duplicate_module.os.replace

    def tracking_replace(src, dst):
        replace_calls.append((Path(src), Path(dst)))
        real_replace(src, dst)

    monkeypatch.setattr(duplicate_module.os, "replace", tracking_replace)
    service.save_to_disk("t1", "text one")

    # FIX 12: assert at least one call, not index [0] blindly.
    assert replace_calls, "os.replace was never called — write may not be atomic"
    tmp_used, dest = replace_calls[-1]
    assert tmp_used.suffix == ".tmp"
    assert dest == Path(service.storage_file)
    assert json.loads(Path(service.storage_file).read_text()) == [
        {"ticket_id": "t1", "text": "text one"}
    ]


# ─── save_to_disk: missing parent dir ────────────────────────────────────────
# FIX 8: parent dir does not exist yet.

def test_save_creates_parent_directory(tmp_path):
    p = tmp_path / "new_dir" / "cache.json"
    svc = DuplicateService()
    svc.storage_file = str(p)
    svc.save_to_disk("t1", "hello")
    assert p.exists()


# ─── save_to_disk: concurrency ───────────────────────────────────────────────
# FIX 3+4: monkeypatch limit to > thread count; assert entry shape.

def test_concurrent_save_preserves_valid_json(tmp_path, monkeypatch):
    monkeypatch.setattr(duplicate_module, "MAX_CACHE_ENTRIES", 50)
    svc = DuplicateService()
    svc.storage_file = str(tmp_path / "cache.json")
    errors = []

    def save(i):
        try:
            svc.save_to_disk(f"ticket-{i}", f"text {i}")
        except Exception as exc:
            errors.append(exc)

    threads = [threading.Thread(target=save, args=(i,)) for i in range(20)]
    for t in threads: t.start()
    for t in threads: t.join()

    assert errors == []
    saved = json.loads(Path(svc.storage_file).read_text())
    assert len(saved) == 20
    assert {e["ticket_id"] for e in saved} == {f"ticket-{i}" for i in range(20)}
    # FIX 4: every entry has required keys.
    for entry in saved:
        assert "ticket_id" in entry and "text" in entry


# ─── load: cache limit + encoding ────────────────────────────────────────────
# FIX 7: use set comparison for encoded_texts, not ordered list.

def test_load_reencodes_only_most_recent(tmp_path, monkeypatch, fake_model):
    monkeypatch.setattr(duplicate_module, "MAX_CACHE_ENTRIES", 2)
    monkeypatch.setattr(duplicate_module, "_HAS_SENTENCE", True)
    monkeypatch.setattr(duplicate_module, "np", SimpleNamespace(float32="float32"))
    monkeypatch.setattr(
        duplicate_module, "SentenceTransformer", lambda *_a, **_kw: fake_model
    )
    f = tmp_path / "cache.json"
    f.write_text(json.dumps([
        {"ticket_id": "old-1", "text": "old one"},
        {"ticket_id": "old-2", "text": "old two"},
        {"ticket_id": "new-3", "text": "new three"},
    ]))
    svc = DuplicateService()
    svc.storage_file = str(f)
    svc.load()

    # FIX 7: order-insensitive check.
    assert set(fake_model.encoded_texts) == {"old two", "new three"}
    loaded_ids = {tid for tid, _emb, _txt in svc._tickets}
    assert loaded_ids == {"old-2", "new-3"}


# ─── load: error paths ───────────────────────────────────────────────────────
# FIX 9: missing / empty / corrupt storage file.

def test_load_missing_file_does_not_raise(service):
    service.load()  # file does not exist yet


def test_load_empty_file_does_not_raise(service):
    Path(service.storage_file).write_text("")
    service.load()


def test_load_corrupt_json_does_not_raise(service):
    Path(service.storage_file).write_text("{corrupt{{")
    service.load()


# ─── load: no sentence-transformers ──────────────────────────────────────────
# FIX 10: _HAS_SENTENCE=False fallback path.

def test_load_without_sentence_transformers(service, monkeypatch):
    monkeypatch.setattr(duplicate_module, "_HAS_SENTENCE", False)
    Path(service.storage_file).write_text(json.dumps([
        {"ticket_id": "t1", "text": "hello"}
    ]))
    service.load()  # must not raise