"""
SLA Engine — Service-Level Agreement monitoring, breach detection,
and multi-channel escalation for HELPDESK.AI.

Architecture:
  - SLA policies defined per priority tier
  - Background checker evaluates ticket SLA in batches
  - Escalation matrix drives notification routing
  - Multi-channel dispatch (Email / Slack / Teams / Webhook)
"""

import os
import json
import logging
import datetime
from typing import Any
from enum import Enum
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

class SLAStatus(str, Enum):
    ACTIVE = "active"
    WARNING = "warning"
    BREACHED = "breached"
    MET = "met"
    PAUSED = "paused"  # ticket on hold

class EscalationLevel(int, Enum):
    NONE = 0
    LEVEL_1 = 1   # Warning → notify assigned team
    LEVEL_2 = 2   # Breach → escalate to L2 / manager
    LEVEL_3 = 3   # Extended breach → escalate to L3 / senior / admin

class ChannelType(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    TEAMS = "teams"
    WEBHOOK = "webhook"

# ---------------------------------------------------------------------------
# SLA Policy definitions
# ---------------------------------------------------------------------------

SLAMetric = dict[str, Any]  # {"max_hours": N, "warning_pct": 0.75, "l2_escalation_after_mins": M, ...}

SLA_POLICIES: dict[str, SLAMetric] = {
    "critical": {
        "max_hours": 2,
        "max_seconds": 2 * 3600,
        "warning_pct": 0.75,               # warn at 75% of SLA
        "warning_label": "1.5h remaining",
        "l2_escalation_mins": 0,            # escalate to L2 immediately on breach
        "l3_escalation_mins": 120,          # escalate to L3 after 2h of breach
        "auto_escalate_on_breach": True,
    },
    "high": {
        "max_hours": 4,
        "max_seconds": 4 * 3600,
        "warning_pct": 0.75,
        "warning_label": "3h remaining",
        "l2_escalation_mins": 30,
        "l3_escalation_mins": 240,
        "auto_escalate_on_breach": True,
    },
    "medium": {
        "max_hours": 8,
        "max_seconds": 8 * 3600,
        "warning_pct": 0.75,
        "warning_label": "6h remaining",
        "l2_escalation_mins": 60,
        "l3_escalation_mins": 480,
        "auto_escalate_on_breach": True,
    },
    "low": {
        "max_hours": 24,
        "max_seconds": 24 * 3600,
        "warning_pct": 0.75,
        "warning_label": "18h remaining",
        "l2_escalation_mins": 120,
        "l3_escalation_mins": 1440,
        "auto_escalate_on_breach": False,   # low priority: no auto-escalation
    },
}

# ---------------------------------------------------------------------------
# Escalation contact mapping (configured via env / DB)
# ---------------------------------------------------------------------------

def _load_escalation_channels() -> list[dict]:
    """Load channel config from JSON file or env vars."""
    channels_raw = os.environ.get("SLA_CHANNELS", "[]")
    try:
        return json.loads(channels_raw)
    except json.JSONDecodeError:
        return []

def _load_team_escalation_contacts() -> dict:
    """Load team escalation contacts."""
    contacts_raw = os.environ.get("SLA_ESCALATION_CONTACTS", "{}")
    try:
        return json.loads(contacts_raw)
    except json.JSONDecodeError:
        return {}

# ---------------------------------------------------------------------------
# Core SLA Engine
# ---------------------------------------------------------------------------

class SLAEngine:
    """
    Evaluates ticket SLA status, detects breaches, and dispatches escalations.
    
    Usage:
        engine = SLAEngine(supabase_client)
        await engine.check_all_active_tickets()
    """

    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.channels = _load_escalation_channels()
        self.contacts = _load_team_escalation_contacts()

    # ------------------------------------------------------------------
    # SLA Evaluation per ticket
    # ------------------------------------------------------------------

    def evaluate_ticket(self, ticket: dict) -> dict:
        """
        Evaluate a single ticket's SLA status.
        
        Returns dict with:
          - sla_status: SLAStatus value
          - remaining_seconds: seconds until breach (negative if breached)
          - elapsed_pct: percentage of SLA time elapsed
          - escalation_level: EscalationLevel value
          - needs_notification: bool
          - policy: the applied SLA policy
        """
        priority_key = (ticket.get("priority") or "medium").lower().strip()
        policy = SLA_POLICIES.get(priority_key, SLA_POLICIES["medium"])

        # Resolve the start time: use sla_started_at if set, else created_at
        start_str = ticket.get("sla_started_at") or ticket.get("created_at")
        if not start_str:
            return self._default_eval(policy)

        try:
            created_dt = datetime.datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return self._default_eval(policy)

        # If ticket is resolved / closed, SLA is "met"
        status = (ticket.get("status") or "").lower()
        if any(s in status for s in ["resolv", "closed", "auto-resolv"]):
            return {
                "sla_status": SLAStatus.MET,
                "remaining_seconds": 0,
                "elapsed_pct": 1.0,
                "escalation_level": EscalationLevel.NONE,
                "needs_notification": False,
                "policy": policy,
            }

        # Calculate elapsed time
        now = datetime.datetime.now(datetime.timezone.utc)
        elapsed = (now - created_dt).total_seconds()
        max_sec = policy["max_seconds"]
        elapsed_pct = elapsed / max_sec if max_sec > 0 else 0

        # Determine SLA status
        if elapsed >= max_sec:
            sla_status = SLAStatus.BREACHED
            remaining_seconds = -(elapsed - max_sec)
        elif elapsed >= max_sec * policy["warning_pct"]:
            sla_status = SLAStatus.WARNING
            remaining_seconds = max_sec - elapsed
        else:
            sla_status = SLAStatus.ACTIVE
            remaining_seconds = max_sec - elapsed

        # Determine escalation level
        escalation_level = EscalationLevel.NONE
        if sla_status == SLAStatus.BREACHED:
            breach_duration = elapsed - max_sec
            if breach_duration >= policy["l3_escalation_mins"] * 60:
                escalation_level = EscalationLevel.LEVEL_3
            elif breach_duration >= policy["l2_escalation_mins"] * 60:
                escalation_level = EscalationLevel.LEVEL_2
            else:
                escalation_level = EscalationLevel.LEVEL_2  # breach = at least L2
        elif sla_status == SLAStatus.WARNING:
            escalation_level = EscalationLevel.LEVEL_1

        needs_notification = (
            sla_status in (SLAStatus.WARNING, SLAStatus.BREACHED)
            and escalation_level.value > (ticket.get("escalation_level") or 0)
        )

        return {
            "sla_status": sla_status.value,
            "remaining_seconds": round(remaining_seconds),
            "elapsed_pct": round(elapsed_pct, 4),
            "escalation_level": escalation_level.value,
            "needs_notification": needs_notification,
            "policy": policy,
        }

    def _default_eval(self, policy: dict) -> dict:
        return {
            "sla_status": SLAStatus.ACTIVE.value,
            "remaining_seconds": policy["max_seconds"],
            "elapsed_pct": 0.0,
            "escalation_level": 0,
            "needs_notification": False,
            "policy": policy,
        }

    # ------------------------------------------------------------------
    # Batch check — evaluate all active tickets
    # ------------------------------------------------------------------

    async def check_all_active_tickets(self) -> list[dict]:
        """
        Fetches all active (non-resolved) tickets from Supabase,
        evaluates SLA, updates DB records, and triggers notifications.
        
        Returns list of escalated tickets that need notification dispatch.
        """
        if not self.supabase:
            logger.warning("[SLA] No Supabase client — skipping SLA check.")
            return []

        try:
            res = self.supabase.table("tickets") \
                .select("*") \
                .not_.ilike("status", "%resolv%") \
                .not_.ilike("status", "%closed%") \
                .execute()
        except Exception as e:
            logger.error(f"[SLA] Failed to fetch tickets: {e}")
            return []

        tickets = res.data or []
        escalated: list[dict] = []

        for ticket in tickets:
            result = self.evaluate_ticket(ticket)
            update_fields = {
                "sla_status": result["sla_status"],
                "remaining_seconds": result["remaining_seconds"],
                "escalation_level": result["escalation_level"],
                "sla_updated_at": datetime.datetime.utcnow().isoformat() + "Z",
            }

            # If breached and not yet marked as breached, set breached timestamp
            if result["sla_status"] == SLAStatus.BREACHED.value and not ticket.get("sla_breach_at"):
                update_fields["sla_breach_at"] = datetime.datetime.utcnow().isoformat() + "Z"

            # If warning and not yet notified, mark warning time
            if result["sla_status"] == SLAStatus.WARNING.value and not ticket.get("sla_warning_at"):
                update_fields["sla_warning_at"] = datetime.datetime.utcnow().isoformat() + "Z"

            # If needs notification, prepare escalation record
            if result["needs_notification"]:
                update_fields["last_escalated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
                escalated.append({
                    "ticket": ticket,
                    "sla_result": result,
                })

            # Update ticket in DB
            try:
                self.supabase.table("tickets") \
                    .update(update_fields) \
                    .eq("id", ticket["id"]) \
                    .execute()
            except Exception as e:
                logger.error(f"[SLA] Failed to update ticket {ticket.get('id')}: {e}")

        # Log escalations to escalation_logs table
        for item in escalated:
            self._log_escalation(item["ticket"], item["sla_result"])

        logger.info(
            f"[SLA] Checked {len(tickets)} tickets "
            f"— {len(escalated)} escalated."
        )
        return escalated

    # ------------------------------------------------------------------
    # Escalation logging
    # ------------------------------------------------------------------

    def _log_escalation(self, ticket: dict, result: dict):
        """Insert an escalation event into the escalation_logs table."""
        if not self.supabase:
            return
        try:
            self.supabase.table("escalation_logs").insert({
                "ticket_id": ticket["id"],
                "ticket_subject": ticket.get("subject") or ticket.get("summary", ""),
                "priority": ticket.get("priority", "medium"),
                "sla_status": result["sla_status"],
                "escalation_level": result["escalation_level"],
                "remaining_seconds": result["remaining_seconds"],
                "assigned_team": ticket.get("assigned_team", ""),
                "triggered_at": datetime.datetime.utcnow().isoformat() + "Z",
                "notification_channels": [],  # populated by notifier
            }).execute()
        except Exception as e:
            logger.error(f"[SLA] Failed to log escalation: {e}")

    # ------------------------------------------------------------------
    # Multi-channel notification dispatch
    # ------------------------------------------------------------------

    async def dispatch_notifications(self, escalated_items: list[dict]):
        """
        Dispatch SLA alerts across configured channels.
        Each item: { ticket, sla_result }
        """
        for item in escalated_items:
            ticket = item["ticket"]
            result = item["sla_result"]
            channels = self._resolve_channels(ticket, result)

            for channel in channels:
                success = await self._send_to_channel(channel, ticket, result)
                if success:
                    logger.info(
                        f"[SLA] Notification sent via {channel['type']} "
                        f"for ticket {ticket.get('id')}"
                    )

    def _resolve_channels(self, ticket: dict, result: dict) -> list[dict]:
        """Determine which channels to send to based on escalation level."""
        level = result["escalation_level"]
        active_channels = [c for c in self.channels if c.get("enabled", True)]

        # Filter by minimum escalation level
        eligible = [
            c for c in active_channels
            if c.get("min_level", 0) <= level
        ]

        return eligible

    async def _send_to_channel(self, channel: dict, ticket: dict, result: dict) -> bool:
        """Send an SLA notification through a specific channel."""
        channel_type = channel.get("type", "webhook")
        payload = self._build_payload(ticket, result, channel_type)

        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    channel["url"],
                    json=payload,
                    headers=channel.get("headers", {"Content-Type": "application/json"}),
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    return resp.status < 500
        except ImportError:
            logger.warning("[SLA] aiohttp not installed — using requests (sync).")
            import requests
            try:
                resp = requests.post(
                    channel["url"],
                    json=payload,
                    headers=channel.get("headers", {"Content-Type": "application/json"}),
                    timeout=10,
                )
                return resp.status_code < 500
            except Exception as e:
                logger.error(f"[SLA] Channel send failed ({channel_type}): {e}")
                return False
        except Exception as e:
            logger.error(f"[SLA] Channel send failed ({channel_type}): {e}")
            return False

    def _build_payload(self, ticket: dict, result: dict, channel_type: str) -> dict:
        """Build a channel-specific notification payload."""
        priority = (ticket.get("priority") or "medium").upper()
        ticket_id = str(ticket.get("id", "???"))[:8].upper()
        subject = ticket.get("subject") or ticket.get("summary") or "Untitled"

        base = {
            "title": f"[SLA {result['sla_status'].upper()}] Ticket #{ticket_id}",
            "subject": subject,
            "priority": priority,
            "status": result["sla_status"],
            "escalation_level": result["escalation_level"],
            "remaining_seconds": result["remaining_seconds"],
            "ticket_url": f"https://helpdeskaiv1.vercel.app/admin/ticket/{ticket['id']}",
            "assigned_team": ticket.get("assigned_team", "Unassigned"),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }

        if channel_type == ChannelType.SLACK:
            color = "#ef4444" if result["sla_status"] == "breached" else "#f59e0b"
            return {
                "attachments": [{
                    "color": color,
                    "title": base["title"],
                    "text": f"*Ticket:* <{base['ticket_url']}|#{ticket_id}> — {subject}\n"
                            f"*Priority:* {priority} | *Team:* {base['assigned_team']}\n"
                            f"*Remaining:* {self._fmt_remaining(result['remaining_seconds'])}",
                    "footer": "HELPDESK.AI SLA Engine",
                    "ts": int(datetime.datetime.utcnow().timestamp()),
                }]
            }

        elif channel_type == ChannelType.TEAMS:
            fact_section = {
                "facts": [
                    {"name": "Ticket", "value": f"[#{ticket_id}]({base['ticket_url']})"},
                    {"name": "Subject", "value": subject},
                    {"name": "Priority", "value": priority},
                    {"name": "Team", "value": base["assigned_team"]},
                    {"name": "SLA Status", "value": result["sla_status"].upper()},
                    {"name": "Escalation Level", "value": str(result["escalation_level"])},
                ]
            }
            return {
                "@type": "MessageCard",
                "@context": "https://schema.org/extensions",
                "summary": base["title"],
                "themeColor": color if result["sla_status"] == "breached" else "f59e0b",
                "sections": [{
                    "activityTitle": base["title"],
                    "activitySubtitle": subject,
                    **fact_section,
                }],
            }

        elif channel_type == ChannelType.EMAIL:
            return {
                "type": "SLA_ALERT",
                "to": channel.get("to", "support@helpdeskai.com"),
                "subject": base["title"],
                "template_data": {
                    "title": f"SLA {result['sla_status'].upper()}: Ticket #{ticket_id}",
                    "badge": f"🚨 Escalation Level {result['escalation_level']}",
                    "mainText": f"Priority {priority} ticket \"{subject}\" has reached SLA status: {result['sla_status']}.",
                    "refLabel": "Time Remaining",
                    "refValue": self._fmt_remaining(result["remaining_seconds"]),
                    "ctaText": "View Ticket",
                    "ctaUrl": base["ticket_url"],
                }
            }

        # Generic webhook fallback
        return base

    @staticmethod
    def _fmt_remaining(seconds: int) -> str:
        """Format seconds into human-readable remaining time."""
        if seconds <= 0:
            return "OVERDUE"
        hrs = seconds // 3600
        mins = (seconds % 3600) // 60
        if hrs > 0:
            return f"{hrs}h {mins}m"
        return f"{mins}m"

    # ------------------------------------------------------------------
    # SLA Dashboard stats
    # ------------------------------------------------------------------

    async def get_dashboard_stats(self) -> dict:
        """Aggregate SLA statistics for dashboard display."""
        if not self.supabase:
            return {"error": "No database connection"}

        try:
            res = self.supabase.table("tickets") \
                .select("id, priority, sla_status, status, escalation_level") \
                .execute()
        except Exception as e:
            return {"error": str(e)}

        tickets = res.data or []
        total = len(tickets)
        active_tickets = [t for t in tickets if not any(
            s in (t.get("status") or "").lower() for s in ["resolv", "closed"]
        )]

        counts = {
            "total": total,
            "active": len(active_tickets),
            "breached": sum(1 for t in tickets if t.get("sla_status") == "breached"),
            "warning": sum(1 for t in tickets if t.get("sla_status") == "warning"),
            "met": sum(1 for t in tickets if t.get("sla_status") == "met"),
            "by_priority": {},
            "breach_rate": 0,
        }

        if total > 0:
            counts["breach_rate"] = round(counts["breached"] / total * 100, 1)

        for p in ["critical", "high", "medium", "low"]:
            ptickets = [t for t in active_tickets if (t.get("priority") or "").lower() == p]
            counts["by_priority"][p] = {
                "total": len(ptickets),
                "breached": sum(1 for t in ptickets if t.get("sla_status") == "breached"),
                "warning": sum(1 for t in ptickets if t.get("sla_status") == "warning"),
            }

        return counts


# ---------------------------------------------------------------------------
# Standalone helper — get policy for a priority
# ---------------------------------------------------------------------------

def get_sla_policy(priority: str) -> SLAMetric:
    """Get the SLA policy for a given priority string."""
    return SLA_POLICIES.get(priority.lower().strip(), SLA_POLICIES["medium"])


def compute_sla_breach_at(priority: str, from_time: datetime.datetime | None = None) -> str:
    """
    Compute the ISO datetime when this ticket's SLA would breach.
    Returns ISO string.
    """
    policy = get_sla_policy(priority)
    start = from_time or datetime.datetime.now(datetime.timezone.utc)
    breach = start + datetime.timedelta(hours=policy["max_hours"])
    return breach.isoformat()
