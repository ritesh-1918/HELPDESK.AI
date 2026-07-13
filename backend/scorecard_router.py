"""
scorecard_router.py — Agent performance scorecard endpoints
Issue #774
"""
import os

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import create_client

from auth_cookie import get_current_user
from agent_scorecard import get_company_scorecard, refresh_agent_scorecard

router = APIRouter(prefix="/api/scorecard", tags=["scorecard"])

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


@router.get("/company/{company_id}")
async def company_scorecard(
    company_id: str,
    days: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(get_current_user),
):
    """Get ranked performance scorecard for all agents in a company."""
    if not company_id or len(company_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid company_id")

    # Tenant isolation: verify caller belongs to the requested company
    user_company = _resolve_company(user)
    if user_company and str(user_company) != company_id:
        raise HTTPException(status_code=403, detail="Access denied: you do not belong to this company")

    data = get_company_scorecard(company_id, days=days)
    return {"success": True, "agents": data, "total": len(data)}


@router.get("/agent/{agent_id}")
async def agent_scorecard(
    agent_id: str,
    company_id: str,
    days: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(get_current_user),
):
    """Get individual agent scorecard with metrics + score + AI coaching tip."""
    # Tenant isolation: verify caller belongs to the requested company
    user_company = _resolve_company(user)
    if user_company and str(user_company) != company_id:
        raise HTTPException(status_code=403, detail="Access denied: you do not belong to this company")

    data = refresh_agent_scorecard(agent_id, company_id, days=days)
    if not data["metrics"]["has_data"]:
        return {
            "success": True,
            "agent_id": agent_id,
            "has_data": False,
            "message": "Insufficient ticket history — check back after resolving more tickets.",
        }
    return {"success": True, "has_data": True, **data}


@router.post("/refresh/{agent_id}")
async def refresh_scorecard(
    agent_id: str,
    company_id: str,
    agent_name: str = "Agent",
    days: int = Query(default=30, ge=1, le=365),
    user: dict = Depends(get_current_user),
):
    """Force-refresh an agent's scorecard (recomputes from latest Supabase data)."""
    # Tenant isolation: verify caller belongs to the requested company
    user_company = _resolve_company(user)
    if user_company and str(user_company) != company_id:
        raise HTTPException(status_code=403, detail="Access denied: you do not belong to this company")

    data = refresh_agent_scorecard(agent_id, company_id, agent_name, days=days)
    return {"success": True, **data}
