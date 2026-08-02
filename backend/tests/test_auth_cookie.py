"""Unit tests for auth cookie session management (issue #898)."""

from __future__ import annotations

import asyncio
import os
import sys
import hmac

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.auth_cookie import (
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    extract_token,
    get_user_role,
    require_roles,
    _cookie_kwargs,
    _set_session_cookies,
    _clear_session_cookies,
)


class _FakeRequest:
    """Minimal Request stand-in for unit testing."""

    def __init__(self, *, cookies: dict | None = None, headers: dict | None = None):
        self.cookies = cookies or {}
        self.headers = headers or {}


class _FakeResponse:
    """Minimal Response stand-in to capture set_cookie / delete_cookie calls."""

    def __init__(self):
        self.set_cookies: list[dict] = []
        self.deleted_cookies: list[tuple[str, dict]] = []

    def set_cookie(self, key: str, value: str, **kwargs):
        self.set_cookies.append({"key": key, "value": value, **kwargs})

    def delete_cookie(self, key: str, **kwargs):
        self.deleted_cookies.append((key, kwargs))


class _FakeSession:
    """Minimal Supabase session stand-in."""

    def __init__(self, access_token: str = "acc-tok", refresh_token: str = "ref-tok"):
        self.access_token = access_token
        self.refresh_token = refresh_token


# ---------------------------------------------------------------------------
# RBAC role helper tests
# ---------------------------------------------------------------------------


def test_get_user_role_defaults_to_user():
    assert get_user_role({}) == "user"
    assert get_user_role(None) == "user"


def test_get_user_role_prefers_direct_role_and_normalizes():
    assert get_user_role({"role": "Company-Admin"}) == "company_admin"


def test_get_user_role_reads_supabase_user_metadata():
    user = {"user_metadata": {"role": "support-agent"}}
    assert get_user_role(user) == "support_agent"


def test_get_user_role_reads_supabase_app_metadata():
    user = {"app_metadata": {"user_role": "Master-Admin"}}
    assert get_user_role(user) == "master_admin"


def test_require_roles_allows_matching_role():
    dependency = require_roles("admin")
    result = asyncio.run(dependency({"user_metadata": {"role": "admin"}}))
    assert result == {"user_metadata": {"role": "admin"}}


def test_require_roles_rejects_non_matching_role():
    dependency = require_roles("admin")
    try:
        asyncio.run(dependency({"user_metadata": {"role": "user"}}))
    except Exception as exc:
        assert exc.status_code == 403
        assert exc.detail == "Insufficient role permissions"
    else:
        raise AssertionError("Expected HTTPException")


# ---------------------------------------------------------------------------
# extract_token tests
# ---------------------------------------------------------------------------

def test_extract_token_prefers_http_only_cookie():
    """Cookie takes precedence over Authorization header."""
    request = _FakeRequest(
        cookies={ACCESS_COOKIE: "cookie-jwt"},
        headers={"Authorization": "Bearer header-jwt"},
    )
    assert extract_token(request) == "cookie-jwt"


def test_extract_token_falls_back_to_bearer_header():
    """When no cookie is present, falls back to Authorization header."""
    request = _FakeRequest(headers={"Authorization": "Bearer header-jwt"})
    assert extract_token(request) == "header-jwt"


def test_extract_token_returns_none_when_missing():
    """Returns None when neither cookie nor header is present."""
    request = _FakeRequest()
    assert extract_token(request) is None


def test_extract_token_case_insensitive_header():
    """Authorization header lookup is case-insensitive."""
    request = _FakeRequest(headers={"authorization": "Bearer lower-case-jwt"})
    assert extract_token(request) == "lower-case-jwt"


def test_extract_token_rejects_malformed_bearer():
    """Returns None for malformed Authorization header."""
    request = _FakeRequest(headers={"Authorization": "Token abc"})
    assert extract_token(request) is None


def test_extract_token_rejects_empty_bearer():
    """Returns None for empty Bearer value."""
    request = _FakeRequest(headers={"Authorization": "Bearer "})
    assert extract_token(request) is None


# ---------------------------------------------------------------------------
# _cookie_kwargs tests
# ---------------------------------------------------------------------------

def test_cookie_kwargs_defaults():
    """Default kwargs include httponly, secure based on ENV."""
    kwargs = _cookie_kwargs()
    assert kwargs["httponly"] is True
    assert kwargs["samesite"] == "strict"
    assert kwargs["path"] == "/"


def test_cookie_kwargs_secure_in_production(monkeypatch):
    """secure=True when ENV is not 'development'."""
    monkeypatch.setenv("ENV", "production")
    kwargs = _cookie_kwargs()
    assert kwargs["secure"] is True


def test_cookie_kwargs_not_secure_in_development(monkeypatch):
    """secure=False when ENV=development."""
    monkeypatch.setenv("ENV", "development")
    kwargs = _cookie_kwargs()
    assert kwargs["secure"] is False


# ---------------------------------------------------------------------------
# _set_session_cookies tests
# ---------------------------------------------------------------------------

def test_set_session_cookies_sets_both_cookies():
    """Both access and refresh cookies are set when session has both tokens."""
    resp = _FakeResponse()
    session = _FakeSession(access_token="acc123", refresh_token="ref456")
    _set_session_cookies(resp, session)

    keys = [c["key"] for c in resp.set_cookies]
    assert ACCESS_COOKIE in keys
    assert REFRESH_COOKIE in keys


def test_set_session_cookies_skips_refresh_when_missing():
    """Only access cookie is set when session has no refresh_token."""
    resp = _FakeResponse()
    session = _FakeSession(access_token="acc123", refresh_token=None)
    _set_session_cookies(resp, session)

    keys = [c["key"] for c in resp.set_cookies]
    assert ACCESS_COOKIE in keys
    assert REFRESH_COOKIE not in keys


def test_set_session_cookies_noop_on_none_session():
    """No cookies are set when session is None."""
    resp = _FakeResponse()
    _set_session_cookies(resp, None)
    assert len(resp.set_cookies) == 0


def test_set_session_cookies_noop_on_empty_access_token():
    """No cookies are set when session has empty access_token."""
    resp = _FakeResponse()
    session = _FakeSession(access_token="", refresh_token="ref")
    _set_session_cookies(resp, session)
    assert len(resp.set_cookies) == 0


def test_set_session_cookies_max_age():
    """Access cookie max_age is 1 hour; refresh cookie max_age is 7 days."""
    resp = _FakeResponse()
    session = _FakeSession()
    _set_session_cookies(resp, session)

    access_cookie = next(c for c in resp.set_cookies if c["key"] == ACCESS_COOKIE)
    refresh_cookie = next(c for c in resp.set_cookies if c["key"] == REFRESH_COOKIE)

    assert access_cookie["max_age"] == 3600
    assert refresh_cookie["max_age"] == 604800


# ---------------------------------------------------------------------------
# _clear_session_cookies tests
# ---------------------------------------------------------------------------

def test_clear_session_cookies_deletes_both():
    """Both cookies are deleted on clear."""
    resp = _FakeResponse()
    _clear_session_cookies(resp)

    deleted_keys = [k for k, _ in resp.deleted_cookies]
    assert ACCESS_COOKIE in deleted_keys
    assert REFRESH_COOKIE in deleted_keys


# ---------------------------------------------------------------------------
# CSRF / cookie security property tests
# ---------------------------------------------------------------------------

def test_cookie_kwargs_httponly_is_true():
    """Auth cookies must always be HttpOnly."""
    kwargs = _cookie_kwargs()
    assert kwargs["httponly"] is True


def test_cookie_kwargs_samesite_is_strict():
    """Auth cookies must use SameSite=Strict for CSRF protection."""
    kwargs = _cookie_kwargs()
    assert kwargs["samesite"] == "strict"


def test_extract_token_prefers_cookie_over_header_regression():
    """Regression: cookie always wins even if header has a longer token."""
    request = _FakeRequest(
        cookies={ACCESS_COOKIE: "short"},
        headers={"Authorization": "Bearer a-very-long-token-value"},
    )
    assert extract_token(request) == "short"
