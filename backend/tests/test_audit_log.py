"""
Unit tests for security audit logging (issue #3906).

Run with:  python -m unittest backend.tests.test_audit_log -v
"""

import unittest

from backend.services.audit_log import (
    AUDIT_TABLE,
    build_audit_payload,
    log_privilege_change,
)


class FakeTable:
    def __init__(self, name):
        self.name = name
        self.pending = None

    def insert(self, payload):
        self.pending = payload
        return self

    def execute(self):
        return None


class FakeSupabase:
    def __init__(self):
        self.tables = {}

    def table(self, name):
        if name not in self.tables:
            self.tables[name] = FakeTable(name)
        return self.tables[name]


class BuildAuditPayloadTests(unittest.TestCase):
    def test_payload_contains_required_fields(self):
        payload = build_audit_payload(
            actor_id="a-1",
            actor_role="admin",
            action="privilege.elevation",
            target_user_id="u-9",
            target_role="agent",
            ip_address="10.0.0.1",
            user_agent="Mozilla/5.0",
        )
        self.assertEqual(payload["actor_id"], "a-1")
        self.assertEqual(payload["actor_role"], "admin")
        self.assertEqual(payload["action"], "privilege.elevation")
        self.assertEqual(payload["target_user_id"], "u-9")
        self.assertEqual(payload["target_role"], "agent")
        self.assertEqual(payload["ip_address"], "10.0.0.1")
        self.assertEqual(payload["user_agent"], "Mozilla/5.0")
        self.assertTrue(payload["created_at"].endswith("Z"))

    def test_meta_serialized_to_json(self):
        payload = build_audit_payload(
            actor_id="a",
            actor_role="admin",
            action="role.update",
            meta={"previous_role": "agent", "changed_fields": ["role"]},
        )
        self.assertIn("previous_role", payload["meta"])
        self.assertIn("agent", payload["meta"])


class LogPrivilegeChangeTests(unittest.TestCase):
    def test_writes_audit_record(self):
        fake = FakeSupabase()
        log_privilege_change(
            fake,
            actor_id="a-1",
            actor_role="admin",
            target_user_id="u-9",
            target_role="admin",
        )
        table = fake.tables.get(AUDIT_TABLE)
        self.assertIsNotNone(table)
        self.assertEqual(table.pending["target_user_id"], "u-9")
        self.assertEqual(table.pending["target_role"], "admin")

    def test_unknown_action_normalized(self):
        fake = FakeSupabase()
        log_privilege_change(
            fake,
            actor_id="a",
            actor_role="admin",
            target_user_id="u",
            target_role="agent",
            action="hack.the.thing",
        )
        self.assertEqual(fake.tables[AUDIT_TABLE].pending["action"], "privilege.elevation")

    def test_no_supabase_is_safe(self):
        log_privilege_change(None, actor_id="a", actor_role="admin", target_user_id="u", target_role="agent")


class BrokenSupabase:
    def table(self, name):
        raise RuntimeError("db down")


class AuditFailureTests(unittest.TestCase):
    def test_db_failure_does_not_raise(self):
        # Audit logging must never break the originating request.
        log_privilege_change(
            BrokenSupabase(),
            actor_id="a",
            actor_role="admin",
            target_user_id="u",
            target_role="agent",
        )


if __name__ == "__main__":
    unittest.main()
