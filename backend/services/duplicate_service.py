"""
Duplicate Detection Service
Uses sentence-transformers all-MiniLM-L6-v2 to detect similar tickets.

Pipeline: embed query text -> cosine-similarity against the stored ticket
history -> rank -> threshold gate. Indexed tickets are persisted to disk
(case_history_cache.json) and reloaded/re-embedded at startup.
"""

import json
import math
import os

from sentence_transformers import SentenceTransformer

SIMILARITY_THRESHOLD = 0.70
MAX_INDEXED_TICKETS = 10_000


def cosine_similarity(vector_a, vector_b) -> float:
    """
    Pure-Python cosine similarity between two equal-length vectors.

    Works with any sequence of floats (lists, tuples, numpy arrays).
    """
    a = list(vector_a)
    b = list(vector_b)
    if len(a) != len(b):
        raise ValueError("Vectors must have the same length")
    if not a:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


class DuplicateService:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False
        # In-memory store: list of (ticket_id, embedding, text)
        self._tickets: list[tuple[str, object, str]] = []
        # Embedding cache for repeated query texts.
        self._embedding_cache: dict[str, object] = {}
        self.storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "case_history_cache.json")
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)

    def is_available(self) -> bool:
        """Check if the model is available for duplicate detection."""
        return self._loaded and not self._load_failed

    def load(self):
        """Load the sentence-transformer model and saved tickets."""
        if self._loaded or self._load_failed:
            return

        print("[DuplicateService] Loading model...")
        try:
            # Check if a local model path is provided
            model_path = os.environ.get("SENTENCE_TRANSFORMER_MODEL_PATH")
            if model_path and os.path.exists(model_path):
                print(f"[DuplicateService] Loading from local path: {model_path}")
                self.model = SentenceTransformer(model_path)
            else:
                # Download from HuggingFace
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self._loaded = True

            self.rebuild_index_from_disk()
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

    def rebuild_index_from_disk(self):
        """Reload the persisted ticket history and re-embed it into memory."""
        if not os.path.exists(self.storage_file):
            return
        print(f"[DuplicateService] Syncing previous ticket history from {self.storage_file}...")
        try:
            with open(self.storage_file, "r") as f:
                data = json.load(f)
            if not isinstance(data, list):
                print("[DuplicateService] Storage file malformed, ignoring.")
                return
            self._tickets = []
            for item in data:
                text = item.get("text")
                ticket_id = item.get("ticket_id")
                if not text or not ticket_id:
                    continue
                embedding = self.model.encode(text)
                self._tickets.append((ticket_id, embedding, text))
            print(f"[DuplicateService] Loaded {len(self._tickets)} tickets.")
        except Exception as e:
            print(f"[DuplicateService] Error loading storage: {e}")

    def get_embedding(self, text: str):
        """Return (and cache) the embedding for a piece of text."""
        if text in self._embedding_cache:
            return self._embedding_cache[text]
        embedding = self.model.encode(text)
        if len(self._embedding_cache) > 2048:
            self._embedding_cache.clear()
        self._embedding_cache[text] = embedding
        return embedding

    def save_to_disk(self, ticket_id: str, text: str):
        """Append a new ticket to the JSON storage."""
        data = []
        try:
            os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
            if os.path.exists(self.storage_file):
                with open(self.storage_file, "r") as f:
                    try:
                        data = json.load(f)
                        if not isinstance(data, list):
                            data = []
                    except Exception:
                        data = []
            data.append({"ticket_id": ticket_id, "text": text})
            with open(self.storage_file, "w") as f:
                json.dump(data, f, indent=2)
            print(f"[DuplicateService] Indexed ticket {ticket_id} to case history.")
        except Exception as e:
            print(f"[DuplicateService] Failed to save to disk: {e}")

    def add_ticket(self, ticket_id: str, text: str):
        """Add a ticket to the in-memory store and persist to disk."""
        self.load()
        if not self.is_available():
            print(f"[DuplicateService] DEGRADED: Skipping embedding for ticket {ticket_id} (model not available)")
            return
        embedding = self.model.encode(text)
        self._tickets.append((ticket_id, embedding, text))
        self.save_to_disk(ticket_id, text)

    def find_similar(
        self,
        text: str,
        top_k: int = 5,
        threshold: float | None = None,
        exclude_ticket_id: str | None = None,
    ) -> list[dict]:
        """
        Rank stored tickets by cosine similarity against the query text.

        Returns up to ``top_k`` matches sorted by descending similarity:
            [{"ticket_id", "text", "similarity"}, ...]
        """
        self.load()
        if not self.is_available():
            print("[DuplicateService] DEGRADED: Similarity search skipped (model not available)")
            return []
        if not self._tickets:
            return []

        query_embedding = self.get_embedding(text)
        scored = []
        for ticket_id, stored_emb, stored_text in self._tickets:
            if exclude_ticket_id and ticket_id == exclude_ticket_id:
                continue
            score = cosine_similarity(query_embedding, stored_emb)
            scored.append((score, ticket_id, stored_text))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [
            {"ticket_id": ticket_id, "text": stored_text, "similarity": round(score, 4)}
            for score, ticket_id, stored_text in scored[: max(0, int(top_k))]
        ]

    def similarity_between(self, text_a: str, text_b: str) -> float:
        """Direct cosine similarity between two pieces of text."""
        self.load()
        if not self.is_available():
            return 0.0
        return round(cosine_similarity(self.get_embedding(text_a), self.get_embedding(text_b)), 4)

    def check_duplicate(self, text: str, threshold: float | None = None) -> dict:
        """
        Check if a ticket is a duplicate of any stored ticket.

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

        matches = self.find_similar(text, top_k=1)
        if not matches:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        best = matches[0]
        is_dup = best["similarity"] >= active_threshold
        return {
            "is_duplicate": is_dup,
            "duplicate_ticket_id": best["ticket_id"] if is_dup else None,
            "similarity": best["similarity"],
        }

    def index_summary(self) -> dict:
        """Diagnostics for health/readiness reporting."""
        return {
            "model_available": self.is_available(),
            "indexed_tickets": len(self._tickets),
            "threshold": SIMILARITY_THRESHOLD,
            "storage_file": self.storage_file,
        }
