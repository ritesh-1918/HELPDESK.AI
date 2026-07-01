"""
[DEPRECATED] Consolidated Security and CORS configuration for HELPDESK.AI Backend.
Resolves Issue #637 by standardizing Helmet headers and CORS policy.
Use backend/security_middleware instead.
"""

import os
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


# ---------------------------------------------------------------------------
# CSP configuration
# ---------------------------------------------------------------------------

def _build_csp(report_only: bool = False) -> str:
    """
    Build the Content-Security-Policy directive string.

    The policy restricts resource loading to trusted origins, blocks inline
    script execution where possible, and prevents framing by third parties.
    ``'unsafe-inline'`` is retained for ``style-src`` because the application
    uses Tailwind CSS utility classes applied via inline <style> attributes
    generated at runtime.  Removing it without a nonce/hash strategy would
    break the UI.
    """
    directives = [
        "default-src 'self'",
        # Allow scripts only from the application origin and the Tailwind CDN
        # used by the backend landing page.
        "script-src 'self' cdn.tailwindcss.com",
        # Images may be loaded over HTTPS from any domain (avatars, screenshots).
        "img-src 'self' https: data:",
        # Inline styles required by Tailwind; no external style-sheet CDNs.
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        # Web-font assets.
        "font-src 'self' fonts.gstatic.com",
        # API calls are strictly same-origin.  Supabase Realtime WS endpoints
        # are handled by the frontend; the backend only talks to itself.
        "connect-src 'self'",
        # No plugins (Flash, Silverlight, etc.).
        "object-src 'none'",
        # Prevent embedding this application in third-party frames.
        "frame-ancestors 'self'",
        # Restrict <base> tag manipulation.
        "base-uri 'self'",
        # Restrict form submission targets.
        "form-action 'self'",
    ]

    csp_string = "; ".join(directives)

    if report_only:
        csp_string += "; report-uri /csp-report"

    return csp_string


# ---------------------------------------------------------------------------
# Permissions-Policy configuration
# ---------------------------------------------------------------------------

def _build_permissions_policy() -> str:
    """
    Return a Permissions-Policy header value that disables browser features
    not required by this application, following the principle of least privilege.
    """
    denied = [
        "geolocation=()",
        "microphone=()",
        "camera=()",
        "payment=()",
        "usb=()",
        "magnetometer=()",
        "accelerometer=()",
        "gyroscope=()",
        "fullscreen=(self)",
    ]
    return ", ".join(denied)


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Starlette middleware that injects HTTP security hardening headers into
    every outbound response.

    Configuration is driven by environment variables so deployment-specific
    values (HSTS max-age, CSP report-only mode) can be adjusted without
    code changes.

    Environment variables:
      HSTS_MAX_AGE          — Integer seconds for HSTS max-age (default: 63072000 / 2 years)
      HSTS_INCLUDE_SUBDOMAINS — "true"/"false" (default: "true")
      HSTS_PRELOAD          — "true"/"false" (default: "false"; enable only after HSTS preload
                              list submission)
      CSP_REPORT_ONLY       — "true"/"false" (default: "false"); use during initial rollout
                              to monitor violations without blocking.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)
        self._hsts_max_age = int(os.environ.get("HSTS_MAX_AGE", "63072000"))
        self._hsts_include_subdomains = (
            os.environ.get("HSTS_INCLUDE_SUBDOMAINS", "true").lower() == "true"
        )
        self._hsts_preload = os.environ.get("HSTS_PRELOAD", "false").lower() == "true"
        self._csp_report_only = (
            os.environ.get("CSP_REPORT_ONLY", "false").lower() == "true"
        )

    # ------------------------------------------------------------------
    # HSTS header
    # ------------------------------------------------------------------

    def _hsts_value(self) -> str:
        value = f"max-age={self._hsts_max_age}"
        if self._hsts_include_subdomains:
            value += "; includeSubDomains"
        if self._hsts_preload:
            value += "; preload"
        return value

    # ------------------------------------------------------------------
    # Middleware dispatch
    # ------------------------------------------------------------------

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # ----------------------------------------------------------
        # Content Security Policy
        # ----------------------------------------------------------
        csp_value = _build_csp(report_only=self._csp_report_only)
        if self._csp_report_only:
            response.headers["Content-Security-Policy-Report-Only"] = csp_value
        else:
            response.headers["Content-Security-Policy"] = csp_value

        # ----------------------------------------------------------
        # Clickjacking protection
        # CSP frame-ancestors supersedes X-Frame-Options for modern
        # browsers; both are set for defense-in-depth with legacy UAs.
        # ----------------------------------------------------------
        response.headers["X-Frame-Options"] = "SAMEORIGIN"

        # ----------------------------------------------------------
        # MIME sniffing protection
        # ----------------------------------------------------------
        response.headers["X-Content-Type-Options"] = "nosniff"

        # ----------------------------------------------------------
        # Referrer policy — send origin only on same-origin requests;
        # omit the path on cross-origin to prevent URL leakage.
        # ----------------------------------------------------------
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # ----------------------------------------------------------
        # Browser feature restrictions
        # ----------------------------------------------------------
        response.headers["Permissions-Policy"] = _build_permissions_policy()

        # ----------------------------------------------------------
        # HSTS — enforce HTTPS; applied unconditionally so that the
        # header is served even on HTTP during local dev (browsers
        # ignore it over HTTP, so there is no correctness risk).
        # ----------------------------------------------------------
        response.headers["Strict-Transport-Security"] = self._hsts_value()

        # ----------------------------------------------------------
        # Legacy XSS filter (IE/old Edge) — disable the built-in
        # filter to avoid XSS filter bypass attacks; modern browsers
        # ignore this header entirely.
        # ----------------------------------------------------------
        response.headers["X-XSS-Protection"] = "0"

        return response
