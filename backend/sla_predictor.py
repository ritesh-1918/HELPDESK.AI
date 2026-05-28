"""
SLA Breach Predictor — estimates resolution time and breach risk for a ticket.

Uses a weighted heuristic with three factors:
  1. Priority baseline   (matching main.py resolution deadlines)
  2. Category adjustment (historical breach rate from Supabase — optional)
  3. Workload multiplier (current open-ticket count for company — optional)
"""
from __future__ import annotations

import logging
import json
import time
import sys
import threading
from datetime import datetime, timezone
from typing import Any, Callable

from backend.services.redis_cache import redis_cache

logger = logging.getLogger(__name__)

# Mirrors calculate_sla_breach_at() in main.py (hours → minutes)
_BASELINE_MINUTES: dict[str, int] = {
    "critical": 2 * 60,
    "high": 8 * 60,
    "medium": 24 * 60,
    "low": 72 * 60,
}

_TERMINAL_STATUSES = frozenset({"resolved", "closed", "auto-resolved", "auto resolved"})
_IS_TESTING = "pytest" in sys.modules or "unittest" in sys.modules


class InMemoryTTLCache:
    """Thread-safe in-memory cache to protect the database from query storms."""
    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self.cache: dict[str, tuple[float, Any]] = {}
        self.lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        with self.lock:
            if key not in self.cache:
                return None
            ts, val = self.cache[key]
            if time.time() - ts > self.ttl:
                del self.cache[key]
                return None
            return val

    def set(self, key: str, val: Any) -> None:
        with self.lock:
            self.cache[key] = (time.time(), val)

    def clear(self) -> None:
        with self.lock:
            self.cache.clear()


# Global instances of local TTL caches
_category_cache = InMemoryTTLCache(ttl_seconds=300)      # 5 minutes for category breach rate
_workload_cache = InMemoryTTLCache(ttl_seconds=60)        # 1 minute for workload open counts


def _priority_key(priority: str | None) -> str:
    value = str(priority or "low").strip().lower()
    return value if value in _BASELINE_MINUTES else "low"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _category_adjustment_details(
    category: str | None,
    company_id: str | None,
    supabase: Any
) -> tuple[float, float, int]:
    """
    Returns a tuple of (multiplier, breach_rate, sample_count) based on historical breach rate.
    """
    if supabase is None or not category:
        return 1.0, 0.0, 0

    cache_key = f"cat_details:{company_id or 'all'}:{category}"

    # 1. Try Redis cache (only if not testing)
    if not _IS_TESTING and redis_cache.available:
        try:
            val = redis_cache._client.get(f"helpdesk:sla:cat_details:{company_id or 'all'}:{category}")
            if val is not None:
                parts = json.loads(val)
                return float(parts[0]), float(parts[1]), int(parts[2])
        except Exception as exc:
            logger.warning("Redis category details get failed: %s", exc)

    # 2. Try Local in-memory TTL cache (only if not testing)
    if not _IS_TESTING:
        cached_val = _category_cache.get(cache_key)
        if cached_val is not None:
            return cached_val

    # 3. Fallback to Supabase database query
    try:
        query = (
            supabase.table("tickets")
            .select("status, sla_status")
            .eq("category", category)
            .limit(100)
        )
        if company_id:
            query = query.eq("company_id", company_id)

        res = query.execute()
        rows = res.data or []

        terminal = [
            r for r in rows
            if str(r.get("status") or "").strip().lower() in _TERMINAL_STATUSES
        ]
        if len(terminal) < 5:
            result = (1.0, 0.0, len(terminal))
        else:
            breached = sum(
                1 for r in terminal
                if str(r.get("sla_status") or "").upper() == "BREACHED"
            )
            breach_rate = breached / len(terminal)

            if breach_rate > 0.5:
                factor = 1.3
            elif breach_rate < 0.2:
                factor = 0.8
            else:
                factor = 1.0
            result = (factor, breach_rate, len(terminal))

        # Save to local cache
        if not _IS_TESTING:
            _category_cache.set(cache_key, result)

        # Save to Redis cache
        if not _IS_TESTING and redis_cache.available:
            try:
                redis_cache._client.setex(
                    f"helpdesk:sla:cat_details:{company_id or 'all'}:{category}",
                    300,  # 5 minutes
                    json.dumps(result)
                )
            except Exception as exc:
                logger.warning("Redis category details set failed: %s", exc)

        return result
    except Exception as exc:
        logger.warning("Category adjustment query failed: %s", exc)
        return 1.0, 0.0, 0


def _category_adjustment(category: str | None, company_id: str | None, supabase: Any) -> float:
    return _category_adjustment_details(category, company_id, supabase)[0]


def _workload_multiplier_details(company_id: str | None, supabase: Any) -> tuple[float, int]:
    """
    Returns a tuple of (multiplier, open_count) based on how many open tickets a company has.
    """
    if supabase is None or not company_id:
        return 1.0, 0

    cache_key = f"workload_details:{company_id}"

    # 1. Try Redis cache (only if not testing)
    if not _IS_TESTING and redis_cache.available:
        try:
            val = redis_cache._client.get(f"helpdesk:sla:workload_details:{company_id}")
            if val is not None:
                parts = json.loads(val)
                return float(parts[0]), int(parts[1])
        except Exception as exc:
            logger.warning("Redis workload details get failed: %s", exc)

    # 2. Try Local in-memory TTL cache (only if not testing)
    if not _IS_TESTING:
        cached_val = _workload_cache.get(cache_key)
        if cached_val is not None:
            return cached_val

    # 3. Fallback to Supabase database query
    try:
        res = (
            supabase.table("tickets")
            .select("id")
            .eq("company_id", company_id)
            .eq("status", "open")
            .limit(50)
            .execute()
        )
        count = len(res.data or [])

        if count > 20:
            factor = 1.2
        elif count < 5:
            factor = 0.9
        else:
            factor = 1.0

        result = (factor, count)

        # Save to local cache
        if not _IS_TESTING:
            _workload_cache.set(cache_key, result)

        # Save to Redis cache
        if not _IS_TESTING and redis_cache.available:
            try:
                redis_cache._client.setex(
                    f"helpdesk:sla:workload_details:{company_id}",
                    60,  # 1 minute
                    json.dumps(result)
                )
            except Exception as exc:
                logger.warning("Redis workload details set failed: %s", exc)

        return result
    except Exception as exc:
        logger.warning("Workload multiplier query failed: %s", exc)
        return 1.0, 0


def _workload_multiplier(company_id: str | None, supabase: Any) -> float:
    return _workload_multiplier_details(company_id, supabase)[0]


def get_sla_estimate(
    ticket: dict,
    supabase: Any = None,
    _now_fn: Callable[[], datetime] | None = None,
) -> dict:
    """
    Estimates resolution time and breach risk for a ticket.

    Args:
        ticket:   Ticket row dict — uses priority, category, company_id, sla_breach_at
        supabase: Optional Supabase client for historical + workload context
        _now_fn:  Injectable clock (for testing)

    Returns:
        {"estimated_minutes": int, "breach_risk": bool} + advanced factors metadata
    """
    now_fn = _now_fn or _utc_now

    priority = ticket.get("priority")
    category = ticket.get("category")
    company_id = ticket.get("company_id")
    sla_breach_at = ticket.get("sla_breach_at")

    baseline = _BASELINE_MINUTES[_priority_key(priority)]
    category_factor, breach_rate, sample_count = _category_adjustment_details(category, company_id, supabase)
    workload_factor, workload_count = _workload_multiplier_details(company_id, supabase)

    estimated_minutes = int(round(baseline * category_factor * workload_factor))

    breach_risk = False
    if sla_breach_at:
        try:
            deadline = datetime.fromisoformat(str(sla_breach_at).replace("Z", "+00:00"))
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            minutes_remaining = (deadline - now_fn()).total_seconds() / 60
            breach_risk = estimated_minutes > minutes_remaining
        except (ValueError, TypeError) as exc:
            logger.warning("Could not parse sla_breach_at %r: %s", sla_breach_at, exc)

    # Calculate SLA predictor confidence score (0.0 to 1.0)
    # Higher sample size = higher confidence. Extreme workloads introduce volatility.
    if sample_count > 0:
        confidence_score = min(0.95, 0.4 + (min(sample_count, 50) / 50.0) * 0.5)
        if workload_count > 30:
            confidence_score = max(0.2, confidence_score - 0.1)
    else:
        confidence_score = 0.3

    return {
        "estimated_minutes": estimated_minutes,
        "breach_risk": breach_risk,
        "factors": {
            "baseline_minutes": baseline,
            "category_multiplier": category_factor,
            "workload_multiplier": workload_factor,
        },
        "metadata": {
            "category": category,
            "company_id": company_id,
            "confidence_score": round(confidence_score, 2),
            "historical_breach_rate": round(breach_rate, 2),
            "sample_count": sample_count,
            "workload_count": workload_count,
        }
    }
