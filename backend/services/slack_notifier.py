"""
Slack notifier.

Sends messages and Slack Block Kit payloads to a configured incoming
webhook. Uses only the standard library so no extra dependency is required.
All delivery failures are swallowed and logged so a Slack outage never
breaks the request path.
"""

import json
import logging
import os
import threading
import urllib.request

logger = logging.getLogger(__name__)

DEFAULT_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "")


class SlackNotifier:
    def __init__(self, webhook_url: str | None = None):
        self.webhook_url = webhook_url or DEFAULT_WEBHOOK_URL
        self._lock = threading.Lock()
        self._last_error: str | None = None

    def is_enabled(self) -> bool:
        return bool(self.webhook_url and self.webhook_url.startswith("https://"))

    def send_message(self, text: str) -> bool:
        """Send a simple text message to the Slack channel."""
        if not text or not self.is_enabled():
            return False
        return self._post({"text": text})

    def send_blocks(self, blocks: list[dict], text: str | None = None) -> bool:
        """Send a Block Kit payload (with an optional fallback text)."""
        if not blocks or not self.is_enabled():
            return False
        payload: dict = {"blocks": blocks}
        if text:
            payload["text"] = text
        return self._post(payload)

    def _post(self, payload: dict) -> bool:
        data = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(
            self.webhook_url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                body = response.read().decode("utf-8", errors="replace")
            if body.strip() not in ("ok", ""):
                self._last_error = body.strip()
                logger.warning("[SlackNotifier] Webhook rejected payload: %s", self._last_error)
                return False
            self._last_error = None
            return True
        except Exception as exc:
            self._last_error = str(exc)
            logger.warning("[SlackNotifier] Delivery failed: %s", exc)
            return False

    def last_error(self) -> str | None:
        return self._last_error


_default_notifier = SlackNotifier()


def is_enabled() -> bool:
    return _default_notifier.is_enabled()


def send_message(text: str) -> bool:
    return _default_notifier.send_message(text)


def send_blocks(blocks: list[dict], text: str | None = None) -> bool:
    return _default_notifier.send_blocks(blocks, text)


def notify_sla_breach(ticket: dict, deadline) -> bool:
    """Send a formatted SLA breach alert for a ticket."""
    ticket_id = ticket.get("id") or ticket.get("ticket_id") or "unknown"
    deadline_iso = getattr(deadline, "isoformat", lambda: str(deadline))()
    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"SLA breach: ticket {ticket_id}"},
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Subject:*\n{ticket.get('subject') or 'N/A'}"},
                {"type": "mrkdwn", "text": f"*Priority:*\n{ticket.get('priority') or 'N/A'}"},
                {"type": "mrkdwn", "text": f"*Status:*\n{ticket.get('status') or 'N/A'}"},
                {"type": "mrkdwn", "text": f"*Deadline:*\n{deadline_iso}"},
            ],
        },
    ]
    return _default_notifier.send_blocks(
        blocks, text=f"SLA breach detected for ticket {ticket_id}"
    )


def notify_ticket_escalated(ticket: dict) -> bool:
    """Send a formatted escalation notice for a ticket."""
    ticket_id = ticket.get("id") or ticket.get("ticket_id") or "unknown"
    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"Ticket escalated: {ticket_id}"},
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*{ticket.get('subject') or 'No subject'}* was escalated to "
                f"`{ticket.get('priority') or 'high'}` priority.",
            },
        },
    ]
    return _default_notifier.send_blocks(blocks, text=f"Ticket {ticket_id} escalated")
