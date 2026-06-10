"""
Duplicate Detection Service
Uses sentence-transformers all-MiniLM-L6-v2 to detect similar tickets.
"""

import uuid
import os
import threading
from sentence_transformers import SentenceTransformer, util

SIMILARITY_THRESHOLD = 0.70


class DuplicateService:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False
        self._lock = threading.Lock()
        
        # Parallel vector tracking structures for optimized tensor math
        self._ticket_ids: list[str] = []
        self._embeddings_tensor: torch.Tensor | None = None
        
        self.storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "case_history_cache.json")
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)

    def is_available(self) -> bool:
        """Check if the model is available for duplicate detection."""
        return self._loaded and not self._load_failed

    def load(self):
        """Load the sentence-transformer model and saved tickets."""
        if self._loaded or self._load_failed:
            return
            
        with self._lock:
            # Double-checked lock confirmation
            if self._loaded or self._load_failed:
                return
            
            print("[DuplicateService] Loading model...")
        
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
                        
                        temp_embeddings = []
                        for item in data:
                            text = item["text"]
                            embedding = self.model.encode(text, convert_to_tensor=True)
                            
                            self._ticket_ids.append(item["ticket_id"])
                            temp_embeddings.append(embedding)
                        
                        if temp_embeddings:
                            # Stacks standalone 1D vectors into a contiguous [N, D] tensor matrix
                            import torch
                            self._embeddings_tensor = torch.stack(temp_embeddings).squeeze(1)
                            
                    print(f"[DuplicateService] Loaded {len(self._ticket_ids)} tickets.")
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
        """Add a ticket to the parallel tracking structures and persist to disk."""
        self.load()
        if not self.is_available():
            print(f"[DuplicateService] DEGRADED: Skipping embedding for ticket {ticket_id} (model not available)")
            return
        
        # Format explicitly as a 2D matrix row [1, D]
        import torch
        embedding = self.model.encode(text, convert_to_tensor=True).view(1, -1)
        
        with self._lock:
            self._ticket_ids.append(ticket_id)
            if self._embeddings_tensor is None:
                self._embeddings_tensor = embedding
            else:
                # Vertically appends the new embedding vector onto the matrix stack
                self._embeddings_tensor = torch.cat([self._embeddings_tensor, embedding], dim=0)
                
            self.save_to_disk(ticket_id, text)

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

        if not self._ticket_ids or self._embeddings_tensor is None:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        import torch
        # Query vector matrix row shape configuration: [1, D]
        query_embedding = self.model.encode(text, convert_to_tensor=True).view(1, -1)

        # Computes similarity against all matrix keys simultaneously in parallel. Shape: [1, N]
        similarity_matrix = util.cos_sim(query_embedding, self._embeddings_tensor)
        
        # Extract the highest matrix matching vector score index instantly via torch argmax
        best_index = torch.argmax(similarity_matrix).item()
        best_score = similarity_matrix[0, best_index].item()
        best_id = self._ticket_ids[best_index]

        is_dup = best_score >= active_threshold

        return {
            "is_duplicate": is_dup,
            "duplicate_ticket_id": best_id if is_dup else None,
            "similarity": round(best_score, 4),
        }