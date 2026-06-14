import logging
import traceback
from fastapi import APIRouter, Depends, HTTPException
from backend.database import supabase
from backend.auth_cookie import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Admin"])

@router.get("/profiles")
async def api_get_profiles(
    role: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        query = supabase.table("profiles").select("*")
        if role:
            query = query.eq("role", role)
        if status:
            query = query.eq("status", status)
        res = query.range(offset, offset + limit - 1).execute()
        return res.data
    except Exception as e:
        logger.error(f"Failed to fetch profiles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profiles")

@router.patch("/profiles/{user_id}")
async def api_update_profile(
    user_id: str,
    updates: dict,
    current_user: dict = Depends(get_current_user),
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        res = supabase.table("profiles").update(updates).eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update profile {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.delete("/profiles/{user_id}")
async def api_delete_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        supabase.table("profiles").delete().eq("id", user_id).execute()
        try:
            supabase.rpc('delete_user').execute()
        except Exception as e:
            logger.warning(f"delete_user RPC failed for {user_id}: {e}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Failed to delete profile {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete profile")

@router.get("/companies")
async def api_get_companies(
    current_user: dict = Depends(get_current_user),
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        res = supabase.table("companies").select("*").execute()
        return res.data
    except Exception as e:
        logger.error(f"Failed to fetch companies: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch companies")

@router.get("/admin_requests")
async def api_get_admin_requests(
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        query = supabase.table("admin_requests").select("*")
        if status:
            query = query.eq("status", status)
        res = query.range(offset, offset + limit - 1).execute()
        return res.data
    except Exception as e:
        logger.error(f"Failed to fetch admin requests: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin requests")
