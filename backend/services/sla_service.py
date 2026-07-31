"""
SLA policy service.

Centralizes the SLA limits for each priority tier and loads per-company SLA
related settings (auto-close behaviour, notification flags, AI thresholds)
from Supabase. Reads are cached through the Redis-backed :class:`CacheLayer`
so repeated config lookups do not hit the database on every request.
"""

import datetime
import os

from backend.services.cache import CacheLayer

# SLA response targets (seconds), mirroring the frontend SLABadge limits.
SLA_LIMITS = {
    "critical": 2 * 60 * 60,   # 2 hours
    "high": 4 * 60 * 60,       # 4 hours
    "medium": 8 * 60 * 60,     # 8 hours
    "low": 24 * 60 * 60,       # 24 hours
}

SLA_CACHE_TTL = int(os.environ.get("SLA_CACHE_TTL_SECONDS", "300"))
SLA_SETTINGS_COLUMNS = (
    "ai_confidence_threshold, duplicate_sensitivity, enable_auto_resolve, "
    "auto_close_enabled, auto_close_days, email_notifications, admin_alerts, digest_frequency"
)

DEFAULT_POLICY = {
    "ai_confidence_threshold": 0.80,
    "duplicate_sensitivity": 0.85,
    "enable_auto_resolve": False,
    "auto_close_enabled": True,
    "auto_close_days": 7,
    "email_notifications": True,
    "admin_alerts": True,
    "digest_frequency": "daily",
}


def get_sla_limit_seconds(priority: str) -> int:
    return SLA_LIMITS.get(str(priority or "").lower(), SLA_LIMITS["medium"])


def get_sla_deadline(priority: str, created_at: str) -> datetime.datetime | None:
    """Return the UTC SLA deadline for a ticket, or None if it cannot be derived."""
    try:
        if not created_at:
            return None
        created = datetime.datetime.fromisoformat(
            created_at.replace("Z", "+00:00")
        )
        if created.tzinfo is None:
            created = created.replace(tzinfo=datetime.timezone.utc)
        return created + datetime.timedelta(seconds=get_sla_limit_seconds(priority))
    except (ValueError, TypeError):
        return None


class SlaPolicyService:
    def __init__(self, cache: CacheLayer, supabase_client):
        self.cache = cache
        self.supabase = supabase_client

    def get_policy(self, company_id: str | None, force_refresh: bool = False) -> dict:
        """Return the effective SLA/system policy for a company, cached."""
        cache_key = f"sla:{company_id or 'default'}"
        if not force_refresh:
            cached = self.cache.get(cache_key)
            if cached is not None:
                return cached

        policy = dict(DEFAULT_POLICY)
        if self.supabase and company_id:
            try:
                res = (
                    self.supabase.table("system_settings")
                    .select(SLA_SETTINGS_COLUMNS)
                    .eq("company_id", company_id)
                    .single()
                    .execute()
                )
                if res.data:
                    policy.update(res.data)
            except Exception as exc:
                print(f"[SLA] Could not fetch system_settings for company_id={company_id}: {exc}")

        self.cache.set(cache_key, policy, ttl=SLA_CACHE_TTL)
        return policy

    def invalidate(self, company_id: str | None) -> None:
        self.cache.delete(f"sla:{company_id or 'default'}")
