import unittest
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List

from backend.services.gdpr_service import GdprService, DEFAULT_PREFERENCES


class FakeResult:
    def __init__(self, data=None):
        self.data = data or []


import uuid

class FakeTable:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        self.filters = {}
        self.payload = None
        self.limit_count = None
        self.order_by = None
        self.upsert_payload = None
        self.insert_payload = None

    def select(self, *_args):
        return self

    def update(self, payload):
        self.payload = payload
        return self

    def insert(self, payload):
        self.insert_payload = payload
        return self

    def upsert(self, payload):
        self.upsert_payload = payload
        return self

    def delete(self):
        self.payload = "DELETE"
        return self

    def eq(self, field, value):
        self.filters[field] = value
        return self

    def in_(self, field, values):
        self.filters[f"{field}__in"] = values
        return self

    def lt(self, field, value):
        self.filters[f"{field}__lt"] = value
        return self

    def order(self, field, desc=False):
        self.order_by = (field, desc)
        return self

    def execute(self):
        rows = self.db.setdefault(self.name, [])

        if self.insert_payload is not None:
            rows_to_add = self.insert_payload if isinstance(self.insert_payload, list) else [self.insert_payload]
            for row in rows_to_add:
                if "id" not in row and self.name in ["consent_logs", "privacy_requests", "privacy_audit_logs"]:
                    row["id"] = str(uuid.uuid4())
                if "created_at" not in row:
                    row["created_at"] = datetime.now(timezone.utc).isoformat()
            self.db.setdefault(self.name, []).extend(rows_to_add)
            return FakeResult(rows_to_add)

        if self.payload == "DELETE":
            # Filter rows to delete
            kept_rows = []
            deleted_rows = []
            for row in rows:
                match = True
                for key, value in self.filters.items():
                    if row.get(key) != value:
                        match = False
                if match:
                    deleted_rows.append(row)
                else:
                    kept_rows.append(row)
            self.db[self.name] = kept_rows
            return FakeResult(deleted_rows)

        if self.upsert_payload is not None:
            # Upsert
            pk = "user_id" if self.name == "user_privacy_preferences" else "id"
            pk_val = self.upsert_payload.get(pk)
            existing = False
            for row in rows:
                if row.get(pk) == pk_val:
                    row.update(self.upsert_payload)
                    existing = True
                    break
            if not existing:
                rows.append(self.upsert_payload)
            return FakeResult([self.upsert_payload])

        if self.payload is not None:
            # Update
            updated_rows = []
            for row in rows:
                match = True
                for key, value in self.filters.items():
                    if key.endswith("__in"):
                        field = key[:-4]
                        if row.get(field) not in value:
                            match = False
                    elif key.endswith("__lt"):
                        field = key[:-4]
                        if not row.get(field) or row[field] >= value:
                            match = False
                    else:
                        if row.get(key) != value:
                            match = False
                if match:
                    row.update(self.payload)
                    updated_rows.append(row)
            return FakeResult(updated_rows)

        # Select
        matched = []
        for row in rows:
            match = True
            for key, value in self.filters.items():
                if key.endswith("__in"):
                    field = key[:-4]
                    if row.get(field) not in value:
                        match = False
                elif key.endswith("__lt"):
                    field = key[:-4]
                    if not row.get(field) or row[field] >= value:
                        match = False
                else:
                    if row.get(key) != value:
                        match = False
            if match:
                matched.append(row)

        if self.order_by:
            field, desc = self.order_by
            matched.sort(key=lambda r: r.get(field, ""), reverse=desc)

        return FakeResult(matched)


class FakeSupabase:
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return FakeTable(self.tables, name)


class TestGdprService(unittest.TestCase):
    def setUp(self):
        self.db = {
            "profiles": [
                {
                    "id": "user-1",
                    "full_name": "Alice GDPR",
                    "email": "alice@helpdesk.ai",
                    "role": "user",
                    "created_at": "2026-01-01T00:00:00Z"
                }
            ],
            "tickets": [
                {
                    "id": "ticket-1",
                    "user_id": "user-1",
                    "subject": "Email broken",
                    "description": "My inbox is not syncing.",
                    "status": "resolved",
                    "image_url": "https://supabase.co/storage/v1/object/public/ticket-attachments/user-1/screenshot.png",
                    "created_at": "2026-01-01T00:00:00Z"
                }
            ],
            "ticket_messages": [
                {
                    "id": "msg-1",
                    "ticket_id": "ticket-1",
                    "sender_id": "user-1",
                    "sender_name": "Alice GDPR",
                    "sender_role": "user",
                    "message": "Please assist."
                }
            ],
            "user_privacy_preferences": [],
            "consent_logs": [],
            "privacy_requests": [],
            "privacy_audit_logs": []
        }
        self.service = GdprService(FakeSupabase(self.db))

    def test_default_preferences(self):
        prefs = self.service.get_privacy_preferences("user-1")
        self.assertEqual(prefs["marketing_emails"], True)
        self.assertEqual(prefs["experimental_features"], False)

    def test_update_preferences_triggers_consent_log(self):
        new_prefs = {
            "marketing_emails": False,
            "experimental_features": True
        }
        res = self.service.update_privacy_preferences("user-1", new_prefs)
        
        # Check current preferences updated
        self.assertFalse(res["marketing_emails"])
        self.assertTrue(res["experimental_features"])
        
        # Check consent logs contains entries
        logs = self.db["consent_logs"]
        self.assertEqual(len(logs), 2)
        marketing_log = next(l for l in logs if l["consent_type"] == "marketing_emails")
        self.assertTrue(marketing_log["previous_state"])
        self.assertFalse(marketing_log["new_state"])

        # Check compliance audit log
        audit = self.db["privacy_audit_logs"]
        self.assertEqual(len(audit), 1)
        self.assertEqual(audit[0]["action"], "update_consent_preferences")

    def test_submit_privacy_request(self):
        req = self.service.submit_privacy_request("user-1", "export")
        self.assertEqual(req["status"], "Submitted")
        self.assertEqual(req["request_type"], "export")
        self.assertEqual(len(self.db["privacy_requests"]), 1)
        self.assertEqual(self.db["privacy_audit_logs"][0]["action"], "submit_export_request")

    def test_generate_data_export(self):
        export = self.service.generate_user_data_export("user-1")
        self.assertEqual(export["profile"]["full_name"], "Alice GDPR")
        self.assertEqual(len(export["tickets"]), 1)
        self.assertEqual(export["tickets"][0]["id"], "ticket-1")
        self.assertEqual(len(export["messages"]), 1)
        self.assertEqual(export["messages"][0]["id"], "msg-1")

    def test_execute_account_deletion_anonymization(self):
        self.service.execute_account_deletion_anonymization("user-1")
        
        # Profile must be deleted
        self.assertEqual(len(self.db["profiles"]), 0)
        
        # Ticket user_id must be None (anonymized)
        self.assertEqual(self.db["tickets"][0]["user_id"], None)
        self.assertTrue(self.db["tickets"][0]["metadata"]["anonymized"])

        # Message sender name must be "Deleted User" and sender_id None
        self.assertEqual(self.db["ticket_messages"][0]["sender_id"], None)
        self.assertEqual(self.db["ticket_messages"][0]["sender_name"], "Deleted User")

        # Audit logs should track the completed erasure request
        self.assertEqual(self.db["privacy_audit_logs"][0]["action"], "erasure_request_completed")

    def test_cleanup_expired_attachments_lifecycle(self):
        # 100 days old ticket resolved
        self.db["tickets"][0]["created_at"] = (datetime.now(timezone.utc) - timedelta(days=100)).isoformat()
        self.db["tickets"][0]["status"] = "resolved"
        
        count = self.service.cleanup_expired_attachments(days=90)
        self.assertEqual(count, 1)
        # Image url must be wiped (None)
        self.assertIsNone(self.db["tickets"][0]["image_url"])

    def test_archive_old_tickets_lifecycle(self):
        # 400 days old resolved ticket
        self.db["tickets"][0]["created_at"] = (datetime.now(timezone.utc) - timedelta(days=400)).isoformat()
        self.db["tickets"][0]["status"] = "resolved"
        
        count = self.service.archive_old_tickets(years=1)
        self.assertEqual(count, 1)
        self.assertEqual(self.db["tickets"][0]["status"], "archived")

    def test_cleanup_inactive_accounts_lifecycle(self):
        # 3 years old inactive profile
        self.db["profiles"][0]["created_at"] = (datetime.now(timezone.utc) - timedelta(days=3 * 365)).isoformat()
        
        count = self.service.cleanup_inactive_accounts(years=2)
        self.assertEqual(count, 1)
        self.assertEqual(len(self.db["privacy_requests"]), 1)
        self.assertEqual(self.db["privacy_requests"][0]["request_type"], "deletion")


if __name__ == "__main__":
    unittest.main()
