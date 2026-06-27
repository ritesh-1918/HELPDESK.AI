"""
Notification queue worker for ticket email events.

The worker expects rows in the `notifications` table created by the matching
Supabase migration. It can be called from a scheduler, a management script, or
an API endpoint without blocking ticket creation.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from dotenv import load_dotenv

from backend.services.email_service import EmailDeliveryResult, EmailService, TicketEmailContext

load_dotenv()

logger = logging.getLogger(__name__)


DEFAULT_PREFS = {
    "ticket_created": True,
    "ticket_assigned": True,
    "ticket_updated": True,
    "ticket_resolved": True,
    "new_comment": True,
}


def notification_enabled(notification_prefs: Optional[Dict[str, Any]], event_type: str) -> bool:
    """Return whether the user's preferences allow this event type."""
    if not notification_prefs:
        return True
    if notification_prefs.get("email_enabled") is False:
        return False
    return bool(notification_prefs.get(event_type, DEFAULT_PREFS.get(event_type, True)))


def enqueue_ticket_notification(
    supabase_client: Any,
    *,
    event_type: str,
    ticket: Dict[str, Any],
    recipient_email: str,
    recipient_user_id: Optional[str] = None,
    recipient_name: str = "",
    notification_prefs: Optional[Dict[str, Any]] = None,
) -> bool:
    """Insert a pending email notification row for a ticket event."""
    if not supabase_client or not recipient_email:
        return False
    if not notification_enabled(notification_prefs, event_type):
        return False

    payload = {
        "ticket_id": str(ticket.get("id") or ticket.get("ticket_id") or ""),
        "ticket_title": ticket.get("subject") or ticket.get("summary") or ticket.get("title") or "",
        "ticket_status": ticket.get("status") or "",
        "ticket_priority": ticket.get("priority") or "",
        "recipient_name": recipient_name,
        "notification_prefs": notification_prefs or DEFAULT_PREFS,
    }

    supabase_client.table("notifications").insert({
        "channel": "email",
        "event_type": event_type,
        "status": "pending",
        "ticket_id": payload["ticket_id"],
        "user_id": str(recipient_user_id or ""),
        "company_id": str(ticket.get("company_id") or ""),
        "recipient_email": recipient_email,
        "recipient_name": recipient_name,
        "payload": payload,
    }).execute()
    return True


class NotificationWorker:
    """Process queued notification rows and send transactional emails."""

    def __init__(
        self,
        supabase_client: Any = None,
        email_service: Optional[EmailService] = None,
        batch_size: Optional[int] = None,
    ):
        self.supabase = supabase_client or self._create_supabase_client()
        self.email_service = email_service or EmailService()
        self.batch_size = batch_size or int(os.getenv("EMAIL_NOTIFICATION_BATCH_SIZE", "25"))

    def _create_supabase_client(self) -> Any:
        from supabase import create_client

        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and service key are required for NotificationWorker")
        return create_client(url, key)

    def process_once(self) -> Dict[str, int]:
        """Process one batch of pending email notifications."""
        stats = {"processed": 0, "sent": 0, "skipped": 0, "failed": 0}
        rows = self._fetch_pending()

        for row in rows:
            stats["processed"] += 1
            try:
                result = self._process_row(row)
                if result.sent:
                    stats["sent"] += 1
                elif result.skipped:
                    stats["skipped"] += 1
                else:
                    stats["failed"] += 1
            except Exception as exc:
                stats["failed"] += 1
                self._mark_failed(row, str(exc))
                logger.exception("Notification row failed: %s", row.get("id"))

        return stats

    def _fetch_pending(self) -> list[Dict[str, Any]]:
        response = self.supabase.rpc(
            "claim_pending_email_notifications",
            {"batch_limit": self.batch_size},
        ).execute()
        return response.data or []

    def _process_row(self, row: Dict[str, Any]) -> EmailDeliveryResult:
        payload = row.get("payload") or {}
        event_type = row.get("event_type") or payload.get("event_type") or "ticket_updated"
        prefs = payload.get("notification_prefs")

        if not notification_enabled(prefs, event_type):
            result = EmailDeliveryResult(False, self.email_service.provider, skipped=True, reason="user_preferences_disabled")
            self._mark_skipped(row, result.reason)
            return result

        context = TicketEmailContext(
            event_type=event_type,
            recipient_email=row.get("recipient_email") or "",
            recipient_name=row.get("recipient_name") or payload.get("recipient_name") or "",
            ticket_id=str(payload.get("ticket_id") or row.get("ticket_id") or ""),
            ticket_title=payload.get("ticket_title") or "",
            ticket_status=payload.get("ticket_status") or "",
            ticket_priority=payload.get("ticket_priority") or "",
            ticket_url=payload.get("ticket_url") or "",
            actor_name=payload.get("actor_name") or "",
            comment_excerpt=payload.get("comment_excerpt") or "",
        )
        result = self.email_service.send_ticket_email(context)

        if result.sent:
            self._mark_sent(row, result)
            try:
                self._log_email(row, result)
            except Exception:
                logger.exception("Email audit log failed for notification row: %s", row.get("id"))
        elif result.skipped:
            self._mark_skipped(row, result.reason)
        else:
            self._mark_failed(row, result.reason or "delivery_failed")

        return result

    def _mark_sent(self, row: Dict[str, Any], result: EmailDeliveryResult) -> None:
        self.supabase.table("notifications").update({
            "status": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "attempts": int(row.get("attempts") or 0) + 1,
            "last_error": None,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", row["id"]).execute()

    def _mark_skipped(self, row: Dict[str, Any], reason: str) -> None:
        self.supabase.table("notifications").update({
            "status": "skipped",
            "attempts": int(row.get("attempts") or 0) + 1,
            "last_error": reason,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", row["id"]).execute()

    def _mark_failed(self, row: Dict[str, Any], reason: str) -> None:
        self.supabase.table("notifications").update({
            "status": "failed",
            "attempts": int(row.get("attempts") or 0) + 1,
            "last_error": reason[:1000],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", row["id"]).execute()

    def _log_email(self, row: Dict[str, Any], result: EmailDeliveryResult) -> None:
        self.supabase.table("email_logs").insert({
            "notification_id": row.get("id"),
            "ticket_id": row.get("ticket_id"),
            "user_id": row.get("user_id"),
            "recipient_email": row.get("recipient_email"),
            "provider": result.provider,
            "provider_message_id": result.message_id,
            "status": "sent",
        }).execute()
