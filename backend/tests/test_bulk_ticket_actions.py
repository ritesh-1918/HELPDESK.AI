from backend.auth_cookie import get_current_user


def authenticate_as(test_client, user_id):
    test_client.app.dependency_overrides[get_current_user] = lambda: {"id": user_id}


def clear_authentication(test_client):
    test_client.app.dependency_overrides.pop(get_current_user, None)


def test_bulk_status_updates_are_company_scoped(test_client, fake_db):
    fake_db["tickets"] = [
        {
            "id": "ticket-1",
            "company_id": "company_A",
            "status": "open",
            "priority": "low",
            "assigned_team": "General Support",
            "assigned_agent_id": None,
            "resolved_at": None,
        },
        {
            "id": "ticket-2",
            "company_id": "company_A",
            "status": "in progress",
            "priority": "medium",
            "assigned_team": "General Support",
            "assigned_agent_id": None,
            "resolved_at": None,
        },
        {
            "id": "ticket-3",
            "company_id": "company_B",
            "status": "open",
            "priority": "high",
            "assigned_team": "Security Unit",
            "assigned_agent_id": None,
            "resolved_at": None,
        },
    ]

    authenticate_as(test_client, "user_A")
    try:
        response = test_client.post(
            "/tickets/bulk-action",
            json={
                "ticket_ids": ["ticket-1", "ticket-2"],
                "action": "status",
                "value": "resolved",
                "company_id": "company_A",
            },
        )
    finally:
        clear_authentication(test_client)

    assert response.status_code == 200
    payload = response.json()
    assert payload["action"] == "status"
    assert payload["updated_count"] == 2
    assert payload["updated_ticket_ids"] == ["ticket-1", "ticket-2"]
    assert fake_db["tickets"][0]["status"] == "resolved"
    assert fake_db["tickets"][0]["resolved_at"] is not None
    assert fake_db["tickets"][1]["status"] == "resolved"
    assert fake_db["tickets"][1]["resolved_at"] is not None
    assert fake_db["tickets"][2]["status"] == "open"
    assert fake_db["tickets"][2]["resolved_at"] is None


def test_bulk_assignment_forces_in_progress(test_client, fake_db):
    fake_db["tickets"] = [
        {
            "id": "ticket-11",
            "company_id": "company_A",
            "status": "open",
            "priority": "low",
            "assigned_team": "General Support",
            "assigned_agent_id": None,
            "resolved_at": None,
        }
    ]

    authenticate_as(test_client, "user_A")
    try:
        response = test_client.post(
            "/tickets/bulk-action",
            json={
                "ticket_ids": ["ticket-11"],
                "action": "assigned_agent_id",
                "value": "agent-9",
                "company_id": "company_A",
            },
        )
    finally:
        clear_authentication(test_client)

    assert response.status_code == 200
    payload = response.json()
    assert payload["action"] == "assigned_agent_id"
    assert payload["updated_count"] == 1
    assert fake_db["tickets"][0]["assigned_agent_id"] == "agent-9"
    assert fake_db["tickets"][0]["status"] == "in progress"
