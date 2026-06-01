# backend/app/cors.py
"""
FastAPI CORS middleware configuration.

Reads comma‑separated allowed origins from the ALLOWED_ORIGINS environment
variable. Returns HTTP 403 Forbidden if the request Origin does not match
any allowed origin.

This custom ASGI middleware replaces FastAPI's built‑in CORSMiddleware to
provide strict validation and is designed for production security.
"""

from __future__ import annotations

import logging
import os
from typing import List, Optional

# ---------------------------------------------------------------------------
# Logging
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Configuration helper
def get_allowed_origins() -> List[str]:
    """
    Parse the ALLOWED_ORIGINS environment variable into a list of origins.

    The variable should contain a comma‑separated list of origins (with scheme
    and host).  Whitespace around each origin is stripped.  Empty values
    result in an empty list.

    Returns:
        List of allowed origin strings.
    """
    raw = os.environ.get("ALLOWED_ORIGINS", "")
    if not raw:
        logger.warning("ALLOWED_ORIGINS not set or empty – all origins will be blocked")
        return []
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


# ---------------------------------------------------------------------------
# Custom ASGI middleware
class StrictCORSMiddleware:
    """
    ASGI middleware that validates the Origin header against a whitelist.

    - If the Origin is missing (same‑origin request), the request passes through.
    - If the Origin is present but not in the allowed list, a 403 JSON response
      is returned and the mismatch is logged.
    - If the Origin is allowed, appropriate CORS headers are added to the
      response, including Access‑Control‑Allow‑Origin, ‑Credentials,
      ‑Methods, ‑Headers, and ‑Max‑Age.
    - Preflight OPTIONS requests are handled directly with a 204 and the same headers.
    """

    __slots__ = ("app", "allowed_origins")

    def __init__(self, app, allowed_origins: Optional[List[str]] = None) -> None:
        self.app = app
        self.allowed_origins = allowed_origins if allowed_origins is not None else get_allowed_origins()

    async def __call__(self, scope, receive, send) -> None:
        # Only handle HTTP requests
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Extract Origin header
        origin: Optional[str] = None
        for header_name, header_value in scope.get("headers", []):
            if header_name.decode("utf-8").lower() == "origin":
                origin = header_value.decode("utf-8")
                break

        # No Origin -> same‑origin request, allow
        if not origin:
            await self.app(scope, receive, send)
            return

        # Block if origin not in allowed list
        if origin not in self.allowed_origins:
            logger.warning("Blocked request from disallowed origin: %s", origin)
            response_headers = [
                (b"content-type", b"application/json"),
                (b"access-control-allow-origin", b""),       # Explicitly empty
            ]
            await send({
                "type": "http.response.start",
                "status": 403,
                "headers": response_headers,
            })
            await send({
                "type": "http.response.body",
                "body": b'{"detail":"Origin not allowed"}',
            })
            return

        # Allowed origin – we will add CORS headers to the response.
        # Prepare the common CORS headers for the allowed origin.
        cors_headers = [
            (b"access-control-allow-origin", origin.encode()),
            (b"access-control-allow-credentials", b"true"),
            (b"access-control-allow-methods", b"GET, POST, PUT, DELETE, PATCH, OPTIONS"),
            (b"access-control-allow-headers", b"Content-Type, Authorization, X-Requested-With"),
            (b"access-control-max-age", b"3600"),
            (b"vary", b"Origin"),
        ]

        # Handle preflight request directly
        if scope["method"] == "OPTIONS":
            await send({
                "type": "http.response.start",
                "status": 204,
                "headers": [*cors_headers, (b"content-length", b"0")],
            })
            await send({"type": "http.response.body", "body": b""})
            return

        # For other methods, wrap the `send` callable to inject CORS headers
        # into the response **before** it is sent to the client.
        async def send_with_cors(message):
            if message["type"] == "http.response.start":
                # Merge new headers (ignore existing duplicates – final ones win)
                existing = dict(message.get("headers", []))
                # Remove any previously set CORS headers (defensive)
                for key, _ in cors_headers:
                    if key in existing:
                        del existing[key]
                # Convert back to list and append new headers
                final_headers = list(existing.items())
                final_headers.extend(cors_headers)
                # Keep content-type etc.
                message["headers"] = final_headers
            await send(message)

        await self.app(scope, receive, send_with_cors)


# ---------------------------------------------------------------------------
# Convenience factory for FastAPI applications
def setup_cors(app, allowed_origins: Optional[List[str]] = None) -> None:
    """
    Add the strict CORS middleware to a FastAPI application.

    This should be called *before* any other middleware that might consume
    the Origin header.  It works alongside normal application endpoints.

    Args:
        app: FastAPI application instance.
        allowed_origins: Optional list of origins.  If None, reads from env.
    """
    if allowed_origins is None:
        allowed_origins = get_allowed_origins()
    # Adding middleware as the outermost layer (first to process requests)
    app.add_middleware(StrictCORSMiddleware, allowed_origins=allowed_origins)