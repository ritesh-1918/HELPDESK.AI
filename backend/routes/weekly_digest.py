"""
Weekly Digest Email Routes

Provides endpoints for previewing and triggering the AI-generated weekly
digest email report for admin users.
"""

import datetime
import logging
import os

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import create_client

from backend.auth_cookie import get_current_user
from backend.services.digest_service import (
    get_weekly_stats,
    generate_ai_summary,
    send_digest_email,
)


def _require_tenant(
    company_id: str,
    user: dict,
) -> None:
    uid = user.get("id") or user.get("sub")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Server configuration error.")
    try:
        client = create_client(url, key)
        result = client.table("profiles").select("company_id").eq("id", uid).single().execute()
        data = getattr(result, "data", None) or {}
        user_company = data.get("company_id")
        if user_company and user_company != company_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant mismatch.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tenant verification failed.") from exc

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
async def preview_weekly_digest(
    company_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Generate and return a preview of the weekly digest — ticket stats,
    team performance metrics, and an AI-generated summary — without
    sending any email.
    """
    _require_tenant(company_id, user)
    stats = get_weekly_stats(company_id)
    summary = generate_ai_summary(stats)
    return {"stats": stats, "ai_summary": summary}


@router.post("/send-now", response_model=DigestSendResponse)
async def trigger_weekly_digest(
    body: DigestSendRequest,
    user: dict = Depends(get_current_user),
):
    """
    Manually trigger the dispatch of a weekly operations digest email
    to the specified admin email address.

    The digest includes:
    - Ticket trend counts (open, closed, pending)
    - Team performance metrics (per-team resolution rates, avg times)
    - AI-generated summary with recommendations
    """
    _require_tenant(body.company_id, user)
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
