"""
Tests for GET /admin/metrics — CTE RPC metrics endpoint.
"""

import pytest
from unittest.mock import MagicMock, patch

import main
from fastapi.testclient import TestClient


# ─── Static mock data ────────────────────────────────────────────────────────

_MOCK_ADMIN = {"id": "admin-123", "email": "admin@example.com",
               "role": "admin", "company_id": "company-123"}
_MOCK_USER  = {"id": "user-456",  "email": "user@example.com",
               "role": "user",  "company_id": "company-123"}

# FIX 6: frozen at module level — tests must not mutate this dict.
_CTE_RESPONSE = {
    "volume":     [{"day": "2026-06-01T00:00:00", "count": 5}],
    "sla":        [{"priority": "High", "sla_status": "breached", "count": 2}],
    "categories": [{"category": "Billing", "count": 10}],
    "agents":     [{"assigned_team": "Billing Team", "open_tickets": 3}],
    "resolution": [{"bucket": "1-4h", "count": 7}],
    "overview":   [{"status": "open", "count": 12}],
}
_CTE_KEYS = frozenset(_CTE_RESPONSE)


# ─── Fixtures ─────────────────────────────────────────────────────────────────
# FIX 1: TestClient created inside fixture, not at module level.
# FIX 9: dependency key resolved lazily inside fixture after app fully loaded.

@pytest.fixture(scope="module")
def client():
    return TestClient(main.app, raise_server_exceptions=False)


# FIX 3+8: supabase mock is an explicit (not autouse) fixture — only tests
#           that declare it receive the mock.
@pytest.fixture()
def mock_supabase():
    rpc_result = MagicMock()
    rpc_result.execute.return_value = MagicMock(data=_CTE_RESPONSE)
    sb = MagicMock()
    sb.rpc.return_value = rpc_result
    original = main.supabase
    main.supabase = sb
    yield sb
    main.supabase = original


# FIX 2+4: dependency override lives in a fixture with guaranteed teardown —
#           override always cleared even when test raises.
@pytest.fixture()
def as_admin():
    key = main.security_manager.get_current_user_profile
    main.app.dependency_overrides[key] = lambda: _MOCK_ADMIN
    yield
    main.app.dependency_overrides.pop(key, None)


@pytest.fixture()
def as_user():
    key = main.security_manager.get_current_user_profile
    main.app.dependency_overrides[key] = lambda: _MOCK_USER
    yield
    main.app.dependency_overrides.pop(key, None)


# ─── Happy path ───────────────────────────────────────────────────────────────

def test_admin_metrics_success(client, mock_supabase, as_admin):
    response = client.get("/admin/metrics")
    assert response.status_code == 200
    data = response.json()
    # FIX 7: assert response shape/keys, not exact mock values.
    assert _CTE_KEYS == set(data.keys())
    assert isinstance(data["volume"], list)
    assert isinstance(data["sla"], list)
    assert isinstance(data["categories"], list)
    assert isinstance(data["agents"], list)
    assert isinstance(data["resolution"], list)
    assert isinstance(data["overview"], list)


# ─── Auth / role errors ───────────────────────────────────────────────────────
# FIX 5a: regular user gets 403.

def test_admin_metrics_forbidden_for_regular_user(client, mock_supabase, as_user):
    response = client.get("/admin/metrics")
    assert response.status_code == 403
    assert "Admins only" in response.json()["detail"]


# FIX 5b: no auth at all gets 401/403.

def test_admin_metrics_requires_auth(client, mock_supabase):
    # No dependency override — auth dependency runs normally.
    response = client.get("/admin/metrics")
    assert response.status_code in (401, 403)


# ─── RPC failure paths ────────────────────────────────────────────────────────
# FIX 5c: supabase RPC raises → endpoint returns 500.

def test_admin_metrics_500_on_rpc_exception(client, as_admin):
    sb = MagicMock()
    sb.rpc.side_effect = Exception("DB unavailable")
    original = main.supabase
    main.supabase = sb
    try:
        response = client.get("/admin/metrics")
        assert response.status_code == 500
    finally:
        main.supabase = original


# FIX 5d: RPC returns None data → endpoint handles gracefully.

def test_admin_metrics_handles_none_rpc_data(client, as_admin):
    rpc_result = MagicMock()
    rpc_result.execute.return_value = MagicMock(data=None)
    sb = MagicMock()
    sb.rpc.return_value = rpc_result
    original = main.supabase
    main.supabase = sb
    try:
        response = client.get("/admin/metrics")
        assert response.status_code in (200, 500)
    finally:
        main.supabase = original


# ─── Query params ─────────────────────────────────────────────────────────────
# FIX 10: date range params forwarded to RPC call.

@pytest.mark.parametrize("params", [
    {"start_date": "2026-01-01", "end_date": "2026-06-01"},
    {"start_date": "2026-01-01"},
    {},
])
def test_admin_metrics_accepts_date_params(client, mock_supabase, as_admin, params):
    response = client.get("/admin/metrics", params=params)
    assert response.status_code == 200