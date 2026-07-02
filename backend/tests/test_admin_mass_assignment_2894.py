"""
Regression tests for PATCH /api/profiles/{user_id} — closes #2894.

Original vulnerability: the endpoint accepted `updates: dict`, so any
authenticated user could PATCH any profile field on any user, including
`role` (privilege escalation), `status`, `company_id`, and `email`
(account takeover / tenant escape).

These tests pin the new behavior:
  1. Schema rejects unknown fields (extra="forbid") with 422.
  2. Caller may only update their own profile, unless admin/master_admin.
  3. Allowed fields round-trip through to supabase unchanged.
  4. PATCH with empty body returns 200 (no-op) without calling supabase.
"""

import os
import sys
from unittest.mock import MagicMock, patch

import pytest

# Make the project importable regardless of cwd.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Mock heavy ML deps so importing the app is cheap in CI.
for _m in ("torch", "torch.nn", "torch.nn.functional", "transformers", "sentence_transformers"):
    sys.modules.setdefault(_m, MagicMock())

from fastapi.testclient import TestClient
import main  # noqa: E402

client = TestClient(main.app)


# ─── Fixtures ───────────────────────────────────────────────────────────────

USER_SELF = {"id": "user-1", "email": "self@example.com", "role": "user"}
USER_OTHER = {"id": "user-2", "email": "other@example.com", "role": "user"}
USER_ADMIN = {"id": "admin-1", "email": "admin@example.com", "role": "admin"}
USER_MASTER = {"id": "master-1", "email": "m@example.com", "role": "master_admin"}


@pytest.fixture
def mock_supabase():
    """Replace main.supabase with a MagicMock for the duration of the test."""
    original = getattr(main, "supabase", None)
    sb = MagicMock()
    # chain: supabase.table(...).update(payload).eq("id", x).execute() -> .data
    sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": "user-1", "full_name": "Updated"}]
    )
    main.supabase = sb
    yield sb
    main.supabase = original


def _as(user: dict):
    """Override the auth dependency to return the given user dict."""
    from backend.auth_cookie import get_current_user
    main.app.dependency_overrides[get_current_user] = lambda: user
    return user


@pytest.fixture(autouse=True)
def _clear_overrides():
    main.app.dependency_overrides.clear()
    yield
    main.app.dependency_overrides.clear()


# ─── Tests ──────────────────────────────────────────────────────────────────

def test_rejects_unknown_field_role_escalation(mock_supabase):
    """#2894 primary PoC: any user tries to set role=admin. Must 422."""
    _as(USER_SELF)
    r = client.patch(
        "/api/profiles/user-1",
        json={"role": "admin"},
    )
    assert r.status_code == 422, r.text
    # Pydantic v2 extra=forbid messages mention "Extra inputs"
    body = r.text
    assert "role" in body or "Extra" in body, body
    # supabase must NOT be called.
    mock_supabase.table.assert_not_called()


def test_rejects_status_field(mock_supabase):
    _as(USER_SELF)
    r = client.patch("/api/profiles/user-1", json={"status": "verified"})
    assert r.status_code == 422, r.text
    mock_supabase.table.assert_not_called()


def test_rejects_company_id_field(mock_supabase):
    _as(USER_SELF)
    r = client.patch("/api/profiles/user-1", json={"company_id": "other-tenant"})
    assert r.status_code == 422, r.text
    mock_supabase.table.assert_not_called()


def test_rejects_email_field(mock_supabase):
    """Email is auth-controlled; users must not be able to PATCH it."""
    _as(USER_SELF)
    r = client.patch("/api/profiles/user-1", json={"email": "attacker@evil.com"})
    assert r.status_code == 422, r.text
    mock_supabase.table.assert_not_called()


def test_user_cannot_update_other_profile(mock_supabase):
    """Authorization: user-1 cannot PATCH user-2's profile."""
    _as(USER_SELF)
    r = client.patch("/api/profiles/user-2", json={"full_name": "Hacked"})
    assert r.status_code == 403, r.text
    assert "Not authorized" in r.json()["detail"]
    mock_supabase.table.assert_not_called()


def test_user_can_update_own_profile(mock_supabase):
    """Authorization: user-1 can update their own profile with allowed fields."""
    _as(USER_SELF)
    r = client.patch(
        "/api/profiles/user-1",
        json={"full_name": "New Name", "bio": "Hello", "avatar_url": "https://x/y.png"},
    )
    assert r.status_code == 200, r.text
    # update() must be called with the exact allowlist payload
    mock_supabase.table.return_value.update.assert_called_once()
    payload = mock_supabase.table.return_value.update.call_args.args[0]
    assert payload == {
        "full_name": "New Name",
        "bio": "Hello",
        "avatar_url": "https://x/y.png",
    }
    # forbidden fields not present in payload
    for forbidden in ("role", "status", "company_id", "email"):
        assert forbidden not in payload


def test_admin_can_update_other_profile(mock_supabase):
    _as(USER_ADMIN)
    r = client.patch("/api/profiles/user-2", json={"full_name": "Admin Renamed"})
    assert r.status_code == 200, r.text
    payload = mock_supabase.table.return_value.update.call_args.args[0]
    assert payload == {"full_name": "Admin Renamed"}


def test_master_admin_can_update_other_profile(mock_supabase):
    _as(USER_MASTER)
    r = client.patch("/api/profiles/user-2", json={"full_name": "Master Renamed"})
    assert r.status_code == 200, r.text


def test_non_admin_role_cannot_update_other(mock_supabase):
    """A 'manager' or any other non-allowlisted role must NOT bypass."""
    _as({"id": "mgr-1", "email": "m@x.com", "role": "manager"})
    r = client.patch("/api/profiles/user-2", json={"full_name": "Bypass attempt"})
    assert r.status_code == 403, r.text
    mock_supabase.table.assert_not_called()


def test_avatar_url_must_be_http(mock_supabase):
    _as(USER_SELF)
    r = client.patch("/api/profiles/user-1", json={"avatar_url": "javascript:alert(1)"})
    assert r.status_code == 422, r.text
    mock_supabase.table.assert_not_called()


def test_empty_body_is_noop(mock_supabase):
    """An empty PATCH should be a 200 with no DB write."""
    _as(USER_SELF)
    r = client.patch("/api/profiles/user-1", json={})
    assert r.status_code == 200, r.text
    mock_supabase.table.assert_not_called()


def test_exclude_unset_only_persists_sent_fields(mock_supabase):
    """If client only sends full_name, the DB write must only contain full_name."""
    _as(USER_SELF)
    r = client.patch("/api/profiles/user-1", json={"full_name": "Only Name"})
    assert r.status_code == 200, r.text
    payload = mock_supabase.table.return_value.update.call_args.args[0]
    assert payload == {"full_name": "Only Name"}
    assert "avatar_url" not in payload
    assert "bio" not in payload
