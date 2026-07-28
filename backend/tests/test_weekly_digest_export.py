import os

os.environ.setdefault("ALLOW_DEGRADED_STARTUP", "1")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "placeholder_key")

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.routes import weekly_digest


app = FastAPI()
app.include_router(weekly_digest.router)
client = TestClient(app)

mock_admin_user = {
    "id": "admin-123",
    "email": "admin@example.com",
    "role": "admin",
    "company_id": "company-123",
}

mock_regular_user = {
    "id": "user-456",
    "email": "user@example.com",
    "role": "user",
    "company_id": "company-123",
}


def override_get_admin_user():
    return mock_admin_user


def override_get_regular_user():
    return mock_regular_user


def test_weekly_digest_export_returns_csv(monkeypatch):
    sample_stats = {
        "company_name": "Acme Support",
        "date_range_str": "Jun 21 - Jun 28, 2026",
        "total_tickets": 12,
        "resolved_tickets": 9,
        "open_tickets": 2,
        "pending_tickets": 1,
        "resolution_rate": 75.0,
        "avg_resolution_time_str": "3.4h",
        "sla_breaches": 2,
        "top_categories": [{"category": "Billing", "count": 5}],
        "team_performance": [
            {
                "team": "Billing Team",
                "total": 7,
                "resolved": 6,
                "open": 1,
                "pending": 0,
                "resolution_rate": 85.7,
                "avg_resolution_time": "2.1h",
                "sla_breaches": 1,
            }
        ],
    }

    monkeypatch.setattr(weekly_digest, "get_weekly_stats", lambda company_id, days=7: sample_stats)
    app.dependency_overrides[weekly_digest.get_current_user] = override_get_admin_user

    response = client.get("/api/digest/export/company-123?days=7")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment; filename=weekly_digest_company-123_7d.csv" in response.headers["content-disposition"]
    body = response.text
    assert "=== WEEKLY DIGEST SUMMARY ===" in body
    assert "Acme Support" in body
    assert "Billing Team" in body

    app.dependency_overrides.clear()


def test_weekly_digest_export_forbids_regular_users():
    app.dependency_overrides[weekly_digest.get_current_user] = override_get_regular_user

    response = client.get("/api/digest/export/company-123")

    assert response.status_code == 403
    assert response.json()["detail"] == "Admins only"

    app.dependency_overrides.clear()
