import pytest
from unittest.mock import patch, MagicMock
from backend.auth_cookie import get_current_user


def authenticate_as(test_client, user_id):
    test_client.app.dependency_overrides[get_current_user] = lambda: {"id": user_id}


def clear_authentication(test_client):
    test_client.app.dependency_overrides.pop(get_current_user, None)

def test_route_registration(test_client):
    """
    Test 1: FastAPI route registration and overrides.
    Ensures that active endpoints (like /ai/analyze_ticket, /tickets/save)
    and backward compatibility overrides (like /ai/analyze_ticket/legacy) compile and register cleanly.
    """
    response = test_client.get("/")
    assert response.status_code == 200
    
    # Verify all expected route paths exist in application
    paths = [r.path for r in test_client.app.routes]
    assert "/ai/analyze_ticket" in paths
    assert "/ai/analyze_ticket/legacy" in paths
    assert "/tickets" in paths
    assert "/tickets/save" in paths
    assert "/tickets/search" in paths


def test_multi_tenant_isolation_mismatch(test_client, fake_db):
    """
    Test 2: Multi-tenant Isolation (Violation).
    Verifies that a user profile assigned to company_id_A cannot access or save tickets for company_id_B,
    raising an HTTP 403 Forbidden.
    """
    payload = {
        "user_id": "user_A",  # belongs to company_A in fake profiles
        "subject": "Intrusion Attempt",
        "description": "Testing tenant bypass restriction",
        "category": "Network",
        "subcategory": "VPN Connection",
        "priority": "critical",
        "assigned_team": "Network Support",
        "status": "open",
        "auto_resolve": False,
        "is_duplicate": False,
        "confidence": 0.99,
        "company_id": "company_B",  # Mismatch: User belongs to company_A
        "company": "Company B",
        "sla_breach_at": "2026-05-23T20:00:00Z",
        "metadata": {},
        "routing_confidence": 0.99
    }
    
    response = test_client.post("/tickets/save", json=payload)
    assert response.status_code == 403
    assert "User not authorized for this tenant" in response.json()["detail"]


def test_multi_tenant_isolation_success(test_client, fake_db):
    """
    Test 3: Multi-tenant Isolation (Success).
    Verifies that a request with consistent tenant mappings resolves and inserts cleanly.
    """
    payload = {
        "user_id": "user_A",
        "subject": "Valid Ticket",
        "description": "Everything matches company A",
        "category": "Software",
        "subcategory": "Software Install",
        "priority": "medium",
        "assigned_team": "Application Support",
        "status": "open",
        "auto_resolve": False,
        "is_duplicate": False,
        "confidence": 0.90,
        "company_id": "company_A",
        "company": "Company A",
        "sla_breach_at": "2026-05-23T20:00:00Z",
        "metadata": {},
        "routing_confidence": 0.90
    }
    
    response = test_client.post("/tickets/save", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
    # Assert DB state
    assert len(fake_db["tickets"]) == 1
    assert fake_db["tickets"][0]["company_id"] == "company_A"


def test_multi_tenant_data_isolation_on_read(test_client, fake_db):
    """
    Test 4: Multi-tenant separation on read.
    Verifies that retrieving /tickets with a company_id parameter returns ONLY that tenant's records.
    """
    # Populate mock DB
    fake_db["tickets"] = [
        {"id": 1, "company_id": "company_A", "subject": "Ticket A", "created_at": "2026-05-23T10:00:00Z"},
        {"id": 2, "company_id": "company_B", "subject": "Ticket B", "created_at": "2026-05-23T11:00:00Z"},
    ]
    authenticate_as(test_client, "user_A")
    
    # Query for company A
    res_a = test_client.get("/tickets?company_id=company_A")
    assert res_a.status_code == 200
    tickets_a = res_a.json()
    assert len(tickets_a) == 1
    assert tickets_a[0]["company_id"] == "company_A"
    
    # Query for company B as company A user
    res_b = test_client.get("/tickets?company_id=company_B")
    assert res_b.status_code == 403
    clear_authentication(test_client)


def test_ticket_reads_require_authentication(test_client, fake_db):
    fake_db["tickets"] = [
        {"id": 1, "company_id": "company_A", "subject": "Ticket A", "created_at": "2026-05-23T10:00:00Z"},
    ]

    assert test_client.get("/tickets").status_code == 401
    assert test_client.get("/tickets/search?q=Ticket").status_code == 401
    assert test_client.get("/tickets/1").status_code == 401


def test_ticket_reads_scope_to_authenticated_tenant(test_client, fake_db):
    fake_db["tickets"] = [
        {"id": 1, "company_id": "company_A", "subject": "VPN issue", "description": "A", "created_at": "2026-05-23T10:00:00Z"},
        {"id": 2, "company_id": "company_B", "subject": "VPN issue", "description": "B", "created_at": "2026-05-23T11:00:00Z"},
    ]
    authenticate_as(test_client, "user_A")

    all_tickets = test_client.get("/tickets")
    assert all_tickets.status_code == 200
    assert [ticket["company_id"] for ticket in all_tickets.json()] == ["company_A"]

    search_results = test_client.get("/tickets/search?q=VPN")
    assert search_results.status_code == 200
    assert [ticket["company_id"] for ticket in search_results.json()] == ["company_A"]

    own_ticket = test_client.get("/tickets/1")
    assert own_ticket.status_code == 200
    assert own_ticket.json()["company_id"] == "company_A"

    other_ticket = test_client.get("/tickets/2")
    assert other_ticket.status_code == 403
    clear_authentication(test_client)


def test_analyze_ticket_mock_model_prediction(test_client):
    """
    Test 5: /ai/analyze_ticket endpoint cascade with mocked Hugging Face models.
    """
    payload = {
        "text": "I can't connect to VPN, keep getting error timeout",
        "company_id": "company_A"
    }
    
    response = test_client.post("/ai/analyze_ticket", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Verify predictions are extracted from mocked HuggingFace models
    assert data["category"] == "Software"
    assert data["subcategory"] == "Software Install"
    assert data["priority"] == "Medium"
    assert data["assigned_team"] == "Application Support"
    assert data["confidence"] == 0.95
    assert len(data["entities"]) == 1
    assert data["entities"][0]["text"] == "VPN"
    assert data["entities"][0]["label"] == "PRODUCT"


def test_ticket_save_sla_breach_calculation(test_client, fake_db):
    """
    Test 6: Ticket save payload verification and SLA deadline auto-computation.
    Verifies that a ticket saved without pre-calculated SLA deadlines automatically generates them based on priority.
    """
    payload = {
        "user_id": "user_B",
        "subject": "Missing SLA timestamps",
        "description": "Printer is on fire, please send help",
        "category": "Hardware",
        "subcategory": "Printer Error",
        "priority": "critical",
        "assigned_team": "Hardware Support",
        "status": "open",
        "auto_resolve": False,
        "is_duplicate": False,
        "confidence": 0.95,
        "company_id": "company_B",
        "company": "Company B",
        "sla_breach_at": "",  # Empty string: triggers backend automatic SLA calculation
        "metadata": {},
        "routing_confidence": 0.95
    }
    
    response = test_client.post("/tickets/save", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
    # Assert DB state - verifies that sla_breach_at is backfilled
    saved_ticket = fake_db["tickets"][-1]
    assert saved_ticket["sla_breach_at"] != ""
    assert saved_ticket["sla_response_due_at"] is not None
    assert "Z" in saved_ticket["sla_breach_at"] or "+00:00" in saved_ticket["sla_breach_at"]
