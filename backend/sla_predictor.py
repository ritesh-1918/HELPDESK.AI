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



def _sentiment_risk_score(sentiment=None):
    """Compute sentiment-based risk multiplier and label."""
    if not sentiment:
        return 1.0, "unknown"
    label = str(sentiment.get("sentiment", "neutral")).strip().lower()
    frustration = float(sentiment.get("frustration_score", 0.0) or 0.0)
    if label == "negative":
        return (1.5, "very_frustrated") if frustration > 0.7 else (1.3, "negative")
    elif label == "positive":
        return 0.8, "positive"
    return (1.2, "neutral_frustrated") if frustration > 0.5 else (1.0, "neutral")


_RISK_WEIGHTS = {"priority": 0.35, "time_remaining": 0.30, "sentiment": 0.15, "category_history": 0.10, "workload": 0.10}
_RISK_PRIORITY_SCORES = {"critical": 90, "high": 70, "medium": 40, "low": 10}


def compute_risk_score(priority, sla_breach_at=None, category=None, company_id=None, sentiment=None, supabase=None):
    """Compute 0-100 risk score using multi-factor weighted analysis."""
    now = datetime.now(timezone.utc)
    p_key = _priority_key(priority)
    priority_score = _RISK_PRIORITY_SCORES.get(p_key, 10)
    time_score = 10
    if sla_breach_at:
        try:
            deadline = datetime.fromisoformat(str(sla_breach_at).replace("Z", "+00:00"))
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            remaining_pct = (deadline - now).total_seconds() / 3600
            baseline_hours = _BASELINE_MINUTES.get(p_key, 1440) / 60.0
            if remaining_pct <= 0:
                time_score = 100
            elif baseline_hours > 0:
                time_score = int(round(max(0, 1.0 - remaining_pct / baseline_hours) * 100))
            else:
                time_score = 50
        except (ValueError, TypeError):
            time_score = 10
    sentiment_mult, sentiment_label = _sentiment_risk_score(sentiment)
    sentiment_score = max(0, min(100, int(round((sentiment_mult - 0.8) / 0.7 * 50 + 25))))
    _, historical_breach_rate, _ = _category_adjustment_details(category, company_id, supabase)
    category_score = int(round(historical_breach_rate * 100))
    wf, wc = _workload_multiplier_details(company_id, supabase)
    workload_score = min(100, int(round(max(0, wf - 0.8) / 0.5 * 50)))
    composite = (priority_score * 0.35 + time_score * 0.30 + sentiment_score * 0.15 +
                 category_score * 0.10 + workload_score * 0.10)
    risk_score = int(round(composite))
    risk_level = "critical" if risk_score >= 75 else ("high" if risk_score >= 50 else ("medium" if risk_score >= 25 else "low"))
    factor_scores = {"priority_score": priority_score, "time_score": time_score,
                     "sentiment_score": sentiment_score, "category_score": category_score,
                     "workload_score": workload_score}
    sorted_f = sorted(factor_scores.items(), key=lambda x: x[1], reverse=True)
    top_factors = [k for k, v in sorted_f[:3] if v > 20]
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "factors": {
            "priority": {"raw": priority_score, "weight": 0.35},
            "time_remaining": {"raw": time_score, "weight": 0.30},
            "sentiment": {"raw": sentiment_score, "weight": 0.15, "label": sentiment_label},
            "category_history": {"raw": category_score, "weight": 0.10},
            "workload": {"raw": workload_score, "weight": 0.10},
        },
        "top_risk_factors": top_factors if top_factors else ["priority"],
    }


_TRIGGER_COOLDOWN = {}
_TRIGGER_LOCK = threading.Lock()


def should_notify_admin(ticket_id, risk_level, cooldown_seconds=300):
    if risk_level not in ("high", "critical"):
        return False
    with _TRIGGER_LOCK:
        last = _TRIGGER_COOLDOWN.get(ticket_id, 0)
        now_ts = time.time()
        if now_ts - last < cooldown_seconds:
            return False
        _TRIGGER_COOLDOWN[ticket_id] = now_ts
        return True


def trigger_admin_notification(ticket, risk_assessment):
    risk_level = risk_assessment.get("risk_level", "low")
    ticket_id = ticket.get("ticket_id") or ticket.get("id", "unknown")
    if not should_notify_admin(ticket_id, risk_level):
        return None
    notification = {
        "type": "sla_breach_warning",
        "ticket_id": ticket_id,
        "subject": ticket.get("subject", ticket.get("title", "Untitled")),
        "priority": ticket.get("priority", "low"),
        "risk_level": risk_level,
        "risk_score": risk_assessment.get("risk_score", 0),
        "top_risk_factors": risk_assessment.get("top_risk_factors", []),
        "deadline": ticket.get("sla_breach_at"),
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
    }
    logging.getLogger(__name__).warning(
        "[SLA ALERT] Ticket %s --- risk=%s/%d factors=%s",
        ticket_id, risk_level, notification["risk_score"],
        ",".join(notification["top_risk_factors"]),
    )
    return notification


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
