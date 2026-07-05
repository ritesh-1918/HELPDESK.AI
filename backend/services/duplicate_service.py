from __future__ import annotations

import json
import logging
import math
import os
import threading
from pathlib import Path
from typing import Any, Iterable, Optional

try:
    from sentence_transformers import SentenceTransformer  # type: ignore
    _HAS_SENTENCE = True
except Exception:  # pragma: no cover
    SentenceTransformer = None  # type: ignore
    _HAS_SENTENCE = False


logger = logging.getLogger(__name__)

SIMILARITY_THRESHOLD = 0.70


def _vector_to_list(vector: Any) -> list[float]:
    if vector is None:
        return []
    if hasattr(vector, "tolist"):
        try:
            return list(vector.tolist())
        except Exception:
            pass
    if isinstance(vector, (list, tuple)):
        return [float(v) for v in vector]
    try:
        return [float(v) for v in vector]
    except Exception:
        return []


def _cosine_similarity(a: Iterable[float], b: Iterable[float]) -> float:
    ax = list(a)
    bx = list(b)
    if not ax or not bx:
        return 0.0
    size = min(len(ax), len(bx))
    ax = ax[:size]
    bx = bx[:size]
    dot = sum(x * y for x, y in zip(ax, bx))
    norm_a = math.sqrt(sum(x * x for x in ax))
    norm_b = math.sqrt(sum(y * y for y in bx))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


class DuplicateService:
    def __init__(self, storage_file: Optional[str] = None):
        self.model = None
        self._loaded = False
        self._load_failed = False
        self._tickets: list[tuple[str, Any, str]] = []
        self._embedding_matrix = None
        self._ticket_ids: list[str] = []
        self._embedding_matrix_dirty = True
        self._lock = threading.Lock()
        self._indexing = False
        self._embedding_cache: dict[str, list[float]] = {}
        default_path = Path(__file__).resolve().parent.parent / "data" / "case_history_cache.json"
        self.storage_file = storage_file or str(default_path)
        Path(self.storage_file).parent.mkdir(parents=True, exist_ok=True)

    def _encode_with_cache(self, text: str):
        if not self.model:
            return None
        cached = self._embedding_cache.get(text)
        if cached is not None:
            return cached
        encoded = self.model.encode(text)
        self._embedding_cache[text] = encoded
        return encoded

    def is_available(self) -> bool:
        return self._loaded and not self._load_failed

    def get_ticket_count(self) -> int:
        with self._lock:
            return len(self._tickets)

    def clear(self) -> None:
        with self._lock:
            self._tickets.clear()
            self._ticket_ids.clear()
            self._embedding_matrix = None
            self._embedding_matrix_dirty = True
            self._embedding_cache.clear()
            self._write_to_disk_unlocked()

    def load_from_disk(self) -> None:
        path = Path(self.storage_file)
        if not path.exists():
            return
        try:
            raw = path.read_text(encoding="utf-8")
            if not raw.strip():
                return
            data = json.loads(raw)
            if not isinstance(data, list):
                return
            tickets: list[tuple[str, Any, str]] = []
            for item in data:
                if not isinstance(item, dict):
                    continue
                ticket_id = str(item.get("id") or item.get("ticket_id") or "")
                if not ticket_id:
                    continue
                text = str(item.get("text") or "")
                embedding = item.get("embedding")
                tickets.append((ticket_id, embedding if embedding is not None else [], text))
            with self._lock:
                self._tickets = tickets
                self._ticket_ids = [tid for tid, _, _ in tickets]
                self._embedding_matrix_dirty = True
        except (json.JSONDecodeError, ValueError) as exc:
            logger.warning("DuplicateService failed to read cache %s: %s", self.storage_file, exc)

    def _write_to_disk_unlocked(self) -> None:
        payload = [
            {"id": tid, "embedding": _vector_to_list(emb), "text": txt}
            for tid, emb, txt in self._tickets
        ]
        path = Path(self.storage_file)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    def save_to_disk(self, ticket_id: Optional[str] = None, text: Optional[str] = None) -> None:
        with self._lock:
            self._write_to_disk_unlocked()

    def load(self) -> None:
        if self._loaded or self._load_failed:
            return

        try:
            if not _HAS_SENTENCE:
                raise ImportError("sentence-transformers is not installed")

            model_path = os.getenv("SENTENCE_TRANSFORMER_MODEL_PATH", "").strip()
            if model_path and os.path.exists(model_path):
                self.model = SentenceTransformer(model_path)
            else:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")

            self._loaded = True
            self.load_from_disk()
        except Exception as exc:
            allow_degraded = os.getenv("ALLOW_DEGRADED_STARTUP", "0") == "1"
            self._load_failed = True
            logger.warning("DuplicateService load failed: %s", exc)
            if not allow_degraded:
                raise

    def add_ticket(self, ticket_id: str, text: str) -> None:
        if not self._loaded and not self._load_failed:
            self.load()
        if self._load_failed or not self._loaded or not self.model:
            return

        cleaned = (text or "").strip()
        if not cleaned:
            return

        embedding = self._encode_with_cache(cleaned)
        if embedding is None:
            return

        with self._lock:
            self._tickets.append((ticket_id, embedding, cleaned))
            self._ticket_ids.append(ticket_id)
            self._embedding_matrix_dirty = True
        self.save_to_disk(ticket_id, cleaned)

    def check_duplicate(self, text: str, ticket_id: Optional[str] = None, company_id: Optional[str] = None, threshold: float = SIMILARITY_THRESHOLD) -> dict:
        if threshold != -1.0 and (threshold < 0.0 or threshold > 1.0):
            raise ValueError("threshold must be between 0.0 and 1.0")

        cleaned = (text or "").strip()
        if not cleaned:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        if self._load_failed or (not self._loaded and not self.model):
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        if not self._loaded and not self._load_failed:
            self.load()
            if not self._loaded or not self.model:
                return {
                    "is_duplicate": False,
                    "duplicate_ticket_id": None,
                    "similarity": 0.0,
                }

        query_embedding = self._encode_with_cache(cleaned)
        if query_embedding is None:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        with self._lock:
            snapshot = list(self._tickets)

        if not snapshot:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        best_id = None
        best_similarity = 0.0
        for tid, emb, _ in snapshot:
            sim = _cosine_similarity(query_embedding, _vector_to_list(emb))
            if sim >= best_similarity:
                best_similarity = sim
                best_id = tid

        best_similarity = min(best_similarity, 0.999999)

        return {
            "is_duplicate": best_similarity >= threshold,
            "duplicate_ticket_id": best_id if best_similarity >= threshold else None,
            "similarity": float(best_similarity),
        }


__all__ = ["DuplicateService", "SIMILARITY_THRESHOLD"]
