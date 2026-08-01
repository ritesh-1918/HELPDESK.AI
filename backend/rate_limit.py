"""
Rate limiting helpers for the FastAPI backend (issue #3950).

Centralizes the slowapi configuration so that sensitive endpoints (auth and
ticket creation) are protected against brute-force credential attacks and
automated spam. The module intentionally stays dependency-light (FastAPI +
slowapi only) so unit tests can exercise the limiter without importing the
PyTorch / Transformers model stack.
"""

import re

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded

# Strict budgets for sensitive routes.
AUTH_LOGIN_LIMIT = "5/minute"
TICKET_CREATE_LIMIT = "10/minute"

_UNIT_SECONDS = {
    "second": 1,
    "minute": 60,
    "hour": 3600,
    "day": 86400,
}


def client_ip_key(request: Request) -> str:
    """
    Resolve the client IP used for rate-limit bucketing.

    Honors proxy headers so deployments behind a reverse proxy or load
    balancer still rate-limit per real client:
      1. ``X-Forwarded-For`` -> left-most address (set by the trusted proxy).
      2. ``X-Real-IP``       -> common nginx-style header.
      3. ``request.client.host`` -> direct-connection fallback.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip() or "unknown"
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip() or "unknown"
    if request.client:
        return request.client.host
    return "unknown"


def _parse_limit_spec(spec: str) -> tuple[int, int] | None:
    """Parse a slowapi spec like ``'5 per 1 minute'`` into ``(count, window_s)``."""
    match = re.search(r"(\d+)\s+per\s+(\d+)\s+(second|minute|hour|day)s?", spec)
    if not match:
        return None
    count = int(match.group(1))
    unit_count = int(match.group(2))
    unit = match.group(3)
    window = unit_count * _UNIT_SECONDS.get(unit, 60)
    return count, max(1, window)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Standardized 429 response with a ``Retry-After`` header.

    The retry window is estimated from the offending limit spec so clients can
    back off without polling the endpoint.
    """
    retry_after = 60
    parsed = _parse_limit_spec(str(getattr(exc, "detail", "")))
    if parsed:
        count, window = parsed
        retry_after = max(1, window // max(count, 1))
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests. Please retry after the indicated window.",
            "retry_after": retry_after,
        },
        headers={"Retry-After": str(retry_after)},
    )


def build_limiter() -> Limiter:
    """Create the application-wide slowapi limiter using the proxy-aware key."""
    return Limiter(key_func=client_ip_key)
