from backend.auth_cookie import get_current_user


def authenticate_as(test_client, user_id):
    test_client.app.dependency_overrides[get_current_user] = lambda: {"id": user_id}


def clear_authentication(test_client):
    test_client.app.dependency_overrides.pop(get_current_user, None)


def test_regular_users_cannot_access_privileged_endpoints(test_client, fake_db):
    fake_db["profiles"][0]["role"] = "user"
    authenticate_as(test_client, "user_A")

    assert test_client.get("/system/settings").status_code == 403
    assert test_client.patch("/system/settings", json={"admin_alerts": False}).status_code == 403
    assert test_client.get("/sla/stats").status_code == 403
    assert test_client.get("/sla/policies").status_code == 403
    assert test_client.post("/sla/check").status_code == 403
    assert test_client.post("/ai/reindex_embeddings").status_code == 403

    clear_authentication(test_client)


def test_tenant_admin_endpoints_are_scoped_to_their_company(test_client, fake_db):
    fake_db["profiles"][0]["role"] = "admin"
    fake_db["system_settings"] = [
        {
            "company_id": "company_A",
            "ai_confidence_threshold": 0.8,
            "duplicate_sensitivity": 0.85,
            "enable_auto_resolve": True,
            "admin_alerts": True,
        },
        {
            "company_id": "company_B",
            "ai_confidence_threshold": 0.4,
            "duplicate_sensitivity": 0.5,
            "enable_auto_resolve": False,
            "admin_alerts": True,
        },
    ]
    fake_db["tickets"] = [
        {"id": 1, "company_id": "company_A", "priority": "critical", "sla_status": "breached", "status": "open"},
        {"id": 2, "company_id": "company_A", "priority": "medium", "sla_status": "warning", "status": "open"},
        {"id": 3, "company_id": "company_B", "priority": "low", "sla_status": "met", "status": "open"},
    ]
    fake_db["escalation_logs"] = [
        {"id": "esc-1", "ticket_id": 1, "triggered_at": "2026-06-01T10:00:00Z"},
        {"id": "esc-2", "ticket_id": 3, "triggered_at": "2026-06-01T09:00:00Z"},
    ]

    authenticate_as(test_client, "user_A")

    settings_response = test_client.get("/system/settings")
    assert settings_response.status_code == 200
    assert settings_response.json() == {
        "ai_confidence_threshold": 0.8,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": True,
        "admin_alerts": True,
    }

    update_response = test_client.patch("/system/settings", json={"admin_alerts": False})
    assert update_response.status_code == 200
    assert fake_db["system_settings"][0]["admin_alerts"] is False
    assert fake_db["system_settings"][1]["admin_alerts"] is True

    stats_response = test_client.get("/sla/stats")
    assert stats_response.status_code == 200
    assert stats_response.json()["total"] == 2
    assert stats_response.json()["breached"] == 1
    assert stats_response.json()["warning"] == 1
    assert stats_response.json()["met"] == 0

    escalations_response = test_client.get("/sla/escalations")
    assert escalations_response.status_code == 200
    assert escalations_response.json()["total"] == 1
    assert escalations_response.json()["escalations"][0]["ticket_id"] == 1

    clear_authentication(test_client)


def test_master_admin_can_target_another_company_settings(test_client, fake_db):
    fake_db["profiles"].append(
        {
            "id": "master_admin_1",
            "company_id": None,
            "company": None,
            "role": "master_admin",
        }
    )
    fake_db["system_settings"] = [
        {"company_id": "company_A", "admin_alerts": True, "digest_frequency": "daily"},
        {"company_id": "company_B", "admin_alerts": False, "digest_frequency": "weekly"},
    ]

    authenticate_as(test_client, "master_admin_1")

    settings_response = test_client.get("/system/settings?company_id=company_B")
    assert settings_response.status_code == 200
    assert settings_response.json() == {
        "admin_alerts": False,
        "digest_frequency": "weekly",
    }

    update_response = test_client.patch(
        "/system/settings",
        json={"company_id": "company_B", "admin_alerts": True},
    )
    assert update_response.status_code == 200
    assert fake_db["system_settings"][1]["admin_alerts"] is True

    clear_authentication(test_client)
