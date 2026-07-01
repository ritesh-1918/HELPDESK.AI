"""
sentiment_router.py — Sentiment analysis endpoints
Issue #775
"""

import os
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from supabase import create_client

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


def _require_auth(authorization: Optional[str]) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization[7:]
    sb = _get_sb()
    if sb:
        try:
            sb.auth.get_user(token)
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")


class AnalyzeRequest(BaseModel):
    ticket_id: str
    ticket_title: str = ""
    ticket_body: str = ""
    current_priority: str = "medium"


@router.post("/analyze")
async def analyze_ticket_sentiment(req: AnalyzeRequest, authorization: Optional[str] = Header(None)):
    """Analyze and persist the sentiment of a support ticket based on its content."""
    _require_auth(authorization)
    result = analyze_and_save(req.ticket_id, req.ticket_title, req.ticket_body, req.current_priority)
    return {"success": True, "ticket_id": req.ticket_id, **result}


@router.get("/ticket/{ticket_id}")
async def get_ticket_sentiment(ticket_id: str, authorization: Optional[str] = Header(None)):
    """Retrieve the analyzed sentiment fields for a specific ticket by its ID."""
    _require_auth(authorization)
    sb = _get_sb()
    if sb is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    try:
        result = (
            sb.table("tickets")
            .select("sentiment_score, frustration_level, sentiment_signals, auto_escalated, sentiment_analyzed")
            .eq("id", ticket_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return {"success": True, **result.data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Sentiment analysis failed", exc_info=exc)
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again later.")


@router.get("/heatmap/{company_id}")
async def frustration_heatmap(company_id: str, authorization: Optional[str] = Header(None)):
    """Generate a CSAT frustration heatmap for a company's support tickets."""
    _require_auth(authorization)
    if not company_id or len(company_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid company_id")
    data = get_frustration_heatmap(company_id)
    return {"success": True, "company_id": company_id, **data}