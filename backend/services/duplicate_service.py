"""
DuplicateService — In-memory duplicate ticket detection with idempotent add_ticket.

Key fix (issue #3124):
- add_ticket() is now idempotent — calling it with the same ticket_id twice
  does NOT create duplicate entries, preventing skewed similarity scores.
"""

import json
import logging
import os
import threading
from pathlib import Path

import numpy as np

logger = logging.getLogger(__name__)

# Check sentence_transformers availability at import time
try:
    from sentence_transformers import SentenceTransformer
    _HAS_SENTENCE = True
except ImportError:
    SentenceTransformer = None
    _HAS_SENTENCE = False

DEFAULT_MODEL = "all-MiniLM-L6-v2"
SIMILARITY_THRESHOLD = 0.70
DATA_DIR = Path(__file__).parent.parent / "data"


class DuplicateService:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False
        self._tickets: list[tuple[str, any, str]] = []
        self._ticket_id_set: set[str] = set()  # idempotency guard
        self._embedding_matrix = None
        self._ticket_ids = []
        self._embedding_matrix_dirty = True
        self._lock = threading.Lock()
        self._indexing = False

        # Storage file — JSON format
        storage_dir = DATA_DIR
        storage_dir.mkdir(parents=True, exist_ok=True)
        self.storage_file = str(storage_dir / "case_history_cache.json")

    # ------------------------------------------------------------------
    # Model loading
    # ------------------------------------------------------------------

    def load(self):
        """Load sentence-transformers model and restore tickets from disk."""
        if self._loaded or self._load_failed:
            return

        if not _HAS_SENTENCE:
            allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
            self._load_failed = True
            if not allow_degraded:
                raise ImportError(
                    "sentence-transformers is required but not installed. "
                    "Set ALLOW_DEGRADED_STARTUP=1 to allow degraded startup."
                )
            logger.warning("[DuplicateService] Degraded mode — sentence-transformers unavailable.")
            return

        try:
            local_path = os.environ.get("SENTENCE_TRANSFORMER_MODEL_PATH", "")
            if local_path and os.path.exists(local_path):
                self.model = SentenceTransformer(local_path)
            else:
                self.model = SentenceTransformer(DEFAULT_MODEL)

            self._loaded = True
            logger.info("[DuplicateService] Model loaded.")

            # Restore tickets from disk
            self._load_from_disk()

        except Exception as e:
            self._load_failed = True
            allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
            if not allow_degraded:
                raise
            logger.warning(f"[DuplicateService] Load failed (degraded): {e}")

    def _load_from_disk(self):
        """Restore ticket index from JSON storage file."""
        if not os.path.exists(self.storage_file):
            return
        try:
            with open(self.storage_file, "r", encoding="utf-8") as f:
                content = f.read().strip()
            if not content:
                return
            data = json.loads(content)
            for item in data:
                ticket_id = item.get("ticket_id") or item.get("id")
                text = item.get("text", "")
                embedding = item.get("embedding")
                if ticket_id:
                    with self._lock:
                        if ticket_id not in self._ticket_id_set:
                            emb_array = np.array(embedding) if embedding is not None else None
                            self._tickets.append((ticket_id, emb_array, text))
                            self._ticket_id_set.add(ticket_id)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"[DuplicateService] Failed to load from disk: {e}")

    def is_available(self) -> bool:
        return self._loaded and not self._load_failed

    # ------------------------------------------------------------------
    # Idempotent add_ticket — core fix for issue #3124
    # ------------------------------------------------------------------

    def add_ticket(self, ticket_id: str, text: str) -> bool:
        """
        Add a ticket to the in-memory index.

        Idempotent: if ticket_id already exists, this is a no-op.
        Returns True if added, False if skipped.
        """
        if not self._loaded or self._load_failed:
            logger.warning(f"[DuplicateService] Degraded — skipping {ticket_id}")
            return False

        with self._lock:
            if ticket_id in self._ticket_id_set:
                logger.debug(f"[DuplicateService] {ticket_id} already indexed — skipping.")
                return False

            try:
                embedding = self.model.encode(text)
                self._tickets.append((ticket_id, embedding, text))
                self._ticket_id_set.add(ticket_id)
                self._embedding_matrix_dirty = True
            except Exception as e:
                logger.error(f"[DuplicateService] Embedding failed for {ticket_id}: {e}")
                return False

        self.save_to_disk(ticket_id, text)
        return True

    # ------------------------------------------------------------------
    # Duplicate check
    # ------------------------------------------------------------------

    def check_duplicate(
        self,
        text: str,
        ticket_id: str = None,
        company_id: str = None,
        threshold: float = None,
    ) -> dict:
        """Check text against indexed tickets using cosine similarity."""
        active_threshold = threshold if threshold is not None else SIMILARITY_THRESHOLD

        if not self._loaded or not self._tickets or not self.model:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "parent_ticket_id": None,
                "is_potential_duplicate": False,
                "similarity": 0.0,
            }

        try:
            query_embedding = self._encode(text)
            if query_embedding is None:
                return {
                    "is_duplicate": False,
                    "duplicate_ticket_id": None,
                    "parent_ticket_id": None,
                    "is_potential_duplicate": False,
                    "similarity": 0.0,
                }

            best_id = None
            best_score = 0.0

            with self._lock:
                for tid, embedding, _ in self._tickets:
                    if tid == ticket_id:
                        continue  # skip self
                    emb = np.array(embedding) if not isinstance(embedding, np.ndarray) else embedding
                    norm = np.linalg.norm(query_embedding) * np.linalg.norm(emb)
                    score = float(np.dot(query_embedding, emb) / (norm + 1e-9))
                    if score > best_score:
                        best_score = score
                        best_id = tid

            is_dup = best_score >= active_threshold
            is_potential = best_score >= active_threshold * 0.85 and not is_dup

            return {
                "is_duplicate": is_dup,
                "duplicate_ticket_id": best_id if is_dup else None,
                "parent_ticket_id": best_id if is_dup else None,
                "is_potential_duplicate": is_potential,
                "similarity": round(best_score, 4),
            }
        except Exception as e:
            logger.error(f"[DuplicateService] check_duplicate error: {e}")
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "parent_ticket_id": None,
                "is_potential_duplicate": False,
                "similarity": 0.0,
            }

    def _encode(self, text: str):
        if not self.model:
            return None
        try:
            return self.model.encode(text)
        except Exception as e:
            logger.error(f"[DuplicateService] Encode error: {e}")
            return None

    # ------------------------------------------------------------------
    # Disk persistence — JSON format
    # ------------------------------------------------------------------

    def save_to_disk(self, ticket_id: str = None, text: str = None):
        """Persist full ticket index to JSON storage file (thread-safe)."""
        with self._lock:
            try:
                data = [
                    {
                        "id": tid,
                        "ticket_id": tid,
                        "text": txt,
                        "embedding": emb.tolist() if hasattr(emb, "tolist") else list(emb),
                    }
                    for tid, emb, txt in self._tickets
                ]
                os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
                with open(self.storage_file, "w", encoding="utf-8") as f:
                    json.dump(data, f)
            except Exception as e:
                logger.warning(f"[DuplicateService] save_to_disk failed: {e}")