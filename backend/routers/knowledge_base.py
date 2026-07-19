"""
Knowledge Base API Router

Provides endpoints for knowledge base article suggestions and management.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.auth.tenant_middleware import security_manager
from backend.database import supabase
from backend.services.knowledge_base_service import create_kb_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/knowledge-base", tags=["Knowledge Base"])


class SuggestionFeedbackRequest(BaseModel):
    """Request model for KB suggestion feedback."""
    ticket_id: str
    article_id: str
    feedback: str  # "helpful", "not_helpful", "viewed"


@router.get("/articles/suggest/{ticket_id}")
async def suggest_articles(
    ticket_id: str,
    limit: int = 5,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Get suggested knowledge base articles for a ticket."""
    try:
        company_id = user.get("company_id")
        
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        # Get ticket
        if not supabase:
            raise HTTPException(status_code=503, detail="Database not available")
        
        ticket_result = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
        ticket = ticket_result.data
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Get suggestions
        kb_service = create_kb_service(supabase)
        suggestions = kb_service.suggest_articles(ticket, limit)
        
        return {
            "ticket_id": ticket_id,
            "suggestion_count": len(suggestions),
            "articles": suggestions
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suggesting articles: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/articles/feedback")
async def submit_kb_feedback(
    request: SuggestionFeedbackRequest,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Submit feedback on knowledge base article suggestion."""
    try:
        company_id = user.get("company_id")
        
        kb_service = create_kb_service(supabase)
        kb_service.log_suggestion_interaction(
            request.ticket_id,
            request.article_id,
            request.feedback,
            company_id
        )
        
        return {"success": True, "feedback_recorded": True}
    
    except Exception as e:
        logger.error(f"Error recording feedback: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/{category}")
async def get_category_articles(
    category: str,
    limit: int = 10,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Get popular articles for a category."""
    try:
        kb_service = create_kb_service(supabase)
        articles = kb_service.get_suggested_articles_for_category(category, limit)
        
        return {
            "category": category,
            "article_count": len(articles),
            "articles": articles
        }
    
    except Exception as e:
        logger.error(f"Error getting category articles: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
