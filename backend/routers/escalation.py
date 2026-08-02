"""
Priority Escalation Rules API Router

Endpoints for managing priority escalation rules and viewing escalation logs.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from backend.auth.tenant_middleware import security_manager
from backend.config import settings
from supabase import create_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/escalation", tags=["Priority Escalation"])

# Initialize Supabase client
supabase = None
if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}")


# -------------------- Pydantic Models -------------------- #

class EscalationRuleCreate(BaseModel):
    """Model for creating a new escalation rule."""
    rule_name: str = Field(..., min_length=3, max_length=200)
    rule_description: Optional[str] = Field(None, max_length=500)
    from_priority: str = Field(..., pattern="^(low|medium|high|critical)$")
    to_priority: str = Field(..., pattern="^(low|medium|high|critical)$")
    age_threshold_hours: Optional[int] = Field(None, gt=0)
    reopen_count_threshold: Optional[int] = Field(None, gt=0)
    enabled: bool = True
    priority_order: int = Field(default=0, ge=0)


class EscalationRuleUpdate(BaseModel):
    """Model for updating an escalation rule."""
    rule_name: Optional[str] = Field(None, min_length=3, max_length=200)
    rule_description: Optional[str] = Field(None, max_length=500)
    from_priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    to_priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    age_threshold_hours: Optional[int] = Field(None, gt=0)
    reopen_count_threshold: Optional[int] = Field(None, gt=0)
    enabled: Optional[bool] = None
    priority_order: Optional[int] = Field(None, ge=0)


class EscalationRuleResponse(BaseModel):
    """Response model for escalation rule."""
    id: str
    company_id: Optional[str]
    rule_name: str
    rule_description: Optional[str]
    from_priority: str
    to_priority: str
    age_threshold_hours: Optional[int]
    reopen_count_threshold: Optional[int]
    enabled: bool
    priority_order: int
    created_at: str
    updated_at: str


class EscalationSweepResponse(BaseModel):
    """Response model for escalation sweep operation."""
    success: bool
    stats: dict
    message: str


# -------------------- Endpoints -------------------- #

@router.get("/rules", response_model=List[EscalationRuleResponse])
async def list_escalation_rules(
    company_id: Optional[str] = Query(None),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    List all escalation rules for a company (admin only).
    
    Returns company-specific rules and global rules.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    # Verify admin access
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    target_company_id = company_id or user.get("company_id")
    security_manager.verify_tenant_access(target_company_id, user)
    
    try:
        # Fetch both company-specific and global rules
        query = (
            supabase
            .table("priority_escalation_rules")
            .select("*")
            .order("priority_order", desc=False)
        )
        
        if target_company_id:
            query = query.or_(f"company_id.eq.{target_company_id},company_id.is.null")
        else:
            query = query.is_("company_id", "null")
        
        result = query.execute()
        rules = result.data or []
        
        return rules
    except Exception as exc:
        logger.error(f"Error fetching escalation rules: {exc}")
        raise HTTPException(status_code=500, detail="Failed to fetch escalation rules")


@router.post("/rules", response_model=EscalationRuleResponse, status_code=201)
async def create_escalation_rule(
    rule: EscalationRuleCreate,
    company_id: Optional[str] = Query(None),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Create a new escalation rule (admin only).
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    # Verify admin access
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    target_company_id = company_id or user.get("company_id")
    security_manager.verify_tenant_access(target_company_id, user)
    
    # Validate rule logic
    if not rule.age_threshold_hours and not rule.reopen_count_threshold:
        raise HTTPException(
            status_code=400,
            detail="At least one threshold (age_threshold_hours or reopen_count_threshold) must be specified"
        )
    
    # Validate no priority downgrade
    priority_order = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    if priority_order[rule.from_priority] >= priority_order[rule.to_priority]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid escalation: cannot escalate from {rule.from_priority} to {rule.to_priority}"
        )
    
    try:
        new_rule = {
            "company_id": target_company_id,
            "rule_name": rule.rule_name,
            "rule_description": rule.rule_description,
            "from_priority": rule.from_priority,
            "to_priority": rule.to_priority,
            "age_threshold_hours": rule.age_threshold_hours,
            "reopen_count_threshold": rule.reopen_count_threshold,
            "enabled": rule.enabled,
            "priority_order": rule.priority_order,
            "created_by": user.get("id")
        }
        
        result = supabase.table("priority_escalation_rules").insert(new_rule).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create escalation rule")
        
        return result.data[0]
    except Exception as exc:
        logger.error(f"Error creating escalation rule: {exc}")
        raise HTTPException(status_code=500, detail="Failed to create escalation rule")


@router.patch("/rules/{rule_id}", response_model=EscalationRuleResponse)
async def update_escalation_rule(
    rule_id: str,
    rule_update: EscalationRuleUpdate,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Update an existing escalation rule (admin only).
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    # Verify admin access
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Fetch existing rule to verify ownership
        existing = supabase.table("priority_escalation_rules").select("*").eq("id", rule_id).execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Escalation rule not found")
        
        existing_rule = existing.data[0]
        rule_company_id = existing_rule.get("company_id")
        
        # Verify tenant access
        if rule_company_id:
            security_manager.verify_tenant_access(rule_company_id, user)
        
        # Build update dict (only include non-None fields)
        updates = {}
        if rule_update.rule_name is not None:
            updates["rule_name"] = rule_update.rule_name
        if rule_update.rule_description is not None:
            updates["rule_description"] = rule_update.rule_description
        if rule_update.from_priority is not None:
            updates["from_priority"] = rule_update.from_priority
        if rule_update.to_priority is not None:
            updates["to_priority"] = rule_update.to_priority
        if rule_update.age_threshold_hours is not None:
            updates["age_threshold_hours"] = rule_update.age_threshold_hours
        if rule_update.reopen_count_threshold is not None:
            updates["reopen_count_threshold"] = rule_update.reopen_count_threshold
        if rule_update.enabled is not None:
            updates["enabled"] = rule_update.enabled
        if rule_update.priority_order is not None:
            updates["priority_order"] = rule_update.priority_order
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Validate priority escalation logic if priorities are being updated
        from_pri = updates.get("from_priority", existing_rule.get("from_priority"))
        to_pri = updates.get("to_priority", existing_rule.get("to_priority"))
        
        priority_order = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        if priority_order[from_pri] >= priority_order[to_pri]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid escalation: cannot escalate from {from_pri} to {to_pri}"
            )
        
        result = supabase.table("priority_escalation_rules").update(updates).eq("id", rule_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update escalation rule")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error updating escalation rule: {exc}")
        raise HTTPException(status_code=500, detail="Failed to update escalation rule")


@router.delete("/rules/{rule_id}", status_code=204)
async def delete_escalation_rule(
    rule_id: str,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Delete an escalation rule (admin only).
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    # Verify admin access
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Fetch existing rule to verify ownership
        existing = supabase.table("priority_escalation_rules").select("*").eq("id", rule_id).execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Escalation rule not found")
        
        rule_company_id = existing.data[0].get("company_id")
        
        # Verify tenant access
        if rule_company_id:
            security_manager.verify_tenant_access(rule_company_id, user)
        
        # Delete the rule
        supabase.table("priority_escalation_rules").delete().eq("id", rule_id).execute()
        
        return None
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error deleting escalation rule: {exc}")
        raise HTTPException(status_code=500, detail="Failed to delete escalation rule")


@router.get("/logs")
async def list_escalation_logs(
    company_id: Optional[str] = Query(None),
    ticket_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    List priority escalation logs (admin and agents can view).
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    target_company_id = company_id or user.get("company_id")
    security_manager.verify_tenant_access(target_company_id, user)
    
    try:
        query = (
            supabase
            .table("priority_escalation_log")
            .select("*")
            .order("escalated_at", desc=True)
            .limit(limit)
        )
        
        if target_company_id:
            query = query.eq("company_id", target_company_id)
        
        if ticket_id:
            query = query.eq("ticket_id", ticket_id)
        
        result = query.execute()
        logs = result.data or []
        
        return {"logs": logs, "count": len(logs)}
    except Exception as exc:
        logger.error(f"Error fetching escalation logs: {exc}")
        raise HTTPException(status_code=500, detail="Failed to fetch escalation logs")


@router.post("/sweep", response_model=EscalationSweepResponse)
async def run_escalation_sweep(
    company_id: Optional[str] = Query(None),
    send_alerts: bool = Query(True),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Manually trigger an escalation sweep (admin only).
    
    Evaluates all open tickets against escalation rules and escalates as needed.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    # Verify admin access
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    target_company_id = company_id or user.get("company_id")
    security_manager.verify_tenant_access(target_company_id, user)
    
    try:
        from backend.services.priority_escalation_service import priority_escalation_service
        
        stats = priority_escalation_service.run_escalation_sweep(
            supabase,
            company_id=target_company_id,
            send_alerts=send_alerts
        )
        
        return {
            "success": True,
            "stats": stats,
            "message": f"Escalation sweep complete. {stats.get('escalated', 0)} tickets escalated."
        }
    except Exception as exc:
        logger.error(f"Error running escalation sweep: {exc}")
        raise HTTPException(status_code=500, detail="Failed to run escalation sweep")
