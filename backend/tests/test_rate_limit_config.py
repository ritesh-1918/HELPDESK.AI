"""
Unit tests for backend/services/rate_limit_config.py.

Issue: 1448 (date_utils was 1447; this is the next sequential automation issue)
"""

import os
import sys
import importlib
import unittest
from unittest import mock

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

import backend.services.rate_limit_config as rlc


class TestParseLimit(unittest.TestCase):
    """Tests for the internal _parse_limit function."""

    def test_valid_minute_format(self):
        self.assertEqual(rlc._parse_limit("ANY_KEY", "10/minute"), "10/minute")

    def test_valid_second_format(self):
        self.assertEqual(rlc._parse_limit("ANY_KEY", "5/second"), "5/second")

    def test_valid_hour_format(self):
        self.assertEqual(rlc._parse_limit("ANY_KEY", "100/hour"), "100/hour")

    def test_valid_day_format(self):
        self.assertEqual(rlc._parse_limit("ANY_KEY", "1000/day"), "1000/day")

    def test_empty_value_falls_back_to_default(self):
        # An empty env var should return the default.
        with mock.patch.dict(os.environ, {"X_RATE_TEST": ""}, clear=False):
            self.assertEqual(
                rlc._parse_limit("X_RATE_TEST", "5/minute"),
                "5/minute",
            )

    def test_missing_value_falls_back_to_default(self):
        with mock.dict.dict if False else mock.patch.dict(
            os.environ, {}, clear=True
        ):
            self.assertEqual(
                rlc._parse_limit("X_MISSING_KEY", "7/minute"),
                "7/minute",
            )

    def test_malformed_no_slash_falls_back(self):
        with mock.patch.dict(os.environ, {"X_RATE_TEST": "10minute"}, clear=False):
            self.assertEqual(
                rlc._parse_limit("X_RATE_TEST", "5/minute"),
                "5/minute",
            )

    def test_malformed_bad_period_falls_back(self):
        with mock.patch.dict(os.environ, {"X_RATE_TEST": "10/year"}, clear=False):
            self.assertEqual(
                rlc._parse_limit("X_RATE_TEST", "5/minute"),
                "5/minute",
            )

    def test_malformed_non_int_count_falls_back(self):
        with mock.patch.dict(os.environ, {"X_RATE_TEST": "abc/minute"}, clear=False):
            self.assertEqual(
                rlc._parse_limit("X_RATE_TEST", "5/minute"),
                "5/minute",
            )

    def test_extra_slash_falls_back(self):
        with mock.patch.dict(os.environ, {"X_RATE_TEST": "10/minute/extra"}, clear=False):
            self.assertEqual(
                rlc._parse_limit("X_RATE_TEST", "5/minute"),
                "5/minute",
            )

    def test_whitespace_only_falls_back(self):
        with mock.patch.dict(os.environ, {"X_RATE_TEST": "   "}, clear=False):
            self.assertEqual(
                rlc._parse_limit("X_RATE_TEST", "5/minute"),
                "5/minute",
            )

    def test_value_is_stripped(self):
        with mock.patch.dict(os.environ, {"X_RATE_TEST": " 10/minute "}, clear=False):
            self.assertEqual(
                rlc._parse_limit("X_RATE_TEST", "5/minute"),
                "10/minute",
            )


class TestGetAll(unittest.TestCase):
    """Tests for get_all()."""

    def test_returns_three_keys(self):
        result = rlc.get_all()
        self.assertIn("ai", result)
        self.assertIn("tickets", result)
        self.assertIn("auth", result)

    def test_values_match_module_constants(self):
        result = rlc.get_all()
        self.assertEqual(result["ai"], rlc.RATE_LIMIT_AI)
        self.assertEqual(result["tickets"], rlc.RATE_LIMIT_TICKETS)
        self.assertEqual(result["auth"], rlc.RATE_LIMIT_AUTH)

    def test_values_have_valid_format(self):
        result = rlc.get_all()
        for key, value in result.items():
            self.assertIn("/", value, f"{key} value {value!r} lacks slash")
            n, period = value.split("/")
            int(n)  # parses
            self.assertIn(period, {"second", "minute", "hour", "day"})


class TestGetRetryAfterSeconds(unittest.TestCase):
    """Tests for get_retry_after_seconds()."""

    def test_second_period(self):
        self.assertEqual(rlc.get_retry_after_seconds("5/second"), 1)

    def test_minute_period(self):
        self.assertEqual(rlc.get_retry_after_seconds("5/minute"), 60)

    def test_hour_period(self):
        self.assertEqual(rlc.get_retry_after_seconds("100/hour"), 3600)

    def test_day_period(self):
        self.assertEqual(rlc.get_retry_after_seconds("1000/day"), 86400)

    def test_invalid_format_returns_default(self):
        # 60 seconds is the documented fallback
        self.assertEqual(rlc.get_retry_after_seconds("nope"), 60)

    def test_unknown_period_returns_default(self):
        self.assertEqual(rlc.get_retry_after_seconds("10/year"), 60)


class TestModuleConstants(unittest.TestCase):
    """Tests for the module-level resolved constants."""

    def test_ai_constant_is_string(self):
        self.assertIsInstance(rlc.RATE_LIMIT_AI, str)

    def test_tickets_constant_is_string(self):
        self.assertIsInstance(rlc.RATE_LIMIT_TICKETS, str)

    def test_auth_constant_is_string(self):
        self.assertIsInstance(rlc.RATE_LIMIT_AUTH, str)

    def test_defaults_match_documented_values(self):
        # When env vars are not set, defaults should be 10/minute, 30/minute, 5/minute
        with mock.patch.dict(
            os.environ,
            {
                "RATE_LIMIT_AI": "",
                "RATE_LIMIT_TICKETS": "",
                "RATE_LIMIT_AUTH": "",
            },
            clear=False,
        ):
            importlib.reload(rlc)
            self.assertEqual(rlc.RATE_LIMIT_AI, "10/minute")
            self.assertEqual(rlc.RATE_LIMIT_TICKETS, "30/minute")
            self.assertEqual(rlc.RATE_LIMIT_AUTH, "5/minute")
            # Restore for other tests
            importlib.reload(rlc)


if __name__ == "__main__":
    unittest.main()
