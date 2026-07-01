import os
import re
from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)

# Default limits
DEFAULT_AI = "10/minute"
DEFAULT_TICKETS = "30/minute"
DEFAULT_AUTH = "5/minute"

LIMIT_REGEX = re.compile(r"^\d+/(second|minute|hour|day)$")

def _parse_limit(env_name: str, default: str) -> str:
    val = os.getenv(env_name)
    if val is None:
        return default
    val = val.strip()
    if not val:
        return default
    if LIMIT_REGEX.match(val):
        return val
    return default

# Use module-level __getattr__ to read env vars dynamically on every access.
# This prevents cached module values from failing unit tests that use patch.dict.
def __getattr__(name: str) -> str:
    if name == "RATE_LIMIT_AI":
        return _parse_limit("RATE_LIMIT_AI", DEFAULT_AI)
    elif name == "RATE_LIMIT_TICKETS":
        return _parse_limit("RATE_LIMIT_TICKETS", DEFAULT_TICKETS)
    elif name == "RATE_LIMIT_AUTH":
        return _parse_limit("RATE_LIMIT_AUTH", DEFAULT_AUTH)
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")

def get_all() -> dict[str, str]:
    # Use the globals/getattr lookup to retrieve the current dynamic values
    return {
        "ai": __getattr__("RATE_LIMIT_AI"),
        "tickets": __getattr__("RATE_LIMIT_TICKETS"),
        "auth": __getattr__("RATE_LIMIT_AUTH"),
    }

def get_retry_after_seconds(limit_str: str) -> int:
    if not limit_str or "/" not in limit_str:
        return 60
    parts = limit_str.split("/")
    period = parts[-1].lower()
    if period == "second":
        return 1
    elif period == "minute":
        return 60
    elif period == "hour":
        return 3600
    elif period == "day":
        return 86400
    return 60
