"""
SLA Escalation Service — Detects SLA breaches and escalates tickets.

Features:
  - check_breaches()  — queries tickets where sla_breach_at < now AND status != 'resolved'
  - escalate_ticket() — updates assigned_team, sets escalated=True
  - send_webhook_alert() — POSTs to Slack/Teams webhook
  - run_sweep()       — full sweep: find breaches, escalate, alert, return stats
  - ESCALATION_MAP    — maps original team → escalation team
  - Supports SLACK_WEBHOOK_URL and TEAMS_WEBHOOK_URL env vars
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional

try:
    import requests as _requests_lib
except ImportError:
    _requests_lib = None  # type: ignore

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Escalation team mapping: original team → escalation team
# ---------------------------------------------------------------------------
ESCALATION_MAP: dict[str, str] = {
    "Network Support": "Senior Network Engineers",
    "Hardware Support": "Senior Hardware Engineers",
    "Application Support": "Senior Software Engineers",
    "IAM Team": "Security Operations Center",
    "General Support": "Tier 2 Support",
    "Cloud Apps Team": "Platform Engineering",
    "Security Ops": "Security Operations Center",
    "HR Systems": "Senior HR Systems Team",
    "IT Service Desk": "Tier 2 Support",
    "IT Inventory": "Senior Hardware Engineers",
    "Network Services": "Senior Network Engineers",
}


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class SLAEscalationService:
    """Detects and escalates SLA-breached tickets."""

    def __init__(self):
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")
        self.teams_webhook_url = os.getenv("TEAMS_WEBHOOK_URL", "")

    # ------------------------------------------------------------------
    # Core methods
    # ------------------------------------------------------------------

    def check_breaches(self, supabase_client, company_id: Optional[str] = None) -> list[dict]:
        """
        Query tickets where sla_breach_at is in the past and status != 'resolved'.

        Args:
            supabase_client: Initialized Supabase client.
            company_id:      Optional company filter.

        Returns:
            List of breached ticket dicts.
        """
        try:
            now_iso = _utc_now_iso()
            query = (
                supabase_client
                .table("tickets")
                .select("id, subject, category, priority, assigned_team, status, sla_breach_at, company_id, escalated")
                .lt("sla_breach_at", now_iso)
                .neq("status", "resolved")
                .neq("status", "closed")
            )
            if company_id:
                query = query.eq("company_id", company_id)

            res = query.execute()
            tickets = res.data or []
            logger.info(f"[SLAEscalation] Found {len(tickets)} breached tickets.")
            return tickets
        except Exception as exc:
            logger.error(f"[SLAEscalation] check_breaches error: {exc}")
            return []

    def escalate_ticket(self, supabase_client, ticket_id: str, original_team: str) -> dict:
        """
        Escalate a ticket to the appropriate escalation team.

        Updates:
          - assigned_team → escalation team from ESCALATION_MAP
          - escalated = True
          - escalated_at = now

        Returns:
            Updated ticket dict, or empty dict on failure.
        """
        escalation_team = ESCALATION_MAP.get(original_team, f"Escalated: {original_team}")
        updates = {
            "assigned_team": escalation_team,
            "escalated": True,
            "escalated_at": _utc_now_iso(),
            "escalation_note": (
                f"Auto-escalated from '{original_team}' to '{escalation_team}' "
                f"due to SLA breach at {_utc_now_iso()}"
            ),
        }
        try:
            res = (
                supabase_client
                .table("tickets")
                .update(updates)
                .eq("id", ticket_id)
                .execute()
            )
            if res.data:
                logger.info(f"[SLAEscalation] Ticket {ticket_id} escalated to {escalation_team}")
                return res.data[0]
            logger.warning(f"[SLAEscalation] escalate_ticket({ticket_id}): no data returned.")
            return {}
        except Exception as exc:
            logger.error(f"[SLAEscalation] escalate_ticket({ticket_id}) failed: {exc}")
            return {}

    def send_webhook_alert(self, ticket: dict, webhook_url: str = "") -> bool:
        """
        POST an SLA breach alert to a Slack/Teams webhook.

        Args:
            ticket:      Ticket dict with id, subject, priority, assigned_team.
            webhook_url: Webhook URL (defaults to SLACK_WEBHOOK_URL or TEAMS_WEBHOOK_URL).

        Returns:
            True if alert was sent successfully.
        """
        url = webhook_url or self.slack_webhook_url or self.teams_webhook_url
        if not url:
            logger.debug("[SLAEscalation] No webhook URL configured; skipping alert.")
            return False

        if _requests_lib is None:
            logger.warning("[SLAEscalation] 'requests' not available; cannot send webhook.")
            return False

        ticket_id = ticket.get("id", "unknown")
        subject = ticket.get("subject", "No subject")
        priority = ticket.get("priority", "Unknown")
        team = ticket.get("assigned_team", "Unknown")
        breach_at = ticket.get("sla_breach_at", "Unknown")

        # Slack-compatible payload (also accepted by most Teams incoming webhooks)
        payload = {
            "text": f":rotating_light: *SLA Breach Alert*",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": (
                            f":rotating_light: *SLA Breach Detected*\n"
                            f"*Ticket:* `{ticket_id}`\n"
                            f"*Subject:* {subject}\n"
                            f"*Priority:* {priority}\n"
                            f"*Team:* {team}\n"
                            f"*SLA Breached At:* {breach_at}"
                        ),
                    },
                }
            ],
        }

        try:
            resp = _requests_lib.post(url, json=payload, timeout=10)
            resp.raise_for_status()
            logger.info(f"[SLAEscalation] Webhook alert sent for ticket {ticket_id}")
            return True
        except Exception as exc:
            logger.warning(f"[SLAEscalation] Webhook alert failed for {ticket_id}: {exc}")
            return False

    def run_sweep(
        self,
        supabase_client,
        company_id: Optional[str] = None,
        send_alerts: bool = True,
    ) -> dict:
        """
        Full sweep: detect SLA breaches, escalate tickets, send alerts.

        Args:
            supabase_client: Initialized Supabase client.
            company_id:      Optional company filter.
            send_alerts:     Whether to send webhook notifications.

        Returns:
            Stats dict with breaches_found, escalated, alerts_sent, skipped, errors.
        """
        stats = {
            "breaches_found": 0,
            "escalated": 0,
            "alerts_sent": 0,
            "skipped_already_escalated": 0,
            "errors": 0,
        }

        try:
            breached_tickets = self.check_breaches(supabase_client, company_id=company_id)
            stats["breaches_found"] = len(breached_tickets)

            for ticket in breached_tickets:
                ticket_id = ticket.get("id")
                if not ticket_id:
                    stats["errors"] += 1
                    continue

                # Skip tickets already escalated
                if ticket.get("escalated"):
                    stats["skipped_already_escalated"] += 1
                    continue

                original_team = ticket.get("assigned_team", "General Support")
                updated = self.escalate_ticket(supabase_client, ticket_id, original_team)

                if updated:
                    stats["escalated"] += 1
                    # Send webhook alert
                    if send_alerts:
                        sent = self.send_webhook_alert(ticket)
                        if sent:
                            stats["alerts_sent"] += 1
                else:
                    stats["errors"] += 1

            logger.info(
                f"[SLAEscalation] Sweep complete. "
                f"Found={stats['breaches_found']}, Escalated={stats['escalated']}, "
                f"Alerts={stats['alerts_sent']}, Skipped={stats['skipped_already_escalated']}, "
                f"Errors={stats['errors']}"
            )
        except Exception as exc:
            logger.error(f"[SLAEscalation] run_sweep fatal error: {exc}")
            stats["errors"] += 1

        return stats
