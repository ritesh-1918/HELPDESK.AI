"""
Unit tests for security_middleware.py
Run: pytest tests/test_security_middleware.py -v
Issue #1169
"""
import pytest
import os
from unittest.mock import patch


class TestGetAllowedOrigins:

    def test_reads_allowed_origins_env(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "https://app.example.com,https://admin.example.com", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert "https://app.example.com" in origins
            assert "https://admin.example.com" in origins

    def test_falls_back_to_cors_origins_env(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "", "CORS_ORIGINS": "https://fallback.example.com"}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert "https://fallback.example.com" in origins

    def test_empty_env_returns_localhost_defaults(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert any("localhost" in o for o in origins)
            assert len(origins) > 0

    def test_never_returns_wildcard(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "*", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert "*" not in origins

    def test_trailing_slash_stripped(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "https://app.example.com/", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert "https://app.example.com" in origins
            assert "https://app.example.com/" not in origins

    def test_whitespace_stripped(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "  https://app.example.com  , https://b.com  ", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert "https://app.example.com" in origins
            assert "https://b.com" in origins

    def test_invalid_origins_filtered(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "not-a-url,https://valid.com,ftp://bad.com", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert "not-a-url" not in origins
            assert "ftp://bad.com" not in origins
            assert "https://valid.com" in origins

    def test_returns_list_type(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "https://app.example.com", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            assert isinstance(get_allowed_origins(), list)

    def test_vercel_production_url_accepted(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "https://helpdeskaiv1.vercel.app", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            origins = get_allowed_origins()
            assert "https://helpdeskaiv1.vercel.app" in origins

    def test_all_valid_origins_included(self):
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "https://a.com,https://b.com,https://c.com", "CORS_ORIGINS": ""}):
            from security_middleware import get_allowed_origins
            assert len(get_allowed_origins()) == 3


class TestSecurityHeadersMiddleware:

    def setup_method(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from security_middleware import SecurityHeadersMiddleware

        app = FastAPI()
        app.add_middleware(SecurityHeadersMiddleware)

        @app.get("/ping")
        def ping():
            return {"ok": True}

        self.client = TestClient(app, raise_server_exceptions=False)
        self.resp = self.client.get("/ping")

    def test_x_content_type_options(self):
        assert self.resp.headers.get("X-Content-Type-Options") == "nosniff"

    def test_x_frame_options_deny(self):
        assert self.resp.headers.get("X-Frame-Options") == "DENY"

    def test_x_xss_protection(self):
        assert "1" in self.resp.headers.get("X-XSS-Protection", "")

    def test_referrer_policy(self):
        assert self.resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"

    def test_permissions_policy_present(self):
        policy = self.resp.headers.get("Permissions-Policy", "")
        assert "camera=()" in policy
        assert "geolocation=()" in policy

    def test_csp_default_src_self(self):
        csp = self.resp.headers.get("Content-Security-Policy", "")
        assert "default-src 'self'" in csp

    def test_csp_frame_ancestors_none(self):
        csp = self.resp.headers.get("Content-Security-Policy", "")
        assert "frame-ancestors 'none'" in csp

    def test_csp_object_src_none(self):
        csp = self.resp.headers.get("Content-Security-Policy", "")
        assert "object-src 'none'" in csp

    def test_csp_no_unsafe_wildcard_default(self):
        csp = self.resp.headers.get("Content-Security-Policy", "")
        assert "default-src *" not in csp

    def test_cross_origin_opener_policy(self):
        assert self.resp.headers.get("Cross-Origin-Opener-Policy") == "same-origin"

    def test_cross_origin_resource_policy(self):
        assert self.resp.headers.get("Cross-Origin-Resource-Policy") == "same-origin"

    def test_hsts_absent_in_development(self):
        with patch.dict(os.environ, {"ENV": "development"}):
            assert "Strict-Transport-Security" not in self.resp.headers

    def test_server_header_removed(self):
        assert "Server" not in self.resp.headers

    def test_returns_200_normally(self):
        assert self.resp.status_code == 200
