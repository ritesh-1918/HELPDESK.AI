import torch
"""
Duplicate Detection Service
Uses sentence-transformers all-MiniLM-L6-v2 to detect similar tickets.

Thread-safety: all mutable state is guarded by a threading.Lock to prevent
TOCTOU race conditions in save_to_disk() and list mutation in add_ticket().
"""

import json
import os
from typing import Any

try:
    from sentence_transformers import SentenceTransformer, util
    _HAS_SENTENCE = True
except Exception:  # pragma: no cover - optional runtime dependency
    SentenceTransformer = None
    util = None
    _HAS_SENTENCE = False

SIMILARITY_THRESHOLD = 0.70


class DuplicateService:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False
        # In-memory store: list of (ticket_id, embedding, text)
        self._tickets: list[tuple[str, object, str]] = []
        # Pre-computed embedding matrix for vectorized search
        self._embedding_matrix: torch.Tensor | None = None
        self._ticket_ids: list[str] = []
        self._embedding_matrix_dirty: bool = True
        self.storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "case_history_cache.json")
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        # Lock for thread-safe access to _tickets and storage_file
        self._lock = threading.Lock()

    def is_available(self) -> bool:
        """Check if the model is available for duplicate detection."""
        return self._loaded and not self._load_failed

    def _encode(self, text: str) -> np.ndarray:
        """Encode text to an L2-normalized float32 numpy embedding."""
        emb = self.model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        return emb.astype(np.float32, copy=False)

    def _rebuild_matrix(self):
        if self._tickets:
            self._embedding_matrix = np.vstack([emb for _, emb, _ in self._tickets])
        else:
            self._embedding_matrix = None

    def load(self):
        """Load the sentence-transformer model and saved tickets."""
        if self._loaded or self._load_failed:
            return

        print("[DuplicateService] Loading model...")
        if not _HAS_SENTENCE:
            allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
            self._load_failed = True
            print("[DuplicateService] sentence-transformers not installed")
            if allow_degraded:
                print("[DuplicateService] DEGRADED: Continuing without model (ALLOW_DEGRADED_STARTUP=1)")
                self.model = None
                self._loaded = False
                return
            else:
                raise ImportError("sentence-transformers is required for DuplicateService")
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
            
            if os.path.exists(self.storage_file):
                print(f"[DuplicateService] Syncing previous ticket history from {self.storage_file}...")
                try:
                    with open(self.storage_file, "r") as f:
                        data = json.load(f)
                        if not isinstance(data, list):
                            data = []
                        for item in data:
                            text = item["text"]
                            embedding = self.model.encode(text, convert_to_tensor=True)
                            self._tickets.append((item["ticket_id"], embedding, text))
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

    def save_to_disk(self, ticket_id: str, text: str):
        """Append a new ticket to the JSON storage atomically.

        Uses a lock to prevent TOCTOU race conditions where concurrent reads
        could overwrite each other's writes. Writes to a temp file first, then
        renames for atomicity.
        """
        with self._lock:
            data = []
            try:
                os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
                if os.path.exists(self.storage_file):
                    with open(self.storage_file, "r") as f:
                        try:
                            data = json.load(f)
                            if not isinstance(data, list):
                                data = []
                        except (json.JSONDecodeError, ValueError):
                            data = []
                
                data.append({"ticket_id": ticket_id, "text": text})

                # Atomic write: write to temp file, then rename
                dir_name = os.path.dirname(self.storage_file)
                with tempfile.NamedTemporaryFile(
                    mode="w", dir=dir_name, suffix=".tmp", delete=False
                ) as tmp:
                    json.dump(data, tmp, indent=2)
                    tmp.flush()
                    os.fsync(tmp.fileno())
                    tmp_name = tmp.name

                os.replace(tmp_name, self.storage_file)
                print(f"[DuplicateService] Indexed ticket {ticket_id} to case history.")
            except Exception as e:
                print(f"[DuplicateService] Failed to save to disk: {e}")
                # Clean up temp file if rename failed
                try:
                    if 'tmp_name' in locals() and os.path.exists(tmp_name):
                        os.unlink(tmp_name)
                except OSError:
                    pass

    def _rebuild_embedding_matrix(self):
        """Rebuild the stacked embedding matrix from the ticket list.

        This enables vectorized cosine similarity computation by stacking all
        stored embeddings into a single 2D tensor, eliminating the per-ticket
        loop in ``check_duplicate``.
        """
        if not self._tickets:
            self._embedding_matrix = None
            self._ticket_ids = []
            self._embedding_matrix_dirty = False
            return

        tickets = list(self._tickets)  # consistent snapshot
        self._ticket_ids = [tid for tid, _, _ in tickets]
        embeddings = [emb for _, emb, _ in tickets]
        self._embedding_matrix = torch.stack(embeddings)
        self._embedding_matrix_dirty = False

    def add_ticket(self, ticket_id: str, text: str):
        """Add a ticket to the in-memory store and persist to disk.

        Thread-safe: lock prevents interleaved appends to _tickets.
        """
        self.load()
        if not self.is_available():
            print(f"[DuplicateService] DEGRADED: Skipping embedding for ticket {ticket_id} (model not available)")
            return
        embedding = self.model.encode(text, convert_to_tensor=True)
        with self._lock:
            self._tickets.append((ticket_id, embedding, text))
        self.save_to_disk(ticket_id, text)

    def generate_embedding(self, text: str) -> list[float] | None:
        """Generate a 384-d embedding for the provided ticket text."""
        from backend.services.redis_cache import redis_cache

        cached = redis_cache.get_embedding(text)
        if cached is not None:
            return cached

        self.load()
        if not self.is_available():
            return None

        embedding = self.model.encode(text, convert_to_tensor=False, normalize_embeddings=True)
        values = [float(value) for value in embedding.tolist()]
        redis_cache.set_embedding(text, values)
        return values

    def _build_result(
        self,
        *,
        is_duplicate: bool,
        duplicate_ticket_id: str | None,
        similarity: float,
    ) -> dict:
        return {
            "is_duplicate": is_duplicate,
            "duplicate_ticket_id": duplicate_ticket_id,
            "parent_ticket_id": duplicate_ticket_id,
            "is_potential_duplicate": is_duplicate,
            "similarity": round(similarity, 4),
        }

    def find_semantic_duplicate(
        self,
        text: str,
        *,
        threshold: float | None = None,
        company_id: str | None = None,
        supabase_client: Any | None = None,
        match_count: int = 1,
    ) -> dict:
        """Find the best duplicate candidate using Supabase vector search, with local fallback."""
        self.load()

        active_threshold = threshold if threshold is not None else SIMILARITY_THRESHOLD
        embedding = self.generate_embedding(text)

        if embedding and supabase_client and company_id:
            try:
                response = supabase_client.rpc(
                    "match_tickets",
                    {
                        "query_vector": embedding,
                        "match_threshold": float(active_threshold),
                        "match_count": match_count,
                        "tenant_company_id": company_id,
                    },
                ).execute()

                rows = response.data or []
                if rows:
                    best_match = rows[0]
                    similarity = float(best_match.get("similarity", 0.0))
                    ticket_identifier = best_match.get("ticket_id") or best_match.get("id")
                    return self._build_result(
                        is_duplicate=similarity >= active_threshold,
                        duplicate_ticket_id=str(ticket_identifier) if ticket_identifier is not None else None,
                        similarity=similarity,
                    )
            except Exception as error:
                print(f"[DuplicateService] Supabase vector search failed, falling back to local cache: {error}")

        duplicate_result = self.check_duplicate(text, threshold=active_threshold)
        duplicate_result["parent_ticket_id"] = duplicate_result.get("duplicate_ticket_id")
        duplicate_result["is_potential_duplicate"] = duplicate_result.get("is_duplicate", False)
        return duplicate_result

    def check_duplicate(self, text: str, threshold: float = None) -> dict:
        """
        Check if a ticket is a duplicate of any stored ticket.

        Uses vectorized cosine similarity: all stored embeddings are stacked
        into a single 2D tensor and compared against the query embedding in
        one batched matrix operation, rather than looping over each stored
        ticket individually.  This reduces the similarity computation from
        O(n) individual tensor operations to a single O(1) matrix multiply.

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

        # Take a snapshot of tickets under lock to avoid mutation during iteration
        with self._lock:
            tickets_snapshot = list(self._tickets)

        if not tickets_snapshot:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        query_embedding = self._encode(text)

        import torch

        # Stack stored embeddings into a single tensor for vectorized operations
        embeddings = [stored_emb for _, stored_emb, _ in self._tickets]
        stacked_embeddings = torch.stack(embeddings)

        # Compute cosine similarity between query and all stored embeddings in one operation
        similarity_matrix = util.cos_sim(query_embedding, stacked_embeddings)

        # Find the index and score of the most similar ticket
        best_score_tensor, best_index_tensor = torch.max(similarity_matrix, dim=1)
        best_score = best_score_tensor.item()
        best_index = best_index_tensor.item()
        best_id = self._tickets[best_index][0]

        is_dup = best_score >= active_threshold

        return {
            "is_duplicate": is_dup,
            "duplicate_ticket_id": best_id if is_dup else None,
            "similarity": round(best_score, 4),
        }

