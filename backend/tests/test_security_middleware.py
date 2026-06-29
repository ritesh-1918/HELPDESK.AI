from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.security_middleware import SecurityHeadersMiddleware


def test_security_headers_middleware_adds_browser_protections():
    app = FastAPI()
    app.add_middleware(SecurityHeadersMiddleware)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["content-security-policy"].startswith("default-src 'self'")
    assert response.headers["strict-transport-security"] == "max-age=31536000; includeSubDomains"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert response.headers["permissions-policy"] == "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    assert response.headers["cross-origin-opener-policy"] == "same-origin"
