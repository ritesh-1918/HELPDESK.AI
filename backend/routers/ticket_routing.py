"""
Ticket Routing API Router

Provides endpoints for automatic ticket routing based on classification.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from backend.auth.tenant_middleware import security_manager
from backend.database import supabase
from backend.services.ticket_routing_service import create_routing_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tickets", tags=["Ticket Routing"])


class RoutingThresholdsRequest(BaseModel):
    """Request model for updating routing thresholds."""
    critical: float = 0.95
    specialized: float = 0.80
    standard: float = 0.60


@router.post("/{ticket_id}/auto-route")
async def auto_route_ticket(
    ticket_id: str,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Automatically route a ticket based on classification confidence."""
    try:
        company_id = user.get("company_id")
        
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        # Get ticket
        if not supabase:
            raise HTTPException(status_code=503, detail="Database not available")
        
        ticket_result = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
        ticket = ticket_result.data
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Route ticket
        routing_service = create_routing_service(supabase)
        routing_result = routing_service.route_ticket(ticket, company_id)
        
        if routing_result["success"]:
            # Update ticket with assigned team/agent
            update_data = {
                "assigned_team": routing_result["assigned_team"],
            }
            if routing_result.get("assigned_to"):
                update_data["assigned_to"] = routing_result["assigned_to"]
            
            supabase.table("tickets").update(update_data).eq("id", ticket_id).execute()
        
        return routing_result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error auto-routing ticket: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/routing/analytics")
async def get_routing_analytics(
    hours: int = Query(default=24, ge=1, le=168),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Get ticket routing analytics for the company."""
    try:
        company_id = user.get("company_id")
        
        routing_service = create_routing_service(supabase)
        analytics = routing_service.get_routing_analytics(company_id, hours)
        
        return {
            "company_id": company_id,
            "time_range_hours": hours,
            **analytics
        }
    
    except Exception as e:
        logger.error(f"Error getting routing analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/routing/thresholds")
async def update_routing_thresholds(
    request: RoutingThresholdsRequest,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Update routing thresholds for the company."""
    try:
        company_id = user.get("company_id")
        role = user.get("role")
        
        # Only admins can update thresholds
        if role not in ["admin", "master_admin"]:
            raise HTTPException(status_code=403, detail="Only admins can update routing thresholds")
        
        routing_service = create_routing_service(supabase)
        result = routing_service.adjust_routing_thresholds(
            company_id,
            request.dict()
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating thresholds: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
