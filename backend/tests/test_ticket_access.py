import unittest

from backend.services.ticket_access import (
    filter_ticket_updates,
    normalize_company_id,
    require_company_id,
    ticket_belongs_to_company,
)


class TicketAccessTests(unittest.TestCase):
    def test_normalize_company_id_strips_whitespace(self):
        self.assertEqual(normalize_company_id("  acme-123  "), "acme-123")

    def test_require_company_id_rejects_blank_values(self):
        with self.assertRaises(ValueError):
            require_company_id("   ")

    def test_filter_ticket_updates_blocks_tenant_and_owner_fields(self):
        updates = {
            "status": "resolved",
            "assigned_team": "support",
            "assigned_agent_id": "agent-9",
            "priority": "high",
            "category": "billing",
            "company_id": "evil-tenant",
            "owner_id": "someone-else",
            "ticket_id": "patched-id",
            "metadata": {"resolved_at": "2026-06-29T00:00:00Z"},
            "unexpected": "should-not-appear",
        }

        sanitized = filter_ticket_updates(updates)

        self.assertEqual(sanitized["status"], "resolved")
        self.assertEqual(sanitized["assigned_team"], "support")
        self.assertEqual(sanitized["assigned_agent_id"], "agent-9")
        self.assertEqual(sanitized["priority"], "high")
        self.assertEqual(sanitized["category"], "billing")
        self.assertEqual(sanitized["metadata"], {"resolved_at": "2026-06-29T00:00:00Z"})
        self.assertNotIn("company_id", sanitized)
        self.assertNotIn("owner_id", sanitized)
        self.assertNotIn("ticket_id", sanitized)
        self.assertNotIn("unexpected", sanitized)

    def test_ticket_belongs_to_company_matches_trimmed_ids(self):
        self.assertTrue(ticket_belongs_to_company("  acme-123  ", "acme-123"))
        self.assertFalse(ticket_belongs_to_company("acme-123", "beta-456"))


if __name__ == "__main__":
    unittest.main()
