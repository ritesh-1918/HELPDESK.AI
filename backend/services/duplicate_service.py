"""
Duplicate Detection Service
Uses sentence-transformers all-MiniLM-L6-v2 to detect similar tickets.
"""

import uuid
import os
from typing import Any

from sentence_transformers import SentenceTransformer, util

SIMILARITY_THRESHOLD = 0.70


class DuplicateService:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False
        # In-memory store: list of (ticket_id, embedding, text)
        self._tickets: list[tuple[str, object, str]] = []
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
            
            if os.path.exists(self.storage_file):
                print(f"[DuplicateService] Syncing previous ticket history from {self.storage_file}...")
                import json
                try:
                    with open(self.storage_file, "r") as f:
                        data = json.load(f)
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
        """Append a new ticket to the JSON storage."""
        import json
        data = []
        try:
            os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
            if os.path.exists(self.storage_file):
                with open(self.storage_file, "r") as f:
                    try:
                        data = json.load(f)
                        if not isinstance(data, list):
                            data = []
                    except:
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
        embedding = self.model.encode(text, convert_to_tensor=True)
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
