"""
SLA auto-escalation background job.

Periodically scans active tickets, computes their SLA deadline from the
per-priority limits in :mod:`backend.services.sla_service`, and escalates
tickets that have exceeded the deadline: priority is bumped to at least
"high", status becomes "escalated", the breach timestamp is persisted and a
system message is posted to the ticket conversation.

The loop is started/stopped from the FastAPI lifespan (see backend/main.py).
"""

import asyncio
import datetime
import os

from backend.services.sla_service import get_sla_deadline

ACTIVE_STATUSES = ["open", "pending", "in progress", "in-progress", "escalated"]
ESCALATED_STATUS = "escalated"
MIN_ESCALATION_PRIORITY = "high"
PRIORITY_ORDER = ["low", "medium", "high", "critical"]
MAX_BATCH = 500


def _now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def _notify_via_slack(ticket: dict, deadline: datetime.datetime) -> None:
    """Best-effort Slack notification hook (lazy import, no-op if unavailable)."""
    try:
        from backend.services.slack_notifier import notify_sla_breach

        notify_sla_breach(ticket, deadline)
    except Exception as exc:
        print(f"[SLA Escalation] Slack notification skipped: {exc}")


def escalate_ticket(supabase, ticket: dict, deadline: datetime.datetime) -> dict:
    """Escalate a single breached ticket and return the update payload."""
    now = _now_utc().isoformat()
    priority = str(ticket.get("priority") or "low").lower()
    if PRIORITY_ORDER.index(priority) < PRIORITY_ORDER.index(MIN_ESCALATION_PRIORITY):
        new_priority = MIN_ESCALATION_PRIORITY
    else:
        new_priority = priority

    update = {
        "status": ESCALATED_STATUS,
        "priority": new_priority,
        "sla_breach_at": ticket.get("sla_breach_at") or now,
        "metadata": dict(ticket.get("metadata") or {}),
    }
    update["metadata"].update({
        "sla_escalated_at": now,
        "sla_escalation_count": int((ticket.get("metadata") or {}).get("sla_escalation_count", 0)) + 1,
    })

    supabase.table("tickets").update(update).eq("id", ticket["id"]).execute()
    supabase.table("ticket_messages").insert({
        "ticket_id": ticket["id"],
        "sender_id": "00000000-0000-0000-0000-000000000000",  # System ID
        "sender_name": "SLA Monitor",
        "sender_role": "system",
        "message": (
            f"Automatic escalation: this ticket has exceeded its SLA deadline "
            f"({deadline.isoformat()} UTC). Priority raised to {new_priority.upper()} "
            f"and the ticket has been marked as escalated."
        ),
    }).execute()
    _notify_via_slack(ticket, deadline)
    return update


def run_sla_escalation_check(supabase) -> dict:
    """Run one escalation pass and return a summary dict."""
    if not supabase:
        return {"status": "skipped", "reason": "database unavailable"}

    try:
        res = (
            supabase.table("tickets")
            .select("id, subject, priority, status, sla_breach_at, created_at, company_id, metadata")
            .in_("status", ACTIVE_STATUSES)
            .limit(MAX_BATCH)
            .execute()
        )
    except Exception as exc:
        return {"status": "error", "reason": str(exc)}

    tickets = res.data or []
    now = _now_utc()
    escalated: list[dict] = []
    skipped = 0

    for ticket in tickets:
        deadline = get_sla_deadline(ticket.get("priority"), ticket.get("created_at"))
        if deadline is None:
            skipped += 1
            continue
        if now < deadline:
            continue
        try:
            update = escalate_ticket(supabase, ticket, deadline)
            escalated.append({
                "ticket_id": ticket["id"],
                "priority": update["priority"],
                "status": update["status"],
            })
        except Exception as exc:
            print(f"[SLA Escalation] Failed to escalate ticket {ticket.get('id')}: {exc}")

    return {
        "status": "completed",
        "checked": len(tickets),
        "escalated_count": len(escalated),
        "skipped": skipped,
        "escalated": escalated,
    }


async def sla_escalation_loop(supabase, interval_seconds: int | None = None) -> None:
    """Run the escalation check on a fixed interval until cancelled."""
    interval = interval_seconds or int(os.environ.get("SLA_ESCALATION_INTERVAL_SECONDS", "300"))
    print(f"[SLA Escalation] Background loop started (interval={interval}s)")
    while True:
        try:
            summary = await asyncio.to_thread(run_sla_escalation_check, supabase)
            print(f"[SLA Escalation] {summary}")
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            print(f"[SLA Escalation] Background loop error: {exc}")
        await asyncio.sleep(interval)
