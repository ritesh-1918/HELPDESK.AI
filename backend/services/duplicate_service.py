"""
Duplicate Detection Service
Uses sentence-transformers all-MiniLM-L6-v2 to detect similar tickets.
"""

import uuid
import os
import threading
import json
import contextlib
import time
from typing import Any


from sentence_transformers import SentenceTransformer, util


SIMILARITY_THRESHOLD = 0.70


class DuplicateService:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False
        # In-memory store: list of (ticket_id, embedding, text)
        # In-memory store: list of (ticket_id, embedding_vector_as_list[float], text)
        self._tickets: list[tuple[str, list[float], str]] = []
        # Thread lock to prevent concurrent modification of _tickets
        self._tickets_lock = threading.Lock()
        self._load_lock = threading.Lock()

        self.storage_file = os.path.join(
            os.path.dirname(__file__), "..", "data", "case_history_cache.json"
        )
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)

        # Simple cross-process file lock using a companion .lock file.
        # (Avoids concurrent writes when multiple gunicorn/uvicorn workers exist.)
        self.lock_file = self.storage_file + ".lock"

        self.cache_version = 2


    def is_available(self) -> bool:
        """Check if the model is available for duplicate detection."""
        return self._loaded and not self._load_failed

    def load(self):
        """Load the sentence-transformer model and saved tickets.

        Cache format v2:
        - Either a list: [{ticket_id, text, embedding}]
        - Or an object: {"version": 2, "items": [...]}.

        If embeddings exist, they are loaded directly to avoid re-encoding.
        If embeddings are missing, we compute once and upgrade the cache.
        """
        if self._loaded or self._load_failed:
            return

        with self._load_lock:
            if self._loaded or self._load_failed:
                return

            print("[DuplicateService] Loading model...")
            try:
                model_path = os.environ.get("SENTENCE_TRANSFORMER_MODEL_PATH")
                if model_path and os.path.exists(model_path):
                    print(f"[DuplicateService] Loading from local path: {model_path}")
                    self.model = SentenceTransformer(model_path)
                else:
                    self.model = SentenceTransformer("all-MiniLM-L6-v2")

                self._loaded = True

                if not os.path.exists(self.storage_file):
                    return

                print(
                    f"[DuplicateService] Syncing previous ticket history from {self.storage_file}..."
                )

                def _normalize_cache(raw: Any) -> list[dict]:
                    if isinstance(raw, list):
                        return raw
                    if isinstance(raw, dict):
                        items = raw.get("items")
                        if isinstance(items, list):
                            return items
                    return []

                try:
                    with open(self.storage_file, "r", encoding="utf-8") as f:
                        raw = json.load(f)
                    items = _normalize_cache(raw)

                    upgraded = False
                    with self._tickets_lock:
                        for item in items:
                            ticket_id = item.get("ticket_id")
                            text = item.get("text")
                            emb = item.get("embedding")
                            if not ticket_id or text is None:
                                continue

                            if isinstance(emb, list) and emb:
                                self._tickets.append((str(ticket_id), emb, str(text)))
                                continue

                            # Backfill embedding for older cache entries.
                            if self.model is not None:
                                computed = self.model.encode(text, convert_to_tensor=False)
                                emb_list = computed.tolist() if hasattr(computed, "tolist") else list(computed)
                                self._tickets.append((str(ticket_id), emb_list, str(text)))
                                item["embedding"] = emb_list
                                upgraded = True

                    if upgraded:
                        # Best-effort upgrade: write back the enriched items.
                        try:
                            self._write_cache_items(items)
                        except Exception as e:
                            print(f"[DuplicateService] Cache upgrade write failed: {e}")

                    print(f"[DuplicateService] Loaded {len(self._tickets)} tickets.")

                except Exception as e:
                    print(f"[DuplicateService] Error loading storage: {e}")

            except Exception as e:
                allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
                self._load_failed = True
                print(f"[DuplicateService] Failed to load model: {e}")
                if allow_degraded:
                    print("[DuplicateService] DEGRADED: Continuing without model (ALLOW_DEGRADED_STARTUP=1)")
                    self.model = None
                    self._loaded = False
                else:
                    raise


    @contextlib.contextmanager
    def _file_lock(self, timeout_s: float = 10.0):
        """Best-effort cross-process lock using a companion .lock file."""
        start = time.time()  # type: ignore[name-defined]
        while True:
            try:
                # O_EXCL ensures we fail if lock already exists.
                fd = os.open(self.lock_file, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                os.close(fd)
                break
            except FileExistsError:
                if time.time() - start > timeout_s:  # type: ignore[name-defined]
                    raise TimeoutError(f"Timeout acquiring lock: {self.lock_file}")
                time.sleep(0.1)  # type: ignore[name-defined]

        try:
            yield
        finally:
            with contextlib.suppress(Exception):
                os.remove(self.lock_file)


    def _read_cache_items(self) -> list[dict]:
        if not os.path.exists(self.storage_file):
            return []
        try:
            with open(self.storage_file, "r", encoding="utf-8") as f:
                raw = json.load(f)
        except Exception:
            return []

        if isinstance(raw, list):
            return raw
        if isinstance(raw, dict):
            items = raw.get("items")
            if isinstance(items, list):
                return items
        return []


    def _write_cache_items(self, items: list[dict]) -> None:
        # Write in object wrapper format to enable future migrations.
        payload = {"version": self.cache_version, "items": items}
        tmp_path = self.storage_file + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        os.replace(tmp_path, self.storage_file)


    def save_to_disk(self, ticket_id: str, text: str, embedding: list[float]):
        """Persist a single ticket entry (thread-safe + cross-process via lock)."""
        try:
            with self._file_lock():
                os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
                items = self._read_cache_items()

                # Upsert by ticket_id
                updated = False
                for it in items:
                    if str(it.get("ticket_id")) == str(ticket_id):
                        it["text"] = text
                        it["embedding"] = embedding
                        updated = True
                        break

                if not updated:
                    items.append(
                        {"ticket_id": ticket_id, "text": text, "embedding": embedding}
                    )

                self._write_cache_items(items)
                print(f"[DuplicateService] Indexed ticket {ticket_id} to case history.")
        except Exception as e:
            print(f"[DuplicateService] Failed to save to disk: {e}")


    def add_ticket(self, ticket_id: str, text: str):
        """Add a ticket to the in-memory store and persist to disk (thread-safe)."""
        self.load()
        if not self.is_available():
            print(f"[DuplicateService] DEGRADED: Skipping embedding for ticket {ticket_id} (model not available)")
            return
        embedding = self.model.encode(text, convert_to_tensor=False)
        emb_list = embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)
        with self._tickets_lock:
            self._tickets.append((ticket_id, emb_list, text))
        self.save_to_disk(ticket_id, text, emb_list)


    def check_duplicate(self, text: str, threshold: float = None) -> dict:
        """
        Check if a ticket is a duplicate of any stored ticket (thread-safe).

        Args:
            text: The ticket text to check.
            threshold: Optional override for the similarity threshold.

        Returns:
            {
                "is_duplicate": bool,
                "duplicate_ticket_id": str | None,
                "similarity": float
            }
        """
        self.load()
        
        # If model is not available, return no duplicate found
        if not self.is_available():
            print("[DuplicateService] DEGRADED: Duplicate check skipped (model not available)")
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }
        
        # Use provided threshold or default to global constant
        active_threshold = threshold if threshold is not None else SIMILARITY_THRESHOLD

        with self._tickets_lock:
            if not self._tickets:
                return {
                    "is_duplicate": False,
                    "duplicate_ticket_id": None,
                    "similarity": 0.0,
                }
            
            query_embedding = self.model.encode(text, convert_to_tensor=True)
            best_score = 0.0
            best_id = None

            for ticket_id, stored_emb, _ in self._tickets:
                score = util.cos_sim(query_embedding, stored_emb).item()
                if score > best_score:
                    best_score = score
                    best_id = ticket_id

        is_dup = best_score >= active_threshold

        return {
            "is_duplicate": is_dup,
            "duplicate_ticket_id": best_id if is_dup else None,
            "similarity": round(best_score, 4),
        }
