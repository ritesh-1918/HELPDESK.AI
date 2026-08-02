"""
sentiment_router.py — Sentiment analysis endpoints
Issue #775
"""

import os
import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client

from auth_cookie import get_current_user
from sentiment_service import analyze_and_save, get_frustration_heatmap

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sentiment", tags=["sentiment"])

_sb = None


def _get_sb():
    global _sb
    if _sb is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_KEY", "")
        if url and key:
            _sb = create_client(url, key)
    return _sb


def _resolve_company(user: dict) -> str | None:
    """Resolve the authenticated user's company_id from the profiles table."""
    sb = _get_sb()
    if not sb:
        return None
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        return None
    try:
        res = sb.table("profiles").select("company_id").eq("id", user_id).single().execute()
        return res.data.get("company_id") if res.data else None
    except Exception:
        return None


class AnalyzeRequest(BaseModel):
    ticket_id: str
    ticket_title: str = ""
    ticket_body: str = ""
    current_priority: str = "medium"


@router.post("/analyze")
async def analyze_ticket_sentiment(req: AnalyzeRequest, user: dict = Depends(get_current_user)):
    """Analyze and persist the sentiment of a support ticket based on its content."""
    result = analyze_and_save(req.ticket_id, req.ticket_title, req.ticket_body, req.current_priority)
    return {"success": True, "ticket_id": req.ticket_id, **result}


@router.get("/ticket/{ticket_id}")
async def get_ticket_sentiment(ticket_id: str, user: dict = Depends(get_current_user)):
    """Retrieve the analyzed sentiment fields for a specific ticket by its ID."""
    sb = _get_sb()
    if sb is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    try:
        result = (
            sb.table("tickets")
            .select("sentiment_score, frustration_level, sentiment_signals, auto_escalated, sentiment_analyzed, company_id")
            .eq("id", ticket_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Ticket not found")

        # Tenant isolation: verify caller belongs to the ticket's company
        user_company = _resolve_company(user)
        ticket_company = result.data.get("company_id")
        if user_company and ticket_company and str(user_company) != str(ticket_company):
            raise HTTPException(status_code=403, detail="Access denied: ticket belongs to another organization")

        return {"success": True, **result.data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Sentiment analysis failed", exc_info=exc)
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again later.")


@router.get("/heatmap/{company_id}")
async def frustration_heatmap(company_id: str, user: dict = Depends(get_current_user)):
    """Generate a CSAT frustration heatmap for a company's support tickets."""
    if not company_id or len(company_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid company_id")

    # Tenant isolation: verify caller belongs to the requested company
    user_company = _resolve_company(user)
    if user_company and str(user_company) != company_id:
        raise HTTPException(status_code=403, detail="Access denied: you do not belong to this company")

    data = get_frustration_heatmap(company_id)
    return {"success": True, "company_id": company_id, **data}