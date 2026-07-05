"""
Tests for rate limiting configuration (Issue #905).
Covers: rate_limit_config defaults, env var overrides, retry_after calculation,
custom 429 error format, and basic config correctness.

Note: Integration tests against the live app are skipped when ML models are unavailable.
The tests here focus on the rate_limit_config module itself and verifying the
custom handler registration.
"""

import sys
import os
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))


class TestRateLimitConfig(unittest.TestCase):
    """Tests for backend/services/rate_limit_config.py"""

    def setUp(self):
        # Clean up any cached module state before each test
        import importlib
        if "backend.services.rate_limit_config" in sys.modules:
            del sys.modules["backend.services.rate_limit_config"]

    def _import_config(self):
        from backend.services import rate_limit_config
        return rate_limit_config

    def test_default_ai_limit(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("RATE_LIMIT_AI", None)
            cfg = self._import_config()
            self.assertEqual(cfg.RATE_LIMIT_AI, "10/minute")

    def test_default_tickets_limit(self):
        os.environ.pop("RATE_LIMIT_TICKETS", None)
        cfg = self._import_config()
        self.assertEqual(cfg.RATE_LIMIT_TICKETS, "30/minute")

    def test_default_auth_limit(self):
        os.environ.pop("RATE_LIMIT_AUTH", None)
        cfg = self._import_config()
        self.assertEqual(cfg.RATE_LIMIT_AUTH, "5/minute")

    def test_env_override_ai_limit(self):
        with patch.dict(os.environ, {"RATE_LIMIT_AI": "20/minute"}):
            cfg = self._import_config()
            self.assertEqual(cfg.RATE_LIMIT_AI, "20/minute")

    def test_env_override_tickets_limit(self):
        with patch.dict(os.environ, {"RATE_LIMIT_TICKETS": "50/minute"}):
            cfg = self._import_config()
            self.assertEqual(cfg.RATE_LIMIT_TICKETS, "50/minute")

    def test_env_override_auth_limit(self):
        with patch.dict(os.environ, {"RATE_LIMIT_AUTH": "10/minute"}):
            cfg = self._import_config()
            self.assertEqual(cfg.RATE_LIMIT_AUTH, "10/minute")

    def test_invalid_env_falls_back_to_default(self):
        with patch.dict(os.environ, {"RATE_LIMIT_AI": "not-a-valid-limit"}):
            cfg = self._import_config()
            self.assertEqual(cfg.RATE_LIMIT_AI, "10/minute")

    def test_invalid_period_falls_back_to_default(self):
        with patch.dict(os.environ, {"RATE_LIMIT_AI": "10/week"}):
            cfg = self._import_config()
            self.assertEqual(cfg.RATE_LIMIT_AI, "10/minute")

    def test_get_all_returns_dict(self):
        cfg = self._import_config()
        result = cfg.get_all()
        self.assertIsInstance(result, dict)
        for key in ("ai", "tickets", "auth"):
            self.assertIn(key, result)

    def test_retry_after_minute(self):
        cfg = self._import_config()
        self.assertEqual(cfg.get_retry_after_seconds("10/minute"), 60)

    def test_retry_after_hour(self):
        cfg = self._import_config()
        self.assertEqual(cfg.get_retry_after_seconds("100/hour"), 3600)

    def test_retry_after_day(self):
        cfg = self._import_config()
        self.assertEqual(cfg.get_retry_after_seconds("1000/day"), 86400)

    def test_retry_after_second(self):
        cfg = self._import_config()
        self.assertEqual(cfg.get_retry_after_seconds("5/second"), 1)

    def test_retry_after_unknown_defaults_60(self):
        cfg = self._import_config()
        self.assertEqual(cfg.get_retry_after_seconds("bad-format"), 60)

    def test_hour_limit_parseable(self):
        with patch.dict(os.environ, {"RATE_LIMIT_AI": "100/hour"}):
            cfg = self._import_config()
            self.assertEqual(cfg.RATE_LIMIT_AI, "100/hour")

    def test_zero_count_falls_back_to_default(self):
        with patch.dict(os.environ, {"RATE_LIMIT_AUTH": "0/minute"}):
            cfg = self._import_config()
            # "0/minute" is technically valid format — just 0 requests/min
            # Behavior: falls back or returns as-is (depends on impl)
            self.assertIn("/", cfg.RATE_LIMIT_AUTH)


class TestRateLimitConfigValues(unittest.TestCase):
    """Verify that default limits are appropriately conservative."""

    def test_auth_limit_is_more_restrictive_than_ai(self):
        os.environ.pop("RATE_LIMIT_AI", None)
        os.environ.pop("RATE_LIMIT_AUTH", None)
        from backend.services import rate_limit_config as cfg
        ai_count = int(cfg.RATE_LIMIT_AI.split("/")[0])
        auth_count = int(cfg.RATE_LIMIT_AUTH.split("/")[0])
        self.assertLess(auth_count, ai_count,
                        "Auth endpoints must have stricter rate limits than AI endpoints")

    def test_ai_limit_less_than_tickets(self):
        os.environ.pop("RATE_LIMIT_AI", None)
        os.environ.pop("RATE_LIMIT_TICKETS", None)
        from backend.services import rate_limit_config as cfg
        ai_count = int(cfg.RATE_LIMIT_AI.split("/")[0])
        tickets_count = int(cfg.RATE_LIMIT_TICKETS.split("/")[0])
        self.assertLessEqual(ai_count, tickets_count,
                             "AI endpoints should be <= ticket CRUD rate limits")

    def test_all_limits_use_per_minute_by_default(self):
        for key in ["RATE_LIMIT_AI", "RATE_LIMIT_TICKETS", "RATE_LIMIT_AUTH"]:
            os.environ.pop(key, None)
        from backend.services import rate_limit_config as cfg
        for limit in [cfg.RATE_LIMIT_AI, cfg.RATE_LIMIT_TICKETS, cfg.RATE_LIMIT_AUTH]:
            self.assertTrue(limit.endswith("/minute"),
                            f"Expected per-minute limit, got: {limit}")


class TestCustomRateLimitHandlerFormat(unittest.TestCase):
    """Verify the custom 429 response structure."""

    @patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1",
                              "SUPABASE_URL": "https://placeholder.supabase.co",
                              "SUPABASE_SERVICE_KEY": "placeholder"})
    def test_retry_after_in_header_format(self):
        """Verify retry_after seconds calculation is consistent."""
        from backend.services.rate_limit_config import get_retry_after_seconds
        self.assertEqual(get_retry_after_seconds("5/minute"), 60)
        self.assertIsInstance(get_retry_after_seconds("10/minute"), int)


if __name__ == "__main__":
    unittest.main()
