
"""
Persistent Notification Queue Service

Ensures email notifications are not lost on server restart, with:
- Supabase table as primary storage
- Local JSON file as fallback
- Retry logic
- Status tracking (pending/processing/failed/sent)
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
from enum import Enum

logger = logging.getLogger(__name__)


class NotificationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    FAILED = "failed"
    SENT = "sent"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class NotificationQueue:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.state_path = Path(__file__).resolve().parent.parent / "data" / "notification_queue.json"

    def _read_state(self) -> Dict[str, Any]:
        if not self.state_path.exists():
            return {"notifications": []}
        try:
            return json.loads(self.state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {"notifications": []}

    def _write_state(self, state: Dict[str, Any]) -> None:
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        self.state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    def enqueue(
        self,
        notification_type: str,
        payload: Dict[str, Any],
        scheduled_at: Optional[str] = None,
        max_attempts: int = 5
    ) -> Dict[str, Any]:
        """Add a new notification to the queue."""
        notification_id = str(uuid.uuid4())
        scheduled_at = scheduled_at or utc_now_iso()
        notification = {
            "id": notification_id,
            "type": notification_type,
            "payload": payload,
            "status": NotificationStatus.PENDING.value,
            "attempts": 0,
            "max_attempts": max_attempts,
            "last_attempted_at": None,
            "error_message": None,
            "created_at": utc_now_iso(),
            "scheduled_at": scheduled_at
        }

        if self.supabase:
            try:
                self.supabase.table("notification_queue").insert(notification).execute()
            except Exception as e:
                logger.warning("Supabase enqueue failed, using fallback: %s", str(e))
                state = self._read_state()
                state["notifications"].append(notification)
                self._write_state(state)
        else:
            state = self._read_state()
            state["notifications"].append(notification)
            self._write_state(state)

        return notification

    def dequeue(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get next pending notifications for processing."""
        now = utc_now_iso()
        notifications = []

        if self.supabase:
            try:
                response = (
                    self.supabase.table("notification_queue")
                    .select("*")
                    .eq("status", NotificationStatus.PENDING.value)
                    .lte("scheduled_at", now)
                    .order("created_at", desc=False)
                    .limit(limit)
                    .execute()
                )
                if response.data:
                    notifications = response.data
            except Exception as e:
                logger.warning("Supabase dequeue failed, using fallback: %s", str(e))
                state = self._read_state()
                notifications = [
                    n for n in state["notifications"]
                    if n["status"] == NotificationStatus.PENDING.value and n["scheduled_at"] <= now
                ][:limit]
        else:
            state = self._read_state()
            notifications = [
                n for n in state["notifications"]
                if n["status"] == NotificationStatus.PENDING.value and n["scheduled_at"] <= now
            ][:limit]

        return notifications

    def update_status(
        self,
        notification_id: str,
        status: NotificationStatus,
        error_message: Optional[str] = None
    ) -> None:
        """Update the status of a notification."""
        update_data: Dict[str, Any] = {
            "status": status.value,
            "last_attempted_at": utc_now_iso()
        }
        if error_message:
            update_data["error_message"] = error_message
        if status == NotificationStatus.PROCESSING or status == NotificationStatus.FAILED:
            # Increment attempts if not sent
            update_data["attempts"] = None  # We'll increment in the code

        if self.supabase:
            try:
                # First, get current attempts if we need to increment
                if status != NotificationStatus.SENT:
                    current = (
                        self.supabase.table("notification_queue")
                        .select("attempts")
                        .eq("id", notification_id)
                        .single()
                        .execute()
                    )
                    if current.data:
                        update_data["attempts"] = current.data["attempts"] + 1

                self.supabase.table("notification_queue").update(update_data).eq("id", notification_id).execute()
            except Exception as e:
                logger.warning("Supabase update failed, using fallback: %s", str(e))
                state = self._read_state()
                for n in state["notifications"]:
                    if n["id"] == notification_id:
                        n["status"] = status.value
                        n["last_attempted_at"] = utc_now_iso()
                        if error_message:
                            n["error_message"] = error_message
                        if status != NotificationStatus.SENT:
                            n["attempts"] += 1
                        break
                self._write_state(state)
        else:
            state = self._read_state()
            for n in state["notifications"]:
                if n["id"] == notification_id:
                    n["status"] = status.value
                    n["last_attempted_at"] = utc_now_iso()
                    if error_message:
                        n["error_message"] = error_message
                    if status != NotificationStatus.SENT:
                        n["attempts"] += 1
                    break
            self._write_state(state)

    def get_failed(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get failed notifications that can be retried."""
        notifications = []

        if self.supabase:
            try:
                response = (
                    self.supabase.table("notification_queue")
                    .select("*")
                    .eq("status", NotificationStatus.FAILED.value)
                    .lt("attempts", self.supabase.table("notification_queue").select("max_attempts"))
                    .order("created_at", desc=False)
                    .limit(limit)
                    .execute()
                )
                if response.data:
                    notifications = response.data
            except Exception as e:
                logger.warning("Supabase get_failed failed, using fallback: %s", str(e))
                state = self._read_state()
                notifications = [
                    n for n in state["notifications"]
                    if n["status"] == NotificationStatus.FAILED.value and n["attempts"] < n["max_attempts"]
                ][:limit]
        else:
            state = self._read_state()
            notifications = [
                n for n in state["notifications"]
                if n["status"] == NotificationStatus.FAILED.value and n["attempts"] < n["max_attempts"]
            ][:limit]

        return notifications

    def retry_failed(self, notification_id: str) -> None:
        """Mark a failed notification as pending to retry it."""
        self.update_status(notification_id, NotificationStatus.PENDING)


# Singleton instance
_instance: Optional[NotificationQueue] = None


def load(supabase_client=None) -> NotificationQueue:
    """Load and return singleton instance of NotificationQueue."""
    global _instance
    if _instance is None:
        _instance = NotificationQueue(supabase_client)
        logger.info("NotificationQueue loaded")
    return _instance


def get_instance() -> Optional[NotificationQueue]:
    """Get the singleton instance if already loaded."""
    return _instance

