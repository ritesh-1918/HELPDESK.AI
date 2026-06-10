import os
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Environment configuration variables tested by TestRateLimitConfig
RATE_LIMIT_AI = os.getenv("RATE_LIMIT_AI", "10/minute")
RATE_LIMIT_TICKETS = os.getenv("RATE_LIMIT_TICKETS", "30/minute")
RATE_LIMIT_AUTH = os.getenv("RATE_LIMIT_AUTH", "5/minute")


def validate_rate_limit(val: str, default: str) -> str:
    """Validate rate limit string format."""
    if not val or "/" not in val:
        return default
    parts = val.split("/")
    if len(parts) != 2:
        return default
    try:
        count = int(parts[0])
        if count < 0:
            return default
    except ValueError:
        return default
    if parts[1] not in ("second", "minute", "hour", "day"):
        return default
    return val


RATE_LIMIT_AI = validate_rate_limit(os.getenv("RATE_LIMIT_AI"), "10/minute")
RATE_LIMIT_TICKETS = validate_rate_limit(os.getenv("RATE_LIMIT_TICKETS"), "30/minute")
RATE_LIMIT_AUTH = validate_rate_limit(os.getenv("RATE_LIMIT_AUTH"), "5/minute")


def get_all() -> dict:
    """Return all active rate configurations."""
    return {
        "ai": RATE_LIMIT_AI,
        "tickets": RATE_LIMIT_TICKETS,
        "auth": RATE_LIMIT_AUTH
    }


def get_retry_after_seconds(limit_str: str) -> int:
    """Compute period seconds from configuration strings."""
    if not limit_str or "/" not in limit_str:
        return 60
    period = limit_str.split("/")[1]
    mapping = {"second": 1, "minute": 60, "hour": 3600, "day": 86400}
    return mapping.get(period, 60)
