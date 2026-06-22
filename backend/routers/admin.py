import os

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client

from backend.database import supabase
from backend.auth_cookie import get_current_user
from backend.schemas import ProfileUpdate


ADMIN_ROLES = ("admin", "master_admin")


async def require_admin(current_user: dict = Depends(get_current_user)) -> None:
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Server configuration error.")
    try:
        client = create_client(url, key)
        result = client.table("profiles").select("role").eq("id", user_id).single().execute()
        data = getattr(result, "data", None) or {}
        if data.get("role") not in ADMIN_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authorization check failed.") from exc


router = APIRouter(prefix="/api", tags=["Admin"])

@router.get("/profiles")
async def api_get_profiles(
    role: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(require_admin),
):
    """List admin-visible profiles with optional role and status filters."""
    if not supabase: return []
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
    _: None = Depends(require_admin),
):
    """Apply an admin edit to a user profile."""
    if not supabase: return {}
    payload = updates.model_dump(exclude_unset=True)
    if not payload:
        return {}
    res = supabase.table("profiles").update(payload).eq("id", user_id).execute()
    return res.data[0] if res.data else {}

@router.delete("/profiles/{user_id}")
async def api_delete_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(require_admin),
):
    """Delete a user profile and cascade auth cleanup when possible."""
    if not supabase: return {"success": False}
    supabase.table("profiles").delete().eq("id", user_id).execute()
    try:
        supabase.rpc('delete_user').execute()
    except: pass
    return {"success": True}

@router.get("/companies")
async def api_get_companies(
    current_user: dict = Depends(get_current_user),
    _: None = Depends(require_admin),
):
    """Return the company list visible to the current admin."""
    if not supabase: return []
    res = supabase.table("companies").select("*").execute()
    return res.data

@router.get("/admin_requests")
async def api_get_admin_requests(
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(require_admin),
):
    """List admin requests with optional status filtering."""
    if not supabase: return []
    query = supabase.table("admin_requests").select("*")
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data
