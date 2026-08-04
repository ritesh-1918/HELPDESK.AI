from datetime import datetime, timedelta, timezone
import pytest
from backend.services.sla_service import SLAEscalationService


def test_sla_sweep_escalates_overdue_first_response():
    service = SLAEscalationService(response_time_limit_hours=4, resolution_time_limit_hours=24)
    past_time = (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat()

    tickets = [
        {
            "id": "t-101",
            "created_at": past_time,
            "status": "open",
            "priority": "low",
            "first_responded_at": None,
        }
    ]

    result = service.run_sweep(tickets)
    assert result["escalated_count"] == 1
    assert tickets[0]["priority"] == "high"
    assert tickets[0]["escalation_reason"] == "SLA first response limit exceeded"


def test_sla_sweep_escalates_overdue_resolution_to_urgent():
    service = SLAEscalationService(response_time_limit_hours=4, resolution_time_limit_hours=24)
    past_time = (datetime.now(timezone.utc) - timedelta(hours=26)).isoformat()

    tickets = [
        {
            "id": "t-102",
            "created_at": past_time,
            "status": "open",
            "priority": "medium",
            "first_responded_at": (datetime.now(timezone.utc) - timedelta(hours=25)).isoformat(),
        }
    ]

    result = service.run_sweep(tickets)
    assert result["escalated_count"] == 1
    assert tickets[0]["priority"] == "urgent"


def test_sla_sweep_ignores_resolved_tickets():
    service = SLAEscalationService()
    past_time = (datetime.now(timezone.utc) - timedelta(hours=30)).isoformat()

    tickets = [
        {
            "id": "t-103",
            "created_at": past_time,
            "status": "resolved",
            "priority": "low",
        }
    ]

    result = service.run_sweep(tickets)
    assert result["escalated_count"] == 0
    assert tickets[0]["priority"] == "low"
