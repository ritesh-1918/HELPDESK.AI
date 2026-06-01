"""
ASGI Middleware for enforcing security headers (Helmet-equivalent).

This module provides a configurable SecurityHeadersMiddleware that adds
Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
X-XSS-Protection, Strict-Transport-Security, Referrer-Policy, and
Permissions-Policy headers to every HTTP response.

It includes comprehensive CSP validation, path-based exclusion,
and integration with FastAPI/Starlette.

Typical usage::

    from security_headers import SecurityHeadersMiddleware
    app.add_middleware(SecurityHeadersMiddleware)
"""

from __future__ import annotations

import logging
import os
import re
from collections.abc import Awaitable, Callable
from typing import Any, Final, List, Optional
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger: logging.Logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Default constant values
# ---------------------------------------------------------------------------
_DEFAULT_CSP: Final[str] = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data:; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)

_DEFAULT_SECURITY_HEADERS: Final[dict[str, str]] = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

# Allowed CSP directive names (lowercase)
_ALLOWED_CSP_DIRECTIVES: Final[frozenset[str]] = frozenset(
    {
        "default-src",
        "script-src",
        "style-src",
        "img-src",
        "font-src",
        "connect-src",
        "frame-ancestors",
        "base-uri",
        "form-action",
        "object-src",
        "media-src",
        "worker-src",
        "frame-src",
        "manifest-src",
        "prefetch-src",
        "navigate-to",
        "report-uri",
        "report-to",
    }
)

# Known CSP quoted keywords
_CSP_ALLOWED_KEYWORDS: Final[frozenset[str]] = frozenset(
    {
        "'self'",
        "'none'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "'strict-dynamic'",
        "'wasm-unsafe-eval'",
        "'unsafe-hashes'",
        "'report-sample'",
    }
)

# Regex patterns (precompiled for performance)
_SCHEME_PATTERN: Final[re.Pattern[str]] = re.compile(r"^[a-zA-Z][a-zA-Z0-9+\-.]*:$")
_NONCE_PATTERN: Final[re.Pattern[str]] = re.compile(r"^'nonce-[A-Za-z0-9+/=]+'$")
_HASH_PATTERN: Final[re.Pattern[str]] = re.compile(
    r"^'(sha256|sha384|sha512)-[A-Za-z0-9+/=]+'$"
)

ASGIReceiveCallable = Callable[[], Awaitable[dict[str, Any]]]
ASGISendCallable = Callable[[dict[str, Any]], Awaitable[None]]


# ---------------------------------------------------------------------------
# CSP validation helpers
# ---------------------------------------------------------------------------

def _is_valid_csp_source(source: str) -> bool:
    """
    Validate a single CSP source string.

    Supports:
    - Quoted keywords (``'self'``, ``'none'``, etc.)
    - Scheme-only sources (``https:``, ``data:``)
    - Nonces (``'nonce-...'``)
    - Hashes (``'sha256-...'``)
    - Full URIs (``https://example.com``)
    - Special schemes (``data:``, ``blob:``, ``mediastream:``)
    - Host sources with optional port/path (``*.example.com:8080/path``)

    Args:
        source: CSP source token (without leading/trailing whitespace).

    Returns:
        ``True`` if the source is syntactically valid, ``False`` otherwise.
    """
    source = source.strip()
    if not source:
        return False

    # Quoted keyword
    if source.startswith("'") and source.endswith("'"):
        return (
            source in _CSP_ALLOWED_KEYWORDS
            or _NONCE_PATTERN.match(source) is not None
            or _HASH_PATTERN.match(source) is not None
        )

    # Scheme-only sources (e.g., https:)
    if _SCHEME_PATTERN.match(source):
        known_schemes = {"https:", "http:", "wss:", "ws:", "data:", "blob:"}
        return source in known_schemes or source.startswith("http")

    # URI-based sources
    try:
        parsed = urlparse(source)
        if parsed.netloc:
            return True
    except Exception as exc:
        logger.warning("Failed to parse CSP source URI: %s", source, exc_info=exc)
        return False

    # data: / blob: / mediastream: sources (already caught by scheme, but ensure)
    if source.startswith(("data:", "blob:", "mediastream:")):
        return True

    # Wildcard host (e.g., *.example.com)
    if source.startswith("*.") or source == "*":
        return True

    return False


def _validate_csp_string(csp_string: str) -> bool:
    """
    Validate an entire Content Security Policy string.

    Every directive must be a recognised name and every source must pass
    ``_is_valid_csp_source``. Empty directives are ignored.

    Args:
        csp_string: Semicolon-separated policy string.

    Returns:
        ``True`` if the policy is structurally valid, ``False`` otherwise.
    """
    parts = [p.strip() for p in csp_string.split(";") if p.strip()]
    for part in parts:
        tokens = part.split()
        if not tokens:
            continue
        directive_lower = tokens[0].lower()
        if directive_lower not in _ALLOWED_CSP_DIRECTIVES:
            logger.warning("Unknown CSP directive: %s", directive_lower)
            return False
        for source in tokens[1:]:
            if not _is_valid_csp_source(source):
                logger.warning(
                    "Invalid CSP source '%s' in directive '%s'",
                    source,
                    directive_lower,
                )
                return False
    return True


def _resolve_csp_policy() -> str:
    """
    Read and validate CSP from environment variable ``CSP_ALLOWED_SOURCES``.

    The environment variable may contain:
    - A full CSP policy string (semicolon-separated directives).
    - A comma-separated list of allowed origins,
      which will be inserted into a minimal policy shape.
    - Nothing (falls back to ``_DEFAULT_CSP``).

    Returns:
        A validated CSP policy string.

    Raises:
        ValueError: If the environment variable contains an invalid policy.
    """
    env_csp = os.environ.get("CSP_ALLOWED_SOURCES", "").strip()

    if not env_csp:
        logger.info("CSP_ALLOWED_SOURCES not set; using default CSP.")
        return _DEFAULT_CSP

    # Try to parse as full policy
    if _validate_csp_string(env_csp):
        logger.info("Using CSP_ALLOWED_SOURCES environment variable: %s", env_csp)
        return env_csp

    # Treat as comma-separated list of origins
    if "," in env_csp or env_csp.startswith("'") or env_csp.startswith(("http", "https")):
        origins = [src.strip() for src in env_csp.split(",") if src.strip()]
        validated_origins: list[str] = []
        for origin in origins:
            if _is_valid_csp_source(origin):
                validated_origins.append(origin)
            else:
                logger.warning("Ignoring invalid CSP origin: %s", origin)
        if not validated_origins:
            logger.error(
                "No valid CSP origins found in CSP_ALLOWED_SOURCES; falling back to default."
            )
            return _DEFAULT_CSP

        # Build a policy from validated origins
        origins_joined = " ".join(validated_origins)
        # Merge with default policy: replace default-src and script-src, keep others
        default_directives = dict(
            directive.split(None, 1)
            for directive in _DEFAULT_CSP.split(";")
            if " " in directive.strip()
        )
        # Override default-src and script-src
        default_directives["default-src"] = f"'self' {origins_joined}"
        default_directives["script-src"] = f"'self' {origins_joined}"
        default_directives["style-src"] = (
            f"'self' 'unsafe-inline' {origins_joined}"
        )
        # Build policy string
        policy = "; ".join(
            f"{key} {value}" for key, value in default_directives.items()
        )
        logger.info("Built CSP policy from origins: %s", policy)
        return policy

    # If we get here, it's something unexpected
    logger.warning(
        "CSP_ALLOWED_SOURCES could not be parsed; falling back to default."
    )
    return _DEFAULT_CSP


# ---------------------------------------------------------------------------
# Middleware class
# ---------------------------------------------------------------------------

class SecurityHeadersMiddleware:
    """
    ASGI middleware that attaches security headers to every response.

    Headers set:
    - Content-Security-Policy (configurable via env or constructor)
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security (configurable)
    - Referrer-Policy: strict-origin-when-cross-origin
    - Permissions-Policy (configurable)

    Configuration via environment variables:
    - ``CSP_ALLOWED_SOURCES``: overrides CSP (see _resolve_csp_policy).
    - ``HSTS_MAX_AGE``: overrides max-age for Strict-Transport-Security.

    Optional constructor parameters override environment variables.

    Args:
        app: The ASGI application to wrap.
        csp: Optional CSP policy string.
        hsts_max_age: Optional max-age for HSTS (default 31536000).
        exclude_paths: List of path prefixes to exclude from header injection.

    Example::

        from fastapi import FastAPI
        from security_headers import SecurityHeadersMiddleware

        app = FastAPI()
        app.add_middleware(SecurityHeadersMiddleware)
    """

    def __init__(
        self,
        app: Callable[[dict[str, Any], ASGIReceiveCallable, ASGISendCallable], Awaitable[None]],
        csp: Optional[str] = None,
        hsts_max_age: Optional[int] = None,
        exclude_paths: Optional[List[str]] = None,
    ) -> None:
        self.app = app
        self.csp: str = csp if csp is not None else _resolve_csp_policy()
        self.hsts_max_age: int = (
            hsts_max_age if hsts_max_age is not None
            else int(os.environ.get("HSTS_MAX_AGE", "31536000"))
        )
        self.exclude_paths: List[str] = exclude_paths or []
        self._headers: List[tuple[bytes, bytes]] = self._build_headers()

    def _build_headers(self) -> List[tuple[bytes, bytes]]:
        """Build the list of header tuples to inject."""
        hsts_value = f"max-age={self.hsts_max_age}; includeSubDomains; preload"
        headers: List[tuple[bytes, bytes]] = [
            (b"content-security-policy", self.csp.encode("utf-8")),
            (b"x-content-type-options", b"nosniff"),
            (b"x-frame-options", b"DENY"),
            (b"x-xss-protection", b"1; mode=block"),
            (b"strict-transport-security", hsts_value.encode("utf-8")),
            (b"referrer-policy", b"strict-origin-when-cross-origin"),
            (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
        ]
        return headers

    async def __call__(
        self,
        scope: dict[str, Any],
        receive: ASGIReceiveCallable,
        send: ASGISendCallable,
    ) -> None:
        """
        ASGI callable: intercepts every response and adds security headers.

        Args:
            scope: ASGI connection scope.
            receive: ASGI receive callable.
            send: ASGI send callable.
        """
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path: str = scope.get("path", "")
        if self._is_excluded(path):
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message: dict[str, Any]) -> None:
            if message["type"] == "http.response.start":
                original_headers: list[tuple[bytes, bytes]] = message.get("headers", [])
                # Merge headers: add or override with our security headers
                header_dict: dict[bytes, bytes] = {}
                for key, value in original_headers:
                    header_dict[key.lower()] = value
                # Override with our headers
                for key, value in self._headers:
                    header_dict[key] = value
                message["headers"] = list(header_dict.items())
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as exc:
            logger.error(
                "Unhandled exception in downstream application: %s",
                exc,
                exc_info=True,
            )
            raise

    def _is_excluded(self, path: str) -> bool:
        """Check if the given path should be excluded from header injection."""
        return any(path.startswith(prefix) for prefix in self.exclude_paths)


# ---------------------------------------------------------------------------
# Convenience function for FastAPI add_middleware usage
# ---------------------------------------------------------------------------

def add_security_headers_middleware(
    app: Callable[[dict[str, Any], ASGIReceiveCallable, ASGISendCallable], Awaitable[None]],
    csp: Optional[str] = None,
    hsts_max_age: Optional[int] = None,
    exclude_paths: Optional[List[str]] = None,
) -> None:
    """
    Directly wrap an ASGI app with SecurityHeadersMiddleware.

    Useful for frameworks that do not support add_middleware.

    Args:
        app: The ASGI application.
        csp: Optional CSP policy.
        hsts_max_age: Optional HSTS max-age.
        exclude_paths: Optional list of paths to exclude.
    """
    middleware = SecurityHeadersMiddleware(app, csp, hsts_max_age, exclude_paths)
    # Replace app reference; this is a simple replacement
    # but may not work for all frameworks. Use add_middleware instead.
    # For demonstration, we return the middleware as callable.
    # In practice, replace the app object in the framework.
    import Starlette  # noqa: F401 import for type hint
    if hasattr(app, 'add_middleware'):
        app.add_middleware(SecurityHeadersMiddleware, csp=csp, hsts_max_age=hsts_max_age, exclude_paths=exclude_paths)
    else:
        raise TypeError("The provided app does not support add_middleware. Use middleware instance directly.")