"""
Webhook Notification Service for Slack & Microsoft Teams.

Sends critical ticket alerts to configured Slack and/or Microsoft Teams
incoming webhook URLs when ticket status changes to critical.

Supports:
- Slack Incoming Webhooks (Block Kit format)
- Microsoft Teams Incoming Webhooks (MessageCard / Adaptive Card format)

Configuration is stored in the `system_settings` Supabase table:
- `slack_webhook_url`: Incoming webhook URL for Slack
- `teams_webhook_url`: Incoming webhook URL for Microsoft Teams
- `webhook_notifications_enabled`: Global toggle for webhook alerts
"""

import os
import logging
import datetime
from typing import Optional, Dict, Any

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[WebhookService] %(asctime)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


class WebhookService:
    """Service for sending webhook notifications to Slack and Microsoft Teams."""

    def __init__(self):
        self._timeout = 10.0  # seconds

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def send_critical_ticket_alert(
        self,
        ticket: Dict[str, Any],
        slack_url: Optional[str] = None,
        teams_url: Optional[str] = None,
    ) -> Dict[str, bool]:
        """
        Send a critical-ticket alert to all configured webhook endpoints.

        Args:
            ticket: Ticket data dict (id, subject, priority, status, etc.)
            slack_url: Slack incoming webhook URL (if configured)
            teams_url: Teams incoming webhook URL (if configured)

        Returns:
            Dict mapping platform -> success bool, e.g. {"slack": True, "teams": False}
        """
        results: Dict[str, bool] = {}

        if slack_url:
            results["slack"] = await self._send_slack_alert(ticket, slack_url)
        if teams_url:
            results["teams"] = await self._send_teams_alert(ticket, teams_url)

        if not results:
            logger.info("No webhook URLs configured; skipping alert.")

        return results

    # ------------------------------------------------------------------
    # Slack
    # ------------------------------------------------------------------

    async def _send_slack_alert(
        self, ticket: Dict[str, Any], webhook_url: str
    ) -> bool:
        """Send a Block-Kit formatted message to a Slack incoming webhook."""
        ticket_id = ticket.get("id", ticket.get("ticket_id", "unknown"))
        subject = ticket.get("subject", ticket.get("summary", "No subject"))
        priority = ticket.get("priority", "unknown")
        status = ticket.get("status", "unknown")
        category = ticket.get("category", "Uncategorized")
        assigned_team = ticket.get("assigned_team", "Unassigned")
        created_at = ticket.get("created_at", "")
        description = ticket.get("description", "")

        # Truncate description for display
        desc_preview = description[:200] + ("…" if len(description) > 200 else "")

        payload = {
            "text": f":rotating_light: *Critical Ticket Alert* — #{ticket_id}",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"🚨 Critical Ticket Alert — #{ticket_id}",
                        "emoji": True,
                    },
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Subject:*\n{subject}"},
                        {"type": "mrkdwn", "text": f"*Priority:*\n🔴 {priority.upper()}"},
                        {"type": "mrkdwn", "text": f"*Status:*\n{status.title()}"},
                        {"type": "mrkdwn", "text": f"*Category:*\n{category}"},
                        {"type": "mrkdwn", "text": f"*Assigned Team:*\n{assigned_team}"},
                        {"type": "mrkdwn", "text": f"*Created:*\n{created_at}"},
                    ],
                },
            ],
        }

        if desc_preview:
            payload["blocks"].append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Description:*\n{desc_preview}",
                    },
                }
            )

        payload["blocks"].append({"type": "divider"})

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                resp = await client.post(webhook_url, json=payload)
                if resp.status_code in (200, 204):
                    logger.info(
                        f"Slack alert sent for ticket #{ticket_id} (HTTP {resp.status_code})"
                    )
                    return True
                else:
                    logger.error(
                        f"Slack webhook returned HTTP {resp.status_code}: {resp.text}"
                    )
                    return False
        except Exception as exc:
            logger.error(f"Slack webhook error for ticket #{ticket_id}: {exc}")
            return False

    # ------------------------------------------------------------------
    # Microsoft Teams
    # ------------------------------------------------------------------

    async def _send_teams_alert(
        self, ticket: Dict[str, Any], webhook_url: str
    ) -> bool:
        """Send an Adaptive Card message to a Microsoft Teams incoming webhook."""
        ticket_id = ticket.get("id", ticket.get("ticket_id", "unknown"))
        subject = ticket.get("subject", ticket.get("summary", "No subject"))
        priority = ticket.get("priority", "unknown")
        status = ticket.get("status", "unknown")
        category = ticket.get("category", "Uncategorized")
        assigned_team = ticket.get("assigned_team", "Unassigned")
        created_at = ticket.get("created_at", "")
        description = ticket.get("description", "")

        desc_preview = description[:200] + ("…" if len(description) > 200 else "")

        # Teams Adaptive Card payload
        payload = {
            "type": "message",
            "attachments": [
                {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "contentUrl": None,
                    "content": {
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "type": "AdaptiveCard",
                        "version": "1.4",
                        "body": [
                            {
                                "type": "Container",
                                "style": "attention",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": f"🚨 Critical Ticket Alert — #{ticket_id}",
                                        "weight": "Bolder",
                                        "size": "Large",
                                        "color": "Attention",
                                    }
                                ],
                            },
                            {
                                "type": "FactSet",
                                "facts": [
                                    {"title": "Subject", "value": subject},
                                    {"title": "Priority", "value": priority.upper()},
                                    {"title": "Status", "value": status.title()},
                                    {"title": "Category", "value": category},
                                    {"title": "Assigned Team", "value": assigned_team},
                                    {"title": "Created", "value": created_at},
                                ],
                            },
                        ],
                    },
                }
            ],
        }

        # Add description if available
        if desc_preview:
            content = payload["attachments"][0]["content"]
            content["body"].insert(
                1,
                {
                    "type": "TextBlock",
                    "text": f"Description: {desc_preview}",
                    "wrap": True,
                    "spacing": "Medium",
                },
            )

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                resp = await client.post(webhook_url, json=payload)
                if resp.status_code in (200, 202):
                    logger.info(
                        f"Teams alert sent for ticket #{ticket_id} (HTTP {resp.status_code})"
                    )
                    return True
                else:
                    logger.error(
                        f"Teams webhook returned HTTP {resp.status_code}: {resp.text}"
                    )
                    return False
        except Exception as exc:
            logger.error(f"Teams webhook error for ticket #{ticket_id}: {exc}")
            return False


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------
_instance: Optional[WebhookService] = None


def load() -> WebhookService:
    """Load and return singleton instance of WebhookService."""
    global _instance
    if _instance is None:
        _instance = WebhookService()
        logger.info("WebhookService loaded")
    return _instance


def get_instance() -> Optional[WebhookService]:
    """Get the singleton instance if already loaded."""
    return _instance
