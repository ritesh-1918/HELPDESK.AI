"""
Resolution Summary Router — Endpoints for AI-generated ticket resolution summaries.

Provides two endpoints:
- POST /tickets/{ticket_id}/generate-summary — generate an editable draft
- POST /tickets/{ticket_id}/save-summary    — persist the final (possibly edited) summary
"""

import logging

from fastapi import APIRouter, Depends, HTTPException

from backend.services.resolution_summary import ResolutionSummaryService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tickets", tags=["Resolution Summary"])


def _get_resolution_service(request=None):
    """Dependency: provide a ResolutionSummaryService wired to the global supabase client."""
    from backend.main import supabase
    if supabase is None:
        raise HTTPException(status_code=503, detail="Database connection not initialised")
    return ResolutionSummaryService(supabase)


@router.post("/{ticket_id}/generate-summary")
async def generate_resolution_summary_draft(
    ticket_id: str,
    current_user: dict = Depends(__import__("backend.main", fromlist=["get_current_user"]).get_current_user),
    service: ResolutionSummaryService = Depends(_get_resolution_service),
):
    """
    Generate an editable resolution summary draft for a resolved ticket.

    The service analyses the ticket's subject, description, and any existing
    resolution metadata (solution_steps, actions_taken) to produce a
    concise draft.  The draft is intended to be presented to an admin who can
    review and edit it before calling save-summary.

    Returns:
        A JSON body with:
        - status: "ok" or "error"
        - ticket_id: str
        - draft_summary: str (the editable summary text)
        - source_fields: dict (fields used to generate the draft)

    Requires authentication.  Only authenticated users may call this endpoint.
    """
    try:
        result = service.generate_draft(ticket_id)
        if result.get("status") == "error":
            raise HTTPException(
                status_code=404 if "not found" in result.get("detail", "").lower() else 500,
                detail=result.get("detail", "Failed to generate summary draft"),
            )
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to generate resolution summary draft: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to generate summary draft. Please try again.")


@router.post("/{ticket_id}/save-summary")
async def save_resolution_summary(
    ticket_id: str,
    body: dict,
    current_user: dict = Depends(__import__("backend.main", fromlist=["get_current_user"]).get_current_user),
    service: ResolutionSummaryService = Depends(_get_resolution_service),
):
    """
    Persist a (possibly admin-edited) resolution summary for a ticket.

    The request body must include a summary field containing the final
    resolution summary text.  The summary is stored in the ticket's metadata
    JSONB column under the resolution_summary key.

    Request body::

        {
            "summary": "Resolved: User was unable to log in... Steps: Reset password..."
        }

    Returns:
        - On success: {"status": "ok", "summary": "<the saved summary>"}
        - On error: HTTP 4xx/5xx with a detail field.

    Requires authentication.  Only authenticated users may call this endpoint.
    """
    summary = body.get("summary", "").strip()
    if not summary:
        raise HTTPException(status_code=400, detail="'summary' field is required and must not be empty")

    try:
        result = service.save_summary_to_ticket(ticket_id, summary)
        if result.get("status") == "error":
            raise HTTPException(
                status_code=404 if "not found" in result.get("detail", "").lower() else 500,
                detail=result.get("detail", "Failed to save resolution summary"),
            )
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to save resolution summary: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save resolution summary. Please try again.")
