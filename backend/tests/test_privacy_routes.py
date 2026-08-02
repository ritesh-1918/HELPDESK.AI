import unittest
import json
import io
from unittest.mock import patch, MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.routes.privacy import router, get_gdpr_service
from backend.auth_cookie import get_current_user
from backend.services.gdpr_service import GdprService


class FakeResult:
    def __init__(self, data=None):
        self.data = data or []


class FakeTable:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        self.filters = {}
        self.payload = None
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

    def order(self, field, desc=False):
        return self

    def execute(self):
        rows = self.db.setdefault(self.name, [])
        
        if self.insert_payload is not None:
            rows_to_add = self.insert_payload if isinstance(self.insert_payload, list) else [self.insert_payload]
            for row in rows_to_add:
                if "id" not in row:
                    row["id"] = "req-new"
                if "created_at" not in row:
                    row["created_at"] = "2026-01-01T00:00:00Z"
            rows.extend(rows_to_add)
            return FakeResult(rows_to_add)

        if self.upsert_payload is not None:
            # Simple upsert logic
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

        if self.payload == "DELETE":
            kept_rows = []
            deleted_rows = []
            for row in rows:
                match = True
                for k, v in self.filters.items():
                    if row.get(k) != v:
                        match = False
                if match:
                    deleted_rows.append(row)
                else:
                    kept_rows.append(row)
            self.db[self.name] = kept_rows
            return FakeResult(deleted_rows)

        if self.payload is not None:
            # Update
            updated_rows = []
            for row in rows:
                match = True
                for k, v in self.filters.items():
                    if row.get(k) != v:
                        match = False
                if match:
                    row.update(self.payload)
                    updated_rows.append(row)
            return FakeResult(updated_rows)

        # Select
        matched = []
        for row in rows:
            match = True
            for k, v in self.filters.items():
                if row.get(k) != v:
                    match = False
            if match:
                matched.append(row)
        return FakeResult(matched)


class FakeSupabase:
    def __init__(self, db):
        self.db = db

    def table(self, name):
        return FakeTable(self.db, name)


class TestPrivacyRoutes(unittest.TestCase):
    def setUp(self):
        self.app = FastAPI()
        self.app.include_router(router)
        
        # Test DB state
        self.db = {
            "profiles": [
                {
                    "id": "user-123",
                    "full_name": "Bob Privacy",
                    "email": "bob@helpdesk.ai",
                    "role": "user",
                    "created_at": "2026-01-01T00:00:00Z"
                }
            ],
            "tickets": [
                {
                    "id": "ticket-123",
                    "user_id": "user-123",
                    "subject": "Help",
                    "description": "Please help",
                    "status": "resolved",
                    "image_url": "http://img",
                    "created_at": "2026-01-01T00:00:00Z"
                }
            ],
            "ticket_messages": [],
            "user_privacy_preferences": [
                {
                    "user_id": "user-123",
                    "marketing_emails": True,
                    "product_updates": True,
                    "announcements": True,
                    "usage_analytics": True,
                    "performance_monitoring": True,
                    "behavior_tracking": True,
                    "experimental_features": False,
                    "research_participation": False
                }
            ],
            "consent_logs": [],
            "privacy_requests": [
                {
                    "id": "req-123",
                    "user_id": "user-123",
                    "request_type": "deletion",
                    "status": "Submitted",
                    "created_at": "2026-01-01T00:00:00Z"
                }
            ],
            "privacy_audit_logs": []
        }
        
        self.gdpr_service = GdprService(FakeSupabase(self.db))
        
        # Dependency overrides
        self.app.dependency_overrides[get_current_user] = lambda: {"id": "user-123", "email": "bob@helpdesk.ai"}
        self.app.dependency_overrides[get_gdpr_service] = lambda: self.gdpr_service
        
        self.client = TestClient(self.app)

    def test_get_privacy_preferences(self):
        # Default get preferences
        resp = self.client.get("/api/privacy/preferences")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["marketing_emails"])
        self.assertTrue(data["usage_analytics"])

    def test_get_privacy_preferences_dnt(self):
        # DNT active
        resp = self.client.get("/api/privacy/preferences", headers={"DNT": "1"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["usage_analytics"])
        self.assertFalse(data["behavior_tracking"])

    def test_update_privacy_preferences(self):
        # Update preferences
        new_prefs = {
            "marketing_emails": False,
            "experimental_features": True
        }
        resp = self.client.post("/api/privacy/preferences", json=new_prefs)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["marketing_emails"])
        self.assertTrue(data["experimental_features"])
        self.assertEqual(self.db["user_privacy_preferences"][0]["marketing_emails"], False)

    def test_get_privacy_requests(self):
        resp = self.client.get("/api/privacy/requests")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], "req-123")

    def test_submit_deletion_request(self):
        resp = self.client.post("/api/privacy/delete-request", json={})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "Submitted")
        self.assertEqual(data["request_type"], "deletion")

    def test_cancel_deletion_request(self):
        resp = self.client.post("/api/privacy/cancel-delete")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(self.db["privacy_requests"][0]["status"], "Completed")
        self.assertEqual(self.db["privacy_requests"][0]["admin_notes"], "Cancelled by User")

    def test_admin_approve_cancel_request(self):
        resp = self.client.post("/api/admin/privacy/requests/req-123/approve", json={"admin_notes": "Cancelled by User"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "Completed")
        self.assertEqual(data["admin_notes"], "Cancelled by User")

    def test_export_data_json(self):
        resp = self.client.post("/api/privacy/export", json={"format": "json"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers["content-type"], "application/json")
        data = resp.json()
        self.assertEqual(data["profile"]["email"], "bob@helpdesk.ai")
        self.assertEqual(len(data["tickets"]), 1)

    def test_export_data_csv(self):
        resp = self.client.post("/api/privacy/export", json={"format": "csv"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers["content-type"], "text/csv; charset=utf-8")
        csv_content = resp.content.decode("utf-8")
        self.assertIn("=== USER PROFILE ===", csv_content)
        self.assertIn("bob@helpdesk.ai", csv_content)


if __name__ == "__main__":
    unittest.main()
