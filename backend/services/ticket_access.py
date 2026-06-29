"""Helpers for scoping and sanitizing ticket access."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

ALLOWED_TICKET_UPDATE_FIELDS = frozenset(
    {
        "status",
        "assigned_team",
        "assigned_agent_id",
        "priority",
        "category",
        "subcategory",
        "metadata",
        "timeline",
        "last_user_viewed_at",
        "updated_at",
    }
)


def normalize_company_id(company_id: str | None) -> str | None:
    """Return a trimmed company id or None when the value is empty."""
    if company_id is None:
        return None

    normalized = str(company_id).strip()
    return normalized or None


def require_company_id(company_id: str | None, *, context: str = "company_id") -> str:
    """Validate that a tenant id is present."""
    normalized = normalize_company_id(company_id)
    if not normalized:
        raise ValueError(f"{context} is required")
    return normalized


def filter_ticket_updates(updates: Mapping[str, Any]) -> dict[str, Any]:
    """Keep only explicitly allowed ticket fields."""
    sanitized: dict[str, Any] = {}
    for field in ALLOWED_TICKET_UPDATE_FIELDS:
        if field in updates and updates[field] is not None:
            sanitized[field] = updates[field]
    return sanitized


def ticket_belongs_to_company(ticket_company_id: str | None, company_id: str | None) -> bool:
    """Check whether a ticket row belongs to the requested company."""
    normalized_company_id = require_company_id(company_id)
    normalized_ticket_company_id = normalize_company_id(ticket_company_id)
    return normalized_ticket_company_id == normalized_company_id
