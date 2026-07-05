"""
Response Time Estimator — AI-Powered Ticket Response Time Estimator with SLA Breach Prediction
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

# SLA definitions by priority (in hours)
SLA_TARGETS = {
    "critical": {"first_response": 1, "resolution": 4},
    "high": {"first_response": 4, "resolution": 8},
    "medium": {"first_response": 8, "resolution": 24},
    "low": {"first_response": 24, "resolution": 72},
    "default": {"first_response": 24, "resolution": 48},
}

# Priority weights for scoring
PRIORITY_WEIGHTS = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1,
}


def get_sla_targets(priority: str) -> dict:
    """Get SLA targets for a given priority level."""
    return SLA_TARGETS.get(priority.lower(), SLA_TARGETS["default"])


def estimate_response_time(
    priority: str = "medium",
    team_workload: int = 0,
    team_size: int = 1,
    category: Optional[str] = None,
    historical_avg_hours: Optional[float] = None,
) -> dict:
    """
    Estimate response time based on ticket properties and team capacity.

    Args:
        priority: ticket priority (critical/high/medium/low)
        team_workload: number of open tickets assigned to team
        team_size: number of team members available
        category: ticket category for specialized estimation
        historical_avg_hours: historical average response time

    Returns:
        dict with estimated times, SLA targets, and breach risk
    """
    sla = get_sla_targets(priority)
    priority_weight = PRIORITY_WEIGHTS.get(priority.lower(), 2)

    # Base estimate from SLA
    base_first_response = sla["first_response"]
    base_resolution = sla["resolution"]

    # Workload adjustment factor
    if team_size > 0:
        workload_ratio = team_workload / team_size
    else:
        workload_ratio = team_workload

    # Each open ticket adds ~15% delay
    workload_factor = 1 + (workload_ratio * 0.15)

    # Use historical data if available, weighted with SLA
    if historical_avg_hours and historical_avg_hours > 0:
        estimated_first_response = (base_first_response * 0.4 + historical_avg_hours * 0.6) * workload_factor
        estimated_resolution = (base_resolution * 0.4 + historical_avg_hours * 2 * 0.6) * workload_factor
    else:
        estimated_first_response = base_first_response * workload_factor
        estimated_resolution = base_resolution * workload_factor

    # Cap estimates
    estimated_first_response = min(estimated_first_response, 168)  # Max 1 week
    estimated_resolution = min(estimated_resolution, 720)  # Max 30 days

    # SLA breach risk calculation
    first_response_breach_risk = min(estimated_first_response / base_first_response, 3.0) / 3.0
    resolution_breach_risk = min(estimated_resolution / base_resolution, 3.0) / 3.0

    # Overall risk level
    avg_risk = (first_response_breach_risk + resolution_breach_risk) / 2
    if avg_risk > 0.7:
        risk_level = "high"
    elif avg_risk > 0.4:
        risk_level = "medium"
    else:
        risk_level = "low"

    # Predicted breach times
    now = datetime.utcnow()
    first_response_deadline = now + timedelta(hours=base_first_response)
    resolution_deadline = now + timedelta(hours=base_resolution)

    will_breach_first_response = estimated_first_response > base_first_response
    will_breach_resolution = estimated_resolution > base_resolution

    return {
        "estimated_first_response_hours": round(estimated_first_response, 1),
        "estimated_resolution_hours": round(estimated_resolution, 1),
        "sla_targets": sla,
        "breach_risk": {
            "first_response": round(first_response_breach_risk, 2),
            "resolution": round(resolution_breach_risk, 2),
            "overall": round(avg_risk, 2),
            "level": risk_level,
        },
        "predictions": {
            "will_breach_first_response": will_breach_first_response,
            "will_breach_resolution": will_breach_resolution,
            "first_response_deadline": first_response_deadline.isoformat(),
            "resolution_deadline": resolution_deadline.isoformat(),
            "estimated_first_response_at": (now + timedelta(hours=estimated_first_response)).isoformat(),
            "estimated_resolution_at": (now + timedelta(hours=estimated_resolution)).isoformat(),
        },
        "factors": {
            "priority": priority,
            "team_workload": team_workload,
            "team_size": team_size,
            "workload_factor": round(workload_factor, 2),
            "category": category,
            "has_historical_data": historical_avg_hours is not None,
        },
    }


def generate_estimation_summary(estimation: dict) -> str:
    """Generate a human-readable AI summary of the estimation."""
    risk = estimation["breach_risk"]
    preds = estimation["predictions"]
    factors = estimation["factors"]

    summary_parts = []

    # Risk assessment
    if risk["level"] == "high":
        summary_parts.append(
            f"⚠️ HIGH BREACH RISK ({risk['overall']:.0%}). "
            f"This {factors['priority']} priority ticket may miss SLA targets."
        )
    elif risk["level"] == "medium":
        summary_parts.append(
            f"⚡ MODERATE BREACH RISK ({risk['overall']:.0%}). "
            f"Monitor this ticket closely."
        )
    else:
        summary_parts.append(
            f"✅ LOW BREACH RISK ({risk['overall']:.0%}). "
            f"Ticket is within SLA expectations."
        )

    # Time estimates
    summary_parts.append(
        f"Estimated first response: {estimation['estimated_first_response_hours']}h "
        f"(SLA: {estimation['sla_targets']['first_response']}h)"
    )
    summary_parts.append(
        f"Estimated resolution: {estimation['estimated_resolution_hours']}h "
        f"(SLA: {estimation['sla_targets']['resolution']}h)"
    )

    # Breach predictions
    if preds["will_breach_first_response"]:
        summary_parts.append("🔴 First response SLA will likely be breached.")
    if preds["will_breach_resolution"]:
        summary_parts.append("🔴 Resolution SLA will likely be breached.")

    # Workload factor
    if factors["workload_factor"] > 1.5:
        summary_parts.append(
            f"📊 Team is overloaded (workload factor: {factors['workload_factor']}x). "
            f"Consider reassigning or adding resources."
        )

    return "\n".join(summary_parts)
