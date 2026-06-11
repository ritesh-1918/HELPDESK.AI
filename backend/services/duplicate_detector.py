import os
from sentence_transformers import SentenceTransformer, util

TENANT_DUPLICATE_THRESHOLD = 0.85

OPEN_STATUSES = ['open', 'in_progress', 'pending', 'reopened']

class SemanticDuplicateDetector:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False

    def is_available(self) -> bool:
        return self._loaded and not self._load_failed

    def load(self):
        if self._loaded or self._load_failed:
            return

        print("[SemanticDuplicateDetector] Loading model...")
        try:
            model_path = os.environ.get("SENTENCE_TRANSFORMER_MODEL_PATH")
            if model_path and os.path.exists(model_path):
                self.model = SentenceTransformer(model_path)
            else:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self._loaded = True
        except Exception as e:
            allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
            self._load_failed = True
            print(f"[SemanticDuplicateDetector] Failed to load model: {e}")
            if allow_degraded:
                self.model = None
                self._loaded = False
            else:
                raise

    def find_duplicates(
        self,
        description: str,
        company_id: str,
        supabase_client,
        threshold: float = TENANT_DUPLICATE_THRESHOLD,
        exclude_ticket_id: str = None,
    ) -> dict:
        if not self.is_available():
            return {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0, "all_matches": []}

        if not supabase_client or not company_id:
            return {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0, "all_matches": []}

        try:
            query = (
                supabase_client.table("tickets")
                .select("id, description, subject")
                .eq("company_id", company_id)
                .in_("status", OPEN_STATUSES)
                .execute()
            )
        except Exception as e:
            print(f"[SemanticDuplicateDetector] DB query error: {e}")
            return {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0, "all_matches": []}

        if not query.data:
            return {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0, "all_matches": []}

        query_embedding = self.model.encode(description, convert_to_tensor=True)

        best_score = 0.0
        best_id = None
        all_matches = []

        for ticket in query.data:
            ticket_id = str(ticket["id"])
            if exclude_ticket_id and ticket_id == exclude_ticket_id:
                continue

            ticket_text = (ticket.get("description") or "") + " " + (ticket.get("subject") or "")
            ticket_text = ticket_text.strip()
            if not ticket_text:
                continue

            ticket_embedding = self.model.encode(ticket_text, convert_to_tensor=True)
            score = util.cos_sim(query_embedding, ticket_embedding).item()

            if score >= threshold:
                all_matches.append({
                    "ticket_id": ticket_id,
                    "similarity": round(score, 4),
                })

            if score > best_score:
                best_score = score
                best_id = ticket_id

        is_dup = best_score >= threshold

        return {
            "is_duplicate": is_dup,
            "duplicate_ticket_id": best_id if is_dup else None,
            "similarity": round(best_score, 4),
            "all_matches": sorted(all_matches, key=lambda x: x["similarity"], reverse=True),
        }
