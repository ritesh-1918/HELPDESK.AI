from unittest.mock import patch
import unittest
from datetime import datetime, timezone


from backend.services.sla_service import (
    SlaEscalationService,
    calculate_sla_breach_at,
    classify_sla_status,
    get_sla_status,
)


class FakeResult:
    def __init__(self, data=None):
        self.data = data or []


class FakeTable:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        self.filters = {}
        self.payload = None
        self.limit_count = None

    def select(self, *_args):
        return self

    def update(self, payload):
        self.payload = payload
        return self

    def insert(self, payload):
        rows = payload if isinstance(payload, list) else [payload]
        self.db.setdefault(self.name, []).extend(rows)
        return self

    def eq(self, field, value):
        self.filters[field] = value
        return self

    def lte(self, field, value):
        self.filters[f"{field}__lte"] = value
        return self

    def limit(self, value):
        self.limit_count = value
        return self

    def execute(self):
        if self.payload is not None:
            rows = self.db.setdefault(self.name, [])
            for row in rows:
                if all(row.get(key) == value for key, value in self.filters.items() if "__" not in key):
                    row.update(self.payload)
            return FakeResult([])

        rows = list(self.db.get(self.name, []))
        for key, value in self.filters.items():
            if key.endswith("__lte"):
                field = key[:-5]
                rows = [row for row in rows if row.get(field) and row[field] <= value]
            else:
                rows = [row for row in rows if row.get(key) == value]
        if self.limit_count is not None:
            rows = rows[: self.limit_count]
        return FakeResult(rows)


class FakeSupabase:
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return FakeTable(self.tables, name)


class SlaServiceTest(unittest.TestCase):
    def test_calculates_resolution_deadline_from_priority(self):
        now = datetime(2026, 5, 22, 7, 0, tzinfo=timezone.utc)

        self.assertEqual(calculate_sla_breach_at("critical", now).hour, 11)
        self.assertEqual(calculate_sla_breach_at("high", now).hour, 19)
        self.assertEqual(calculate_sla_breach_at("medium", now).day, 23)
        self.assertEqual(calculate_sla_breach_at("low", now).day, 25)

    def test_classifies_active_warning_and_breached_tickets(self):
        now = datetime(2026, 5, 22, 7, 0, tzinfo=timezone.utc)

        self.assertEqual(classify_sla_status("2026-05-22T06:59:00Z", now), "BREACHED")
        self.assertEqual(classify_sla_status("2026-05-22T07:30:00Z", now), "WARNING")
        self.assertEqual(classify_sla_status("2026-05-22T09:00:00Z", now), "ACTIVE")

    def test_get_sla_status_transitions(self):
        # 4 hours resolution time for critical priority = 14400 seconds
        now = datetime(2026, 5, 22, 12, 0, 0, tzinfo=timezone.utc)
        
        # 1. Healthy / Active: < 75% SLA consumption
        # deadline is 3 hours away, meaning 1 hour elapsed out of 4 (25% consumed)
        ticket_healthy = {
            "priority": "critical",
            "sla_breach_at": "2026-05-22T15:00:00Z"
        }
        res = get_sla_status(ticket_healthy, now)
        self.assertEqual(res["status"], "active")
        self.assertEqual(res["severity"], "healthy")
        self.assertEqual(res["remaining_seconds"], 3 * 3600)
        self.assertEqual(res["percentage_used"], 25)

        # 2. Warning: between 75% and 89% SLA consumption
        # deadline is 48 minutes away, meaning 3 hours 12 minutes elapsed (80% consumed)
        ticket_warning = {
            "priority": "critical",
            "sla_breach_at": "2026-05-22T12:48:00Z"
        }
        res = get_sla_status(ticket_warning, now)
        self.assertEqual(res["status"], "warning")
        self.assertEqual(res["severity"], "warning")
        self.assertEqual(res["percentage_used"], 80)

        # 3. Critical: between 90% and 99% SLA consumption
        # deadline is 12 minutes away, meaning 3 hours 48 minutes elapsed (95% consumed)
        ticket_critical = {
            "priority": "critical",
            "sla_breach_at": "2026-05-22T12:12:00Z"
        }
        res = get_sla_status(ticket_critical, now)
        self.assertEqual(res["status"], "critical")
        self.assertEqual(res["severity"], "critical")
        self.assertEqual(res["percentage_used"], 95)

        # 4. Breached: 100%+ SLA consumption (remaining_seconds <= 0)
        # deadline was 5 minutes ago (-300 seconds)
        ticket_breached = {
            "priority": "critical",
            "sla_breach_at": "2026-05-22T11:55:00Z"
        }
        res = get_sla_status(ticket_breached, now)
        self.assertEqual(res["status"], "breached")
        self.assertEqual(res["severity"], "breached")
        self.assertTrue(res["remaining_seconds"] <= 0)
        self.assertEqual(res["percentage_used"], 100)

    def test_run_once_escalates_only_overdue_open_tickets(self):
        now = datetime(2026, 5, 22, 7, 0, tzinfo=timezone.utc)
        tables = {
            "tickets": [
                {
                    "id": "ticket-1",
                    "company_id": "company-1",
                    "status": "open",
                    "priority": "critical",
                    "subject": "VPN outage",
                    "assigned_team": "Network Ops",
                    "sla_breach_at": "2026-05-22T06:55:00Z",
                    "sla_status": "ACTIVE",
                    "escalation_level": 1,
                },
                {
                    "id": "ticket-2",
                    "company_id": "company-1",
                    "status": "resolved",
                    "priority": "critical",
                    "subject": "Closed incident",
                    "assigned_team": "Network Ops",
                    "sla_breach_at": "2026-05-22T06:50:00Z",
                    "sla_status": "ACTIVE",
                    "escalation_level": 0,
                },
                {
                    "id": "ticket-3",
                    "company_id": "company-1",
                    "status": "open",
                    "priority": "high",
                    "subject": "Future incident",
                    "assigned_team": "Hardware Support",
                    "sla_breach_at": "2026-05-22T07:30:00Z",
                    "sla_status": "WARNING",
                    "escalation_level": 0,
                },
            ],
            "audit_logs": [],
            "ticket_messages": [],
        }
        service = SlaEscalationService(FakeSupabase(tables), now_fn=lambda: now)

        stats = service.run_once()

        self.assertEqual(stats["breached_count"], 1)
        self.assertEqual(stats["skipped_count"], 2)
        self.assertEqual(tables["tickets"][0]["sla_status"], "BREACHED")
        self.assertEqual(tables["tickets"][0]["escalation_level"], 2)
        self.assertEqual(tables["tickets"][1]["sla_status"], "ACTIVE")
        self.assertEqual(tables["tickets"][2]["sla_status"], "WARNING")
        self.assertEqual(tables["audit_logs"][0]["event_type"], "sla_breached")
        self.assertEqual(tables["audit_logs"][0]["ticket_id"], "ticket-1")
        self.assertIn("SLA breached", tables["ticket_messages"][0]["message"])

    @patch("backend.services.sla_service.dispatch_slack_alert")
    @patch("backend.services.sla_service.dispatch_teams_alert")
    def test_automated_rerouting_and_webhook_alerts(self, mock_dispatch_teams, mock_dispatch_slack):
        """Verify that tickets are automatically rerouted to correct escalation teams and alerts are dispatched."""
        now = datetime(2026, 5, 22, 7, 0, tzinfo=timezone.utc)
        tables = {
            "tickets": [
                {
                    "id": "ticket-reroute-1",
                    "company_id": "company-1",
                    "status": "open",
                    "priority": "critical",
                    "subject": "Authentication latency",
                    "assigned_team": "IAM Team",  # Level 1
                    "sla_breach_at": "2026-05-22T06:50:00Z",
                    "sla_status": "ACTIVE",
                    "escalation_level": 0,
                }
            ],
            "audit_logs": [],
            "ticket_messages": [],
        }
        service = SlaEscalationService(FakeSupabase(tables), now_fn=lambda: now)
        stats = service.run_once()

        self.assertEqual(stats["breached_count"], 1)
        # Verify status is breached
        self.assertEqual(tables["tickets"][0]["sla_status"], "BREACHED")
        # Verify escalation level incremented to 1
        self.assertEqual(tables["tickets"][0]["escalation_level"], 1)
        # Verify the team was AUTOMATICALLY REROUTED to Level 2 ("Directory Services Lead")
        self.assertEqual(tables["tickets"][0]["assigned_team"], "Directory Services Lead")
        
        # Verify webhook dispatches were called
        mock_dispatch_slack.assert_called_once()
        mock_dispatch_teams.assert_called_once()



if __name__ == "__main__":
    unittest.main()
