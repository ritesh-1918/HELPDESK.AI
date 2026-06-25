"""
security_middleware.py — HTTP Security Headers Middleware (Helmet.js equivalent)
Issue #1169 — Standardize Security Headers and CORS Policy
"""
from __future__ import annotations

import logging
import os
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)

_DEFAULT_CSP = (
    "default-src 'self'; "
    "script-src 'self' https://cdn.jsdelivr.net; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in; "
    "connect-src 'self' https://*.supabase.co https://*.supabase.in "
    "wss://*.supabase.co https://generativelanguage.googleapis.com; "
    "worker-src 'self' blob:; "
    "object-src 'none'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "upgrade-insecure-requests;"
)


def _resolve_csp() -> str:
    env_csp = os.environ.get("CSP_ALLOWED_SOURCES", "").strip()
    if not env_csp:
        return _DEFAULT_CSP
    if "default-src" in env_csp or (
        ";" in env_csp and any(d in env_csp for d in ("script-src", "style-src", "img-src"))
    ):
        return env_csp
    origins = [o.strip() for o in env_csp.split(",") if o.strip()]
    if not origins:
        return _DEFAULT_CSP
    origins_joined = " ".join(origins)
    return (
        f"default-src 'self' {origins_joined}; "
        f"script-src 'self' https://cdn.jsdelivr.net {origins_joined}; "
        f"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        f"font-src 'self' https://fonts.gstatic.com data:; "
        f"img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in {origins_joined}; "
        f"connect-src 'self' https://*.supabase.co https://*.supabase.in "
        f"wss://*.supabase.co https://generativelanguage.googleapis.com {origins_joined}; "
        f"worker-src 'self' blob:; "
        f"object-src 'none'; "
        f"frame-ancestors 'none'; "
        f"base-uri 'self'; "
        f"form-action 'self'; "
        f"upgrade-insecure-requests;"
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds production-grade HTTP security headers to every response.
    FastAPI/Starlette equivalent of helmet.js for Express backends.
    """

    def __init__(
        self,
        app,
        csp: Optional[str] = None,
        enable_hsts: Optional[bool] = None,
        hsts_max_age: int = 63072000,
    ) -> None:
        super().__init__(app)
        self.csp: str = csp if csp is not None else _resolve_csp()
        self.hsts_max_age = hsts_max_age
        if enable_hsts is not None:
            self.enable_hsts = enable_hsts
        else:
            env = os.getenv("ENV", os.getenv("ENVIRONMENT", "development")).lower()
            self.enable_hsts = env == "production"

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        self._apply_headers(response)
        return response

    def _apply_headers(self, response: Response) -> None:
        # ── Content Security Policy ───────────────────────────────────────────
        response.headers["Content-Security-Policy"] = self.csp

        # ── Prevent MIME-type sniffing ────────────────────────────────────────
        response.headers["X-Content-Type-Options"] = "nosniff"

        # ── Prevent Clickjacking ──────────────────────────────────────────────
        response.headers["X-Frame-Options"] = "DENY"

        # ── Legacy XSS protection ─────────────────────────────────────────────
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # ── Referrer policy ───────────────────────────────────────────────────
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # ── Permissions policy ────────────────────────────────────────────────
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), "
            "payment=(), usb=(), magnetometer=(), "
            "gyroscope=(), accelerometer=()"
        )

        # ── HSTS — production only ────────────────────────────────────────────
        if self.enable_hsts:
            response.headers["Strict-Transport-Security"] = (
                f"max-age={self.hsts_max_age}; includeSubDomains; preload"
            )

        # ── Cross-origin policies ─────────────────────────────────────────────
        response.headers["Cross-Origin-Opener-Policy"]   = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

        # ── Remove server fingerprinting ──────────────────────────────────────
        for header in ("Server", "X-Powered-By"):
            try:
                del response.headers[header]
            except KeyError:
                pass


def get_allowed_origins() -> list[str]:
    """
    Read allowed CORS origins from ALLOWED_ORIGINS env var.
    Validates format — must start with http:// or https://.
    Falls back to localhost defaults — NEVER wildcards.

    Issue #1169: Replaces the previous CORS_ORIGINS env var with the
    standardized ALLOWED_ORIGINS documented in .env.example (issue #637).
    """
    # Support both env var names for backwards compatibility
    raw = os.getenv("ALLOWED_ORIGINS", "") or os.getenv("CORS_ORIGINS", "")

    if not raw.strip():
        defaults = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ]
        logger.info("ALLOWED_ORIGINS not set — using localhost defaults")
        return defaults

    origins = []
    for origin in raw.split(","):
        origin = origin.strip().rstrip("/")
        if not origin:
            continue
        if origin.startswith("http://") or origin.startswith("https://"):
            origins.append(origin)
        else:
            logger.warning("Skipping invalid origin (must start with http/https): '%s'", origin)

    if not origins:
        logger.warning("No valid origins in ALLOWED_ORIGINS — falling back to localhost")
        return ["http://localhost:5173", "http://localhost:3000"]

    return origins
