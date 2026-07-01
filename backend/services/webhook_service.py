"""
Generic Webhook Service for Slack & Microsoft Teams.
Handles storing webhook URLs in Supabase and sending notifications.
"""

import json
import logging
import os
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", "https://helpdeskaiv1.vercel.app").rstrip("/")

class TicketPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"


class TicketPayload(BaseModel):
    """
    Validated webhook ticket payload schema.
    """

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    subject: Optional[str] = Field(default="Untitled ticket", max_length=300)
    priority: TicketPriority = TicketPriority.UNKNOWN
    assigned_team: Optional[str] = Field(default="Unassigned", max_length=100)
    company: Optional[str] = Field(default=None, max_length=100)
    company_id: Optional[str] = Field(default=None, max_length=100)
    sla_breach_at: Optional[str] = None


def build_slack_payload(ticket: TicketPayload) -> dict:
    ticket_id = str(ticket.id)
    ticket_ref = f"#T-{ticket_id[-4:]}" if len(ticket_id) >= 4 else f"#T-{ticket_id}"
    subject = ticket.subject or "Untitled ticket"
    priority = str(ticket.priority or "unknown").upper()
    assigned_team = ticket.assigned_team or "Unassigned"
    company = ticket.company or ticket.company_id or "UNKNOWN"
    breach_at = ticket.sla_breach_at or "N/A"
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
                            "text": f"🚨 Critical Ticket Alert: {ticket_ref}",
                            "emoji": True,
                        },
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Ticket:*\n<{FRONTEND_BASE_URL}/tickets/{ticket_id}|{ticket_ref}>"},
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
                                "text": "🔔 *Action required* — This ticket requires immediate attention.",
                            }
                        ],
                    },
                    {"type": "divider"},
                ],
            }
        ]
    }


def build_teams_payload(ticket: TicketPayload) -> dict:
    ticket_id = str(ticket.id)
    ticket_ref = f"#T-{ticket_id[-4:]}" if len(ticket_id) >= 4 else f"#T-{ticket_id}"
    subject = ticket.subject or "Untitled ticket"
    priority = str(ticket.priority or "unknown").upper()
    assigned_team = ticket.assigned_team or "Unassigned"
    company = ticket.company or ticket.company_id or "UNKNOWN"
    breach_at = ticket.sla_breach_at or "N/A"
    color = "FF0000" if priority in ("CRITICAL", "HIGH") else "FFA500"

    return {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": color,
        "summary": f"Critical Ticket Alert: {ticket_ref}",
        "sections": [
            {
                "activityTitle": f"🚨 Critical Ticket Alert: {ticket_ref}",
                "activitySubtitle": subject,
                "facts": [
                    {"name": "Priority", "value": priority},
                    {"name": "Assigned Team", "value": assigned_team},
                    {"name": "Company", "value": company},
                    {"name": "Breach Time", "value": breach_at},
                ],
                "markdown": True,
            }
        ],
        "potentialAction": [
            {
                "@type": "OpenUri",
                "name": "View Ticket",
                "targets": [
                    {
                        "os": "default",
                        "uri": f"{FRONTEND_BASE_URL}/tickets/{ticket_id}",
                    }
                ],
            }
        ],
    }


def detect_webhook_type(url: str) -> str:
    """Detect if URL is for Slack or Teams."""
    if "hooks.slack.com" in url:
        return "slack"
    elif "webhook.office.com" in url or "outlook.office.com" in url:
        return "teams"
    return "slack"  # default


def send_webhook_notification(webhook_url: str, ticket: TicketPayload) -> bool:
    """
    Send notification to Slack or Teams based on webhook URL.

    Args:
        webhook_url: The webhook URL (Slack or Teams)
        ticket: Ticket details dict

    Returns:
        True if sent successfully, False otherwise.
    """
    if not webhook_url:
        logger.debug("Webhook notification skipped: no URL provided")
        return False

    webhook_type = detect_webhook_type(webhook_url)

    if webhook_type == "teams":
        payload = build_teams_payload(ticket)
    else:
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
                "Webhook alert sent (%s) for ticket %s (HTTP %s)",
                webhook_type,
                ticket.id,
                resp.status,
            )
            return True
    except HTTPError as e:
        logger.error("Webhook HTTP error %s: %s", e.code, e.reason)
    except URLError as e:
        logger.error("Webhook connection error: %s", e.reason)
    except OSError as e:
        logger.error("Webhook OS error: %s", e)

    return False


def notify_critical_ticket(ticket: TicketPayload, webhook_url: Optional[str] = None) -> bool:
    """
    Entry point for critical ticket notifications.
    Uses provided webhook_url or falls back to env variable.

    Args:
        ticket: Ticket details dict
        webhook_url: Optional override webhook URL (from Supabase/settings)

    Returns:
        True if notification sent successfully.
    """
    url = webhook_url or os.environ.get("SLACK_WEBHOOK_URL", "").strip() or None

    if not url:
        logger.info("No webhook URL configured — notification skipped")
        return False

    validated_ticket = TicketPayload.model_validate(ticket)
    sent = send_webhook_notification(url, validated_ticket)
    
    if sent:
        logger.info("Critical ticket notified for ticket %s", ticket.id)
    else:
        logger.warning("Webhook notification failed for ticket %s", ticket.id)

    return sent