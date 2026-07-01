"""
Tests for backend/middleware/security_headers.py

Validates that every response produced by the FastAPI application
carries the expected browser hardening headers with correct values.
Each test is isolated: a minimal ASGI app is wrapped with the
middleware and probed with a synthetic HTTP request.
"""

import unittest
from unittest.mock import patch

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import PlainTextResponse
from starlette.routing import Route
from starlette.testclient import TestClient

from backend.middleware.security_headers import (
    SecurityHeadersMiddleware,
    _build_csp,
    _build_permissions_policy,
)


# ---------------------------------------------------------------------------
# Shared test fixture
# ---------------------------------------------------------------------------

def _homepage(request: Request) -> PlainTextResponse:
    return PlainTextResponse("ok")


def _make_client(**env_overrides) -> TestClient:
    """
    Build a minimal Starlette test app wrapped with SecurityHeadersMiddleware.
    Optional *env_overrides* are patched into ``os.environ`` before the
    middleware is instantiated so that ``__init__`` reads the overridden values.
    The patch remains active for the lifetime of the returned TestClient.
    """
    import os
    from unittest.mock import patch

    patcher = patch.dict(os.environ, env_overrides)
    patcher.start()

    app = Starlette(routes=[Route("/", _homepage)])
    app.add_middleware(SecurityHeadersMiddleware)
    client = TestClient(app, raise_server_exceptions=True)

    # Store the patcher so callers can stop it; for these tests the process
    # lifetime is short enough that leaking is acceptable, but we clean up
    # via addCleanup in each test class that uses custom env values.
    client._env_patcher = patcher  # type: ignore[attr-defined]
    return client



# ---------------------------------------------------------------------------
# Unit tests for helper builders
# ---------------------------------------------------------------------------

class TestBuildCsp(unittest.TestCase):
    def test_returns_string(self):
        result = _build_csp()
        self.assertIsInstance(result, str)

    def test_contains_default_src_self(self):
        self.assertIn("default-src 'self'", _build_csp())

    def test_contains_script_src(self):
        self.assertIn("script-src", _build_csp())

    def test_contains_frame_ancestors_self(self):
        self.assertIn("frame-ancestors 'self'", _build_csp())

    def test_contains_object_src_none(self):
        self.assertIn("object-src 'none'", _build_csp())

    def test_contains_base_uri_self(self):
        self.assertIn("base-uri 'self'", _build_csp())

    def test_contains_form_action_self(self):
        self.assertIn("form-action 'self'", _build_csp())

    def test_report_only_appends_report_uri(self):
        self.assertIn("report-uri", _build_csp(report_only=True))

    def test_enforcement_mode_no_report_uri(self):
        self.assertNotIn("report-uri", _build_csp(report_only=False))


class TestBuildPermissionsPolicy(unittest.TestCase):
    def test_returns_string(self):
        self.assertIsInstance(_build_permissions_policy(), str)

    def test_blocks_geolocation(self):
        self.assertIn("geolocation=()", _build_permissions_policy())

    def test_blocks_microphone(self):
        self.assertIn("microphone=()", _build_permissions_policy())

    def test_blocks_camera(self):
        self.assertIn("camera=()", _build_permissions_policy())

    def test_blocks_payment(self):
        self.assertIn("payment=()", _build_permissions_policy())

    def test_blocks_usb(self):
        self.assertIn("usb=()", _build_permissions_policy())


# ---------------------------------------------------------------------------
# Integration tests — header presence and values
# ---------------------------------------------------------------------------

class TestSecurityHeadersMiddleware(unittest.TestCase):
    """Verify that every required security header is injected into responses."""

    def setUp(self):
        self.client = _make_client()
        self.response = self.client.get("/")

    def test_response_is_successful(self):
        self.assertEqual(self.response.status_code, 200)

    # --- Content-Security-Policy ---

    def test_csp_header_present(self):
        self.assertIn("Content-Security-Policy", self.response.headers)

    def test_csp_default_src_self(self):
        csp = self.response.headers["Content-Security-Policy"]
        self.assertIn("default-src 'self'", csp)

    def test_csp_frame_ancestors_self(self):
        csp = self.response.headers["Content-Security-Policy"]
        self.assertIn("frame-ancestors 'self'", csp)

    def test_csp_object_src_none(self):
        csp = self.response.headers["Content-Security-Policy"]
        self.assertIn("object-src 'none'", csp)

    # --- Clickjacking ---

    def test_x_frame_options_present(self):
        self.assertIn("X-Frame-Options", self.response.headers)

    def test_x_frame_options_sameorigin(self):
        self.assertEqual(self.response.headers["X-Frame-Options"], "SAMEORIGIN")

    # --- MIME sniffing ---

    def test_x_content_type_options_present(self):
        self.assertIn("X-Content-Type-Options", self.response.headers)

    def test_x_content_type_options_nosniff(self):
        self.assertEqual(self.response.headers["X-Content-Type-Options"], "nosniff")

    # --- Referrer ---

    def test_referrer_policy_present(self):
        self.assertIn("Referrer-Policy", self.response.headers)

    def test_referrer_policy_value(self):
        self.assertEqual(
            self.response.headers["Referrer-Policy"],
            "strict-origin-when-cross-origin",
        )

    # --- Permissions ---

    def test_permissions_policy_present(self):
        self.assertIn("Permissions-Policy", self.response.headers)

    def test_permissions_policy_blocks_geolocation(self):
        self.assertIn(
            "geolocation=()", self.response.headers["Permissions-Policy"]
        )

    def test_permissions_policy_blocks_camera(self):
        self.assertIn("camera=()", self.response.headers["Permissions-Policy"])

    # --- HSTS ---

    def test_hsts_header_present(self):
        self.assertIn("Strict-Transport-Security", self.response.headers)

    def test_hsts_contains_max_age(self):
        self.assertIn("max-age=", self.response.headers["Strict-Transport-Security"])

    def test_hsts_includes_subdomains_by_default(self):
        self.assertIn(
            "includeSubDomains",
            self.response.headers["Strict-Transport-Security"],
        )

    # --- Legacy XSS filter disabled ---

    def test_x_xss_protection_disabled(self):
        self.assertEqual(self.response.headers.get("X-XSS-Protection"), "0")


# ---------------------------------------------------------------------------
# Configuration tests — env-driven behaviour
# ---------------------------------------------------------------------------

class TestSecurityHeadersMiddlewareConfiguration(unittest.TestCase):
    """Verify that environment variables correctly alter header values."""

    def test_custom_hsts_max_age(self):
        client = _make_client(HSTS_MAX_AGE="31536000")
        response = client.get("/")
        self.assertIn("max-age=31536000", response.headers["Strict-Transport-Security"])

    def test_hsts_preload_flag(self):
        client = _make_client(HSTS_PRELOAD="true")
        response = client.get("/")
        self.assertIn("preload", response.headers["Strict-Transport-Security"])

    def test_hsts_no_preload_by_default(self):
        client = _make_client()
        response = client.get("/")
        self.assertNotIn("preload", response.headers["Strict-Transport-Security"])

    def test_hsts_exclude_subdomains(self):
        client = _make_client(HSTS_INCLUDE_SUBDOMAINS="false")
        response = client.get("/")
        self.assertNotIn(
            "includeSubDomains",
            response.headers["Strict-Transport-Security"],
        )

    def test_csp_report_only_mode(self):
        client = _make_client(CSP_REPORT_ONLY="true")
        response = client.get("/")
        self.assertIn("Content-Security-Policy-Report-Only", response.headers)
        self.assertNotIn("Content-Security-Policy", response.headers)

    def test_csp_enforcement_mode_by_default(self):
        client = _make_client()
        response = client.get("/")
        self.assertIn("Content-Security-Policy", response.headers)
        self.assertNotIn("Content-Security-Policy-Report-Only", response.headers)


if __name__ == "__main__":
    unittest.main()
