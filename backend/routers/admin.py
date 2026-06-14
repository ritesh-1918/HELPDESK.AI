from fastapi import APIRouter, Depends, HTTPException, Request
from backend.database import supabase
from backend.auth_cookie import get_current_user
from backend.limiter import limiter, ADMIN_LIMIT

router = APIRouter(prefix="/api", tags=["Admin"])

@router.get("/profiles")
@limiter.limit(ADMIN_LIMIT)
async def api_get_profiles(
    request: Request,
    role: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    if not supabase: return []
    query = supabase.table("profiles").select("*")
    if role: query = query.eq("role", role)
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data

@router.patch("/profiles/{user_id}")
async def api_update_profile(
    user_id: str,
    updates: dict,
    current_user: dict = Depends(get_current_user),
):
    if not supabase: return {}
    res = supabase.table("profiles").update(updates).eq("id", user_id).execute()
    return res.data[0] if res.data else {}

@router.delete("/profiles/{user_id}")
async def api_delete_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not supabase: return {"success": False}
    supabase.table("profiles").delete().eq("id", user_id).execute()
    try:
        supabase.rpc('delete_user').execute()
    except: pass
    return {"success": True}

@router.get("/companies")
async def api_get_companies(
    current_user: dict = Depends(get_current_user),
):
    if not supabase: return []
    res = supabase.table("companies").select("*").execute()
    return res.data

@router.get("/admin_requests")
async def api_get_admin_requests(
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    if not supabase: return []
    query = supabase.table("admin_requests").select("*")
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data
