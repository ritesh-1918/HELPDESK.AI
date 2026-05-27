"""
SLA Breach Predictor — estimates resolution time and breach risk for a ticket.

Uses a weighted heuristic with three factors:
  1. Priority baseline   (matching main.py resolution deadlines)
  2. Category adjustment (historical breach rate from Supabase — optional)
  3. Workload multiplier (current open-ticket count for company — optional)
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Callable

logger = logging.getLogger(__name__)

# Mirrors calculate_sla_breach_at() in main.py (hours → minutes)
_BASELINE_MINUTES: dict[str, int] = {
    "critical": 2 * 60,
    "high": 8 * 60,
    "medium": 24 * 60,
    "low": 72 * 60,
}

_TERMINAL_STATUSES = frozenset({"resolved", "closed", "auto-resolved", "auto resolved"})


def _priority_key(priority: str | None) -> str:
    value = str(priority or "low").strip().lower()
    return value if value in _BASELINE_MINUTES else "low"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _category_adjustment(category: str | None, company_id: str | None, supabase: Any) -> float:
    """
    Returns a multiplier based on the historical SLA breach rate for this category.

      breach_rate > 0.5  → 1.3  (category tends to run over SLA)
      breach_rate < 0.2  → 0.8  (category tends to resolve quickly)
      < 5 resolved samples→ 1.0  (not enough data)
    """
    if supabase is None or not category:
        return 1.0

    try:
        query = (
            supabase.table("tickets")
            .select("status, sla_status")
            .eq("category", category)
            .limit(100)
        )
        if company_id:
            query = query.eq("company_id", company_id)

        res = query.execute()
        rows = res.data or []

        terminal = [
            r for r in rows
            if str(r.get("status") or "").strip().lower() in _TERMINAL_STATUSES
        ]
        if len(terminal) < 5:
            return 1.0

        breached = sum(
            1 for r in terminal
            if str(r.get("sla_status") or "").upper() == "BREACHED"
        )
        breach_rate = breached / len(terminal)

        if breach_rate > 0.5:
            return 1.3
        if breach_rate < 0.2:
            return 0.8
        return 1.0
    except Exception as exc:
        logger.warning("Category adjustment query failed: %s", exc)
        return 1.0


def _workload_multiplier(company_id: str | None, supabase: Any) -> float:
    """
    Returns a multiplier based on how many open tickets the company currently has.

      > 20 open → 1.2  (high load, slower resolution expected)
      < 5  open → 0.9  (low load, faster resolution expected)
      otherwise → 1.0
    """
    if supabase is None or not company_id:
        return 1.0

    try:
        res = (
            supabase.table("tickets")
            .select("id")
            .eq("company_id", company_id)
            .eq("status", "open")
            .limit(50)
            .execute()
        )
        count = len(res.data or [])

        if count > 20:
            return 1.2
        if count < 5:
            return 0.9
        return 1.0
    except Exception as exc:
        logger.warning("Workload multiplier query failed: %s", exc)
        return 1.0


def get_sla_estimate(
    ticket: dict,
    supabase: Any = None,
    _now_fn: Callable[[], datetime] | None = None,
) -> dict:
    """
    Estimates resolution time and breach risk for a ticket.

    Args:
        ticket:   Ticket row dict — uses priority, category, company_id, sla_breach_at
        supabase: Optional Supabase client for historical + workload context
        _now_fn:  Injectable clock (for testing)

    Returns:
        {"estimated_minutes": int, "breach_risk": bool}
    """
    now_fn = _now_fn or _utc_now

    priority = ticket.get("priority")
    category = ticket.get("category")
    company_id = ticket.get("company_id")
    sla_breach_at = ticket.get("sla_breach_at")

    baseline = _BASELINE_MINUTES[_priority_key(priority)]
    category_factor = _category_adjustment(category, company_id, supabase)
    workload_factor = _workload_multiplier(company_id, supabase)

    estimated_minutes = int(round(baseline * category_factor * workload_factor))

    breach_risk = False
    if sla_breach_at:
        try:
            deadline = datetime.fromisoformat(str(sla_breach_at).replace("Z", "+00:00"))
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            minutes_remaining = (deadline - now_fn()).total_seconds() / 60
            breach_risk = estimated_minutes > minutes_remaining
        except (ValueError, TypeError) as exc:
            logger.warning("Could not parse sla_breach_at %r: %s", sla_breach_at, exc)

    return {"estimated_minutes": estimated_minutes, "breach_risk": breach_risk}
