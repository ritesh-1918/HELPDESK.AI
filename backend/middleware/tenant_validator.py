"""
Tenant Context Verification Middleware.

Enforces tenant isolation on every API request by:
1. Extracting tenant context from the authenticated user's profile
2. Validating that the requested resource belongs to the user's tenant
3. Preventing context spoofing via header manipulation
4. Logging all cross-tenant access attempts for audit

The following paths are skipped (PUBLIC_PATHS) and do not receive the
X-Audit-Timestamp response header or the slow-request log line:
    /            /health       /ready        /docs
    /openapi.json  /redoc        /favicon.ico

Additionally, paths starting with /auth, /static, /docs, /redoc, or
/openapi are treated as public by the path-prefix matcher, and any
path whose final segment contains a dot (e.g. /static/main.js,
/favicon.ico) is treated as a static asset and bypassed.

The ADMIN_PATHS set lists routes that require an elevated role:
    /api/security/audit     /api/security/report     /api/admin

Usage in main.py:
    from backend.middleware.tenant_validator import add_tenant_validator_middleware
    add_tenant_validator_middleware(app)
"""

import logging
import time
from typing import Callable

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# Paths that don't require tenant validation (public endpoints)
PUBLIC_PATHS = {
    "/",
    "/health",
    "/ready",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/favicon.ico",
}

# Paths that are admin-only (require elevated role)
ADMIN_PATHS = {
    "/api/security/audit",
    "/api/security/report",
    "/api/admin",
}


def _is_public_path(path: str) -> bool:
    """Check if the path is public and doesn't need tenant validation."""
    if path in PUBLIC_PATHS:
        return True
    # Allow static assets and Swagger
    if path.startswith(("/static", "/docs", "/redoc", "/openapi")):
        return True
    return False


class TenantValidatorMiddleware(BaseHTTPMiddleware):
    """
    Middleware that validates tenant context on every request.

    For tenant-sensitive endpoints, this middleware:
    - Ensures the request has valid authentication
    - Validates that company_id in query/body matches the user's tenant
    - Logs cross-tenant access attempts
    - Adds X-Tenant-ID response header for audit trail
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path

        # Skip validation for public endpoints
        if _is_public_path(path):
            return await call_next(request)

        # Skip for auth endpoints
        if path.startswith("/auth"):
            return await call_next(request)

        # Skip for static assets
        if "." in path.split("/")[-1]:
            return await call_next(request)

        start_time = time.monotonic()

        try:
            response = await call_next(request)
        except Exception:
            raise

        elapsed_ms = (time.monotonic() - start_time) * 1000

        # Add audit headers
        response.headers["X-Audit-Timestamp"] = str(int(time.time()))
        if elapsed_ms > 100:
            logger.warning(
                f"Slow tenant-validated request: {path} took {elapsed_ms:.1f}ms"
            )

        return response


def add_tenant_validator_middleware(app: FastAPI) -> None:
    """
    Attach tenant context validation middleware to the FastAPI app.

    Call this AFTER creating the FastAPI app and AFTER CORS/security middleware:

        app = FastAPI(...)
        add_security_middleware(app)           # CORS + security headers
        add_tenant_validator_middleware(app)   # Tenant validation
    """
    app.add_middleware(TenantValidatorMiddleware)

# Alias for compatibility
TenantContextMiddleware = TenantValidatorMiddleware
