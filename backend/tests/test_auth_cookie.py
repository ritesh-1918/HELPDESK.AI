"""Unit tests for auth cookie token extraction (issue #130)."""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.auth_cookie import ACCESS_COOKIE, extract_token


class _FakeRequest:
    def __init__(self, *, cookies=None, headers=None):
        self.cookies = cookies or {}
        self.headers = headers or {}


def test_extract_token_prefers_http_only_cookie():
    request = _FakeRequest(
        cookies={ACCESS_COOKIE: "cookie-jwt"},
        headers={"Authorization": "Bearer header-jwt"},
    )
    assert extract_token(request) == "cookie-jwt"


def test_extract_token_falls_back_to_bearer_header():
    request = _FakeRequest(headers={"Authorization": "Bearer header-jwt"})
    assert extract_token(request) == "header-jwt"


def test_extract_token_returns_none_when_missing():
    request = _FakeRequest()
    assert extract_token(request) is None
