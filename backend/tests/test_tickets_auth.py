"""
Tests for ticket endpoints authentication and tenant isolation.
Covers: GET /tickets, POST /tickets/save, GET /tickets/{ticket_id},
        POST /tickets, PATCH /tickets/{ticket_id},
        GET /tickets/{ticket_id}/audit_logs
"""
import pytest
from unittest.mock import patch, MagicMock

# Mock supabase before importing main
import main
main.supabase = MagicMock()

from main import app, get_current_user
from fastapi.testclient import TestClient

client = TestClient(app)

# Mock user data
MOCK_USER = {
    "id": "test-user-id-123",
    "email": "test@example.com",
    "user_metadata": {
        "company_id": "test-company-id",
        "company": "Test Company",
        "role": "admin"
    }
}

MOCK_TICKET = {
    "id": "ticket-123",
    "ticket_id": "TKT-001",
    "subject": "Test Issue",
    "description": "Test description",
    "company_id": "test-company-id",
    "user_id": "test-user-id-123",
    "owner_id": "test-user-id-123",
    "status": "open",
    "created_at": "2026-06-01T00:00:00Z"
}


class MockChain:
    def __init__(self, table_name, profile_data, ticket_data, audit_logs_data, other_data):
        self.table_name = table_name
        self.profile_data = profile_data
        self.ticket_data = ticket_data
        self.audit_logs_data = audit_logs_data
        self.other_data = other_data
        self.is_single = False
        
        self.insert = MagicMock(return_value=self)
        self.update = MagicMock(return_value=self)
        self.select = MagicMock(return_value=self)
        self.eq = MagicMock(return_value=self)
        self.order = MagicMock(return_value=self)
        self.limit = MagicMock(return_value=self)
        self.offset = MagicMock(return_value=self)
        self.single = MagicMock(side_effect=self._single_side_effect)
        
    def _single_side_effect(self, *args, **kwargs):
        self.is_single = True
        return self
        
    def execute(self, *args, **kwargs):
        mock_res = MagicMock()
        if self.table_name == "profiles":
            data = self.profile_data
        elif self.table_name == "tickets":
            data = self.ticket_data
            if self.is_single and isinstance(data, list):
                data = data[0] if data else {}
            elif not self.is_single and isinstance(data, dict):
                data = [data]
        elif self.table_name == "audit_logs":
            data = self.audit_logs_data
        else:
            data = self.other_data
        mock_res.data = data
        return mock_res


def make_mock_supabase(profile_data=None, ticket_data=None, audit_logs_data=None, other_data=None):
    mock_client = MagicMock()
    chains = {}
    
    def table_side_effect(table_name):
        chain = MockChain(table_name, profile_data, ticket_data, audit_logs_data, other_data)
        chains[table_name] = chain
        return chain
        
    mock_client.table.side_effect = table_side_effect
    mock_client.chains = chains
    return mock_client


def mock_get_current_user():
    return MOCK_USER


@pytest.fixture(autouse=True)
def setup_dependency_override():
    """Override FastAPI dependency for all tests."""
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture(autouse=True)
def setup_global_supabase_mock():
    """Globally mock main.supabase for every test to avoid missing env/connection issues."""
    original_supabase = main.supabase
    main.supabase = make_mock_supabase(
        profile_data={"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"},
        ticket_data=MOCK_TICKET
    )
    yield main.supabase
    main.supabase = original_supabase


class TestGetTickets:
    """Tests for GET /tickets endpoint."""

    def test_get_tickets_requires_auth(self):
        """Test that /tickets requires authentication."""
        app.dependency_overrides.pop(get_current_user, None)
        response = client.get("/tickets")
        assert response.status_code == 401

    @patch("main.supabase")
    def test_get_tickets_with_auth(self, mock_supabase):
        """Test that /tickets returns tickets for authenticated user."""
        mock_client = make_mock_supabase(
            profile_data={"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"},
            ticket_data=[MOCK_TICKET]
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        response = client.get("/tickets", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == "ticket-123"


class TestSaveTicket:
    """Tests for POST /tickets/save endpoint."""

    def test_save_ticket_requires_auth(self):
        """Test that /tickets/save requires authentication."""
        app.dependency_overrides.pop(get_current_user, None)
        response = client.post("/tickets/save", json={
            "user_id": "test-user-id-123",
            "subject": "Test",
            "description": "Test",
            "category": "general",
            "subcategory": "other",
            "priority": "low",
            "assigned_team": "support",
            "status": "open",
            "auto_resolve": False,
            "is_duplicate": False,
            "confidence": 0.9,
            "sla_breach_at": "2026-06-02T00:00:00Z",
            "metadata": {},
            "routing_confidence": 0.8
        })
        assert response.status_code == 401

    @patch("main.supabase")
    def test_save_ticket_uses_auth_user_id(self, mock_supabase):
        """Test that /tickets/save rejects mismatched user_id with 403."""
        mock_client = make_mock_supabase(
            profile_data={"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"},
            ticket_data=MOCK_TICKET
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        # Try to spoof user_id in body
        response = client.post("/tickets/save", json={
            "user_id": "spoofed-user-id",  # Mismatched user_id
            "subject": "Test",
            "description": "Test",
            "category": "general",
            "subcategory": "other",
            "priority": "low",
            "assigned_team": "support",
            "status": "open",
            "auto_resolve": False,
            "is_duplicate": False,
            "confidence": 0.9,
            "sla_breach_at": "2026-06-02T00:00:00Z",
            "metadata": {},
            "routing_confidence": 0.8
        }, headers={"Authorization": "Bearer test-token"})

        # Should be rejected with 403 Forbidden
        assert response.status_code == 403


class TestGetTicketById:
    """Tests for GET /tickets/{ticket_id} endpoint."""

    def test_get_ticket_by_id_requires_auth(self):
        """Test that /tickets/{ticket_id} requires authentication."""
        app.dependency_overrides.pop(get_current_user, None)
        response = client.get("/tickets/ticket-123")
        assert response.status_code == 401

    @patch("main.supabase")
    def test_get_ticket_by_id_tenant_isolation(self, mock_supabase):
        """Test that /tickets/{ticket_id} enforces tenant isolation."""
        # Mock user profile from test-company-id, but ticket belongs to other-company-id
        mock_client = make_mock_supabase(
            profile_data={"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"},
            ticket_data={**MOCK_TICKET, "company_id": "other-company-id"}
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        response = client.get("/tickets/ticket-123", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 403
        assert "not authorized for this tenant" in response.json()["detail"].lower()

    @patch("main.supabase")
    def test_get_ticket_by_id_same_company(self, mock_supabase):
        """Test that /tickets/{ticket_id} allows access to same company tickets."""
        mock_client = make_mock_supabase(
            profile_data={"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"},
            ticket_data=MOCK_TICKET
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        response = client.get("/tickets/ticket-123", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 200
        assert response.json()["id"] == "ticket-123"


class TestCreateTicketAuth:
    """Tests for POST /tickets endpoint authentication."""

    def test_create_ticket_requires_auth(self):
        """Test that POST /tickets requires authentication."""
        app.dependency_overrides.pop(get_current_user, None)
        response = client.post("/tickets", json={
            "user_id": "test-user-id-123",
            "subject": "Test",
            "description": "Test",
            "category": "general",
            "subcategory": "other",
            "priority": "low",
            "assigned_team": "support",
            "status": "open",
            "company_id": "test-company-id"
        })
        assert response.status_code == 401

    def test_create_ticket_with_auth(self):
        """Test that POST /tickets works with authentication and binds owner_id."""
        response = client.post("/tickets", json={
            "user_id": "test-user-id-123",
            "subject": "Test",
            "description": "Test",
            "category": "general",
            "subcategory": "other",
            "priority": "low",
            "assigned_team": "support",
            "status": "open",
            "company_id": "test-company-id"
        }, headers={"Authorization": "Bearer test-token"})
        assert response.status_code in (200, 201)
        # Verify user_id was bound to authenticated user
        data = response.json()
        assert data.get("user_id") == "test-user-id-123", \
            f"Expected user_id to be authenticated user, got {data.get('user_id')}"


class TestUpdateTicketAuth:
    """Tests for PATCH /tickets/{ticket_id} endpoint authentication."""

    def test_update_ticket_requires_auth(self):
        """Test that PATCH /tickets/{ticket_id} requires authentication."""
        app.dependency_overrides.pop(get_current_user, None)
        response = client.patch("/tickets/ticket-123", json={"status": "closed"})
        assert response.status_code == 401

    @patch("main.supabase")
    def test_update_ticket_with_auth(self, mock_supabase):
        """Test that PATCH /tickets/{ticket_id} works with authentication."""
        mock_client = make_mock_supabase(
            profile_data={"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"},
            ticket_data=MOCK_TICKET
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        # First create a ticket we own
        create_response = client.post("/tickets", json={
            "user_id": "test-user-id-123",
            "subject": "Test Update",
            "description": "Test",
            "category": "general",
            "subcategory": "other",
            "priority": "low",
            "assigned_team": "support",
            "status": "open",
            "company_id": "test-company-id"
        }, headers={"Authorization": "Bearer test-token"})
        assert create_response.status_code in (200, 201)

        # Now update it
        response = client.patch("/tickets/ticket-123", json={"status": "closed"},
                                headers={"Authorization": "Bearer test-token"})
        assert response.status_code in (200, 204)

    @patch("main.supabase")
    def test_update_ticket_rejects_non_owner(self, mock_supabase):
        """PATCH must reject authenticated users who do not own the ticket."""
        profile = {
            "id": "test-user-id-123",
            "company_id": "test-company-id",
            "company": "Test Company",
            "role": "user",
        }
        ticket = {
            "id": "ticket-123",
            "user_id": "other-user-id",
            "company_id": "test-company-id",
        }

        profile_query = MagicMock()
        profile_query.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=profile)
        ticket_query = MagicMock()
        ticket_query.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=ticket)

        mock_supabase.table.side_effect = [ticket_query, profile_query]

        response = client.patch(
            "/tickets/ticket-123",
            json={"status": "closed"},
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"]
        ticket_query.update.assert_not_called()

    @patch("main.supabase")
    def test_update_ticket_allows_only_whitelisted_fields(self, mock_supabase):
        """PATCH should ignore ownership/routing fields and update only allowed fields."""
        profile = {
            "id": "test-user-id-123",
            "company_id": "test-company-id",
            "company": "Test Company",
            "role": "user",
        }
        ticket = {
            "id": "ticket-123",
            "user_id": "test-user-id-123",
            "company_id": "test-company-id",
        }
        updated = {**ticket, "status": "closed"}

        profile_query = MagicMock()
        profile_query.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=profile)

        ticket_query = MagicMock()
        ticket_query.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=ticket)
        ticket_query.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[updated])

        mock_supabase.table.side_effect = [ticket_query, profile_query, ticket_query]

        response = client.patch(
            "/tickets/ticket-123",
            json={
                "status": "closed",
                "owner_id": "attacker-user-id",
                "assigned_team": "Security",
                "ticket_id": "rewritten",
            },
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 200
        ticket_query.update.assert_called_once_with({"status": "closed"})


class TestGetTicketAuditLogsAuth:
    """Tests for GET /tickets/{ticket_id}/audit_logs endpoint authentication and authorization."""

    def test_get_audit_logs_requires_auth(self):
        """Test that GET /tickets/{ticket_id}/audit_logs requires authentication."""
        app.dependency_overrides.pop(get_current_user, None)
        response = client.get("/tickets/ticket-123/audit_logs?company_id=test-company-id")
        assert response.status_code == 401

    @patch("main.supabase")
    def test_get_audit_logs_tenant_isolation(self, mock_supabase):
        """Test that /tickets/{ticket_id}/audit_logs enforces tenant isolation."""
        user_profile = {"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"}
        other_ticket = {"id": "ticket-123", "user_id": "other-user-id", "company_id": "other-company-id"}
        
        mock_client = make_mock_supabase(
            profile_data=user_profile,
            ticket_data=other_ticket
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        response = client.get("/tickets/ticket-123/audit_logs?company_id=other-company-id", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 403

    @patch("main.supabase")
    def test_get_audit_logs_standard_user_not_owner(self, mock_supabase):
        """Test that a standard user cannot view audit logs of a ticket they do not own."""
        user_profile = {"id": "test-user-id-123", "company_id": "test-company-id", "role": "user"}
        other_ticket = {"id": "ticket-123", "user_id": "other-user-id", "company_id": "test-company-id"}

        mock_client = make_mock_supabase(
            profile_data=user_profile,
            ticket_data=other_ticket
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        response = client.get("/tickets/ticket-123/audit_logs?company_id=test-company-id", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 403

    @patch("main.supabase")
    def test_get_audit_logs_standard_user_owner(self, mock_supabase):
        """Test that a standard user can view audit logs of a ticket they own."""
        user_profile = {"id": "test-user-id-123", "company_id": "test-company-id", "role": "user"}
        own_ticket = {"id": "ticket-123", "user_id": "test-user-id-123", "company_id": "test-company-id"}
        audit_logs = [{
            "id": "log-1",
            "ticket_id": "ticket-123",
            "company_id": "test-company-id",
            "action": "created",
            "created_at": "2026-06-01T00:00:00Z"
        }]

        mock_client = make_mock_supabase(
            profile_data=user_profile,
            ticket_data=own_ticket,
            audit_logs_data=audit_logs
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        response = client.get("/tickets/ticket-123/audit_logs?company_id=test-company-id", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 200
        assert len(response.json()) == 1

    @patch("main.supabase")
    def test_get_audit_logs_admin_user_not_owner(self, mock_supabase):
        """Test that an admin user can view audit logs of a ticket in their company they do not own."""
        user_profile = {"id": "test-user-id-123", "company_id": "test-company-id", "role": "admin"}
        company_ticket = {"id": "ticket-123", "user_id": "other-user-id", "company_id": "test-company-id"}
        audit_logs = [{
            "id": "log-1",
            "ticket_id": "ticket-123",
            "company_id": "test-company-id",
            "action": "created",
            "created_at": "2026-06-01T00:00:00Z"
        }]

        mock_client = make_mock_supabase(
            profile_data=user_profile,
            ticket_data=company_ticket,
            audit_logs_data=audit_logs
        )
        mock_supabase.table.side_effect = mock_client.table.side_effect

        response = client.get("/tickets/ticket-123/audit_logs?company_id=test-company-id", headers={"Authorization": "Bearer test-token"})
        assert response.status_code == 200
        assert len(response.json()) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
