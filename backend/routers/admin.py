from fastapi import APIRouter, Depends, HTTPException
from backend.database import supabase
from backend.auth_cookie import get_current_user
from backend.schemas import ProfileUpdate

router = APIRouter(prefix="/api", tags=["Admin"])


async def _require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Verify the caller has an admin-level role before allowing access."""
    user_id = current_user.get("id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    try:
        res = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
        profile = res.data or {}
    except Exception:
        raise HTTPException(status_code=403, detail="Admin access required")

    role = str(profile.get("role", "")).lower()
    if role not in ("admin", "company_admin", "master_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user


@router.get("/profiles")
async def api_get_profiles(
    role: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    _: dict = Depends(_require_admin),
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
    _: dict = Depends(_require_admin),
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
    _: dict = Depends(_require_admin),
):
    """Delete a user profile and cascade auth cleanup when possible."""
    if not supabase: return {"success": False}
    supabase.table("profiles").delete().eq("id", user_id).execute()
    try:
        supabase.rpc('delete_user').execute()
    except:
        pass
    return {"success": True}

@router.get("/companies")
async def api_get_companies(
    _: dict = Depends(_require_admin),
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
    _: dict = Depends(_require_admin),
):
    """List admin requests with optional status filtering."""
    if not supabase: return []
    query = supabase.table("admin_requests").select("*")
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data
