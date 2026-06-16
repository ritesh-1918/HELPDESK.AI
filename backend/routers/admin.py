from fastapi import APIRouter, Depends, HTTPException
from backend.database import supabase
from backend.auth_cookie import get_current_user
from backend.schemas import ProfileUpdate

router = APIRouter(prefix="/api", tags=["Admin"])

@router.get("/profiles")
async def api_get_profiles(
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
    updates: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    # Authorization: only the user themselves, or admin/master_admin, may update.
    caller_id = current_user.get("id") or current_user.get("user_id")
    caller_role = current_user.get("role")
    if caller_id != user_id and caller_role not in ("admin", "master_admin"):
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")

    if not supabase: return {}
    # Schema validation in ProfileUpdate (extra="forbid") already blocks
    # any field outside the allowlist, so a Pydantic .model_dump() with
    # exclude_unset=True gives us only what the client actually sent.
    payload = updates.model_dump(exclude_unset=True)
    if not payload:
        return {}
    res = supabase.table("profiles").update(payload).eq("id", user_id).execute()
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
