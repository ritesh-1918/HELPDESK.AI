"""
tag_router.py — REST endpoints for ticket tagging
Issue #404 — Smart Ticket Tagging System
"""
from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel, field_validator
from typing import Optional
from tag_service import suggest_tags, save_tags, get_tags, get_popular_tags

router = APIRouter(prefix="/api/tags", tags=["tags"])


# ── Auth helper ───────────────────────────────────────────────────────────────
def _require_auth(authorization: Optional[str]) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized — Bearer token required")


# ── Request models ────────────────────────────────────────────────────────────
class SuggestRequest(BaseModel):
    ticket_title: str = ""
    ticket_body: str = ""
    category: str = ""

    @field_validator("ticket_title", "ticket_body", "category", mode="before")
    @classmethod
    def truncate(cls, v):
        return str(v)[:500] if v else ""


class SaveTagsRequest(BaseModel):
    tags: list[str]

    @field_validator("tags", mode="before")
    @classmethod
    def validate_tags(cls, v):
        if not isinstance(v, list):
            raise ValueError("tags must be a list")
        if len(v) > 10:
            raise ValueError("Maximum 10 tags allowed")
        return v


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/suggest")
async def suggest_tags_endpoint(
    req: SuggestRequest,
    authorization: Optional[str] = Header(None),
):
    """
    GET AI-suggested tags for ticket content.
    Call this when creating/viewing a ticket before saving tags.
    """
    _require_auth(authorization)
    tags = suggest_tags(req.ticket_title, req.ticket_body, req.category)
    return {"success": True, "suggested_tags": tags}


@router.get("/popular/{company_id}")
async def popular_tags_endpoint(
    company_id: str,
    limit: int = Query(default=20, ge=1, le=50),
    authorization: Optional[str] = Header(None),
):
    """Return top N most-used tags for a company — used for autocomplete."""
    _require_auth(authorization)
    if not company_id or len(company_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid company_id")
    tags = get_popular_tags(company_id, limit)
    return {"success": True, "popular_tags": tags}


@router.get("/{ticket_id}")
async def get_ticket_tags_endpoint(
    ticket_id: str,
    authorization: Optional[str] = Header(None),
):
    """Fetch current saved tags for a ticket."""
    _require_auth(authorization)
    tags = get_tags(ticket_id)
    return {"success": True, "ticket_id": ticket_id, "tags": tags}


@router.post("/{ticket_id}")
async def save_ticket_tags_endpoint(
    ticket_id: str,
    req: SaveTagsRequest,
    authorization: Optional[str] = Header(None),
):
    """Save final accepted tags to a ticket."""
    _require_auth(authorization)
    success = save_tags(ticket_id, req.tags)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save tags")
    saved = get_tags(ticket_id)
    return {"success": True, "ticket_id": ticket_id, "tags": saved}


