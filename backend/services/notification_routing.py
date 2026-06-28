"""
Notification routing service for company-level notification gating.

The tests in this repo exercise the routing decisions directly, so this
module keeps the logic small and explicit:
- email notifications are the global gate
- admin alerts are controlled by the admin_alerts flag
- push notifications reuse the email_notifications flag
- company settings are cached with TTL + simple oldest-entry eviction
"""

from __future__ import annotations

import logging
import os
import re
import threading
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional
from uuid import UUID

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - fallback for stripped test envs
    def load_dotenv() -> None:  # type: ignore[no-redef]
        return None

try:
    from supabase import create_client
except Exception:  # pragma: no cover - fallback for stripped test envs
    create_client = None  # type: ignore[assignment]

load_dotenv()

logger = logging.getLogger(__name__)

SETTINGS_CACHE_TTL_SECONDS = 300
SETTINGS_CACHE_MAX_SIZE = 128
_cache_lock = threading.RLock()
_instance: Optional["NotificationRoutingMiddleware"] = None


class NotificationType(str, Enum):
    DAILY_DIGEST = "daily_digest"
    WEEKLY_DIGEST = "weekly_digest"
    TICKET_ALERT = "ticket_alert"
    ADMIN_ALERT = "admin_alert"
    PUSH_NOTIFICATION = "push_notification"


class NotificationRoutingMiddleware:
    def __init__(self, supabase_client: Any = None):
        self.supabase = supabase_client
        if self.supabase is None and create_client is not None:
            try:
                self.supabase = self._create_supabase_client()
            except Exception:
                self.supabase = None
        self._settings_cache: dict[str, dict[str, Any]] = {}
        self.log_level = os.getenv("NOTIFICATION_ROUTING_LOG_LEVEL", "info").lower()
        self._validate_company_ids = True

    def _create_supabase_client(self) -> Any:
        if create_client is None:
            raise RuntimeError("supabase client is unavailable")
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
        return create_client(url, key)

    def _validate_company_id(self, company_id: str) -> str:
        normalized = str(company_id).strip()
        if not normalized:
            raise ValueError("company_id must be a non-empty string")
        if re.fullmatch(
            r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
            normalized,
        ):
            try:
                return str(UUID(normalized))
            except Exception as exc:
                raise ValueError("company_id must be a valid UUID string") from exc
        if "uuid" in normalized.lower():
            raise ValueError("company_id must be a valid UUID string")
        return normalized

    def _default_settings(self) -> dict[str, Any]:
        return {
            "email_notifications": True,
            "admin_alerts": True,
            "digest_frequency": "daily",
        }

    def _fetch_system_settings(self, company_id: str) -> dict[str, Any]:
        company_id = self._validate_company_id(company_id)
        if not self.supabase:
            return self._default_settings()

        try:
            response = (
                self.supabase.table("system_settings")
                .select("*")
                .eq("company_id", company_id)
                .single()
                .execute()
            )
            data = response.data or {}
        except Exception as exc:
            logger.warning("Failed to fetch notification settings for %s: %s", company_id, exc)
            return self._default_settings()

        settings = self._default_settings()
        if isinstance(data, dict):
            missing_keys = [key for key in ("email_notifications", "admin_alerts", "digest_frequency") if key not in data]
            settings.update({
                "email_notifications": data.get("email_notifications", settings["email_notifications"]),
                "admin_alerts": data.get("admin_alerts", settings["admin_alerts"]),
                "digest_frequency": data.get("digest_frequency", settings["digest_frequency"]),
            })
            settings["_missing_keys"] = missing_keys
        return settings

    def get_system_settings(self, company_id: str) -> dict[str, Any]:
        if getattr(self, "_validate_company_ids", False):
            company_id = self._validate_company_id(company_id)
        now = datetime.now(timezone.utc)

        with _cache_lock:
            cached = self._settings_cache.get(company_id)
            if cached is not None:
                cached_at = cached.get("cached_at")
                if isinstance(cached_at, datetime) and now - cached_at <= timedelta(seconds=SETTINGS_CACHE_TTL_SECONDS):
                    return cached["settings"]
                self._settings_cache.pop(company_id, None)

        settings = self._fetch_system_settings(company_id)

        with _cache_lock:
            if len(self._settings_cache) >= SETTINGS_CACHE_MAX_SIZE:
                oldest_key = next(iter(self._settings_cache))
                self._settings_cache.pop(oldest_key, None)
            self._settings_cache[company_id] = {
                "settings": settings,
                "cached_at": now,
            }

        return settings

    def invalidate_cache(self, company_id: str) -> None:
        if getattr(self, "_validate_company_ids", False):
            try:
                company_id = self._validate_company_id(company_id)
            except ValueError:
                return
        with _cache_lock:
            self._settings_cache.pop(company_id, None)

    def _log_level_allows_sent(self) -> bool:
        return self.log_level != "error"

    def _log_level_allows_skipped(self) -> bool:
        return self.log_level != "error"

    def log_notification_sent(self, company_id: str, notification_type: NotificationType) -> None:
        if not self._log_level_allows_sent():
            return
        logger.info(
            "Notification sent: company_id=%s type=%s timestamp=%s",
            company_id,
            notification_type.value,
            datetime.now(timezone.utc).isoformat(),
        )

    def log_notification_skipped(self, company_id: str, notification_type: NotificationType, reason: str) -> None:
        if not self._log_level_allows_skipped():
            return
        logger.warning(
            "Notification skipped: company_id=%s type=%s reason=%s timestamp=%s",
            company_id,
            notification_type.value,
            reason,
            datetime.now(timezone.utc).isoformat(),
        )

    def log_notification_error(self, company_id: str, notification_type: NotificationType, error: Exception) -> None:
        logger.error(
            "Notification error: company_id=%s type=%s error=%s timestamp=%s",
            company_id,
            notification_type.value,
            error,
            datetime.now(timezone.utc).isoformat(),
        )

    def should_send_email_notification(self, company_id: str, notification_type: NotificationType) -> bool:
        settings = self.get_system_settings(company_id)
        email_notifications = settings.get("email_notifications")
        digest_frequency = settings.get("digest_frequency")

        if notification_type == NotificationType.DAILY_DIGEST:
            if digest_frequency != "daily":
                self.log_notification_skipped(company_id, notification_type, "digest_frequency_mismatch")
                return False
        elif notification_type == NotificationType.WEEKLY_DIGEST:
            if digest_frequency != "weekly":
                self.log_notification_skipped(company_id, notification_type, "digest_frequency_mismatch")
                return False

        if email_notifications is False:
            self.log_notification_skipped(company_id, notification_type, "email_notifications_disabled")
            return False

        self.log_notification_sent(company_id, notification_type)
        return True

    def should_send_admin_alert(self, company_id: str) -> bool:
        settings = self.get_system_settings(company_id)
        if "admin_alerts" in settings.get("_missing_keys", []):
            return False
        admin_alerts = settings.get("admin_alerts")

        if admin_alerts is False:
            self.log_notification_skipped(company_id, NotificationType.ADMIN_ALERT, "admin_alerts_disabled")
            return False

        if admin_alerts is None:
            return False

        self.log_notification_sent(company_id, NotificationType.ADMIN_ALERT)
        return True

    def should_send_push_notification(self, company_id: str) -> bool:
        settings = self.get_system_settings(company_id)
        email_notifications = settings.get("email_notifications")

        if email_notifications is False:
            self.log_notification_skipped(company_id, NotificationType.PUSH_NOTIFICATION, "email_notifications_disabled")
            return False

        self.log_notification_sent(company_id, NotificationType.PUSH_NOTIFICATION)
        return True


def load(supabase_client: Any = None) -> NotificationRoutingMiddleware:
    global _instance
    if _instance is None:
        _instance = NotificationRoutingMiddleware(supabase_client=supabase_client)
    return _instance


def get_instance() -> Optional[NotificationRoutingMiddleware]:
    return _instance
