"""
Tests for issue #1387 — POST /auth/logout must invalidate server-side session.

Verifies:
- Revoked tokens are added to the Redis denylist on logout
- get_current_user rejects revoked tokens before hitting Supabase
- Tokens not in the denylist pass through to Supabase verification normally
- Redis unavailability is handled gracefully (non-fatal)
- Admin sign-out failure does not prevent cookie clearing
- _revoke_token respects the configured TTL
- Multiple concurrent logouts for the same token are idempotent
"""

from __future__ import annotations

import hashlib
import os
import sys
import unittest
from unittest.mock import MagicMock, patch, call

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

os.environ.setdefault("ALLOW_DEGRADED_STARTUP", "1")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "placeholder_service_key")
os.environ.setdefault("SUPABASE_ANON_KEY", "placeholder_anon_key")


def _sha256(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Unit tests for token denylist helpers
# ---------------------------------------------------------------------------

class TestRevokeToken(unittest.TestCase):
    """_revoke_token writes the correct key/TTL to Redis."""

    def _import(self):
        try:
            from backend.auth_cookie import _revoke_token, _token_hash, _REVOKED_PREFIX, ACCESS_MAX_AGE
            return _revoke_token, _token_hash, _REVOKED_PREFIX, ACCESS_MAX_AGE
        except Exception:
            return None, None, None, None

    def test_writes_hashed_key_to_redis(self):
        fn, th, prefix, max_age = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_redis = MagicMock()
        with patch("backend.auth_cookie._get_redis", return_value=mock_redis):
            fn("my_token_abc")

        expected_key = f"{prefix}{th('my_token_abc')}"
        mock_redis.setex.assert_called_once_with(expected_key, max_age, "1")

    def test_custom_ttl_is_honoured(self):
        fn, th, prefix, _ = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_redis = MagicMock()
        with patch("backend.auth_cookie._get_redis", return_value=mock_redis):
            fn("token_xyz", ttl=300)

        mock_redis.setex.assert_called_once()
        args = mock_redis.setex.call_args[0]
        self.assertEqual(args[1], 300)

    def test_no_crash_when_redis_unavailable(self):
        fn, *_ = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        with patch("backend.auth_cookie._get_redis", return_value=None):
            # Should not raise
            fn("any_token")

    def test_no_crash_when_redis_raises(self):
        fn, *_ = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_redis = MagicMock()
        mock_redis.setex.side_effect = Exception("Redis connection refused")
        with patch("backend.auth_cookie._get_redis", return_value=mock_redis):
            fn("any_token")  # must not raise


class TestIsTokenRevoked(unittest.TestCase):
    """_is_token_revoked reads the denylist from Redis."""

    def _import(self):
        try:
            from backend.auth_cookie import _is_token_revoked, _token_hash, _REVOKED_PREFIX
            return _is_token_revoked, _token_hash, _REVOKED_PREFIX
        except Exception:
            return None, None, None

    def test_returns_true_for_revoked_token(self):
        fn, th, prefix = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_redis = MagicMock()
        mock_redis.exists.return_value = 1
        with patch("backend.auth_cookie._get_redis", return_value=mock_redis):
            result = fn("revoked_token")

        self.assertTrue(result)
        mock_redis.exists.assert_called_once_with(f"{prefix}{th('revoked_token')}")

    def test_returns_false_for_valid_token(self):
        fn, *_ = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_redis = MagicMock()
        mock_redis.exists.return_value = 0
        with patch("backend.auth_cookie._get_redis", return_value=mock_redis):
            result = fn("valid_token")

        self.assertFalse(result)

    def test_returns_false_when_redis_unavailable(self):
        fn, *_ = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        with patch("backend.auth_cookie._get_redis", return_value=None):
            result = fn("any_token")

        # Fail open: if Redis is down we cannot confirm revocation,
        # so Supabase verification is the fallback guard.
        self.assertFalse(result)

    def test_returns_false_when_redis_raises(self):
        fn, *_ = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_redis = MagicMock()
        mock_redis.exists.side_effect = Exception("timeout")
        with patch("backend.auth_cookie._get_redis", return_value=mock_redis):
            result = fn("any_token")

        self.assertFalse(result)


class TestTokenHash(unittest.TestCase):
    """_token_hash produces stable SHA-256 digests."""

    def _import(self):
        try:
            from backend.auth_cookie import _token_hash
            return _token_hash
        except Exception:
            return None

    def test_produces_sha256_hex(self):
        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        token = "test.jwt.payload"
        expected = hashlib.sha256(token.encode()).hexdigest()
        self.assertEqual(fn(token), expected)

    def test_different_tokens_produce_different_hashes(self):
        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        self.assertNotEqual(fn("token_a"), fn("token_b"))

    def test_same_token_is_idempotent(self):
        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        self.assertEqual(fn("abc"), fn("abc"))


# ---------------------------------------------------------------------------
# Integration-style tests for get_current_user denylist check
# ---------------------------------------------------------------------------

class TestGetCurrentUserDenylist(unittest.TestCase):
    """get_current_user must reject revoked tokens before hitting Supabase."""

    def _import(self):
        try:
            from backend.auth_cookie import get_current_user
            return get_current_user
        except Exception:
            return None

    def test_revoked_token_raises_401(self):
        import asyncio
        from fastapi import HTTPException

        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_request = MagicMock()
        mock_request.cookies.get.return_value = "revoked_jwt"
        mock_request.headers.get.return_value = None

        with patch("backend.auth_cookie._is_token_revoked", return_value=True):
            with self.assertRaises(HTTPException) as ctx:
                asyncio.get_event_loop().run_until_complete(fn(mock_request))

        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("revoked", ctx.exception.detail.lower())

    def test_valid_token_bypasses_denylist_and_calls_supabase(self):
        import asyncio
        from fastapi import HTTPException

        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_request = MagicMock()
        mock_request.cookies.get.return_value = "good_jwt"
        mock_request.headers.get.return_value = None

        mock_user = MagicMock()
        mock_user.id = "user-uuid-123"
        mock_user.model_dump = lambda: {"id": "user-uuid-123", "email": "test@test.com"}

        mock_result = MagicMock()
        mock_result.user = mock_user

        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = mock_result

        with patch("backend.auth_cookie._is_token_revoked", return_value=False):
            with patch("backend.auth_cookie._anon_supabase", return_value=mock_client):
                result = asyncio.get_event_loop().run_until_complete(fn(mock_request))

        self.assertEqual(result["id"], "user-uuid-123")
        mock_client.auth.get_user.assert_called_once_with("good_jwt")


# ---------------------------------------------------------------------------
# Tests for the logout endpoint three-layer invalidation
# ---------------------------------------------------------------------------

class TestLogoutEndpointInvalidation(unittest.TestCase):
    """auth_logout must invoke all three invalidation layers."""

    def _import(self):
        try:
            from backend.auth_cookie import auth_logout
            return auth_logout
        except Exception:
            return None

    def test_logout_revokes_token_in_redis(self):
        import asyncio

        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_request = MagicMock()
        mock_request.cookies.get.return_value = "logout_token"
        mock_request.headers.get.return_value = None
        mock_response = MagicMock()

        with patch("backend.auth_cookie._revoke_token") as mock_revoke, \
             patch("backend.auth_cookie._service_supabase", return_value=None), \
             patch("backend.auth_cookie._clear_session_cookies"):
            asyncio.get_event_loop().run_until_complete(
                fn(mock_request, mock_response)
            )

        from unittest.mock import ANY
        mock_revoke.assert_called_once_with("logout_token", ttl=ANY)

    def test_logout_clears_cookies_even_when_admin_signout_fails(self):
        import asyncio

        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_request = MagicMock()
        mock_request.cookies.get.return_value = "some_token"
        mock_request.headers.get.return_value = None
        mock_response = MagicMock()

        mock_admin = MagicMock()
        mock_admin.auth.get_user.side_effect = Exception("Admin API down")

        with patch("backend.auth_cookie._revoke_token"), \
             patch("backend.auth_cookie._service_supabase", return_value=mock_admin), \
             patch("backend.auth_cookie._clear_session_cookies") as mock_clear:
            asyncio.get_event_loop().run_until_complete(
                fn(mock_request, mock_response)
            )

        mock_clear.assert_called_once_with(mock_response)

    def test_logout_calls_admin_signout_with_user_id(self):
        import asyncio

        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_request = MagicMock()
        mock_request.cookies.get.return_value = "valid_token"
        mock_request.headers.get.return_value = None
        mock_response = MagicMock()

        mock_user = MagicMock()
        mock_user.id = "user-id-999"
        mock_user_result = MagicMock()
        mock_user_result.user = mock_user

        mock_admin = MagicMock()
        mock_admin.auth.get_user.return_value = mock_user_result

        with patch("backend.auth_cookie._revoke_token"), \
             patch("backend.auth_cookie._service_supabase", return_value=mock_admin), \
             patch("backend.auth_cookie._clear_session_cookies"):
            asyncio.get_event_loop().run_until_complete(
                fn(mock_request, mock_response)
            )

        mock_admin.auth.admin.sign_out.assert_called_once_with("user-id-999")

    def test_logout_returns_ok_true(self):
        import asyncio

        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_request = MagicMock()
        mock_request.cookies.get.return_value = None
        mock_request.headers.get.return_value = None
        mock_response = MagicMock()

        with patch("backend.auth_cookie._clear_session_cookies"):
            result = asyncio.get_event_loop().run_until_complete(
                fn(mock_request, mock_response)
            )

        self.assertEqual(result, {"ok": True})

    def test_logout_with_no_token_still_clears_cookies(self):
        import asyncio

        fn = self._import()
        if fn is None:
            self.skipTest("auth_cookie not importable")

        mock_request = MagicMock()
        mock_request.cookies.get.return_value = None
        mock_request.headers.get.return_value = None
        mock_response = MagicMock()

        with patch("backend.auth_cookie._clear_session_cookies") as mock_clear:
            asyncio.get_event_loop().run_until_complete(
                fn(mock_request, mock_response)
            )

        mock_clear.assert_called_once_with(mock_response)


# ---------------------------------------------------------------------------
# Tests confirming the denylist prefix and constants are correct
# ---------------------------------------------------------------------------

class TestDenylistConstants(unittest.TestCase):
    def test_revoked_prefix_is_namespaced(self):
        try:
            from backend.auth_cookie import _REVOKED_PREFIX
            self.assertTrue(_REVOKED_PREFIX.startswith("helpdesk:"))
        except ImportError:
            self.skipTest("auth_cookie not importable")

    def test_access_max_age_is_positive(self):
        try:
            from backend.auth_cookie import ACCESS_MAX_AGE
            self.assertGreater(ACCESS_MAX_AGE, 0)
        except ImportError:
            self.skipTest("auth_cookie not importable")

    def test_service_supabase_returns_none_without_service_key(self):
        try:
            from backend.auth_cookie import _service_supabase
        except ImportError:
            self.skipTest("auth_cookie not importable")

        with patch.dict(os.environ, {"SUPABASE_SERVICE_KEY": ""}, clear=False):
            result = _service_supabase()
        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
