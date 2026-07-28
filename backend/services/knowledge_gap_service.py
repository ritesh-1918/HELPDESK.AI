import logging
import json
import datetime
import numpy as np
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class KnowledgeGapService:

    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self._gemini = None

    @property
    def gemini_service(self):
        if not self._gemini:
            try:
                from backend.services.gemini_service import GeminiService
                self._gemini = GeminiService()
            except ImportError:
                pass
        return self._gemini

    def _parse_vector(self, vec_str) -> Optional[np.ndarray]:
        if not vec_str:
            return None
        try:
            if isinstance(vec_str, str):
                vec = json.loads(vec_str)
            else:
                vec = vec_str
            return np.array(vec, dtype=np.float32)
        except Exception:
            return None

    async def detect_gaps(self, company_id: str) -> None:
        """
        Analyze closed/resolved tickets, cluster them, and detect knowledge gaps.
        """
        if not self.supabase:
            logger.warning("[KnowledgeGap] Supabase client not provided")
            return

        # 1. Fetch resolved/closed tickets
        try:
            res = self.supabase.table("tickets").select(
                "id, subject, description_vector, created_at, closed_at, updated_at"
            ).eq("company_id", company_id).in_("status", ["resolved", "closed"]).execute()
            tickets = res.data or []
        except Exception as e:
            logger.error(f"[KnowledgeGap] Failed to fetch tickets: {e}")
            return

        if not tickets:
            logger.info(f"[KnowledgeGap] No resolved tickets found for {company_id}")
            return

        # 2. Extract vectors
        vectors = []
        valid_tickets = []
        for t in tickets:
            vec = self._parse_vector(t.get("description_vector"))
            if vec is not None and vec.shape[0] == 384:
                vectors.append(vec)
                valid_tickets.append(t)

        if len(vectors) < 3:
            logger.info(f"[KnowledgeGap] Not enough tickets with vectors for {company_id}")
            return

        X = np.vstack(vectors)

        # 3. Cluster using simple thresholding (cosine distance < 0.15 -> sim > 0.85)
        clusters = {} # label -> list of tickets
        labels = [-1] * len(vectors)
        current_cluster_id = 0
        
        for i in range(len(vectors)):
            if labels[i] != -1:
                continue # Already clustered
            
            # Find neighbors
            neighbors = []
            for j in range(len(vectors)):
                # Compute cosine similarity
                dot_product = np.dot(vectors[i], vectors[j])
                norm_a = np.linalg.norm(vectors[i])
                norm_b = np.linalg.norm(vectors[j])
                sim = dot_product / (norm_a * norm_b) if norm_a > 0 and norm_b > 0 else 0
                if sim >= 0.85:
                    neighbors.append(j)
            
            if len(neighbors) >= 3:
                for n in neighbors:
                    labels[n] = current_cluster_id
                current_cluster_id += 1

        # 4. Process clusters
        for i, label in enumerate(labels):
            if label == -1:
                continue # Noise
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(valid_tickets[i])

        # Delete existing gaps for the company to refresh them (or we could just merge)
        # For simplicity, we refresh.
        try:
            self.supabase.table("knowledge_gaps").delete().eq("company_id", company_id).execute()
        except Exception as e:
            logger.warning(f"[KnowledgeGap] Failed to clear old gaps: {e}")

        for label, group in clusters.items():
            occurrences = len(group)
            
            # Subject of the cluster could be the subject of the first ticket
            subject = group[0].get("subject") or "Recurring Issue"
            
            # Calculate avg resolution time
            total_seconds = 0
            valid_times = 0
            for t in group:
                created_str = t.get("created_at")
                end_str = t.get("closed_at") or t.get("updated_at")
                if created_str and end_str:
                    try:
                        c_dt = datetime.datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                        e_dt = datetime.datetime.fromisoformat(end_str.replace("Z", "+00:00"))
                        diff = (e_dt - c_dt).total_seconds()
                        if diff >= 0:
                            total_seconds += diff
                            valid_times += 1
                    except Exception:
                        pass
                        
            avg_res_hours = (total_seconds / valid_times / 3600.0) if valid_times > 0 else 0.0
            
            # Compute centroid to check against KB
            # Find indices of this cluster
            idx = [i for i, lbl in enumerate(labels) if lbl == label]
            cluster_vecs = X[idx]
            centroid = np.mean(cluster_vecs, axis=0)
            centroid_list = centroid.tolist()
            
            # Check KB Coverage via RPC match_articles
            coverage_status = "None"
            try:
                kb_res = self.supabase.rpc(
                    "match_articles",
                    {
                        "query_embedding": centroid_list,
                        "match_threshold": 0.70,
                        "match_count": 1
                    }
                ).execute()
                matches = kb_res.data or []
                if matches:
                    best_sim = matches[0].get("similarity", 0)
                    if best_sim >= 0.85:
                        coverage_status = "Covered"
                    elif best_sim >= 0.70:
                        coverage_status = "Partial"
            except Exception as e:
                logger.warning(f"[KnowledgeGap] KB match failed: {e}")

            # Generate AI recommendation if gap exists
            recommended_draft = ""
            if coverage_status != "Covered" and self.gemini_service and getattr(self.gemini_service, "_initialized", False):
                try:
                    prompt = (
                        f"You are an expert IT knowledge base author. We have detected a recurring support issue: '{subject}'. "
                        f"Please write a structured knowledge base article draft to address this. "
                        f"Include: Problem Description, Common Causes, Troubleshooting Steps, and Prevention Tips."
                    )
                    ai_res = self.gemini_service.client.models.generate_content(
                        model=self.gemini_service.model_name,
                        contents=prompt
                    )
                    recommended_draft = ai_res.text.strip()
                except Exception as e:
                    logger.warning(f"[KnowledgeGap] Gemini generation failed: {e}")

            # Gap Score
            gap_score = round((occurrences * 10) + (avg_res_hours * 2), 2)

            # Insert into table
            try:
                self.supabase.table("knowledge_gaps").insert({
                    "company_id": company_id,
                    "cluster_subject": subject,
                    "occurrences": occurrences,
                    "unique_users": occurrences, # Approx
                    "gap_score": gap_score,
                    "coverage_status": coverage_status,
                    "recommended_draft": recommended_draft,
                    "resolution_time_avg_hours": round(avg_res_hours, 2)
                }).execute()
            except Exception as e:
                logger.error(f"[KnowledgeGap] Failed to insert gap: {e}")

    async def get_dashboard_insights(self, company_id: str) -> Dict[str, Any]:
        """Provide insights for the knowledge gaps dashboard."""
        if not self.supabase:
            return {}

        try:
            res = self.supabase.table("knowledge_gaps").select("*").eq("company_id", company_id).order("gap_score", desc=True).execute()
            gaps = res.data or []
            
            top_recurring = []
            missing_docs = 0
            partial_docs = 0
            
            for g in gaps:
                if g.get("coverage_status") == "None":
                    missing_docs += 1
                elif g.get("coverage_status") == "Partial":
                    partial_docs += 1
                
                top_recurring.append({
                    "id": g["id"],
                    "subject": g["cluster_subject"],
                    "occurrences": g["occurrences"],
                    "gap_score": g["gap_score"],
                    "coverage": g["coverage_status"],
                    "draft": g["recommended_draft"]
                })
                
            return {
                "top_recurring_issues": top_recurring,
                "missing_documentation_count": missing_docs,
                "partial_documentation_count": partial_docs,
                "total_gaps_detected": len(gaps),
            }
        except Exception as e:
            logger.error(f"[KnowledgeGap] Dashboard insights error: {e}")
            return {}
            
    async def convert_ticket_to_article(self, ticket_id: str, company_id: str) -> dict:
        """Resolution-to-Article Pipeline."""
        if not self.supabase:
            raise Exception("Database unavailable")
            
        # Fetch ticket
        res = self.supabase.table("tickets").select("*").eq("id", ticket_id).eq("company_id", company_id).single().execute()
        ticket = res.data
        if not ticket:
            raise Exception("Ticket not found")
            
        subject = ticket.get("subject", "Untitled")
        description = ticket.get("description", "")
        resolution = ticket.get("resolution_notes", "") or ticket.get("ai_resolution", "")
        
        if not self.gemini_service or not getattr(self.gemini_service, "_initialized", False):
            content = f"Problem: {description}\n\nResolution: {resolution}"
            title = f"Fix: {subject}"
        else:
            prompt = (
                f"You are a technical writer. Transform this resolved ticket into a professional knowledge base article.\n"
                f"Ticket Subject: {subject}\n"
                f"Description: {description}\n"
                f"Resolution: {resolution}\n\n"
                "Provide a markdown article with a Title, Problem, and Solution section."
            )
            try:
                ai_res = self.gemini_service.client.models.generate_content(
                    model=self.gemini_service.model_name,
                    contents=prompt
                )
                content = ai_res.text.strip()
                title = f"Guide: {subject}"
            except Exception as e:
                logger.warning(f"[KnowledgeGap] Draft generation failed: {e}")
                content = f"Problem: {description}\n\nResolution: {resolution}"
                title = f"Fix: {subject}"
                
        # Insert into knowledge_base
        from backend.services.semantic_duplicate_service import SemanticDuplicateService
        sem_srv = SemanticDuplicateService(self.supabase)
        emb = sem_srv.generate_embedding(title + " " + content)
        
        insert_data = {
            "title": title,
            "content": content,
            "category": ticket.get("category", "General"),
        }
        if emb:
            insert_data["embedding"] = emb
            
        kb_res = self.supabase.table("knowledge_base").insert(insert_data).execute()
        return {"success": True, "article": kb_res.data[0] if kb_res.data else {}}

