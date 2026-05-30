import logging
from fastapi import APIRouter, Depends, HTTPException, Request

router = APIRouter()

TICKET_ALLOWED_FIELDS = {
    "subject", "description", "category", "subcategory", "priority",
    "assigned_team", "status", "resolution_notes", "assigned_to",
    "company_id", "company", "metadata",
}

IMMUTABLE_FIELDS = {
    "user_id", "id", "created_at", "sla_breach_at", "sla_response_due_at",
    "is_duplicate", "parent_ticket_id",
}

ADMIN_ONLY_FIELDS = {
    "priority", "assigned_team", "assigned_to", "status",
    "resolution_notes", "escalation_level",
}

MASTER_ADMIN_ONLY_FIELDS = {"company_id", "company"}

LOGGER = logging.getLogger(__name__)


def validate_ticket_patch_fields(payload: dict, user_role: str) -> dict:
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Payload must be a JSON object")

    validated = {}
    for key, value in payload.items():
        if key in IMMUTABLE_FIELDS:
            raise HTTPException(
                status_code=422,
                detail=f"Field '{key}' is immutable and cannot be updated",
            )
        if key in MASTER_ADMIN_ONLY_FIELDS and user_role not in ("master_admin", "super_admin", "superadmin", "owner"):
            raise HTTPException(
                status_code=403,
                detail=f"Field '{key}' requires master admin privileges",
            )
        if key in ADMIN_ONLY_FIELDS and user_role not in ("admin", "company_admin", "master_admin", "super_admin", "superadmin", "owner"):
            raise HTTPException(
                status_code=403,
                detail=f"Field '{key}' requires admin privileges",
            )
        if key not in TICKET_ALLOWED_FIELDS:
            raise HTTPException(
                status_code=422,
                detail=f"Field '{key}' is not allowed for ticket updates",
            )
        validated[key] = value

    if not validated:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    return validated
