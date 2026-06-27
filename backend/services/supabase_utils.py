"""
Supabase Utility Module — Common Supabase CRUD operations for the Helpdesk backend.
Each function wraps a Supabase table operation and handles exceptions gracefully,
returning None or empty structures on error rather than propagating exceptions.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Ticket helpers
# ---------------------------------------------------------------------------

def get_ticket(supabase_client, ticket_id: str) -> Optional[dict]:
    """
    Fetch a single ticket by its primary key.

    Args:
        supabase_client: Initialized Supabase client.
        ticket_id:       UUID or ID of the ticket.

    Returns:
        The ticket dict, or None if not found or on error.
    """
    try:
        res = (
            supabase_client
            .table("tickets")
            .select("*")
            .eq("id", ticket_id)
            .single()
            .execute()
        )
        return res.data or None
    except Exception as exc:
        logger.warning(f"[supabase_utils] get_ticket({ticket_id}): {exc}")
        return None


def create_ticket(supabase_client, data: dict) -> dict:
    """
    Insert a new ticket row.

    Args:
        supabase_client: Initialized Supabase client.
        data:            Dict of ticket fields to insert.

    Returns:
        The created ticket dict, or an empty dict on error.
    """
    try:
        res = supabase_client.table("tickets").insert(data).execute()
        if res.data:
            return res.data[0]
        logger.warning("[supabase_utils] create_ticket: no data returned.")
        return {}
    except Exception as exc:
        logger.error(f"[supabase_utils] create_ticket failed: {exc}")
        return {}


def update_ticket(supabase_client, ticket_id: str, updates: dict) -> dict:
    """
    Partially update a ticket's fields.

    Args:
        supabase_client: Initialized Supabase client.
        ticket_id:       UUID or ID of the ticket.
        updates:         Fields to update.

    Returns:
        The updated ticket dict, or an empty dict on error.
    """
    try:
        res = (
            supabase_client
            .table("tickets")
            .update(updates)
            .eq("id", ticket_id)
            .execute()
        )
        if res.data:
            return res.data[0]
        logger.warning(f"[supabase_utils] update_ticket({ticket_id}): no data returned.")
        return {}
    except Exception as exc:
        logger.error(f"[supabase_utils] update_ticket({ticket_id}) failed: {exc}")
        return {}


# ---------------------------------------------------------------------------
# Profile helpers
# ---------------------------------------------------------------------------

def get_profile(supabase_client, user_id: str) -> Optional[dict]:
    """
    Fetch a user profile by user ID.

    Args:
        supabase_client: Initialized Supabase client.
        user_id:         UUID of the user.

    Returns:
        The profile dict, or None if not found or on error.
    """
    try:
        res = (
            supabase_client
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return res.data or None
    except Exception as exc:
        logger.warning(f"[supabase_utils] get_profile({user_id}): {exc}")
        return None


# ---------------------------------------------------------------------------
# System settings
# ---------------------------------------------------------------------------

_SETTINGS_DEFAULTS = {
    "ai_confidence_threshold": 0.80,
    "duplicate_sensitivity": 0.85,
    "enable_auto_resolve": False,
    "auto_close_days": 7,
    "auto_close_enabled": True,
}


def get_system_settings(supabase_client, company_id: str) -> dict:
    """
    Fetch system settings for a company, falling back to defaults.

    Args:
        supabase_client: Initialized Supabase client.
        company_id:      UUID of the company.

    Returns:
        Settings dict (never None; falls back to defaults on error or missing row).
    """
    defaults = dict(_SETTINGS_DEFAULTS)
    if not supabase_client or not company_id:
        return defaults
    try:
        res = (
            supabase_client
            .table("system_settings")
            .select("*")
            .eq("company_id", company_id)
            .single()
            .execute()
        )
        if res.data:
            return {**defaults, **res.data}
    except Exception as exc:
        logger.warning(f"[supabase_utils] get_system_settings({company_id}): {exc}")
    return defaults


# ---------------------------------------------------------------------------
# Ticket listing
# ---------------------------------------------------------------------------

def list_tickets(
    supabase_client,
    company_id: str,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    """
    List tickets for a company with pagination.

    Args:
        supabase_client: Initialized Supabase client.
        company_id:      UUID of the company.
        limit:           Maximum number of records to return.
        offset:          Number of records to skip.

    Returns:
        List of ticket dicts; empty list on error.
    """
    try:
        res = (
            supabase_client
            .table("tickets")
            .select("*")
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        logger.error(f"[supabase_utils] list_tickets({company_id}): {exc}")
        return []
