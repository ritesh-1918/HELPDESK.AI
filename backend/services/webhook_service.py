"""
Webhook Notification Service: Sends alerts to Slack and Microsoft Teams
via incoming webhooks for critical ticket events.

Supports:
- Slack Incoming Webhooks (Block Kit format)
- Microsoft Teams Incoming Webhooks (Adaptive Card / Office 365 Connector format)

Features:
- Automatic platform detection from URL
- Rich message formatting with ticket details
- Graceful error handling with logging
- Fire-and-forget delivery (non-blocking)
"""

import os
import json
import logging
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[WebhookService] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


class WebhookPlatform:
    """Supported webhook platforms."""
    SLACK = "slack"
    TEAMS = "teams"
    UNKNOWN = "unknown"


def detect_platform(url: str) -> str:
    """
    Detect the webhook platform from the URL.
    
    Args:
        url: Webhook URL string
        
    Returns:
        WebhookPlatform constant
    """
    if not url:
        return WebhookPlatform.UNKNOWN
    url_lower = url.lower()
    if "hooks.slack.com" in url_lower or "slack.com" in url_lower:
        return WebhookPlatform.SLACK
    if "webhook.office.com" in url_lower or "outlook.office.com" in url_lower or "office365.com" in url_lower:
        return WebhookPlatform.TEAMS
    return WebhookPlatform.UNKNOWN


def build_slack_payload(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a Slack Block Kit payload for a critical ticket alert.
    
    Args:
        ticket_data: Dictionary with ticket details
        
    Returns:
        Slack-compatible payload dict
    """
    priority = ticket_data.get("priority", "Unknown")
    priority_emoji = {
        "Critical": "🔴",
        "High": "🟠",
        "Medium": "🟡",
        "Low": "🟢"
    }.get(priority, "⚪")

    ticket_id = ticket_data.get("ticket_id", "N/A")
    subject = ticket_data.get("subject", "No subject")
    description = ticket_data.get("description", "No description")
    category = ticket_data.get("category", "Unknown")
    subcategory = ticket_data.get("subcategory", "")
    assigned_team = ticket_data.get("assigned_team", "Unassigned")
    status = ticket_data.get("status", "Open")
    company = ticket_data.get("company", "")
    created_at = ticket_data.get("created_at", datetime.now(timezone.utc).isoformat())

    # Truncate description for readability
    if len(description) > 300:
        description = description[:300] + "..."

    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"🚨 Critical Ticket Alert",
                "emoji": True
            }
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Ticket ID:*\n`{ticket_id}`"},
                {"type": "mrkdwn", "text": f"*Priority:*\n{priority_emoji} {priority}"},
                {"type": "mrkdwn", "text": f"*Status:*\n{status}"},
                {"type": "mrkdwn", "text": f"*Assigned Team:*\n{assigned_team}"}
            ]
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Category:*\n{category}"},
                {"type": "mrkdwn", "text": f"*Subcategory:*\n{subcategory}"}
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Subject:*\n{subject}"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Description:*\n{description}"
            }
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": f"📅 {created_at}" + (f" • 🏢 {company}" if company else "")
                }
            ]
        }
    ]

    return {
        "text": f"🚨 Critical Ticket Alert: {subject}",
        "blocks": blocks
    }


def build_teams_payload(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a Microsoft Teams (Office 365 Connector) payload for a critical ticket alert.
    
    Args:
        ticket_data: Dictionary with ticket details
        
    Returns:
        Teams-compatible payload dict
    """
    priority = ticket_data.get("priority", "Unknown")
    priority_color = {
        "Critical": "attention",
        "High": "warning",
        "Medium": "accent",
        "Low": "good"
    }.get(priority, "default")

    ticket_id = ticket_data.get("ticket_id", "N/A")
    subject = ticket_data.get("subject", "No subject")
    description = ticket_data.get("description", "No description")
    category = ticket_data.get("category", "Unknown")
    subcategory = ticket_data.get("subcategory", "")
    assigned_team = ticket_data.get("assigned_team", "Unassigned")
    status = ticket_data.get("status", "Open")
    company = ticket_data.get("company", "")
    created_at = ticket_data.get("created_at", datetime.now(timezone.utc).isoformat())

    # Truncate description
    if len(description) > 300:
        description = description[:300] + "..."

    # Use MessageCard format (broadly compatible with Teams)
    return {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "FF0000" if priority == "Critical" else "FF8C00" if priority == "High" else "0076D7",
        "summary": f"Critical Ticket Alert: {subject}",
        "sections": [
            {
                "activityTitle": "🚨 Critical Ticket Alert",
                "activitySubtitle": f"Priority: {priority}",
                "facts": [
                    {"name": "Ticket ID", "value": ticket_id},
                    {"name": "Status", "value": status},
                    {"name": "Category", "value": f"{category} / {subcategory}"},
                    {"name": "Assigned Team", "value": assigned_team},
                    {"name": "Subject", "value": subject},
                ],
                "markdown": True
            },
            {
                "text": description,
                "markdown": True
            }
        ],
        "potentialAction": []
    }


async def send_webhook(url: str, payload: Dict[str, Any], platform: str) -> bool:
    """
    Send a webhook notification asynchronously.
    
    Args:
        url: Webhook URL
        payload: Pre-built payload
        platform: Platform identifier for logging
        
    Returns:
        True if sent successfully, False otherwise
    """
    if not url:
        logger.warning("No webhook URL provided, skipping notification")
        return False

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code in (200, 201, 202, 204):
                logger.info(f"Webhook sent successfully to {platform} (status={response.status_code})")
                return True
            else:
                logger.error(
                    f"Webhook delivery failed to {platform}: "
                    f"status={response.status_code}, body={response.text[:200]}"
                )
                return False
    except httpx.TimeoutException:
        logger.error(f"Webhook timeout sending to {platform}")
        return False
    except Exception as e:
        logger.error(f"Webhook error sending to {platform}: {str(e)}")
        return False


async def send_ticket_alert(
    slack_url: Optional[str],
    teams_url: Optional[str],
    ticket_data: Dict[str, Any]
) -> Dict[str, bool]:
    """
    Send a critical ticket alert to all configured webhook endpoints.
    
    Args:
        slack_url: Slack webhook URL (or None if not configured)
        teams_url: Teams webhook URL (or None if not configured)
        ticket_data: Dictionary with ticket details
        
    Returns:
        Dict mapping platform name to success boolean
    """
    results = {}

    if slack_url:
        payload = build_slack_payload(ticket_data)
        results["slack"] = await send_webhook(slack_url, payload, "Slack")

    if teams_url:
        payload = build_teams_payload(ticket_data)
        results["teams"] = await send_webhook(teams_url, payload, "Teams")

    if not slack_url and not teams_url:
        logger.info("No webhook URLs configured, skipping notification")

    return results


async def test_webhook(url: str) -> Dict[str, Any]:
    """
    Send a test message to a webhook URL to verify connectivity.
    
    Args:
        url: Webhook URL to test
        
    Returns:
        Dict with success status and message
    """
    platform = detect_platform(url)
    
    test_ticket = {
        "ticket_id": "TEST-001",
        "subject": "Webhook Test — HELPDESK.AI Integration",
        "description": "This is a test message to verify your webhook configuration is working correctly.",
        "category": "System",
        "subcategory": "Configuration Test",
        "priority": "Low",
        "assigned_team": "IT Support",
        "status": "Test",
        "company": "HELPDESK.AI",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    if platform == WebhookPlatform.SLACK:
        payload = build_slack_payload(test_ticket)
    elif platform == WebhookPlatform.TEAMS:
        payload = build_teams_payload(test_ticket)
    else:
        # Generic payload for unknown platforms
        payload = {
            "text": "HELPDESK.AI webhook test — connection successful!",
            "ticket": test_ticket
        }

    success = await send_webhook(url, payload, platform)
    return {
        "success": success,
        "platform": platform,
        "message": "Test notification sent successfully" if success else "Failed to send test notification"
    }
