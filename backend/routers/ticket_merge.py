"""
Ticket Merge and Duplicate Detection API Router

Provides endpoints for detecting and managing duplicate tickets.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from backend.auth.tenant_middleware import security_manager
from backend.database import supabase
from backend.services.ticket_deduplication_service import (
    TicketDeduplicationService,
    create_deduplication_service
)
from backend.services.ticket_merge_service import (
    TicketMergeService,
    create_merge_service
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tickets", tags=["Ticket Merge & Deduplication"])


# Request/Response Models

class DuplicateCheckResponse(BaseModel):
    """Response model for duplicate check."""
    has_duplicates: bool
    duplicate_count: int
    duplicates: List[dict]
    similar_count: int
    similar_tickets: List[dict]


class MergeTicketsRequest(BaseModel):
    """Request model for merging tickets."""
    primary_ticket_id: str = Field(..., description="ID of ticket to keep")
    secondary_ticket_id: str = Field(..., description="ID of ticket to close as duplicate")
    merge_note: Optional[str] = Field(None, description="Optional note explaining the merge")


class MergeTicketsResponse(BaseModel):
    """Response model for merge operation."""
    success: bool
    merge_id: Optional[str] = None
    primary_ticket_id: Optional[str] = None
    secondary_ticket_id: Optional[str] = None
    comments_copied: int = 0
    attachments_copied: int = 0
    timestamp: Optional[str] = None
    error: Optional[str] = None


class LinkTicketsRequest(BaseModel):
    """Request model for linking related tickets."""
    source_ticket_id: str
    target_ticket_id: str
    link_type: str = Field(default="related", description="Type of link: duplicate, related, blocks, blocked_by")
    notes: Optional[str] = None


# Endpoints

@router.get("/{ticket_id}/duplicates", response_model=DuplicateCheckResponse)
async def check_for_duplicates(
    ticket_id: str,
    include_similar: bool = Query(default=True, description="Include similar (not duplicate) tickets"),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Check if a ticket has duplicates or similar tickets.
    
    Returns:
    - List of potential duplicate tickets (>85% similarity)
    - List of similar tickets (65-85% similarity) if include_similar=true
    - Similarity scores and match factors for each
    """
    try:
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        # Get the ticket
        if not supabase:
            raise HTTPException(status_code=503, detail="Database not available")
        
        ticket_result = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
        ticket = ticket_result.data
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Check for duplicates
        dedup_service = create_deduplication_service(supabase)
        duplicates = dedup_service.find_duplicates(ticket)
        
        similar_tickets = []
        if include_similar:
            similar_tickets = dedup_service.find_similar_tickets(ticket, limit=10)
        
        return DuplicateCheckResponse(
            has_duplicates=len(duplicates) > 0,
            duplicate_count=len(duplicates),
            duplicates=duplicates,
            similar_count=len(similar_tickets),
            similar_tickets=similar_tickets
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking duplicates for ticket {ticket_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{ticket_id}/merge-candidates")
async def get_merge_candidates(
    ticket_id: str,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Get detailed merge candidates for a ticket.
    
    Returns candidates with:
    - Similarity analysis
    - Merge recommendations
    - Suggested primary/secondary designation
    """
    try:
        company_id = user.get("company_id")
        
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        dedup_service = create_deduplication_service(supabase)
        candidates = dedup_service.suggest_merge_candidates(ticket_id, company_id)
        
        return {
            "ticket_id": ticket_id,
            "candidate_count": len(candidates),
            "candidates": candidates
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting merge candidates: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/merge", response_model=MergeTicketsResponse)
async def merge_tickets(
    request: MergeTicketsRequest,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Merge two duplicate tickets.
    
    Process:
    1. Validates both tickets exist and can be merged
    2. Copies comments from secondary to primary
    3. Copies attachments from secondary to primary
    4. Creates merge record for audit trail
    5. Closes secondary ticket as duplicate
    6. Links tickets in system
    
    Requires: Agent or Admin role
    """
    try:
        role = user.get("role", "user")
        company_id = user.get("company_id")
        user_id = user.get("id")
        
        # Only agents and admins can merge tickets
        if role not in ["agent", "admin", "master_admin"]:
            raise HTTPException(
                status_code=403,
                detail="Only agents and admins can merge tickets"
            )
        
        # Verify access to both tickets
        security_manager.verify_resource_ownership("tickets", request.primary_ticket_id, user)
        security_manager.verify_resource_ownership("tickets", request.secondary_ticket_id, user)
        
        # Perform merge
        merge_service = create_merge_service(supabase)
        result = merge_service.merge_tickets(
            primary_ticket_id=request.primary_ticket_id,
            secondary_ticket_id=request.secondary_ticket_id,
            merged_by_user_id=user_id,
            company_id=company_id,
            merge_note=request.merge_note
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Merge failed"))
        
        return MergeTicketsResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error merging tickets: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/link")
async def link_tickets(
    request: LinkTicketsRequest,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Create a link between two related tickets.
    
    Link types:
    - duplicate: Tickets are duplicates
    - related: Tickets are related but not duplicates
    - blocks: Source ticket blocks target ticket
    - blocked_by: Source ticket is blocked by target ticket
    """
    try:
        company_id = user.get("company_id")
        
        # Verify access to both tickets
        security_manager.verify_resource_ownership("tickets", request.source_ticket_id, user)
        security_manager.verify_resource_ownership("tickets", request.target_ticket_id, user)
        
        # Create link
        link_data = {
            "source_ticket_id": request.source_ticket_id,
            "target_ticket_id": request.target_ticket_id,
            "link_type": request.link_type,
            "notes": request.notes,
            "company_id": company_id,
            "created_by_user_id": user.get("id"),
            "created_at": "now()"
        }
        
        result = supabase.table("ticket_links").insert(link_data).execute()
        
        return {
            "success": True,
            "link_id": result.data[0]["id"] if result.data else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking tickets: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/{ticket_id}/links/{link_id}")
async def unlink_tickets(
    ticket_id: str,
    link_id: str,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Remove a link between two tickets."""
    try:
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        # Delete link
        supabase.table("ticket_links").delete().eq("id", link_id).execute()
        
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking tickets: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{ticket_id}/links")
async def get_ticket_links(
    ticket_id: str,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Get all links for a ticket.
    
    Returns both outgoing and incoming links.
    """
    try:
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        # Get outgoing links (where this ticket is source)
        outgoing = supabase.table("ticket_links").select(
            "*, target:target_ticket_id(id, subject, status)"
        ).eq("source_ticket_id", ticket_id).execute()
        
        # Get incoming links (where this ticket is target)
        incoming = supabase.table("ticket_links").select(
            "*, source:source_ticket_id(id, subject, status)"
        ).eq("target_ticket_id", ticket_id).execute()
        
        return {
            "ticket_id": ticket_id,
            "outgoing_links": outgoing.data or [],
            "incoming_links": incoming.data or [],
            "total_links": len(outgoing.data or []) + len(incoming.data or [])
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ticket links: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{ticket_id}/merge-history")
async def get_merge_history(
    ticket_id: str,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Get merge history for a ticket."""
    try:
        company_id = user.get("company_id")
        
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        merge_service = create_merge_service(supabase)
        history = merge_service.get_merge_history(ticket_id, company_id)
        
        return {
            "ticket_id": ticket_id,
            "merge_count": len(history),
            "merges": history
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting merge history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/batch-check-duplicates")
async def batch_check_duplicates(
    ticket_ids: List[str],
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Batch check multiple tickets for duplicates.
    
    Useful for scanning existing tickets to find duplicates.
    """
    try:
        company_id = user.get("company_id")
        
        if len(ticket_ids) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 tickets per batch")
        
        dedup_service = create_deduplication_service(supabase)
        results = []
        
        for ticket_id in ticket_ids:
            try:
                # Get ticket
                ticket_result = supabase.table("tickets").select(
                    "*"
                ).eq("id", ticket_id).eq("company_id", company_id).single().execute()
                
                ticket = ticket_result.data
                if not ticket:
                    continue
                
                # Find duplicates
                duplicates = dedup_service.find_duplicates(ticket)
                
                if duplicates:
                    results.append({
                        "ticket_id": ticket_id,
                        "subject": ticket.get("subject"),
                        "duplicate_count": len(duplicates),
                        "top_duplicate": duplicates[0] if duplicates else None
                    })
            
            except Exception as e:
                logger.error(f"Error checking ticket {ticket_id}: {e}")
                continue
        
        return {
            "checked_count": len(ticket_ids),
            "duplicates_found": len(results),
            "results": results
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch duplicate check: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
