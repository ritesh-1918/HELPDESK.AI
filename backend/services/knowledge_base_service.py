"""
Knowledge Base Article Auto-Suggestion Service

Suggests relevant knowledge base articles for ticket resolution.
Implements Issue #3203.
"""

import logging
from typing import List, Dict, Any, Optional
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)


class KnowledgeBaseService:
    """
    Service for suggesting relevant knowledge base articles.
    
    Uses semantic similarity matching to find relevant articles
    that might help resolve a ticket.
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.similarity_threshold = 0.65  # 65% similarity for suggestions
    
    def suggest_articles(
        self,
        ticket: Dict[str, Any],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Suggest knowledge base articles relevant to a ticket.
        
        Args:
            ticket: Ticket data
            limit: Maximum articles to suggest
        
        Returns:
            List of suggested articles with relevance scores
        """
        if not self.supabase:
            return []
        
        try:
            # Get all KB articles
            articles_result = self.supabase.table("knowledge_base_articles").select(
                "id, title, content, category, tags, created_at, views"
            ).eq("status", "published").execute()
            
            articles = articles_result.data or []
            
            # Score each article
            ticket_text = f"{ticket.get('subject', '')} {ticket.get('description', '')}".lower()
            scored_articles = []
            
            for article in articles:
                article_text = f"{article.get('title', '')} {article.get('content', '')}".lower()
                
                # Calculate similarity
                similarity = self._calculate_text_similarity(ticket_text, article_text)
                
                if similarity >= self.similarity_threshold:
                    scored_articles.append({
                        **article,
                        "relevance_score": round(similarity, 3),
                        "match_reason": self._get_match_reason(ticket, article)
                    })
            
            # Sort by relevance (highest first)
            scored_articles.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            return scored_articles[:limit]
        
        except Exception as e:
            logger.error(f"Error suggesting articles: {e}")
            return []
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity using sequence matching."""
        if not text1 or not text2:
            return 0.0
        
        # Use SequenceMatcher for efficiency
        matcher = SequenceMatcher(None, text1, text2)
        return matcher.ratio()
    
    def _get_match_reason(self, ticket: Dict[str, Any], article: Dict[str, Any]) -> str:
        """Generate human-readable match reason."""
        ticket_category = ticket.get("category", "")
        article_category = article.get("category", "")
        
        if ticket_category and article_category == ticket_category:
            return f"Same category: {article_category}"
        
        article_tags = set((article.get("tags") or []))
        if article_tags:
            return f"Related tags: {', '.join(list(article_tags)[:3])}"
        
        return "Relevant to ticket content"
    
    def log_suggestion_interaction(
        self,
        ticket_id: str,
        article_id: str,
        interaction_type: str,
        company_id: str
    ):
        """Log when users interact with suggestions."""
        if not self.supabase:
            return
        
        try:
            log_data = {
                "ticket_id": ticket_id,
                "article_id": article_id,
                "interaction_type": interaction_type,  # "viewed", "helpful", "not_helpful"
                "company_id": company_id
            }
            
            self.supabase.table("kb_suggestion_interactions").insert(log_data).execute()
            
            # Update article views if "viewed"
            if interaction_type == "viewed":
                self.supabase.table("knowledge_base_articles").update({
                    "views": self.supabase.rpc("increment_views", {"id": article_id})
                }).eq("id", article_id).execute()
        
        except Exception as e:
            logger.error(f"Error logging suggestion interaction: {e}")
    
    def get_suggested_articles_for_category(
        self,
        category: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get popular KB articles for a category."""
        if not self.supabase:
            return []
        
        try:
            result = self.supabase.table("knowledge_base_articles").select(
                "id, title, category, tags, views"
            ).eq("category", category).eq("status", "published").order(
                "views", desc=True
            ).limit(limit).execute()
            
            return result.data or []
        
        except Exception as e:
            logger.error(f"Error getting articles for category: {e}")
            return []


def create_kb_service(supabase_client=None) -> KnowledgeBaseService:
    """Factory function to create KB service."""
    return KnowledgeBaseService(supabase_client)
