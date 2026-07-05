"""
Tests for security headers middleware.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from middleware.security import SecurityHeadersMiddleware, configure_security


@pytest.fixture
def app():
    """Create test app with security middleware."""
    app = FastAPI()
    
    @app.get("/test")
    async def test_endpoint():
        return {"message": "ok"}
    
    return app


@pytest.fixture
def client_with_security(app):
    """Create test client with security headers."""
    configure_security(app, environment="development")
    return TestClient(app)


@pytest.fixture
def client_production(app):
    """Create test client with production security."""
    configure_security(app, environment="production")
    return TestClient(app)


class TestSecurityHeaders:
    """Test security headers are applied."""
    
    def test_x_frame_options(self, client_with_security):
        response = client_with_security.get("/test")
        assert response.headers["X-Frame-Options"] == "DENY"
    
    def test_x_content_type_options(self, client_with_security):
        response = client_with_security.get("/test")
        assert response.headers["X-Content-Type-Options"] == "nosniff"
    
    def test_x_xss_protection(self, client_with_security):
        response = client_with_security.get("/test")
        assert response.headers["X-XSS-Protection"] == "1; mode=block"
    
    def test_referrer_policy(self, client_with_security):
        response = client_with_security.get("/test")
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    
    def test_content_security_policy(self, client_with_security):
        response = client_with_security.get("/test")
        assert "Content-Security-Policy" in response.headers
        csp = response.headers["Content-Security-Policy"]
        assert "default-src" in csp
        assert "'self'" in csp
    
    def test_permissions_policy(self, client_with_security):
        response = client_with_security.get("/test")
        assert "Permissions-Policy" in response.headers
        pp = response.headers["Permissions-Policy"]
        assert "camera=()" in pp
        assert "microphone=()" in pp
    
    def test_hsts_not_in_dev(self, client_with_security):
        response = client_with_security.get("/test")
        assert "Strict-Transport-Security" not in response.headers
    
    def test_hsts_in_production(self, client_production):
        response = client_production.get("/test")
        assert "Strict-Transport-Security" in response.headers
        hsts = response.headers["Strict-Transport-Security"]
        assert "max-age=" in hsts
        assert "includeSubDomains" in hsts


class TestCSPDirectives:
    """Test CSP directive configuration."""
    
    def test_csp_blocks_frame_ancestors(self, client_with_security):
        response = client_with_security.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "frame-ancestors" in csp
    
    def test_csp_allows_self(self, client_with_security):
        response = client_with_security.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "'self'" in csp


class TestCORSConfiguration:
    """Test CORS configuration."""
    
    def test_cors_allows_configured_origins(self, client_with_security):
        response = client_with_security.options(
            "/test",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Should not error (CORS allows it)
        assert response.status_code in [200, 204]
    
    def test_cors_exposes_request_id(self, client_with_security):
        response = client_with_security.get(
            "/test",
            headers={"Origin": "http://localhost:3000"},
        )
        # Check exposed headers
        assert "access-control-expose-headers" in response.headers


class TestCustomMiddleware:
    """Test SecurityHeadersMiddleware directly."""
    
    def test_custom_frame_options(self, app):
        app.add_middleware(SecurityHeadersMiddleware, frame_options="SAMEORIGIN")
        client = TestClient(app)
        response = client.get("/test")
        assert response.headers["X-Frame-Options"] == "SAMEORIGIN"
    
    def test_custom_hsts_age(self, app):
        app.add_middleware(SecurityHeadersMiddleware, enable_hsts=True, hsts_max_age=86400)
        client = TestClient(app)
        response = client.get("/test")
        hsts = response.headers["Strict-Transport-Security"]
        assert "max-age=86400" in hsts
