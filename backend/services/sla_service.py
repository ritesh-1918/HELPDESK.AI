"""
SLA Auto-Escalation Service & Background Cron Task Module.
Periodically sweeps open tickets for SLA breach thresholds and escalates overdue ticket urgency (#3980).
"""

from datetime import datetime, timezone
from typing import Any, Dict, List


class SLAEscalationService:
    """
    SLA Escalation engine that monitors time-to-first-response and time-to-resolution breaches.
    """

    def __init__(
        self,
        response_time_limit_hours: int = 4,
        resolution_time_limit_hours: int = 24,
    ):
        self.response_time_limit_hours = response_time_limit_hours
        self.resolution_time_limit_hours = resolution_time_limit_hours

    def run_sweep(self, tickets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Sweep tickets and escalate urgency for SLA target violations.
        """
        if not tickets:
            return {"swept_count": 0, "escalated_tickets": []}

        escalated_tickets = []
        now = datetime.now(timezone.utc)

        for ticket in tickets:
            status = ticket.get("status", "open")
            if status in ["resolved", "closed"]:
                continue

            created_at_str = ticket.get("created_at")
            if not created_at_str:
                continue

            try:
                created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            except ValueError:
                continue

            hours_elapsed = (now - created_at).total_seconds() / 3600.0
            current_priority = ticket.get("priority", "medium")

            # Check SLA resolution breach
            if hours_elapsed >= self.resolution_time_limit_hours:
                if current_priority != "urgent":
                    ticket["priority"] = "urgent"
                    ticket["escalated"] = True
                    ticket["escalation_reason"] = "SLA resolution limit exceeded"
                    escalated_tickets.append(ticket)
            elif hours_elapsed >= self.response_time_limit_hours and not ticket.get("first_responded_at"):
                if current_priority in ["low", "medium"]:
                    ticket["priority"] = "high"
                    ticket["escalated"] = True
                    ticket["escalation_reason"] = "SLA first response limit exceeded"
                    escalated_tickets.append(ticket)

        return {
            "swept_count": len(tickets),
            "escalated_count": len(escalated_tickets),
            "escalated_tickets": escalated_tickets,
        }
