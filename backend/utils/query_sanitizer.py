"""
query_sanitizer.py — Input sanitization for query parameters to prevent SQL injection.

Even though Supabase PostgREST uses parameterized queries internally,
this utility enforces an additional layer of validation and sanitization
on all user-supplied query parameters before they reach the ORM layer.
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Patterns that indicate SQL injection attempts
_SQL_INJECTION_PATTERNS = re.compile(
    r"""
    (--|;|/\*|\*/|xp_|UNION\s+SELECT|INSERT\s+INTO|DROP\s+TABLE|
    DELETE\s+FROM|UPDATE\s+SET|ALTER\s+TABLE|EXEC\s*\(|
    CAST\s*\(|CONVERT\s*\(|DECLARE\s+@|WAITFOR\s+DELAY|
    SLEEP\s*\(|BENCHMARK\s*\(|OR\s+1\s*=\s*1|AND\s+1\s*=\s*1|
    '\s*OR\s*'|'\s*AND\s*'|1=1|1\s*=\s*1)
    """,
    re.IGNORECASE | re.VERBOSE,
)

# UUID pattern
_UUID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)

# Safe string pattern — alphanumeric, spaces, hyphens, underscores, dots, @
_SAFE_STRING_PATTERN = re.compile(r"^[\w\s\-_.@]+$")

MAX_PARAM_LENGTH = 500


def sanitize_string(value: Optional[str], field_name: str = "parameter") -> Optional[str]:
    """
    Sanitize a string query parameter.

    - Strips leading/trailing whitespace
    - Enforces max length
    - Rejects SQL injection patterns
    - Returns None if value is None or empty after stripping

    Raises:
        ValueError if the value contains SQL injection patterns
    """
    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    if len(value) > MAX_PARAM_LENGTH:
        logger.warning(f"[QuerySanitizer] {field_name} exceeds max length, truncating.")
        value = value[:MAX_PARAM_LENGTH]

    if _SQL_INJECTION_PATTERNS.search(value):
        logger.warning(f"[QuerySanitizer] Potential SQL injection in {field_name}: {value[:50]!r}")
        raise ValueError(f"Invalid characters detected in {field_name}.")

    return value


def sanitize_uuid(value: Optional[str], field_name: str = "id") -> Optional[str]:
    """
    Validate and sanitize a UUID parameter.

    Raises:
        ValueError if value is not a valid UUID format
    """
    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    if not _UUID_PATTERN.match(value):
        logger.warning(f"[QuerySanitizer] Invalid UUID format for {field_name}: {value[:50]!r}")
        raise ValueError(f"Invalid UUID format for {field_name}.")

    return value.lower()


def sanitize_int(value: Optional[int], field_name: str = "limit", min_val: int = 0, max_val: int = 1000) -> int:
    """
    Validate and clamp an integer parameter within safe bounds.
    """
    if value is None:
        return min_val

    try:
        value = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be an integer.")

    if value < min_val:
        return min_val
    if value > max_val:
        return max_val

    return value


def sanitize_enum(value: Optional[str], allowed: list, field_name: str = "field") -> Optional[str]:
    """
    Validate that a string parameter is within an allowed set of values.

    Raises:
        ValueError if value is not in allowed set
    """
    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    if value not in allowed:
        raise ValueError(f"Invalid value '{value}' for {field_name}. Allowed: {allowed}")

    return value