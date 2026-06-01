import unittest
from datetime import datetime, timezone


from backend.services.sla_service import (
    SlaEscalationService,
    calculate_sla_breach_at,
    classify_sla_status,
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


if __name__ == "__main__":
    unittest.main()
