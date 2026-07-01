from __future__ import annotations

import io
import json
import logging
from datetime import datetime, timezone
from typing import Any, Optional, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from backend.auth_cookie import get_current_user
from backend.limiter import limiter
from backend.services.gdpr_service import load as load_gdpr_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["privacy"])

class ConsentPreferences(BaseModel):
    marketing_emails: Optional[bool] = None
    product_updates: Optional[bool] = None
    announcements: Optional[bool] = None
    usage_analytics: Optional[bool] = None
    performance_monitoring: Optional[bool] = None
    behavior_tracking: Optional[bool] = None
    experimental_features: Optional[bool] = None
    research_participation: Optional[bool] = None

class ConsentUpdateRequest(BaseModel):
    user_id: Optional[str] = None
    consent: Optional[Dict[str, Any]] = None
    actor: Optional[str] = "user"

class ExportRequest(BaseModel):
    format: str = "json"

class DeletionRequestInput(BaseModel):
    user_id: Optional[str] = None
    reason: Optional[str] = ""

class StatusUpdateRequest(BaseModel):
    admin_notes: Optional[str] = None

# Helper to load GDPR Service
def get_gdpr_service() -> Any:
    return load_gdpr_service()

# Helper to check DNT and override preferences
def apply_dnt_override(request: Request, prefs: dict) -> dict:
    dnt = request.headers.get("dnt") or request.headers.get("DNT")
    if dnt == "1":
        logger.info("DNT signal detected: overriding analytics & tracking consent states to False")
        prefs["usage_analytics"] = False
        prefs["behavior_tracking"] = False
    return prefs

# --- Preferences/Consent Routes ---

@router.get("/api/privacy/preferences")
@router.get("/privacy/consent")
@router.get("/api/privacy/consents")
@router.get("/privacy/consents")
@limiter.limit("30/minute")
async def get_privacy_preferences_route(
    request: Request,
    user_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
    service = Depends(get_gdpr_service)
):
    """Return the caller's privacy and consent preferences."""
    uid = user.get("id") or user.get("sub")
    if not uid and user_id:
        uid = user_id
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    prefs = service.get_privacy_preferences(uid)
    prefs = apply_dnt_override(request, prefs)
    
    # If legacy client requested `/privacy/consent`, return legacy wrapper
    if request.url.path == "/privacy/consent":
        return {
            "consent": prefs,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "user_id": uid
        }
    return prefs

@router.post("/api/privacy/preferences")
@router.post("/privacy/consent")
@router.put("/privacy/consent")
@router.put("/api/privacy/consents")
@router.put("/privacy/consents")
@limiter.limit("15/minute")
async def update_privacy_preferences_route(
    request: Request,
    user: dict = Depends(get_current_user),
    service = Depends(get_gdpr_service)
):
    """Update the caller's privacy and consent preferences."""
    body_data = {}
    try:
        body_data = await request.json()
    except Exception:
        pass
        
    # Handle nested consent object or direct preferences
    consent_data = body_data.get("consent") if isinstance(body_data.get("consent"), dict) else body_data
    
    # Clean non-preference fields from consent_data
    clean_consent = {}
    for key in ["marketing_emails", "product_updates", "announcements", "usage_analytics", 
                "performance_monitoring", "behavior_tracking", "experimental_features", "research_participation"]:
        if key in consent_data:
            clean_consent[key] = bool(consent_data[key])
            
    uid = user.get("id") or user.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    updated_prefs = service.update_privacy_preferences(uid, clean_consent)
    
    if request.url.path in ("/privacy/consent", "/api/privacy/consent"):
        return {
            "consent": updated_prefs,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "user_id": uid
        }
    return updated_prefs

# --- Privacy Requests Routes ---

@router.get("/api/privacy/requests")
@router.get("/privacy/requests")
@router.get("/api/privacy/delete-status")
@limiter.limit("30/minute")
async def get_privacy_requests_route(
    request: Request,
    user_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
    service = Depends(get_gdpr_service)
):
    """Return the caller's privacy request history."""
    uid = user.get("id") or user.get("sub")
    if not uid and user_id:
        uid = user_id
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    reqs = service.get_privacy_requests(uid)
    return reqs

@router.post("/api/privacy/delete-request")
@router.post("/privacy/request_deletion")
@limiter.limit("5/minute")
async def request_deletion_route(
    request: Request,
    body: Optional[DeletionRequestInput] = None,
    user: dict = Depends(get_current_user),
    service = Depends(get_gdpr_service)
):
    """Submit a privacy deletion request for the current user."""
    uid = user.get("id") or user.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    res = service.submit_privacy_request(uid, "deletion")
    return res

@router.post("/api/privacy/cancel-delete")
@limiter.limit("5/minute")
async def cancel_deletion_route(
    request: Request,
    user: dict = Depends(get_current_user),
    service = Depends(get_gdpr_service)
):
    """Cancel any pending privacy deletion requests for the current user."""
    uid = user.get("id") or user.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    res = service.supabase.table("privacy_requests").select("*").eq("user_id", uid).eq("request_type", "deletion").eq("status", "Submitted").execute()
    requests = res.data or []
    cancelled_count = 0
    for req in requests:
        service.update_privacy_request_status(req["id"], "Completed", "Cancelled by User")
        cancelled_count += 1
    return {"status": "success", "cancelled_requests": cancelled_count}

@router.post("/api/admin/privacy/requests/{request_id}/approve")
@limiter.limit("10/minute")
async def update_request_status_route(
    request_id: str,
    body: StatusUpdateRequest,
    request: Request,
    user: dict = Depends(get_current_user),
    service = Depends(get_gdpr_service)
):
    """Approve or complete a privacy request when the caller is allowed to do so."""
    uid = user.get("id") or user.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    # Check permissions (either the owner of request, or admin)
    res = service.supabase.table("privacy_requests").select("*").eq("id", request_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req = res.data[0]
    is_owner = str(req.get("user_id")) == str(uid)
    role = (user.get("user_metadata") or {}).get("role") or user.get("role")
    is_admin = role in ("admin", "company_admin", "master_admin")
    
    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    admin_notes = body.admin_notes or ""
    # Decide status
    status_val = "Completed"
    if "cancel" in admin_notes.lower() or "cancelled" in admin_notes.lower():
        status_val = "Completed"
        if not admin_notes:
            admin_notes = "Cancelled by User"
            
    updated = service.update_privacy_request_status(request_id, status_val, admin_notes)
    return updated

# --- Export Data Route ---

@router.get("/api/privacy/export")
@router.post("/api/privacy/export")
@router.get("/privacy/export")
@router.post("/privacy/export")
@limiter.limit("5/minute")
async def export_data_route(
    request: Request,
    user_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
    service = Depends(get_gdpr_service)
):
    """Export a user's data as JSON or CSV."""
    uid = user.get("id") or user.get("sub")
    if not uid and user_id:
        uid = user_id
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    # Determine format
    fmt = "json"
    if request.method == "POST":
        try:
            body = await request.json()
            fmt = str(body.get("format", "json")).lower()
        except Exception:
            pass
    else:
        fmt = str(request.query_params.get("format", "json")).lower()
        
    if fmt not in ("json", "csv"):
        fmt = "json"
        
    # Generate data
    export_data = service.generate_user_data_export(uid)
    
    # Log audit
    service.submit_privacy_request(uid, "export")
    
    if fmt == "csv":
        csv_stream = service.export_to_csv_zip_stream(export_data)
        return StreamingResponse(
            csv_stream,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=helpdesk_export_{uid}.csv"}
        )
    else:
        # JSON format download file
        json_bytes = json.dumps(export_data, default=str, indent=2).encode("utf-8")
        bio = io.BytesIO(json_bytes)
        return StreamingResponse(
            bio,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=helpdesk_export_{uid}.json"}
        )

# --- Daily Background Retention Scheduler Loop ---

import asyncio

async def privacy_retention_scheduler_loop_async(supabase_client: Any, interval_seconds: int = 86400):
    """Background task loop that runs privacy lifecycle operations periodically (e.g. daily)."""
    logger.info("Privacy retention scheduler loop started (interval=%ds)", interval_seconds)
    # Give the server startup some settle time before first scan
    await asyncio.sleep(10)
    service = load_gdpr_service(supabase_client)
    while True:
        try:
            logger.info("[PrivacyScheduler] Starting daily compliance retention check...")
            
            # 1. Clean up expired attachments (resolved tickets older than 90 days)
            attachments_wiped = service.cleanup_expired_attachments(days=90)
            
            # 2. Archive tickets resolved/closed over 1 year ago
            tickets_archived = service.archive_old_tickets(years=1)
            
            # 3. Clean up inactive accounts (inactive for 2+ years)
            inactive_accounts_processed = service.cleanup_inactive_accounts(years=2)
            
            # 4. Process deletion requests past the 30-day grace period
            deletions_executed = service.process_expired_deletion_requests(days=30)
            
            logger.info(
                "[PrivacyScheduler] Check finished: Wiped %d attachments, Archived %d tickets, Flagged %d inactive accounts, Executed %d erasures",
                attachments_wiped, tickets_archived, inactive_accounts_processed, deletions_executed
            )
        except Exception as e:
            logger.error("[PrivacyScheduler] Error during retention check: %s", e)
            
        await asyncio.sleep(interval_seconds)
