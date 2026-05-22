import os
import unittest
import json
import urllib.request
import urllib.error
from supabase import create_client
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env if available
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost:54321")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "test-service-key")
SUPABASE_KEY = SUPABASE_SERVICE_KEY
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:7860")


class TestAuditLogs(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize supabase client with service role bypass for test setup
        cls.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Pre-cleanup in case a previous test crashed
        try:
            cls.supabase.table("profiles").delete().in_("id", ["a0000000-0000-0000-0000-000000000001", "b0000000-0000-0000-0000-000000000002"]).execute()
            cls.supabase.table("companies").delete().in_("name", ["Test Company A", "Test Company B"]).execute()
        except Exception as e:
            print("Pre-cleanup error (can be ignored):", e)
            
        # 1. Create unique test companies
        cls.company_a = cls.supabase.table("companies").insert({"name": "Test Company A"}).execute().data[0]
        cls.company_b = cls.supabase.table("companies").insert({"name": "Test Company B"}).execute().data[0]
        
        cls.company_a_id = cls.company_a["id"]
        cls.company_b_id = cls.company_b["id"]
        
        # 2. Create test profiles
        cls.user_a = cls.supabase.table("profiles").insert({
            "id": "a0000000-0000-0000-0000-000000000001",
            "email": "user_a@companya.com",
            "full_name": "Alice Developer",
            "role": "user",
            "company_id": cls.company_a_id
        }).execute().data[0]
        
        cls.user_b = cls.supabase.table("profiles").insert({
            "id": "b0000000-0000-0000-0000-000000000002",
            "email": "user_b@companyb.com",
            "full_name": "Bob Support",
            "role": "admin",
            "company_id": cls.company_b_id
        }).execute().data[0]

    @classmethod
    def tearDownClass(cls):
        # Cleanup test data using cascade
        try:
            cls.supabase.table("companies").delete().eq("id", cls.company_a_id).execute()
            cls.supabase.table("companies").delete().eq("id", cls.company_b_id).execute()
        except Exception as e:
            print("TearDown error:", e)

    def test_audit_logs_workflow(self):
        # 1. Create a ticket under Company A
        ticket_data = {
            "subject": "System Crash on Login",
            "description": "The login page keeps throwing a 500 error when clicking submit.",
            "company_id": self.company_a_id,
            "user_id": self.user_a["id"],
            "status": "pending",
            "priority": "low"
        }
        ticket = self.supabase.table("tickets").insert(ticket_data).execute().data[0]
        ticket_id = ticket["id"]
        
        # Assert database trigger created 'create' log
        logs = self.supabase.table("audit_logs").select("*").eq("ticket_id", ticket_id).execute().data
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0]["action"], "create")
        self.assertEqual(logs[0]["company_id"], self.company_a_id)

        # 2. Update status (Transition pending -> resolved)
        self.supabase.table("tickets").update({"status": "resolved"}).eq("id", ticket_id).execute()
        
        # Assert database trigger logged 'status_change'
        logs = self.supabase.table("audit_logs").select("*").eq("ticket_id", ticket_id).order("created_at").execute().data
        self.assertEqual(len(logs), 2)
        self.assertEqual(logs[1]["action"], "status_change")
        self.assertEqual(logs[1]["old_value"], "pending")
        self.assertEqual(logs[1]["new_value"], "resolved")

        # 3. Update priority (low -> high)
        self.supabase.table("tickets").update({"priority": "high"}).eq("id", ticket_id).execute()
        
        # Assert database trigger logged 'priority_change'
        logs = self.supabase.table("audit_logs").select("*").eq("ticket_id", ticket_id).order("created_at").execute().data
        self.assertEqual(len(logs), 3)
        self.assertEqual(logs[2]["action"], "priority_change")
        self.assertEqual(logs[2]["old_value"], "low")
        self.assertEqual(logs[2]["new_value"], "high")

        # 4. Assignee change (NULL -> user_a["id"])
        self.supabase.table("tickets").update({"assigned_agent_id": self.user_a["id"]}).eq("id", ticket_id).execute()
        
        # Assert database trigger logged 'assignee_change'
        logs = self.supabase.table("audit_logs").select("*").eq("ticket_id", ticket_id).order("created_at").execute().data
        self.assertEqual(len(logs), 4)
        self.assertEqual(logs[3]["action"], "assignee_change")
        self.assertEqual(logs[3]["old_value"], "Unassigned")
        self.assertEqual(logs[3]["new_value"], "Alice Developer")

        # 5. Fetch logs via backend API endpoint (Strict Company Isolation Checks)
        
        # A. Correct Company ID -> 200 OK and correct audit data
        url_success = f"{BACKEND_URL}/tickets/{ticket_id}/audit_logs?company_id={self.company_a_id}"
        req_success = urllib.request.Request(url_success, method="GET")
        with urllib.request.urlopen(req_success) as response:
            self.assertEqual(response.status, 200)
            api_logs = json.loads(response.read().decode())
            self.assertEqual(len(api_logs), 4)
            # Verify compatibility mapping / properties
            self.assertEqual(api_logs[0]["action"], "create")
            self.assertEqual(api_logs[1]["action_type"], "status_change")
            self.assertEqual(api_logs[2]["action_type"], "priority_change")
            self.assertEqual(api_logs[3]["action_type"], "assignee_change")
            self.assertEqual(api_logs[3]["new_value"], "Alice Developer")
            
        # B. Incorrect Company ID -> 403 Forbidden (tenant isolation check)
        url_forbidden = f"{BACKEND_URL}/tickets/{ticket_id}/audit_logs?company_id={self.company_b_id}"
        req_forbidden = urllib.request.Request(url_forbidden, method="GET")
        try:
            with urllib.request.urlopen(req_forbidden) as response:
                self.fail("Expected HTTP 403 Forbidden for mismatched tenant company_id")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 403)
            error_data = json.loads(e.read().decode())
            self.assertIn("Unauthorized", error_data["detail"])

        # C. Missing Company ID -> 400 Bad Request
        url_bad_request = f"{BACKEND_URL}/tickets/{ticket_id}/audit_logs"
        req_bad_request = urllib.request.Request(url_bad_request, method="GET")
        try:
            with urllib.request.urlopen(req_bad_request) as response:
                self.fail("Expected HTTP 400 Bad Request for missing company_id query parameter")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)
            error_data = json.loads(e.read().decode())
            self.assertIn("company_id query parameter is required", error_data["detail"])

if __name__ == '__main__':
    unittest.main()
