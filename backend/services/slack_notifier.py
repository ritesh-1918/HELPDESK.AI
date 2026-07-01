"""
Slack notification helper for SLA breach alerts.

Sends rich-format Slack messages via webhook for critical SLA breaches.
Falls back gracefully if SLACK_WEBHOOK_URL is not configured.
"""

import json
import logging
import os
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

_WEBHOOK_URL = None


def get_webhook_url() -> Optional[str]:
    """Return the configured Slack webhook URL (cached after first call)."""
    global _WEBHOOK_URL
    if _WEBHOOK_URL is None:
        _WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "").strip() or None
        if _WEBHOOK_URL:
            logger.info("Slack webhook URL configured — Slack alerts enabled")
        else:
            logger.info("No SLACK_WEBHOOK_URL set — Slack alerts disabled (graceful fallback)")
    return _WEBHOOK_URL


def is_slack_enabled() -> bool:
    """Check if Slack integration is available."""
    return get_webhook_url() is not None


def build_slack_payload(ticket: dict[str, Any]) -> dict:
    """
    Build a Slack rich attachment block payload for an SLA breach.

    Args:
        ticket: Ticket dict with at minimum id, subject, priority,
                assigned_team, sla_breach_at, and optional company fields.

    Returns:
        Slack-compatible message payload dict.
    """
    ticket_id = str(ticket.get("id", "???"))
    ticket_ref = f"#T-{ticket_id[-4:]}" if len(ticket_id) >= 4 else f"#T-{ticket_id}"
    subject = ticket.get("subject") or "Untitled ticket"
    priority = str(ticket.get("priority") or "unknown").upper()
    assigned_team = ticket.get("assigned_team") or "Unassigned"
    company = ticket.get("company") or ticket.get("company_id") or "UNKNOWN"
    breach_at = ticket.get("sla_breach_at") or "N/A"

    # Color based on priority
    color = "#FF0000" if priority in ("CRITICAL", "HIGH") else "#FFA500"

    return {
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"🚨 SLA Breach: {ticket_ref}",
                            "emoji": True,
                        },
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Ticket:*\n<https://helpdesk.app/tickets/{ticket_id}|{ticket_ref}>"},
                            {"type": "mrkdwn", "text": f"*Priority:*\n{priority}"},
                            {"type": "mrkdwn", "text": f"*Subject:*\n{subject}"},
                            {"type": "mrkdwn", "text": f"*Assigned Team:*\n{assigned_team}"},
                            {"type": "mrkdwn", "text": f"*Company:*\n{company}"},
                            {"type": "mrkdwn", "text": f"*Breach Time:*\n{breach_at}"},
                        ],
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": "🔔 *Action required* — This ticket has breached its SLA deadline and requires immediate attention.",
                            }
                        ],
                    },
                    {
                        "type": "divider",
                    },
                ],
            }
        ]
    }


def send_slack_alert(ticket: dict[str, Any]) -> bool:
    """
    Send an SLA breach alert to Slack via webhook.

    Args:
        ticket: Ticket details dict.

    Returns:
        True if the message was sent successfully, False otherwise.
    """
    webhook_url = get_webhook_url()
    if not webhook_url:
        logger.debug("Slack alert skipped: no webhook URL configured")
        return False

    payload = build_slack_payload(ticket)
    data = json.dumps(payload).encode("utf-8")

    req = Request(
        webhook_url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(req, timeout=10) as resp:
            logger.info(
                "Slack alert sent for ticket %s (HTTP %s)",
                ticket.get("id"),
                resp.status,
            )
            return True
    except HTTPError as e:
        logger.error(
            "Slack webhook HTTP error %s for ticket %s: %s",
            e.code,
            ticket.get("id"),
            e.reason,
        )
    except URLError as e:
        logger.error(
            "Slack webhook connection error for ticket %s: %s",
            ticket.get("id"),
            e.reason,
        )
    except OSError as e:
        logger.error(
            "Slack webhook OS error for ticket %s: %s",
            ticket.get("id"),
            e,
        )
    return False


def notify_sla_breach(ticket: dict[str, Any]) -> bool:
    """
    SLA breach notification entry point. Tries Slack, falls back gracefully.

    Args:
        ticket: Ticket details dict.

    Returns:
        True if any notification channel was used successfully.
    """
    sent = False
    if is_slack_enabled():
        sent = send_slack_alert(ticket)
        if sent:
            logger.info("SLA breach notified via Slack for ticket %s", ticket.get("id"))
        else:
            logger.warning("SLA breach Slack notification failed for ticket %s", ticket.get("id"))
    else:
        logger.info("SLA breach notification skipped: no Slack webhook (graceful fallback)")

    return sent

