"""
SLA escalation service.

Scans unresolved tickets with expired SLA deadlines, marks them breached,
increments escalation level, emits sanitized system notifications, and writes
audit records for admin review.
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Optional

from fastapi import BackgroundTasks

from backend.sla_checker import dispatch_slack_alert

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*_args, **_kwargs):
        return False

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[SlaEscalationService] %(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)


RESPONSE_DEADLINES_HOURS = {
    "critical": 1,
    "high": 4,
    "medium": 8,
    "low": 24,
}

RESOLUTION_DEADLINES_HOURS = {
    "critical": 4,
    "high": 12,
    "medium": 24,
    "low": 72,
}

TERMINAL_STATUSES = {"resolved", "closed", "auto-resolved", "auto resolved"}
WARNING_WINDOW = timedelta(hours=1)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_priority(priority: str | None) -> str:
    value = str(priority or "low").strip().lower()
    return value if value in RESOLUTION_DEADLINES_HOURS else "low"


def calculate_sla_response_at(priority: str | None, now: datetime | None = None) -> datetime:
    base = now or _utc_now()
    priority_key = normalize_priority(priority)
    return base + timedelta(hours=RESPONSE_DEADLINES_HOURS[priority_key])


def calculate_sla_breach_at(priority: str | None, now: datetime | None = None) -> datetime:
    base = now or _utc_now()
    priority_key = normalize_priority(priority)
    return base + timedelta(hours=RESOLUTION_DEADLINES_HOURS[priority_key])


def parse_sla_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def classify_sla_status(sla_breach_at: str | None, now: datetime | None = None) -> str:
    deadline = parse_sla_datetime(sla_breach_at)
    if deadline is None:
        return "ACTIVE"

    current = now or _utc_now()
    if deadline <= current:
        return "BREACHED"
    if deadline - current <= WARNING_WINDOW:
        return "WARNING"
    return "ACTIVE"


def is_terminal_status(status: str | None) -> bool:
    return str(status or "").strip().lower() in TERMINAL_STATUSES


class SlaEscalationService:
    """Background service for enforcing ticket SLA breach state."""

    def __init__(
        self,
        supabase_client: Any,
        *,
        now_fn: Callable[[], datetime] = _utc_now,
        notification_router: Any = None,
    ):
        self.supabase = supabase_client
        self.now_fn = now_fn
        self.notification_router = notification_router

    def run_once(self, background_tasks: BackgroundTasks | None = None) -> dict[str, int | str]:
        stats: dict[str, int | str] = {
            "processed_count": 0,
            "breached_count": 0,
            "skipped_count": 0,
            "error_count": 0,
        }
        now = self.now_fn().astimezone(timezone.utc)

        try:
            tickets = self._fetch_candidate_tickets()
            stats["processed_count"] = len(tickets)
        except Exception as exc:
            logger.error("Failed to fetch SLA candidates: %s", exc)
            stats["error_count"] = int(stats["error_count"]) + 1
            return stats

        for ticket in tickets:
            try:
                if not self._should_breach(ticket, now):
                    stats["skipped_count"] = int(stats["skipped_count"]) + 1
                    continue
                self._breach_ticket(ticket, now, background_tasks=background_tasks)
                stats["breached_count"] = int(stats["breached_count"]) + 1
            except Exception as exc:
                stats["error_count"] = int(stats["error_count"]) + 1
                logger.error("Failed to process SLA ticket %s: %s", ticket.get("id"), exc)

        logger.info(
            "SLA sweep complete. processed=%s breached=%s skipped=%s errors=%s",
            stats["processed_count"],
            stats["breached_count"],
            stats["skipped_count"],
            stats["error_count"],
        )
        return stats

    def _fetch_candidate_tickets(self) -> list[dict[str, Any]]:
        response = (
            self.supabase.table("tickets")
            .select(
                "id, company_id, company, status, priority, subject, assigned_team, "
                "sla_breach_at, sla_status, escalation_level"
            )
            .execute()
        )
        return list(response.data or [])

    def _should_breach(self, ticket: dict[str, Any], now: datetime) -> bool:
        if is_terminal_status(ticket.get("status")):
            return False
        if str(ticket.get("sla_status") or "").upper() == "BREACHED":
            return False
        return classify_sla_status(ticket.get("sla_breach_at"), now) == "BREACHED"

    def _breach_ticket(
        self,
        ticket: dict[str, Any],
        now: datetime,
        *,
        background_tasks: BackgroundTasks | None = None,
    ) -> None:
        ticket_id = str(ticket.get("id"))
        company_id = ticket.get("company_id")
        escalation_level = int(ticket.get("escalation_level") or 0) + 1
        timestamp = now.isoformat().replace("+00:00", "Z")

        self.supabase.table("tickets").update(
            {
                "sla_status": "BREACHED",
                "escalation_level": escalation_level,
                "updated_at": timestamp,
            }
        ).eq("id", ticket_id).execute()

        self._insert_audit_log(ticket, escalation_level, timestamp)
        self._emit_system_message(ticket, escalation_level, timestamp)
        self._dispatch_breach_alert(ticket, now, background_tasks=background_tasks)

        logger.warning(
            "SLA breached | ticket_id=%s | company_id=%s | priority=%s | level=%s",
            ticket_id,
            company_id or "unknown",
            ticket.get("priority") or "unknown",
            escalation_level,
        )

    def _dispatch_breach_alert(
        self,
        ticket: dict[str, Any],
        breach_time: datetime,
        *,
        background_tasks: BackgroundTasks | None = None,
    ) -> None:
        ticket_id = str(ticket.get("id") or "")
        subject = str(ticket.get("subject") or "Untitled ticket")
        category = str(ticket.get("priority") or "Uncategorized")
        assignee = str(ticket.get("assigned_team") or "Unassigned")

        if background_tasks is not None:
            background_tasks.add_task(
                dispatch_slack_alert,
                ticket_id,
                subject,
                category,
                assignee,
                breach_time,
            )
            return

        dispatch_slack_alert(ticket_id, subject, category, assignee, breach_time)

    def _insert_audit_log(self, ticket: dict[str, Any], escalation_level: int, timestamp: str) -> None:
        ticket_id = str(ticket.get("id"))
        self.supabase.table("audit_logs").insert(
            {
                "event_type": "sla_breached",
                "ticket_id": ticket_id,
                "company_id": ticket.get("company_id"),
                "actor_type": "system",
                "message": "SLA breached and escalation triggered.",
                "metadata": {
                    "priority": ticket.get("priority"),
                    "assigned_team": ticket.get("assigned_team"),
                    "escalation_level": escalation_level,
                    "channels": self._notification_channels(ticket),
                },
                "created_at": timestamp,
            }
        ).execute()

    def _emit_system_message(self, ticket: dict[str, Any], escalation_level: int, timestamp: str) -> None:
        if not self._should_send_admin_alert(ticket):
            logger.info("Admin alert skipped by notification settings for ticket %s", ticket.get("id"))
            return

        subject = ticket.get("subject") or "Untitled ticket"
        message = (
            f"SLA breached for '{subject}'. Escalation level {escalation_level} "
            "has been triggered for admin review."
        )
        self.supabase.table("ticket_messages").insert(
            {
                "ticket_id": str(ticket.get("id")),
                "sender_id": "00000000-0000-0000-0000-000000000000",
                "sender_name": "SLA Escalation Engine",
                "sender_role": "admin",
                "message": message,
            }
        ).execute()

    def _notification_channels(self, ticket: dict[str, Any]) -> list[str]:
        channels = ["incident_log", "admin_alert"]
        if self._should_send_admin_alert(ticket):
            channels.append("ticket_timeline")
        return channels

    def _should_send_admin_alert(self, ticket: dict[str, Any]) -> bool:
        if not self.notification_router:
            return True
        company_id = ticket.get("company_id")
        if not company_id:
            return True
        try:
            return bool(self.notification_router.should_send_admin_alert(str(company_id)))
        except Exception as exc:
            logger.warning("Notification router failed open for company %s: %s", company_id, exc)
            return True


async def run_sla_escalation_loop(
    service: SlaEscalationService,
    *,
    interval_seconds: int = 300,
) -> None:
    while True:
        service.run_once()
        await asyncio.sleep(interval_seconds)


_instance: Optional[SlaEscalationService] = None


def load(supabase_client: Any = None, notification_router: Any = None) -> SlaEscalationService:
    global _instance
    if _instance is None:
        if supabase_client is None:
            from supabase import create_client

            supabase_client = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY"),
            )
        _instance = SlaEscalationService(
            supabase_client,
            notification_router=notification_router,
        )
        logger.info("SlaEscalationService loaded")
    return _instance


def get_instance() -> Optional[SlaEscalationService]:
    return _instance
