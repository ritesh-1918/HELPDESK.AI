from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import supabase
from backend.auth_cookie import get_current_user

router = APIRouter(prefix="/api", tags=["Admin"])

ADMIN_ROLES = {"admin", "master_admin", "company_admin"}

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions — admin role required",
        )
    return current_user

@router.get("/profiles")
async def api_get_profiles(
    role: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    _: dict = Depends(require_admin),
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
    _: dict = Depends(require_admin),
):
    if not supabase: return {}
    res = supabase.table("profiles").update(updates).eq("id", user_id).execute()
    return res.data[0] if res.data else {}

@router.delete("/profiles/{user_id}")
async def api_delete_profile(
    user_id: str,
    _: dict = Depends(require_admin),
):
    if not supabase: return {"success": False}
    supabase.table("profiles").delete().eq("id", user_id).execute()
    try:
        supabase.rpc('delete_user').execute()
    except: pass
    return {"success": True}

@router.get("/companies")
async def api_get_companies(
    _: dict = Depends(require_admin),
):
    if not supabase: return []
    res = supabase.table("companies").select("*").execute()
    return res.data

@router.get("/admin_requests")
async def api_get_admin_requests(
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    _: dict = Depends(require_admin),
):
    if not supabase: return []
    query = supabase.table("admin_requests").select("*")
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data
