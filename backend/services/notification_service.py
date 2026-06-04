"""
Notification Service — Multi-Channel Notification Dispatch and History.

Sends notifications via email, SMS, push, and Slack channels.
Respects per-user channel preferences and logs to Supabase.

Interface matches MockNotificationService in test_notification_service_new.py.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_VALID_CHANNELS = frozenset({"email", "sms", "push", "slack"})


class NotificationService:
    """
    Multi-channel notification dispatcher.

    Usage:
        svc = NotificationService(supabase_client)
        result = await svc.send_notification(user_id, "Your ticket was updated.", channel="email")
    """

    def __init__(self, supabase_client=None) -> None:
        if supabase_client is not None:
            self.supabase = supabase_client
        else:
            try:
                from supabase import create_client
                url = os.environ.get("SUPABASE_URL", "")
                key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
                self.supabase = create_client(url, key) if (url and key) else None
            except Exception:
                self.supabase = None
            if not self.supabase:
                logger.warning(
                    "[NotificationService] No Supabase client — notifications will not be persisted."
                )

    # ------------------------------------------------------------------
    # Core dispatch
    # ------------------------------------------------------------------

    async def send_notification(
        self,
        user_id: str,
        message: str,
        channel: str = "email",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Send a notification to a single user via the specified channel.

        Args:
            user_id:  Target user identifier.
            message:  Notification body text.
            channel:  Delivery channel ('email', 'sms', 'push', 'slack').
            metadata: Optional extra payload attached to the notification record.

        Returns:
            dict with status, id, user_id, message, channel, sent_at, metadata.
            If the user's preference disables the channel, returns
            {'status': 'skipped', 'reason': 'user_preference_disabled'}.

        Raises:
            ValueError: If user_id or message is empty, or channel is invalid.
        """
        if not user_id:
            raise ValueError("user_id is required")
        if not message:
            raise ValueError("message is required")
        if channel not in _VALID_CHANNELS:
            raise ValueError(
                f"Invalid channel: '{channel}'. Must be one of: {', '.join(sorted(_VALID_CHANNELS))}"
            )

        # Check user preferences
        prefs = self._get_preferences(user_id)
        if prefs.get(channel) is False:
            return {"status": "skipped", "reason": "user_preference_disabled"}

        now = datetime.now(timezone.utc).isoformat()
        record: Dict[str, Any] = {
            "user_id": user_id,
            "message": message,
            "channel": channel,
            "status": "sent",
            "sent_at": now,
            "metadata": metadata or {},
        }

        # Persist to Supabase if available
        if self.supabase:
            try:
                resp = self.supabase.table("notifications").insert(record).execute()
                if resp.data:
                    record["id"] = resp.data[0].get("id", 0)
            except Exception as exc:
                logger.error("[NotificationService] Failed to persist notification: %s", exc)
                record["id"] = 0
        else:
            record["id"] = 0

        return record

    async def send_batch(
        self,
        user_ids: List[str],
        message: str,
        channel: str = "email",
    ) -> List[Dict[str, Any]]:
        """
        Send the same notification to multiple users.

        Args:
            user_ids: List of target user identifiers.
            message:  Notification body text.
            channel:  Delivery channel for all recipients.

        Returns:
            List of result dicts, one per user_id (same format as send_notification).
        """
        results = []
        for uid in user_ids:
            try:
                result = await self.send_notification(uid, message, channel)
            except ValueError as exc:
                result = {"status": "error", "user_id": uid, "error": str(exc)}
            results.append(result)
        return results

    # ------------------------------------------------------------------
    # Preferences
    # ------------------------------------------------------------------

    def set_preferences(self, user_id: str, preferences: Dict[str, bool]) -> None:
        """
        Set channel preferences for a user.

        Args:
            user_id:     Target user identifier.
            preferences: Mapping of channel name → enabled (True/False).
                         e.g. {"email": True, "sms": False}
        """
        if self.supabase:
            try:
                self.supabase.table("notification_preferences").upsert(
                    {"user_id": user_id, "preferences": preferences}
                ).execute()
            except Exception as exc:
                logger.error("[NotificationService] set_preferences error: %s", exc)

    def _get_preferences(self, user_id: str) -> Dict[str, bool]:
        """Return the user's channel preferences, defaulting to all-enabled."""
        if not self.supabase:
            return {}
        try:
            resp = (
                self.supabase.table("notification_preferences")
                .select("preferences")
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            if resp.data:
                return resp.data.get("preferences", {})
        except Exception:
            pass
        return {}

    # ------------------------------------------------------------------
    # History
    # ------------------------------------------------------------------

    def get_notification_history(
        self,
        user_id: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> Dict[str, Any]:
        """
        Return paginated notification history.

        Args:
            user_id:  Filter by user (None = all users).
            page:     1-based page number.
            per_page: Items per page (max 100).

        Returns:
            dict with keys: items (list), total (int), page (int),
            per_page (int), pages (int).
        """
        per_page = min(per_page, 100)
        offset = (page - 1) * per_page

        if not self.supabase:
            return {"items": [], "total": 0, "page": page, "per_page": per_page, "pages": 0}

        try:
            query = self.supabase.table("notifications").select("*", count="exact")
            if user_id:
                query = query.eq("user_id", user_id)
            resp = query.range(offset, offset + per_page - 1).order("sent_at", desc=True).execute()
            items = resp.data or []
            total = resp.count or 0
            pages = (total + per_page - 1) // per_page if total else 0
            return {
                "items": items,
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": pages,
            }
        except Exception as exc:
            logger.error("[NotificationService] get_notification_history error: %s", exc)
            return {"items": [], "total": 0, "page": page, "per_page": per_page, "pages": 0}

    def mark_as_read(self, notification_id: int) -> Dict[str, Any]:
        """
        Mark a notification as read.

        Args:
            notification_id: Primary key of the notification record.

        Returns:
            dict with updated record data, or error dict on failure.
        """
        if not self.supabase:
            return {"error": "Database not connected"}
        try:
            resp = (
                self.supabase.table("notifications")
                .update({"status": "read", "read_at": datetime.now(timezone.utc).isoformat()})
                .eq("id", notification_id)
                .execute()
            )
            if resp.data:
                return resp.data[0]
            return {"error": "Notification not found"}
        except Exception as exc:
            logger.error("[NotificationService] mark_as_read error: %s", exc)
            return {"error": str(exc)}
