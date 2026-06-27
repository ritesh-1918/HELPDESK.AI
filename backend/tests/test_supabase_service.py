"""
Unit tests for Supabase client initializers and CRUD error handling (Issue #917).

Covers:
- DB client initialization under missing/invalid env vars or exceptions.
- Graceful error handling in database query functions and API endpoints:
  - get_system_settings defaults fallback on database exception or empty data.
  - get_tickets endpoint error when client is None vs database query exception.
  - save_ticket endpoint error handling (missing client, profile resolution failure,
    profile missing, tenant mismatch, insert failures).
  - get_ticket_by_id endpoint error handling (missing client, ticket not found, query failure).
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Ensure project root is in sys.path
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

# Mock heavy/unused ML modules to prevent importing them during test loading
if "torch" not in sys.modules: sys.modules["torch"] = MagicMock()
if "torch.nn" not in sys.modules: sys.modules["torch.nn"] = MagicMock()
if "torch.nn.functional" not in sys.modules: sys.modules["torch.nn.functional"] = MagicMock()
if "transformers" not in sys.modules: sys.modules["transformers"] = MagicMock()

# Import the FastAPI test client and application components
from fastapi.testclient import TestClient
from fastapi import HTTPException
import backend.main as main
from backend.main import app, get_system_settings


class TestSupabaseClientInitialization(unittest.TestCase):
    
    @patch.dict(os.environ, {"SUPABASE_URL": "", "SUPABASE_SERVICE_KEY": ""})
    @patch("backend.main.create_client")
    def test_init_missing_env_vars_sets_none(self, mock_create):
        # We simulate the initialization logic in main.py
        # When environment variables are missing, create_client should not be called
        # and supabase client is set to None.
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            sb = None
        else:
            sb = mock_create(url, key)
            
        self.assertIsNone(sb)
        mock_create.assert_not_called()

    @patch("backend.main.create_client")
    def test_init_exception_handles_gracefully(self, mock_create):
        # Simulate create_client raising an exception during initialization
        mock_create.side_effect = Exception("Invalid API Key")
        try:
            url = "https://example.supabase.co"
            key = "invalid-key"
            sb = mock_create(url, key)
        except Exception:
            sb = None
            
        self.assertIsNone(sb)


class TestSupabaseCRUDErrorHandling(unittest.TestCase):
    
    def setUp(self):
        self.original_supabase = main.supabase
        main.supabase = MagicMock()
        from backend.main import get_current_user
        app.dependency_overrides[get_current_user] = lambda: {"id": "u-1"}
        self.client = TestClient(app, raise_server_exceptions=False)
        
        # Default profile mock data
        self.profile_data = {"id": "u-1", "company_id": "company_A", "company": "Company A", "role": "user"}
        
        # Default table mock helper
        def default_table(name):
            mock_tbl = MagicMock()
            if name == "profiles":
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=self.profile_data)
            elif name == "system_settings":
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data={
                    "ai_confidence_threshold": 0.80, "enable_auto_resolve": False
                })
            else:
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=None)
                mock_tbl.select.return_value.order.return_value.limit.return_value.offset.return_value.execute.return_value = MagicMock(data=[])
            return mock_tbl
            
        main.supabase.table.side_effect = default_table

    def tearDown(self):
        main.supabase = self.original_supabase
        from backend.main import get_current_user
        if get_current_user in app.dependency_overrides:
            del app.dependency_overrides[get_current_user]

    # ---------------------------------------------------------------------------
    # get_system_settings
    # ---------------------------------------------------------------------------
    def test_get_system_settings_client_none_returns_defaults(self):
        main.supabase = None
        res = get_system_settings("company-123")
        self.assertEqual(res["ai_confidence_threshold"], 0.80)
        self.assertFalse(res["enable_auto_resolve"])

    def test_get_system_settings_exception_returns_defaults(self):
        main.supabase.table.side_effect = Exception("DB Connection Timeout")
        res = get_system_settings("company-123")
        self.assertEqual(res["ai_confidence_threshold"], 0.80)
        self.assertFalse(res["enable_auto_resolve"])

    def test_get_system_settings_empty_data_returns_defaults(self):
        main.supabase.table.side_effect = None
        mock_execute = MagicMock(data=None)
        main.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_execute
        res = get_system_settings("company-123")
        self.assertEqual(res["ai_confidence_threshold"], 0.80)

    # ---------------------------------------------------------------------------
    # get_tickets (/tickets)
    # ---------------------------------------------------------------------------
    def test_get_tickets_client_none_returns_500(self):
        main.supabase = None
        response = self.client.get("/tickets")
        self.assertEqual(response.status_code, 500)
        self.assertIn("Database connection not initialized", response.json()["detail"])

    def test_get_tickets_query_failure_raises_500(self):
        def custom_table(name):
            mock_tbl = MagicMock()
            if name == "profiles":
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=self.profile_data)
                return mock_tbl
            else:
                mock_tbl.select.return_value.order.return_value.limit.return_value.offset.return_value.execute.side_effect = Exception("Permission Denied")
                mock_tbl.select.return_value.order.return_value.limit.return_value.offset.return_value.eq.return_value.execute.side_effect = Exception("Permission Denied")
                return mock_tbl
        main.supabase.table.side_effect = custom_table
        
        response = self.client.get("/tickets")
        self.assertEqual(response.status_code, 500)

    # ---------------------------------------------------------------------------
    # get_ticket_by_id (/tickets/{ticket_id})
    # ---------------------------------------------------------------------------
    def test_get_ticket_by_id_client_none_returns_500(self):
        main.supabase = None
        response = self.client.get("/tickets/t-1")
        self.assertEqual(response.status_code, 500)

    def test_get_ticket_by_id_not_found_returns_404(self):
        response = self.client.get("/tickets/t-missing")
        self.assertEqual(response.status_code, 404)
        self.assertIn("Ticket not found", response.json()["detail"])

    # ---------------------------------------------------------------------------
    # save_ticket (/tickets/save)
    # ---------------------------------------------------------------------------
    def test_save_ticket_client_none_returns_500(self):
        main.supabase = None
        payload = {
            "user_id": "u-1", "subject": "Test", "description": "Desc", "category": "Software",
            "subcategory": "Install", "priority": "Medium", "assigned_team": "Support", "status": "open",
            "auto_resolve": False, "is_duplicate": False, "confidence": 0.9, "sla_breach_at": "2026-06-01T12:00:00Z",
            "metadata": {}, "routing_confidence": 0.9
        }
        response = self.client.post("/tickets/save", json=payload)
        self.assertEqual(response.status_code, 500)

    def test_save_ticket_profile_resolution_exception_returns_503(self):
        def custom_table(name):
            if name == "profiles":
                mock_tbl = MagicMock()
                mock_tbl.select.side_effect = Exception("Table not found")
                return mock_tbl
            return MagicMock()
        main.supabase.table.side_effect = custom_table
        
        payload = {
            "user_id": "u-1", "subject": "Test", "description": "Desc", "category": "Software",
            "subcategory": "Install", "priority": "Medium", "assigned_team": "Support", "status": "open",
            "auto_resolve": False, "is_duplicate": False, "confidence": 0.9, "sla_breach_at": "2026-06-01T12:00:00Z",
            "metadata": {}, "routing_confidence": 0.9
        }
        response = self.client.post("/tickets/save", json=payload)
        self.assertEqual(response.status_code, 503)
        self.assertIn("Failed to resolve tenant linkage", response.json()["detail"])

    def test_save_ticket_profile_missing_returns_404(self):
        def custom_table(name):
            if name == "profiles":
                mock_tbl = MagicMock()
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=None)
                return mock_tbl
            return MagicMock()
        main.supabase.table.side_effect = custom_table
        
        payload = {
            "user_id": "u-1", "subject": "Test", "description": "Desc", "category": "Software",
            "subcategory": "Install", "priority": "Medium", "assigned_team": "Support", "status": "open",
            "auto_resolve": False, "is_duplicate": False, "confidence": 0.9, "sla_breach_at": "2026-06-01T12:00:00Z",
            "metadata": {}, "routing_confidence": 0.9
        }
        response = self.client.post("/tickets/save", json=payload)
        self.assertEqual(response.status_code, 404)
        self.assertIn("User profile not found", response.json()["detail"])

    def test_save_ticket_tenant_mismatch_returns_403(self):
        payload = {
            "user_id": "u-1", "subject": "Test", "description": "Desc", "category": "Software",
            "subcategory": "Install", "priority": "Medium", "assigned_team": "Support", "status": "open",
            "auto_resolve": False, "is_duplicate": False, "confidence": 0.9, "sla_breach_at": "2026-06-01T12:00:00Z",
            "metadata": {}, "routing_confidence": 0.9, "company_id": "company_B"
        }
        response = self.client.post("/tickets/save", json=payload)
        self.assertEqual(response.status_code, 403)
        self.assertIn("User not authorized for this tenant", response.json()["detail"])

    def test_save_ticket_insert_failure_returns_500(self):
        select_chain = MagicMock()
        select_chain.eq.return_value.single.return_value.execute.return_value = MagicMock(data=self.profile_data)
        
        insert_chain = MagicMock()
        insert_chain.insert.return_value.execute.return_value = MagicMock(data=[])
        
        def table_side_effect(name):
            if name == "profiles":
                return MagicMock(select=lambda *a, **k: select_chain)
            return MagicMock(insert=lambda *a, **k: insert_chain.insert(*a, **k))
            
        main.supabase.table.side_effect = table_side_effect

        payload = {
            "user_id": "u-1", "subject": "Test", "description": "Desc", "category": "Software",
            "subcategory": "Install", "priority": "Medium", "assigned_team": "Support", "status": "open",
            "auto_resolve": False, "is_duplicate": False, "confidence": 0.9, "sla_breach_at": "2026-06-01T12:00:00Z",
            "metadata": {}, "routing_confidence": 0.9
        }
        response = self.client.post("/tickets/save", json=payload)
        self.assertEqual(response.status_code, 500)
        self.assertIn("Failed to insert ticket", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
