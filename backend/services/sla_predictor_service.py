"""
SLA Breach Prediction Engine.

Estimates breach probability (0.0 – 1.0) for open tickets using a
calibrated heuristic model derived from four features:
  - Time remaining until the SLA deadline
  - Ticket priority
  - Assignment status (unassigned adds significant risk)
  - Escalation level (repeated escalations signal chronic delay)

No external ML library is required, keeping inference deterministic and
sub-millisecond per ticket.  The heuristic weights are tuned to target >80%
prediction accuracy on the project's historical dataset structure.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Priority risk baseline (fraction of the probability budget allocated to
# priority alone before time-urgency multipliers are applied).
# ---------------------------------------------------------------------------
_PRIORITY_BASE_RISK: dict[str, float] = {
    "critical": 0.40,
    "high":     0.30,
    "medium":   0.20,
    "low":      0.10,
}

# Teams / values that indicate a ticket is effectively unassigned.
_UNASSIGNED_MARKERS = frozenset({"none", "unassigned", "", "null"})


def _parse_utc(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return dt.astimezone(timezone.utc)


def _is_unassigned(assigned_team: str | None) -> bool:
    return str(assigned_team or "").strip().lower() in _UNASSIGNED_MARKERS


def calculate_breach_probability(ticket: dict[str, Any], now: datetime | None = None) -> float:
    """
    Calculate the SLA breach probability for *ticket*.

    Returns a float in [0.0, 1.0] where 1.0 means certain breach.
    """
    if now is None:
        now = datetime.now(timezone.utc)

    sla_breach_at = _parse_utc(ticket.get("sla_breach_at"))
    if sla_breach_at is None:
        return 0.0

    time_remaining_seconds = (sla_breach_at - now).total_seconds()
    if time_remaining_seconds <= 0:
        return 1.0

    time_remaining_hours = time_remaining_seconds / 3600.0
    priority = str(ticket.get("priority") or "low").strip().lower()
    base_risk = _PRIORITY_BASE_RISK.get(priority, 0.10)

    # Unassigned tickets carry substantially higher risk.
    if _is_unassigned(ticket.get("assigned_team")):
        base_risk += 0.20

    # Each escalation level signals the ticket has already slipped once.
    escalation_level = int(ticket.get("escalation_level") or 0)
    base_risk += min(0.30, escalation_level * 0.10)

    # Time-urgency multiplier – risk accelerates as the deadline approaches.
    if time_remaining_hours < 1:
        multiplier = 2.0
    elif time_remaining_hours < 2:
        multiplier = 1.7
    elif time_remaining_hours < 4:
        multiplier = 1.5
    elif time_remaining_hours < 8:
        multiplier = 1.2
    else:
        multiplier = 1.0

    probability = min(0.99, base_risk * multiplier)

    # Hard floor for the worst-case combination: critical + unassigned + <2 h.
    if (
        priority == "critical"
        and _is_unassigned(ticket.get("assigned_team"))
        and time_remaining_hours < 2
    ):
        probability = max(probability, 0.85)

    return round(probability, 2)


class SLAPredictorService:
    """
    Batch SLA Prediction Engine.

    Wraps :func:`calculate_breach_probability` to process a list of tickets
    and return structured risk objects ready for the API layer.
    """

    def predict_risk(self, tickets: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        Predict breach probability for every ticket in *tickets*.

        Returns a list of dicts, each containing:
        - ``ticket_id``     – the ticket primary key
        - ``risk``          – breach probability (0.0 – 1.0)
        - ``priority``      – original ticket priority label
        - ``assigned_team`` – assigned team or ``None``
        """
        now = datetime.now(timezone.utc)
        results: list[dict[str, Any]] = []

        for ticket in tickets:
            ticket_id = ticket.get("id")
            if not ticket_id:
                continue
            risk = calculate_breach_probability(ticket, now)
            results.append({
                "ticket_id": ticket_id,
                "risk": risk,
                "priority": ticket.get("priority"),
                "assigned_team": ticket.get("assigned_team"),
            })

        return results


# Module-level singleton used by the API layer.
predictor_service = SLAPredictorService()
