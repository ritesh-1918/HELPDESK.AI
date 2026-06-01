"""
Weekly Digest Email Routes

Provides endpoints for previewing and triggering the AI-generated weekly
digest email report for admin users.
"""

import datetime
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.services.digest_service import (
    get_weekly_stats,
    generate_ai_summary,
    send_digest_email,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/digest", tags=["Weekly Digest"])


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class DigestSendRequest(BaseModel):
    """Body for manually triggering a digest email dispatch."""
    company_id: str
    email: str


class DigestStatsResponse(BaseModel):
    """Preview response containing raw stats and AI summary."""
    stats: dict
    ai_summary: str


class DigestSendResponse(BaseModel):
    """Response after a successful digest dispatch."""
    status: str
    recipient: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/preview/{company_id}", response_model=DigestStatsResponse)
async def preview_weekly_digest(company_id: str):
    """
    Generate and return a preview of the weekly digest — ticket stats,
    team performance metrics, and an AI-generated summary — without
    sending any email.
    """
    stats = get_weekly_stats(company_id)
    summary = generate_ai_summary(stats)
    return {"stats": stats, "ai_summary": summary}


@router.post("/send-now", response_model=DigestSendResponse)
async def trigger_weekly_digest(body: DigestSendRequest):
    """
    Manually trigger the dispatch of a weekly operations digest email
    to the specified admin email address.

    The digest includes:
    - Ticket trend counts (open, closed, pending)
    - Team performance metrics (per-team resolution rates, avg times)
    - AI-generated summary with recommendations
    """
    from backend.main import supabase

    stats = get_weekly_stats(body.company_id)
    summary = generate_ai_summary(stats)
    success = send_digest_email(body.email, stats, summary)

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send digest email. Check if RESEND_API_KEY is configured.",
        )

    # Track the last sent timestamp in settings
    if supabase:
        try:
            supabase.table("system_settings").update({
                "digest_last_sent": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }).eq("company_id", body.company_id).execute()
        except Exception as e:
            logger.warning(f"[Digest] Failed to update digest_last_sent: {e}")

    return {"status": "success", "recipient": body.email}
