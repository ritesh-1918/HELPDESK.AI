from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def _format_ticket_reference(ticket_id: str) -> str:
    clean_id = str(ticket_id or "").strip()
    if clean_id.isdigit():
        return f"#T-{int(clean_id):04d}"
    return f"#T-{clean_id}" if clean_id else "#T-UNKNOWN"


def _format_breach_time(breach_time: datetime) -> str:
    if breach_time.tzinfo is None:
        normalized = breach_time.replace(tzinfo=timezone.utc)
    else:
        normalized = breach_time.astimezone(timezone.utc)
    iso_value = normalized.isoformat().replace("+00:00", "Z")
    human_value = normalized.strftime("%Y-%m-%d %H:%M:%S UTC")
    return f"{iso_value} ({human_value})"


def _post_json(url: str, payload: dict) -> None:
    try:
        import requests

        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return
    except ImportError:
        pass
    except Exception as exc:
        logger.error("Slack alert request failed: %s", exc)
        return

    try:
        import httpx

        response = httpx.post(url, json=payload, timeout=10)
        response.raise_for_status()
    except ImportError:
        logger.error("Slack alert client not available: install requests or httpx")
    except Exception as exc:
        logger.error("Slack alert request failed: %s", exc)


def dispatch_slack_alert(
    ticket_id: str,
    subject: str,
    category: str,
    assignee: str,
    breach_time: datetime,
) -> None:
    webhook_url = (os.environ.get("SLACK_WEBHOOK_URL") or "").strip()
    if not webhook_url:
        return None

    payload = {
        "attachments": [
            {
                "color": "#FF0000",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": "🚨 SLA Breach Alert",
                            "emoji": True,
                        },
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": f"*Ticket Reference:*\n{_format_ticket_reference(ticket_id)}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Subject:*\n{subject or 'Untitled ticket'}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Category:*\n{category or 'Uncategorized'}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Assigned To:*\n{assignee or 'Unassigned'}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Breach Time:*\n{_format_breach_time(breach_time)}",
                            },
                        ],
                    },
                    {"type": "divider"},
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": "Automated SLA Monitor",
                            }
                        ],
                    },
                ],
            }
        ]
    }

    _post_json(webhook_url, payload)

    return None