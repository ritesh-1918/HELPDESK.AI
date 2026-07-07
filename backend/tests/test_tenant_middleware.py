"""
Unit tests for backend/auth/tenant_middleware.py.

Covers the TenantSecurityManager's pure-logic helpers and the
mock-token / mock-resource formats. No real Supabase calls.
"""

import os
import sys
import time
import unittest
from unittest import mock

# postgrest is required by the module under test; stub it if not available.
try:
    import postgrest  # noqa: F401
except ImportError:
    import types
    postgrest = types.ModuleType("postgrest")
    postgrest_exceptions = types.ModuleType("postgrest.exceptions")
    class APIError(Exception):
        pass
    postgrest_exceptions.APIError = APIError
    postgrest.exceptions = postgrest_exceptions
    sys.modules["postgrest"] = postgrest
    sys.modules["postgrest.exceptions"] = postgrest_exceptions

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from fastapi import HTTPException
from backend.auth.tenant_middleware import (
    TenantSecurityManager,
    _profile_cache,
    CACHE_TTL_SECONDS,
    security_manager,
)


class TestVerifyTenantAccess(unittest.TestCase):
    def setUp(self):
        self.sm = TenantSecurityManager()

    def test_master_admin_bypass(self):
        # Master admin should not be blocked even with target_company_id set
        self.sm.verify_tenant_access("other-company", {"role": "master_admin", "id": "u1"})

    def test_user_no_company_raises(self):
        with self.assertRaises(HTTPException) as ctx:
            self.sm.verify_tenant_access("c1", {"role": "user", "id": "u1", "company_id": None})
        self.assertEqual(ctx.exception.status_code, 403)

    def test_user_empty_company_raises(self):
        with self.assertRaises(HTTPException) as ctx:
            self.sm.verify_tenant_access("c1", {"role": "user", "id": "u1", "company_id": ""})
        self.assertEqual(ctx.exception.status_code, 403)

    def test_matching_company_allowed(self):
        self.sm.verify_tenant_access("c1", {"role": "user", "id": "u1", "company_id": "c1"})

    def test_mismatched_company_denied(self):
        with self.assertRaises(HTTPException) as ctx:
            self.sm.verify_tenant_access("c1", {"role": "user", "id": "u1", "company_id": "c2"})
        self.assertEqual(ctx.exception.status_code, 403)

    def test_none_target_company_allowed(self):
        # If no target, just verify user has a company
        self.sm.verify_tenant_access(None, {"role": "user", "id": "u1", "company_id": "c1"})


class TestVerifyResourceOwnershipMock(unittest.TestCase):
    def setUp(self):
        self.sm = TenantSecurityManager()
        self.user = {"role": "user", "id": "u1", "company_id": "companyA"}

    def test_mock_resource_same_company(self):
        result = self.sm.verify_resource_ownership(
            "tickets", "mock-ticket-companyA-123", self.user
        )
        self.assertEqual(result["company_id"], "companyA")

    def test_mock_resource_other_company_denied(self):
        with self.assertRaises(HTTPException) as ctx:
            self.sm.verify_resource_ownership(
                "tickets", "mock-ticket-companyB-123", self.user
            )
        self.assertEqual(ctx.exception.status_code, 403)

    def test_user_no_company_denied(self):
        user = {"role": "user", "id": "u1", "company_id": None}
        with self.assertRaises(HTTPException) as ctx:
            self.sm.verify_resource_ownership("tickets", "mock-ticket-c1-1", user)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_master_admin_with_mock(self):
        # Master admin: bypasses the user_company_id check, but mock parsing still applies
        # Actually for master_admin it short-circuits to supabase query
        # If supabase is None, returns {} safely
        user = {"role": "master_admin", "id": "master"}
        # Override the supabase property so we don't trigger backend.main import
        type(self.sm).supabase = property(lambda s: None)
        try:
            result = self.sm.verify_resource_ownership("tickets", "mock-ticket-c1-1", user)
            # With no supabase, returns {} - no exception
            self.assertEqual(result, {})
        finally:
            from backend.auth import tenant_middleware as tm
            type(self.sm).supabase = tm.TenantSecurityManager.supabase


class TestResolveUserProfileCache(unittest.TestCase):
    def setUp(self):
        _profile_cache.clear()
        self.sm = TenantSecurityManager()
        # Make sure the supabase property never tries to import backend.main
        # by giving the manager a None client that short-circuits the check.
        type(self.sm).supabase = property(lambda s: None)

    def tearDown(self):
        # Restore the original property
        from backend.auth import tenant_middleware as tm
        type(self.sm).supabase = tm.TenantSecurityManager.supabase

    def test_cache_hit_within_ttl(self):
        # Pre-populate the cache
        _profile_cache["u1"] = {
            "profile": {"id": "u1", "company_id": "c1", "role": "user"},
            "cached_at": time.time(),
        }
        # No supabase client, but cache should serve
        profile = self.sm.resolve_user_profile("u1")
        self.assertEqual(profile["company_id"], "c1")

    def test_cache_expired_falls_through(self):
        # Pre-populate the cache with stale entry
        _profile_cache["u1"] = {
            "profile": {"id": "u1", "company_id": "old"},
            "cached_at": time.time() - CACHE_TTL_SECONDS - 1,
        }
        # No supabase client -> degraded fallback
        profile = self.sm.resolve_user_profile("u1")
        # Stale entries should be replaced with degraded fallback
        self.assertIsNone(profile["company_id"])

    def test_no_supabase_returns_degraded(self):
        profile = self.sm.resolve_user_profile("u-unknown")
        self.assertIsNone(profile["company_id"])
        self.assertEqual(profile["role"], "user")

    def test_supabase_error_returns_degraded(self):
        mock_sb = mock.MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("db error")
        sm = TenantSecurityManager(mock_sb)
        # Patch supabase property on the new instance
        type(sm).supabase = property(lambda s: mock_sb)
        try:
            profile = sm.resolve_user_profile("u1")
            self.assertIsNone(profile["company_id"])
            self.assertEqual(profile["role"], "user")
        finally:
            from backend.auth import tenant_middleware as tm
            type(sm).supabase = tm.TenantSecurityManager.supabase


class TestSingleton(unittest.TestCase):
    def test_security_manager_is_singleton(self):
        # Module exposes a singleton
        self.assertIsInstance(security_manager, TenantSecurityManager)


if __name__ == "__main__":
    unittest.main()
