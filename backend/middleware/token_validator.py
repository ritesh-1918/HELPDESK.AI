"""
API Token Validation Middleware — HelpDesk.AI

Provides a FastAPI dependency that authenticates requests carrying an
``Authorization: Bearer hd_<secret>`` header, enforces the required scope,
and records the usage event.

Usage in a route::

    from backend.middleware.token_validator import require_scope

    @app.get("/api/tickets", dependencies=[Depends(require_scope("tickets:read"))])
    async def list_tickets(request: Request, token_ctx = Depends(require_scope("tickets:read"))):
        ...
"""
from __future__ import annotations

import time
from typing import Optional

from fastapi import Depends, Header, HTTPException, Request

from backend.auth.token_manager import TokenManager


def _get_remote_ip(request: Request) -> str:
    """Resolve the real client IP, respecting common reverse-proxy headers."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _extract_bearer(authorization: Optional[str]) -> Optional[str]:
    """Parse ``Bearer <token>`` → ``<token>``."""
    if not authorization:
        return None
    parts = authorization.strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def require_scope(scope: str):
    """
    Return a FastAPI dependency that validates an API token for *scope*.

    Raises HTTP 401 when no token is present, HTTP 403 when the token is
    invalid or lacks the required scope.
    """
    async def _dependency(
        request: Request,
        authorization: Optional[str] = Header(default=None, alias="Authorization"),
    ) -> dict:
        raw_token = _extract_bearer(authorization)
        if not raw_token or not raw_token.startswith("hd_"):
            raise HTTPException(
                status_code=401,
                detail={"error": "unauthorized", "message": "API token required. Provide 'Authorization: Bearer hd_<token>'."},
            )

        # Lazy-import to avoid circular dependency at module load time.
        from backend.main import supabase  # noqa: PLC0415
        if supabase is None:
            raise HTTPException(status_code=503, detail={"error": "service_unavailable", "message": "Database unavailable."})

        manager = TokenManager(supabase)
        remote_ip = _get_remote_ip(request)
        start = time.monotonic()

        token_row = manager.validate_token(
            raw_token=raw_token,
            required_scope=scope,
            remote_ip=remote_ip,
        )

        elapsed_ms = int((time.monotonic() - start) * 1000)

        if token_row is None:
            # Record the failed attempt without a token_id since we can't identify it.
            raise HTTPException(
                status_code=403,
                detail={"error": "forbidden", "message": f"Invalid token or insufficient scope (required: {scope})."},
            )

        # Record usage asynchronously (best-effort; non-blocking fire-and-forget).
        try:
            manager.record_usage(
                token_id=token_row["id"],
                company_id=token_row["company_id"],
                endpoint=str(request.url.path),
                method=request.method,
                status_code=200,
                ip_address=remote_ip,
                response_ms=elapsed_ms,
            )
        except Exception:
            pass  # Never let usage tracking break the actual request.

        return token_row

    return _dependency
