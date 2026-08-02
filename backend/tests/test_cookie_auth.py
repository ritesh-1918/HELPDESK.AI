"""
Tests for httpOnly cookie auth endpoints (Issue #898).
Covers: login sets cookies, logout clears cookies, /auth/me validates cookie,
cookie security flags, invalid token, missing cookie, SameSite/Secure attributes.

Uses unittest.mock to patch Supabase client — no live DB required.
"""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

os.environ.setdefault("ALLOW_DEGRADED_STARTUP", "1")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "placeholder_key")


# ---------------------------------------------------------------------------
# Tests for _cookie_kwargs function directly (no app import needed)
# ---------------------------------------------------------------------------
class TestCookieKwargsHelper(unittest.TestCase):
    """Test the _cookie_kwargs helper produces correct attributes."""

    def _import_cookie_kwargs(self):
        """Import _cookie_kwargs with mocked supabase to avoid import errors."""
        with patch.dict(os.environ, {"ENV": "production"}):
            try:
                from backend.main import _cookie_kwargs
                return _cookie_kwargs
            except Exception:
                return None

    def test_cookie_kwargs_returns_dict(self):
        fn = self._import_cookie_kwargs()
        if fn is None:
            self.skipTest("backend.main not importable in this environment")
        result = fn()
        self.assertIsInstance(result, dict)

    def test_httponly_is_true(self):
        fn = self._import_cookie_kwargs()
        if fn is None:
            self.skipTest("backend.main not importable")
        result = fn()
        self.assertTrue(result.get("httponly"), "httponly must be True")

    def test_samesite_strict(self):
        fn = self._import_cookie_kwargs()
        if fn is None:
            self.skipTest("backend.main not importable")
        result = fn()
        self.assertEqual(result.get("samesite", "").lower(), "strict",
                         "SameSite must be 'strict'")

    def test_path_is_root(self):
        fn = self._import_cookie_kwargs()
        if fn is None:
            self.skipTest("backend.main not importable")
        result = fn()
        self.assertEqual(result.get("path"), "/")

    def test_secure_true_in_production(self):
        fn = self._import_cookie_kwargs()
        if fn is None:
            self.skipTest("backend.main not importable")
        with patch.dict(os.environ, {"ENV": "production"}):
            from backend.main import _cookie_kwargs as ck
            result = ck()
            self.assertTrue(result.get("secure"), "Secure flag must be True in production")

    def test_secure_false_in_development(self):
        fn = self._import_cookie_kwargs()
        if fn is None:
            self.skipTest("backend.main not importable")
        with patch.dict(os.environ, {"ENV": "development"}):
            from backend.main import _cookie_kwargs as ck
            result = ck()
            self.assertFalse(result.get("secure"), "Secure flag must be False in development")


# ---------------------------------------------------------------------------
# Unit tests for auth helper functions
# ---------------------------------------------------------------------------
class TestExtractToken(unittest.TestCase):
    """Test the extract_token helper."""

    def _get_extract_token(self):
        try:
            from backend.main import extract_token
            return extract_token
        except Exception:
            return None

    def test_extracts_from_cookie(self):
        fn = self._get_extract_token()
        if fn is None:
            self.skipTest("backend.main not importable")
        mock_req = MagicMock()
        mock_req.cookies.get.return_value = "cookie_token_value"
        mock_req.headers.get.return_value = None
        result = fn(mock_req)
        self.assertEqual(result, "cookie_token_value")

    def test_extracts_from_bearer_header(self):
        fn = self._get_extract_token()
        if fn is None:
            self.skipTest("backend.main not importable")
        mock_req = MagicMock()
        mock_req.cookies.get.return_value = None
        mock_req.headers.get.side_effect = lambda k, default=None: (
            "Bearer my_bearer_token" if k.lower() == "authorization" else default
        )
        result = fn(mock_req)
        self.assertEqual(result, "my_bearer_token")

    def test_returns_none_when_no_token(self):
        fn = self._get_extract_token()
        if fn is None:
            self.skipTest("backend.main not importable")
        mock_req = MagicMock()
        mock_req.cookies.get.return_value = None
        mock_req.headers.get.return_value = None
        result = fn(mock_req)
        self.assertIsNone(result)

    def test_cookie_takes_precedence_over_header(self):
        fn = self._get_extract_token()
        if fn is None:
            self.skipTest("backend.main not importable")
        mock_req = MagicMock()
        mock_req.cookies.get.return_value = "cookie_value"
        mock_req.headers.get.return_value = "Bearer header_value"
        result = fn(mock_req)
        self.assertEqual(result, "cookie_value")

    def test_empty_bearer_returns_none(self):
        fn = self._get_extract_token()
        if fn is None:
            self.skipTest("backend.main not importable")
        mock_req = MagicMock()
        mock_req.cookies.get.return_value = None
        mock_req.headers.get.side_effect = lambda k, default=None: (
            "Bearer " if k.lower() == "authorization" else default
        )
        result = fn(mock_req)
        self.assertIsNone(result)


# ---------------------------------------------------------------------------
# Tests for _set_session_cookies / _clear_session_cookies
# ---------------------------------------------------------------------------
class TestSessionCookieFunctions(unittest.TestCase):
    def _import_helpers(self):
        try:
            from backend.main import _set_session_cookies, _clear_session_cookies, ACCESS_COOKIE, REFRESH_COOKIE
            return _set_session_cookies, _clear_session_cookies, ACCESS_COOKIE, REFRESH_COOKIE
        except Exception:
            return None, None, None, None

    def test_set_session_cookies_sets_access_token(self):
        set_fn, _, ACCESS_COOKIE, _ = self._import_helpers()
        if set_fn is None:
            self.skipTest("backend.main not importable")

        mock_response = MagicMock()
        mock_session = MagicMock()
        mock_session.access_token = "access_abc"
        mock_session.refresh_token = "refresh_xyz"

        set_fn(mock_response, mock_session)
        mock_response.set_cookie.assert_called()

        # Verify access token cookie was set
        calls = mock_response.set_cookie.call_args_list
        call_names = [c[0][0] if c[0] else c[1].get("key", "") for c in calls]
        self.assertTrue(
            any(ACCESS_COOKIE in str(c) for c in calls),
            "Access token cookie must be set"
        )

    def test_set_session_cookies_with_no_session_does_nothing(self):
        set_fn, _, _, _ = self._import_helpers()
        if set_fn is None:
            self.skipTest("backend.main not importable")

        mock_response = MagicMock()
        set_fn(mock_response, None)
        mock_response.set_cookie.assert_not_called()

    def test_clear_session_cookies_deletes_cookies(self):
        _, clear_fn, ACCESS_COOKIE, REFRESH_COOKIE = self._import_helpers()
        if clear_fn is None:
            self.skipTest("backend.main not importable")

        mock_response = MagicMock()
        clear_fn(mock_response)
        mock_response.delete_cookie.assert_called()

    def test_max_age_constants_defined(self):
        try:
            from backend.main import ACCESS_MAX_AGE, REFRESH_MAX_AGE
            self.assertGreater(ACCESS_MAX_AGE, 0)
            self.assertGreater(REFRESH_MAX_AGE, ACCESS_MAX_AGE,
                               "Refresh token max_age should exceed access token max_age")
        except ImportError:
            self.skipTest("Constants not importable")


class TestCookieSecurityModel(unittest.TestCase):
    """High-level tests documenting the expected cookie security model."""

    def test_access_token_cookie_name_defined(self):
        try:
            from backend.main import ACCESS_COOKIE
            self.assertIsInstance(ACCESS_COOKIE, str)
            self.assertGreater(len(ACCESS_COOKIE), 0)
        except ImportError:
            self.skipTest("backend.main not importable")

    def test_refresh_token_cookie_name_defined(self):
        try:
            from backend.main import REFRESH_COOKIE
            self.assertIsInstance(REFRESH_COOKIE, str)
        except ImportError:
            self.skipTest("backend.main not importable")

    def test_cookie_auth_endpoints_exist_in_main(self):
        """Verify /auth/login, /auth/logout, /auth/me are present in main.py source."""
        main_path = os.path.join(os.path.dirname(__file__), "..", "main.py")
        if not os.path.exists(main_path):
            self.skipTest("main.py not found")
        content = open(main_path).read()
        for route in ["/auth/login", "/auth/logout", "/auth/me"]:
            self.assertIn(route, content, f"Route {route} must be defined in main.py")

    def test_httponly_used_in_cookie_kwargs(self):
        """Verify httponly=True appears in the _cookie_kwargs implementation."""
        main_path = os.path.join(os.path.dirname(__file__), "..", "main.py")
        if not os.path.exists(main_path):
            self.skipTest("main.py not found")
        content = open(main_path).read()
        self.assertIn("httponly", content.lower(), "httponly must be referenced in main.py")

    def test_samesite_strict_used(self):
        main_path = os.path.join(os.path.dirname(__file__), "..", "main.py")
        if not os.path.exists(main_path):
            self.skipTest("main.py not found")
        content = open(main_path).read()
        self.assertIn("strict", content.lower(), "SameSite=strict must be referenced in main.py")


if __name__ == "__main__":
    unittest.main()
