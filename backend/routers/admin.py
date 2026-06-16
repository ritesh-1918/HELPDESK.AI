from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.auth_cookie import get_current_user
from backend.database import supabase

router = APIRouter(prefix="/api", tags=["Admin"])


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    locale: Optional[str] = None
    notification_preferences: Optional[dict] = None


ALLOWED_ADMIN_ROLES = ("admin", "master_admin")

@router.get("/profiles")
async def api_get_profiles(
    role: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") not in ALLOWED_ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    if not supabase:
        return []
    query = supabase.table("profiles").select("*")
    if role: query = query.eq("role", role)
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data

@router.patch("/profiles/{user_id}")
async def api_update_profile(
    user_id: str,
    updates: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not supabase:
        return {}
    caller_id = current_user.get("id")
    caller_role = current_user.get("role")
    if caller_id != user_id and caller_role not in ALLOWED_ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    filtered = updates.model_dump(exclude_none=True)
    if not filtered:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    res = supabase.table("profiles").update(filtered).eq("id", user_id).execute()
    return res.data[0] if res.data else {}

@router.delete("/profiles/{user_id}")
async def api_delete_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") not in ALLOWED_ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    if not supabase:
        return {"success": False}
    supabase.table("profiles").delete().eq("id", user_id).execute()
    try:
        supabase.rpc('delete_user').execute()
    except: pass
    return {"success": True}

@router.get("/companies")
async def api_get_companies(
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") not in ALLOWED_ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    if not supabase:
        return []
    res = supabase.table("companies").select("*").execute()
    return res.data

@router.get("/admin_requests")
async def api_get_admin_requests(
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") not in ALLOWED_ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    if not supabase:
        return []
    query = supabase.table("admin_requests").select("*")
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data
