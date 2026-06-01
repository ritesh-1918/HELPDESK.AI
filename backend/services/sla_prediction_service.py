"""
SLA Breach Prediction Service
Rule-based weighted scoring engine that predicts the probability of an active
ticket breaching its SLA, forecasts an expected resolution time, and produces
explainable risk factors so support teams can take proactive action.

Designed to be stateless, fast, and dependency-free so it can be invoked
on every active ticket without measurable performance impact.
"""

import datetime
from typing import Iterable


# ---------------------------------------------------------------------------
# Defaults (kept in sync with main.py hours_map so behavior matches existing SLA)
# ---------------------------------------------------------------------------
DEFAULT_SLA_HOURS = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}

# Configurable risk thresholds. Callers can override per request / per tenant.
DEFAULT_THRESHOLDS = {
    "warning": 0.70,
    "escalate": 0.85,
    "critical": 0.95,
}

# Workload bucket -> multiplier applied to the historical average resolution time.
# A heavily loaded team is empirically slower; an idle team is faster.
WORKLOAD_MULTIPLIER = {
    "low": 0.85,
    "normal": 1.00,
    "high": 1.25,
    "overloaded": 1.50,
}


def _parse_iso(ts: str) -> datetime.datetime:
    """Parse an ISO timestamp, tolerating a trailing 'Z'."""
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    return datetime.datetime.fromisoformat(ts)


def _utcnow() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def _risk_level(score: float, thresholds: dict) -> str:
    if score >= thresholds["critical"]:
        return "Critical"
    if score >= thresholds["escalate"]:
        return "Escalate"
    if score >= thresholds["warning"]:
        return "Warning"
    return "OK"


def _confidence(similar_count: int) -> str:
    """Confidence in the prediction grows with how many historical samples back it."""
    if similar_count >= 10:
        return "High"
    if similar_count >= 3:
        return "Medium"
    return "Low"


class SLAPredictionService:
    """Stateless predictor — instantiate once and reuse."""

    def __init__(self, thresholds: dict | None = None):
        self.thresholds = {**DEFAULT_THRESHOLDS, **(thresholds or {})}

    # ----- single ticket -------------------------------------------------
    def predict(
        self,
        priority: str,
        created_at: str,
        sla_breach_at: str | None = None,
        category: str | None = None,
        assigned_team: str | None = None,
        team_workload: str = "normal",
        similar_avg_resolution_hours: float | None = None,
        similar_count: int = 0,
        now: datetime.datetime | None = None,
    ) -> dict:
        """Return breach probability, forecast, risk level, and explanation."""
        now = now or _utcnow()
        created = _parse_iso(created_at)

        if priority not in DEFAULT_SLA_HOURS:
            raise ValueError(
                f"Invalid priority '{priority}'. Must be one of: {', '.join(DEFAULT_SLA_HOURS.keys())}"
            )

        sla_hours = DEFAULT_SLA_HOURS.get(priority, 72)
        if sla_breach_at:
            breach_dt = _parse_iso(sla_breach_at)
        else:
            breach_dt = created + datetime.timedelta(hours=sla_hours)

        age_hours = max(0.0, (now - created).total_seconds() / 3600.0)
        remaining_hours = (breach_dt - now).total_seconds() / 3600.0
        sla_total = max(0.001, (breach_dt - created).total_seconds() / 3600.0)
        age_ratio = min(1.5, age_hours / sla_total)

        # Resolution time forecast — historical average adjusted for workload.
        base_eta = similar_avg_resolution_hours if similar_avg_resolution_hours else sla_hours
        workload_factor = WORKLOAD_MULTIPLIER.get(team_workload.lower(), 1.0)
        predicted_resolution_hours = round(base_eta * workload_factor, 2)

        # Weighted scoring — capped at 1.0.
        # 1) Age vs SLA window (heaviest signal)
        age_score = min(1.0, age_ratio) * 0.45
        # 2) Forecast vs remaining SLA
        if remaining_hours <= 0:
            forecast_score = 0.40  # already breached or at the line
        else:
            overshoot = max(0.0, predicted_resolution_hours - remaining_hours) / max(1.0, sla_total)
            forecast_score = min(1.0, overshoot) * 0.40
        # 3) Team workload pressure
        workload_score = {
            "low": 0.0,
            "normal": 0.05,
            "high": 0.10,
            "overloaded": 0.15,
        }.get(team_workload.lower(), 0.05)

        probability = round(min(1.0, age_score + forecast_score + workload_score), 4)
        risk = _risk_level(probability, self.thresholds)

        factors: list[str] = []
        if age_ratio >= 0.70:
            factors.append(
                f"Ticket age already exceeds {int(age_ratio * 100)}% of SLA window"
            )
        if similar_avg_resolution_hours:
            factors.append(
                f"Similar tickets average {similar_avg_resolution_hours:.1f} hours to resolve"
            )
        if predicted_resolution_hours > max(0.0, remaining_hours):
            factors.append(
                f"Predicted resolution ({predicted_resolution_hours:.1f}h) exceeds "
                f"remaining SLA ({max(0.0, remaining_hours):.1f}h)"
            )
        if team_workload.lower() in ("high", "overloaded"):
            factors.append(f"Assigned team workload is {team_workload.lower()}")
        if not factors:
            factors.append("Ticket is well within SLA window with no risk signals")

        return {
            "priority": priority,
            "category": category,
            "assigned_team": assigned_team,
            "sla_hours": sla_hours,
            "age_hours": round(age_hours, 2),
            "remaining_hours": round(remaining_hours, 2),
            "predicted_resolution_hours": predicted_resolution_hours,
            "breach_probability": probability,
            "risk_level": risk,
            "confidence": _confidence(similar_count),
            "thresholds": self.thresholds,
            "factors": factors,
            "should_escalate": probability >= self.thresholds["escalate"],
        }

    # ----- dashboard summary --------------------------------------------
    def summarize(self, predictions: Iterable[dict]) -> dict:
        """Aggregate per-ticket predictions into a dashboard summary."""
        items = list(predictions)
        active = len(items)
        high = sum(1 for p in items if p["risk_level"] in ("Escalate", "Warning"))
        critical = sum(1 for p in items if p["risk_level"] == "Critical")
        at_risk = high + critical
        compliance = 1.0 if active == 0 else round(1.0 - (at_risk / active), 2)
        return {
            "active_tickets": active,
            "high_risk_tickets": high,
            "critical_risk_tickets": critical,
            "predicted_sla_compliance": compliance,
        }
