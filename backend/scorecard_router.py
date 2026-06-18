"""
scorecard_router.py — Agent performance scorecard endpoints
Issue #774
"""
import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException, Header, Query
from supabase import create_client

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


def _require_auth(authorization: Optional[str]) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization[7:]
    sb = _get_sb()
    if sb:
        try:
            user = sb.auth.get_user(token)
            return {"id": user.user.id, "email": user.user.email}
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {}


def _verify_tenant_access(company_id: str, user_info: dict) -> None:
    """Verify the authenticated user belongs to the requested company."""
    sb = _get_sb()
    if not sb or not user_info.get("id"):
        return
    try:
        profile = sb.table("profiles").select("company_id").eq("id", user_info["id"]).maybe_single().execute()
        user_company = (profile.data or {}).get("company_id") if profile.data else None
        if user_company and str(user_company) != str(company_id):
            raise HTTPException(
                status_code=403,
                detail="Access to this company's scorecard is forbidden",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.warning("Tenant verification failed for user %s: %s", user_info.get("id"), e)


@router.get("/company/{company_id}")
async def company_scorecard(
    company_id: str,
    days: int = Query(default=30, ge=1, le=365),
    authorization: Optional[str] = Header(None),
):
    """Get ranked performance scorecard for all agents in a company."""
    user_info = _require_auth(authorization)
    if not company_id or len(company_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid company_id")
    _verify_tenant_access(company_id, user_info)
    data = get_company_scorecard(company_id, days=days)
    return {"success": True, "agents": data, "total": len(data)}


@router.get("/agent/{agent_id}")
async def agent_scorecard(
    agent_id: str,
    company_id: str,
    days: int = Query(default=30, ge=1, le=365),
    authorization: Optional[str] = Header(None),
):
    """Get individual agent scorecard with metrics + score + AI coaching tip."""
    user_info = _require_auth(authorization)
    _verify_tenant_access(company_id, user_info)
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
    authorization: Optional[str] = Header(None),
):
    """Force-refresh an agent's scorecard (recomputes from latest Supabase data)."""
    user_info = _require_auth(authorization)
    _verify_tenant_access(company_id, user_info)
    data = refresh_agent_scorecard(agent_id, company_id, agent_name, days=days)
    return {"success": True, **data}
