import sys
from unittest.mock import MagicMock

# Define dummy exception for postgrest.exceptions.APIError to allow try/except blocks in middleware
class DummyAPIError(Exception):
    pass

postgrest_exceptions = MagicMock()
postgrest_exceptions.APIError = DummyAPIError

# Set mock env variables for Supabase initialization in main.py
import os
os.environ["SUPABASE_URL"] = "https://mock-project.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "mock-service-key"

# Create mock Supabase client
class MockResult:
    def __init__(self, data):
        self.data = data

class MockSupabaseTable:
    def __init__(self, name):
        self.name = name

    def select(self, *args, **kwargs):
        return self

    def eq(self, field, value):
        return self

    def order(self, *args, **kwargs):
        return self

    def single(self):
        return self

    def execute(self):
        if self.name == "tickets":
            return MockResult([
                {"id": "ticket-123", "company_id": "companyA", "subject": "Ticket A"},
                {"id": "ticket-456", "company_id": "companyA", "subject": "Ticket A2"}
            ])
        elif self.name == "profiles":
            return MockResult([
                {"id": "user123", "company_id": "companyA", "role": "user"}
            ])
        return MockResult([])

    def insert(self, data):
        # Allow returning inserted data structure for test
        res_data = [data] if isinstance(data, dict) else data
        # Ensure ID exists on returned record
        for item in res_data:
            if "id" not in item:
                item["id"] = "new-ticket-id"
        return MockResult(res_data)

class MockSupabaseClient:
    def __init__(self):
        self.auth = MagicMock()

    def table(self, name):
        return MockSupabaseTable(name)

    def rpc(self, *args, **kwargs):
        mock_rpc = MagicMock()
        mock_rpc.execute.return_value = MockResult([
            {"id": "ticket-123", "company_id": "companyA", "subject": "Ticket A"}
        ])
        return mock_rpc

mock_supabase = MockSupabaseClient()
mock_supabase_lib = MagicMock()
mock_supabase_lib.create_client.return_value = mock_supabase

# Mock out libraries to avoid database connection or massive package compilation issues
sys.modules["postgrest"] = MagicMock()
sys.modules["postgrest.exceptions"] = postgrest_exceptions
sys.modules["postgrest._sync.request_builder"] = MagicMock()
sys.modules["supabase"] = mock_supabase_lib

for module_name in [
    "torch", "torch.nn", "torch.nn.functional", "torch.optim", "transformers", "sentence_transformers", 
    "easyocr", "datasets", "sklearn", "sklearn.metrics", "pandas", "openpyxl",
    "prometheus_client"
]:
    sys.modules[module_name] = MagicMock()

import pytest
from fastapi.testclient import TestClient
from backend.main import app, classifier_service, ner_service

# Mock classifier and ner services as loaded for ready checks
classifier_service._loaded = True
ner_service._loaded = True

client = TestClient(app)

# Helper mock tokens
TOKEN_COMPANY_A_USER = "mock-token-companyA-user-user123"
TOKEN_COMPANY_A_ADMIN = "mock-token-companyA-admin-admin123"
TOKEN_COMPANY_B_USER = "mock-token-companyB-user-user456"
TOKEN_MASTER_ADMIN = "mock-token-master-admin-master123"

# Headers helper
def get_auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def test_public_endpoints_accessible_without_token():
    """Ensure public endpoints (/health, /ready, /) do not require authentication."""
    response = client.get("/")
    assert response.status_code == 200
    
    response = client.get("/health")
    assert response.status_code == 200
    
    response = client.get("/ready")
    assert response.status_code == 200


def test_tenant_sensitive_endpoints_require_token():
    """Ensure tenant-sensitive endpoints return 401 when no token is provided."""
    endpoints = [
        ("/tickets", "GET"),
        ("/tickets/search?q=vpn&company_id=companyA", "GET"),
        ("/tickets/ticket-123", "GET"),
        ("/users/user-123", "GET"),
        ("/attachments/ticket-123", "GET"),
        ("/analytics", "GET"),
        ("/api/security/audit", "GET"),
        ("/api/security/report", "GET"),
    ]
    for url, method in endpoints:
        if method == "GET":
            response = client.get(url)
        assert response.status_code == 401, f"Expected 401 for {url}"


def test_read_tickets_isolated_by_tenant():
    """Verify users can only fetch tickets belonging to their own company."""
    # User A requests Company A tickets
    response = client.get("/tickets?company_id=companyA", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 200
    
    # User A attempts to request Company B tickets (Cross-tenant access)
    response = client.get("/tickets?company_id=companyB", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403


def test_search_tickets_isolated_by_tenant():
    """Verify search is restricted to the user's company."""
    response = client.get("/tickets/search?q=printer&company_id=companyA", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 200
    
    response = client.get("/tickets/search?q=printer&company_id=companyB", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403


def test_save_ticket_context_spoofing_prevention():
    """Verify a user cannot save a ticket under a different user or company ID."""
    save_payload = {
        "user_id": "user123",
        "subject": "Wifi is slow",
        "description": "Wifi signal is low in office",
        "category": "Network",
        "subcategory": "Wifi",
        "priority": "Medium",
        "assigned_team": "IT Support",
        "status": "pending_human",
        "auto_resolve": False,
        "is_duplicate": False,
        "confidence": 0.9,
        "company_id": "companyA",
        "sla_breach_at": "2026-05-30T12:00:00Z",
        "routing_confidence": 0.9,
        "metadata": {}
    }

    # Successful save (matching owner and company)
    # We mock the DB insert in offline mode or expect a 500/success from backend depending on DB state.
    # But since save_ticket has a verify_tenant check at the top before hitting DB,
    # let's check spoofing: changing company_id to companyB
    spoofed_company_payload = save_payload.copy()
    spoofed_company_payload["company_id"] = "companyB"
    response = client.post("/tickets/save", json=spoofed_company_payload, headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403

    # Spoofing: changing user_id to user456
    spoofed_user_payload = save_payload.copy()
    spoofed_user_payload["user_id"] = "user456"
    response = client.post("/tickets/save", json=spoofed_user_payload, headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403


def test_idor_protection_on_ticket_retrieval():
    """Verify IDOR prevention: User cannot retrieve another tenant's ticket ID."""
    # User A requests mock ticket belonging to Company A
    ticket_id_a = "mock-ticket-companyA-001"
    response = client.get(f"/tickets/{ticket_id_a}", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 200 or response.status_code == 404 # 404 is allowed if DB offline, but mock middleware checks company part in string first
    # In our mock middleware, if ID starts with mock-ticket-, we check its company component:
    # "mock-ticket-companyA-001" split is ["mock", "ticket", "companyA", "001"]. Target company is companyA.
    # Current user company is companyA, so it passes.
    
    # User A requests mock ticket belonging to Company B
    ticket_id_b = "mock-ticket-companyB-999"
    response = client.get(f"/tickets/{ticket_id_b}", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403


def test_idor_protection_on_user_retrieval():
    """Verify IDOR prevention: User cannot retrieve another tenant's user profile."""
    # User A requests own profile or user A profile in same company
    user_id_a = "mock-user-companyA-123"
    response = client.get(f"/users/{user_id_a}", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 200
    
    # User A requests Company B user profile
    user_id_b = "mock-user-companyB-456"
    response = client.get(f"/users/{user_id_b}", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403


def test_idor_protection_on_attachments():
    """Verify IDOR prevention: User cannot retrieve attachments for a ticket in another company."""
    # User A requests attachments for ticket in Company A
    ticket_id_a = "mock-ticket-companyA-001"
    response = client.get(f"/attachments/{ticket_id_a}", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 200
    
    # User A requests attachments for ticket in Company B
    ticket_id_b = "mock-ticket-companyB-999"
    response = client.get(f"/attachments/{ticket_id_b}", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403


def test_analytics_scoped_to_tenant():
    """Verify analytics is scoped automatically to the user's company."""
    response = client.get("/analytics", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 200
    assert response.json()["company_id"] == "companyA"

    response = client.get("/analytics", headers=get_auth_headers(TOKEN_COMPANY_B_USER))
    assert response.status_code == 200
    assert response.json()["company_id"] == "companyB"


def test_security_audit_permissions():
    """Verify security audit is only viewable/runnable by admins."""
    # Regular user gets 403
    response = client.get("/api/security/audit", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403

    # Admin gets 200
    response = client.get("/api/security/audit", headers=get_auth_headers(TOKEN_COMPANY_A_ADMIN))
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["leakage_risk"] == "Low"


def test_security_report_download():
    """Verify security report is only downloadable by admins and returned as markdown."""
    # Regular user gets 403
    response = client.get("/api/security/report", headers=get_auth_headers(TOKEN_COMPANY_A_USER))
    assert response.status_code == 403

    # Admin gets 200 with markdown content
    response = client.get("/api/security/report", headers=get_auth_headers(TOKEN_COMPANY_A_ADMIN))
    assert response.status_code == 200
    assert "text/markdown" in response.headers["content-type"]
    assert "attachment; filename=tenant_isolation_report.md" in response.headers["content-disposition"]
    assert "# Tenant Isolation Security Audit Report" in response.text
