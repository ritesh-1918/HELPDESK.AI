"""
Query sanitization helpers for ticket search.

The application talks to Postgres exclusively through the Supabase/PostgREST
client, which already binds every filter value as a parameter (no string
interpolation reaches the database). These helpers harden the *input* boundary
so user-supplied search parameters cannot smuggle SQL metacharacters, oversized
payloads, or control characters into the query builders.

Run with:  python -m unittest backend.tests.test_query_sanitizer -v
"""

import re

MAX_SEARCH_QUERY_LENGTH = 200
MAX_PAGE_LIMIT = 100
_DANGEROUS_PATTERN = re.compile(r"[\x00-\x1f\x7f'\"\\;<>`]+")

# PostgREST/Postgres LIKE metacharacters must be escaped so user input is
# matched literally instead of acting as a wildcard.
_LIKE_ESCAPE_RE = re.compile(r"([\\%_])")


class QuerySanitizationError(ValueError):
    """Raised when a search parameter is rejected before reaching the DB."""


def sanitize_search_query(q: str) -> str:
    """
    Validate and normalize a free-text search query.

    - Coerces to string, trims whitespace.
    - Rejects empty results and queries longer than MAX_SEARCH_QUERY_LENGTH.
    - Strips control characters and SQL metacharacters (quotes, backslashes,
      semicolons, angle brackets).
    - Escapes LIKE wildcards so the value is matched literally when used with
      PostgREST's ``ilike`` operator.

    Raises:
        QuerySanitizationError: if the query is invalid after sanitization.
    """
    if q is None:
        return ""
    if not isinstance(q, str):
        q = str(q)
    q = q.strip()
    if len(q) > MAX_SEARCH_QUERY_LENGTH:
        raise QuerySanitizationError(
            f"Search query exceeds maximum length of {MAX_SEARCH_QUERY_LENGTH} characters"
        )
    q = _DANGEROUS_PATTERN.sub("", q).strip()
    if not q:
        return ""
    return _LIKE_ESCAPE_RE.sub(r"\\\1", q)


def sanitize_enum_filter(value: str | None, allowed: set[str] | None = None) -> str | None:
    """
    Validate a fixed-vocabulary filter (e.g. status, priority).

    If ``allowed`` is provided the value must be in the set, otherwise a
    QuerySanitizationError is raised. Returns the trimmed value or ``None``.
    """
    if value is None:
        return None
    value = str(value).strip()
    if not value:
        return None
    if len(value) > 64:
        raise QuerySanitizationError("Filter value exceeds maximum length of 64 characters")
    if _DANGEROUS_PATTERN.search(value):
        raise QuerySanitizationError("Filter value contains invalid characters")
    if allowed is not None and value not in allowed:
        raise QuerySanitizationError(f"Invalid filter value: {value}")
    return value


def sanitize_identifier(value: str | None) -> str | None:
    """
    Validate a column/tenant identifier so it can never be mistaken for SQL.
    """
    if value is None:
        return None
    value = str(value).strip()
    if not value:
        return None
    if len(value) > 64:
        raise QuerySanitizationError("Identifier exceeds maximum length of 64 characters")
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", value):
        raise QuerySanitizationError("Identifier contains invalid characters")
    return value


def validate_pagination(limit: int | None, offset: int | None) -> tuple[int, int]:
    """
    Clamp pagination to sane bounds: limit in [1, MAX_PAGE_LIMIT], offset >= 0.
    """
    try:
        limit_int = int(limit if limit is not None else 50)
        offset_int = int(offset if offset is not None else 0)
    except (TypeError, ValueError):
        raise QuerySanitizationError("Invalid pagination parameters")
    if limit_int < 1:
        limit_int = 1
    if limit_int > MAX_PAGE_LIMIT:
        limit_int = MAX_PAGE_LIMIT
    if offset_int < 0:
        offset_int = 0
    return limit_int, offset_int
