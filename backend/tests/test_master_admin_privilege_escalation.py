"""
Tests for master_admin privilege escalation prevention — issue #3422.

Verifies that:
- Regular users cannot access master_admin-only endpoints
- Tenant admins cannot escalate to cross-tenant access
- master_admin cannot be self-assigned via profile update
- master_admin role is blocked from PATCH /api/profiles mass assignment
- Unauthenticated requests are rejected
"""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from backend.auth_cookie import get_current_user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def authenticate_as(test_client, user_id, role="user", company_id="company_A"):
    test_client.app.dependency_overrides[get_current_user] = lambda: {
        "id": user_id,
        "role": role,
        "company_id": company_id,
    }


def clear_authentication(test_client):
    test_client.app.dependency_overrides.pop(get_current_user, None)


# ---------------------------------------------------------------------------
# 1. Unauthenticated access must be rejected
# ---------------------------------------------------------------------------

class TestUnauthenticatedAccess:
    def test_unauthenticated_cannot_list_profiles(self, test_client):
        clear_authentication(test_client)
        response = test_client.get("/api/profiles")
        assert response.status_code in (401, 403)

    def test_unauthenticated_cannot_patch_profile(self, test_client):
        clear_authentication(test_client)
        response = test_client.patch("/api/profiles/some-user-id", json={"role": "master_admin"})
        assert response.status_code in (401, 403)

    def test_unauthenticated_cannot_delete_profile(self, test_client):
        clear_authentication(test_client)
        response = test_client.delete("/api/profiles/some-user-id")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# 2. Regular users cannot escalate to admin or master_admin
# ---------------------------------------------------------------------------

class TestRegularUserEscalation:
    def test_user_cannot_self_assign_admin_role(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "user_A", "role": "user", "company_id": "company_A", "status": "active"}
        ]
        authenticate_as(test_client, "user_A", role="user")

        response = test_client.patch("/api/profiles/user_A", json={"role": "admin"})
        # Must be blocked — role escalation not allowed
        assert response.status_code in (403, 422)
        clear_authentication(test_client)

    def test_user_cannot_self_assign_master_admin_role(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "user_A", "role": "user", "company_id": "company_A", "status": "active"}
        ]
        authenticate_as(test_client, "user_A", role="user")

        response = test_client.patch("/api/profiles/user_A", json={"role": "master_admin"})
        assert response.status_code in (403, 422)
        clear_authentication(test_client)

    def test_user_cannot_access_system_settings(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "user_A", "role": "user", "company_id": "company_A", "status": "active"}
        ]
        authenticate_as(test_client, "user_A", role="user")

        response = test_client.get("/system/settings")
        assert response.status_code == 403
        clear_authentication(test_client)

    def test_user_cannot_delete_another_user(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "user_A", "role": "user", "company_id": "company_A"},
            {"id": "user_B", "role": "user", "company_id": "company_A"},
        ]
        authenticate_as(test_client, "user_A", role="user")

        response = test_client.delete("/api/profiles/user_B")
        assert response.status_code in (403, 404)
        clear_authentication(test_client)


# ---------------------------------------------------------------------------
# 3. Tenant admin cannot cross-tenant escalate
# ---------------------------------------------------------------------------

class TestTenantAdminEscalation:
    def test_tenant_admin_cannot_access_other_company_profiles(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "admin_A", "role": "admin", "company_id": "company_A", "status": "active"},
            {"id": "user_B", "role": "user", "company_id": "company_B", "status": "active"},
        ]
        authenticate_as(test_client, "admin_A", role="admin", company_id="company_A")

        response = test_client.patch(
            "/api/profiles/user_B",
            json={"role": "admin"}
        )
        # Tenant admin must NOT be able to modify users in another company
        assert response.status_code in (403, 404)
        clear_authentication(test_client)

    def test_tenant_admin_cannot_assign_master_admin_role(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "admin_A", "role": "admin", "company_id": "company_A", "status": "active"},
            {"id": "user_A", "role": "user", "company_id": "company_A", "status": "active"},
        ]
        authenticate_as(test_client, "admin_A", role="admin", company_id="company_A")

        response = test_client.patch(
            "/api/profiles/user_A",
            json={"role": "master_admin"}
        )
        assert response.status_code in (403, 422)
        clear_authentication(test_client)

    def test_tenant_admin_cannot_query_other_company_settings(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "admin_A", "role": "admin", "company_id": "company_A", "status": "active"},
        ]
        fake_db["system_settings"] = [
            {"company_id": "company_A", "admin_alerts": True},
            {"company_id": "company_B", "admin_alerts": False},
        ]
        authenticate_as(test_client, "admin_A", role="admin", company_id="company_A")

        response = test_client.get("/system/settings?company_id=company_B")
        # Tenant admin must NOT see another company's settings
        assert response.status_code in (403, 404)
        clear_authentication(test_client)


# ---------------------------------------------------------------------------
# 4. master_admin role cannot be assigned via mass assignment (ProfileUpdate)
# ---------------------------------------------------------------------------

class TestMassAssignmentProtection:
    def test_master_admin_role_blocked_in_profile_update_schema(self):
        """ProfileUpdate schema must reject 'master_admin' as a role value."""
        from backend.schemas import ProfileUpdate
        from pydantic import ValidationError

        with pytest.raises((ValidationError, ValueError)):
            ProfileUpdate(role="master_admin")

    def test_god_mode_field_blocked_in_profile_update_schema(self):
        """ProfileUpdate schema must reject unknown fields like god_mode."""
        from backend.schemas import ProfileUpdate
        from pydantic import ValidationError

        with pytest.raises((ValidationError, ValueError)):
            ProfileUpdate(**{"god_mode": True})

    def test_arbitrary_fields_blocked_in_profile_update_schema(self):
        """ProfileUpdate schema must reject extra fields (extra=forbid)."""
        from backend.schemas import ProfileUpdate
        from pydantic import ValidationError

        with pytest.raises((ValidationError, ValueError)):
            ProfileUpdate(**{"is_superuser": True, "bypass_rls": True})


# ---------------------------------------------------------------------------
# 5. master_admin cross-company access is properly scoped
# ---------------------------------------------------------------------------

class TestMasterAdminProperAccess:
    def test_master_admin_can_access_any_company_settings(self, test_client, fake_db):
        fake_db["profiles"] = [
            {"id": "master_1", "role": "master_admin", "company_id": None, "status": "active"},
        ]
        fake_db["system_settings"] = [
            {"company_id": "company_A", "admin_alerts": True},
            {"company_id": "company_B", "admin_alerts": False},
        ]
        authenticate_as(test_client, "master_1", role="master_admin", company_id=None)

        response = test_client.get("/system/settings?company_id=company_B")
        assert response.status_code == 200
        clear_authentication(test_client)

    def test_master_admin_cannot_assign_another_master_admin(self, test_client, fake_db):
        """Even master_admin should not be able to create another master_admin."""
        fake_db["profiles"] = [
            {"id": "master_1", "role": "master_admin", "company_id": None, "status": "active"},
            {"id": "user_X", "role": "user", "company_id": "company_A", "status": "active"},
        ]
        authenticate_as(test_client, "master_1", role="master_admin", company_id=None)

        response = test_client.patch(
            "/api/profiles/user_X",
            json={"role": "master_admin"}
        )
        assert response.status_code in (403, 422)
        clear_authentication(test_client)