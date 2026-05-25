"""
Semantic Duplicate Detection Service — pgvector-powered cosine similarity search.

Enhances the existing in-memory DuplicateService with Supabase pgvector integration:
  1. Store embeddings in the tickets table (description_vector column)
  2. Use match_tickets RPC for company-scoped similarity search
  3. Dynamic sensitivity from system_settings table
  4. Auto-flag duplicates during ticket save flow

Usage:
    service = SemanticDuplicateService(supabase_client)
    result = await service.check_duplicate(text, company_id, threshold_override)
    await service.index_ticket(ticket_id, text)
"""

import os
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Default threshold (0.0-1.0, higher = stricter)
DEFAULT_SENSITIVITY = 0.85


class SemanticDuplicateService:
    """
    Duplicate detection backed by pgvector in Supabase.

    Falls back to in-memory DuplicateService if the vector DB is unavailable,
    but the primary path is via the match_tickets RPC function.
    """

    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self._model = None
        self._loaded = False

    def load(self):
        """Lazy-load the sentence-transformers model (called once)."""
        if self._loaded:
            return
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            self._loaded = True
            logger.info("[SemanticDuplicate] Model loaded (all-MiniLM-L6-v2)")
        except ImportError:
            logger.warning("[SemanticDuplicate] sentence-transformers not installed")
        except Exception as e:
            logger.error(f"[SemanticDuplicate] Model load error: {e}")

    @property
    def model(self):
        if not self._loaded:
            self.load()
        return self._model

    # ------------------------------------------------------------------
    # Embedding generation
    # ------------------------------------------------------------------

    def generate_embedding(self, text: str) -> list[float] | None:
        """
        Generate a 384-dimensional embedding vector for the given text.
        Returns None if the model isn't loaded.
        """
        if not self.model:
            return None
        try:
            return self.model.encode(text).tolist()
        except Exception as e:
            logger.error(f"[SemanticDuplicate] Embedding error: {e}")
            return None

    # ------------------------------------------------------------------
    # Dynamic threshold from system_settings
    # ------------------------------------------------------------------

    async def get_sensitivity(self) -> float:
        """
        Fetch the duplicate detection sensitivity from system_settings.
        Falls back to DEFAULT_SENSITIVITY.
        """
        if not self.supabase:
            return DEFAULT_SENSITIVITY
        try:
            res = self.supabase.table("system_settings") \
                .select("value") \
                .eq("key", "duplicate_detection") \
                .single() \
                .execute()
            if res.data:
                return float(res.data["value"].get("sensitivity", DEFAULT_SENSITIVITY))
        except Exception as e:
            logger.warning(f"[SemanticDuplicate] Failed to fetch sensitivity: {e}")
        return DEFAULT_SENSITIVITY

    # ------------------------------------------------------------------
    # Duplicate check via pgvector RPC
    # ------------------------------------------------------------------

    async def check_duplicate(
        self,
        text: str,
        company_id: str | None = None,
        threshold: float | None = None,
        max_candidates: int = 5,
    ) -> dict:
        """
        Check text against existing tickets using pgvector cosine similarity.

        Args:
            text: The ticket description/subject text.
            company_id: Tenant company UUID for scoped search.
            threshold: Override threshold (0.0-1.0). Uses dynamic setting if None.
            max_candidates: Max similar tickets to return.

        Returns:
            {
                "is_duplicate": bool,
                "duplicate_ticket_id": str | None,
                "similarity": float,
                "candidates": [...]  # top candidates with scores
            }
        """
        # Generate embedding
        embedding = self.generate_embedding(text)
        if embedding is None:
            logger.warning("[SemanticDuplicate] No embedding — falling back to no match")
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
                "candidates": [],
            }

        active_threshold = threshold if threshold is not None else await self.get_sensitivity()

        # Perform vector search
        if self.supabase:
            try:
                result = self.supabase.rpc(
                    "match_tickets",
                    {
                        "query_vector": embedding,
                        "match_threshold": active_threshold,
                        "match_count": max_candidates,
                        "tenant_company_id": company_id,
                    },
                ).execute()

                candidates = result.data or []
            except Exception as e:
                logger.warning(f"[SemanticDuplicate] RPC call failed: {e}")
                candidates = []
        else:
            candidates = []

        if not candidates:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
                "candidates": [],
            }

        best = candidates[0]
        similarity = float(best.get("similarity", 0.0))
        is_dup = similarity >= active_threshold

        return {
            "is_duplicate": is_dup,
            "duplicate_ticket_id": best.get("id") if is_dup else None,
            "similarity": round(similarity, 4),
            "parent_subject": best.get("subject") or best.get("summary") if is_dup else None,
            "candidates": [
                {
                    "id": c["id"],
                    "subject": c.get("subject") or c.get("summary"),
                    "similarity": round(float(c.get("similarity", 0)), 4),
                    "status": c.get("status"),
                    "assigned_team": c.get("assigned_team"),
                    "created_at": c.get("created_at"),
                }
                for c in candidates[:3]
            ],
        }

    # ------------------------------------------------------------------
    # Index a ticket — generate embedding and store it
    # ------------------------------------------------------------------

    async def index_ticket(self, ticket_id: str, text: str) -> bool:
        """
        Generate embedding for a ticket and update the description_vector column.
        Returns True on success.
        """
        embedding = self.generate_embedding(text)
        if embedding is None:
            logger.warning(f"[SemanticDuplicate] Cannot index ticket {ticket_id}: no embedding")
            return False

        if not self.supabase:
            logger.warning("[SemanticDuplicate] No Supabase — skipping index")
            return False

        try:
            self.supabase.table("tickets") \
                .update({"description_vector": embedding}) \
                .eq("id", ticket_id) \
                .execute()
            logger.info(f"[SemanticDuplicate] Indexed ticket {ticket_id} ({len(text)} chars)")
            return True
        except Exception as e:
            logger.error(f"[SemanticDuplicate] Index error for {ticket_id}: {e}")
            return False

    # ------------------------------------------------------------------
    # Batch re-index — regenerate all embeddings
    # ------------------------------------------------------------------

    async def reindex_all(self, batch_size: int = 50) -> dict:
        """
        Re-generate embeddings for all tickets that don't have them.
        Useful for initial migration or after model update.
        """
        if not self.supabase:
            return {"indexed": 0, "errors": 0}

        total_indexed = 0
        total_errors = 0
        offset = 0

        while True:
            res = self.supabase.table("tickets") \
                .select("id, subject, description, summary") \
                .is_("description_vector", "null") \
                .range(offset, offset + batch_size - 1) \
                .execute()

            batch = res.data or []
            if not batch:
                break

            for ticket in batch:
                text = (ticket.get("description") or ticket.get("subject") or ticket.get("summary") or "").strip()
                if not text:
                    continue
                success = await self.index_ticket(ticket["id"], text)
                if success:
                    total_indexed += 1
                else:
                    total_errors += 1

            offset += batch_size

        logger.info(f"[SemanticDuplicate] Re-index complete: {total_indexed} indexed, {total_errors} errors")
        return {"indexed": total_indexed, "errors": total_errors}
