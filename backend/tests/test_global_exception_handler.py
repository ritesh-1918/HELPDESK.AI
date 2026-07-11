"""
Tests for the application-wide global exception handler.

The handler converts any unhandled exception into a generic, leak-free 500
JSON response while logging the real traceback server-side with a correlation
``error_id``. This prevents internal error details (file paths, stack frames,
secret values) from leaking to API clients.
"""
import os

# Allow the app to import without models / real Supabase credentials.
os.environ.setdefault("ALLOW_DEGRADED_STARTUP", "1")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "placeholder_key")

from fastapi.testclient import TestClient

from main import app
from backend.auth.tenant_middleware import security_manager


def _raise_unhandled():
    # Simulates an unexpected runtime failure inside a dependency.
    raise RuntimeError("SECRET-INTERNAL-DETAIL-MUST-NOT-LEAK")


def test_global_exception_handler_sanitizes_500():
    """An unhandled exception must become a generic, leak-free 500."""
    app.dependency_overrides[security_manager.get_current_user_profile] = _raise_unhandled
    try:
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/tickets")
        assert resp.status_code == 500
        body = resp.json()
        assert body.get("status") == "error"
        assert body.get("error_id")
        # Internal exception details must never reach the client.
        assert "SECRET-INTERNAL-DETAIL-MUST-NOT-LEAK" not in resp.text
        assert "Traceback" not in resp.text
    finally:
        app.dependency_overrides.clear()


def test_public_health_still_200():
    """Registering the handler must not break normal routes."""
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json().get("status") == "ok"


def test_explicit_http_exceptions_are_preserved():
    """Intentional HTTPException details remain available to clients."""
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/api/security/audit")
    # No auth -> 401/403 from the dependency, not a generic 500.
    assert resp.status_code in (401, 403)
    assert resp.status_code != 500
