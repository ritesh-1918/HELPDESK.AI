"""
Unit tests for backend/middleware/tenant_validator.py.
"""

import os
import sys
import unittest
from unittest import mock

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.middleware.tenant_validator import (
    PUBLIC_PATHS,
    ADMIN_PATHS,
    _is_public_path,
    TenantValidatorMiddleware,
    add_tenant_validator_middleware,
)


class TestPublicPathsConstant(unittest.TestCase):
    def test_includes_root(self):
        self.assertIn("/", PUBLIC_PATHS)

    def test_includes_health(self):
        self.assertIn("/health", PUBLIC_PATHS)
        self.assertIn("/ready", PUBLIC_PATHS)

    def test_includes_docs(self):
        self.assertIn("/docs", PUBLIC_PATHS)
        self.assertIn("/openapi.json", PUBLIC_PATHS)


class TestAdminPathsConstant(unittest.TestCase):
    def test_includes_admin_paths(self):
        self.assertIn("/api/security/audit", ADMIN_PATHS)
        self.assertIn("/api/admin", ADMIN_PATHS)


class TestIsPublicPath(unittest.TestCase):
    def test_exact_public_match(self):
        self.assertTrue(_is_public_path("/"))
        self.assertTrue(_is_public_path("/health"))
        self.assertTrue(_is_public_path("/ready"))

    def test_static_prefix(self):
        self.assertTrue(_is_public_path("/static/main.js"))
        self.assertTrue(_is_public_path("/static/img/logo.png"))

    def test_docs_prefix(self):
        self.assertTrue(_is_public_path("/docs"))
        self.assertTrue(_is_public_path("/docs/sub/path"))

    def test_openapi_prefix(self):
        self.assertTrue(_is_public_path("/openapi.json"))
        self.assertTrue(_is_public_path("/openapi/sub"))

    def test_private_path(self):
        self.assertFalse(_is_public_path("/api/tickets"))
        self.assertFalse(_is_public_path("/tickets/123"))

    def test_auth_path_not_public(self):
        # /auth* is not in PUBLIC_PATHS, so it should be private.
        # (The middleware does its own /auth* skip separately.)
        self.assertFalse(_is_public_path("/auth/login"))


class TestAddTenantValidatorMiddleware(unittest.TestCase):
    def test_adds_middleware(self):
        app = mock.MagicMock()
        add_tenant_validator_middleware(app)
        self.assertEqual(app.add_middleware.call_count, 1)
        call = app.add_middleware.call_args
        self.assertEqual(call.args[0].__name__, "TenantValidatorMiddleware")


class TestTenantValidatorMiddlewareDispatch(unittest.TestCase):
    """Exercise the dispatch logic by mocking the inner ASGI app."""

    def _make_request(self, path):
        req = mock.MagicMock()
        req.url.path = path
        return req

    def _make_response(self):
        response = mock.MagicMock()
        response.headers = {}
        return response

    def _run_dispatch(self, middleware, request):
        # call_next is awaited by the middleware
        async def call_next(_):
            return self._make_response()

        # Since dispatch is async, we need to run it via asyncio
        import asyncio
        return asyncio.run(middleware.dispatch(request, call_next))

    def test_public_path_bypass(self):
        mw = TenantValidatorMiddleware(mock.MagicMock())
        request = self._make_request("/health")
        response = self._run_dispatch(mw, request)
        # The response object should be returned unmodified
        self.assertIsNotNone(response)

    def test_root_path_bypass(self):
        mw = TenantValidatorMiddleware(mock.MagicMock())
        request = self._make_request("/")
        response = self._run_dispatch(mw, request)
        self.assertIsNotNone(response)

    def test_auth_path_bypass(self):
        mw = TenantValidatorMiddleware(mock.MagicMock())
        request = self._make_request("/auth/login")
        response = self._run_dispatch(mw, request)
        self.assertIsNotNone(response)

    def test_private_path_adds_audit_header(self):
        mw = TenantValidatorMiddleware(mock.MagicMock())
        request = self._make_request("/api/tickets")
        response = self._run_dispatch(mw, request)
        # The middleware sets X-Audit-Timestamp on the response
        self.assertIn("X-Audit-Timestamp", response.headers)

    def test_static_asset_bypass(self):
        mw = TenantValidatorMiddleware(mock.MagicMock())
        request = self._make_request("/static/main.js")
        response = self._run_dispatch(mw, request)
        # static paths bypass: no X-Audit-Timestamp added
        self.assertNotIn("X-Audit-Timestamp", response.headers)


if __name__ == "__main__":
    unittest.main()
