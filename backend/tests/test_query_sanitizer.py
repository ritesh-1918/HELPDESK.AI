"""
Unit tests for ticket search query sanitization (issue #3890).

Confirms user-supplied search parameters are validated and escaped before they
are handed to the (parameterized) Supabase/PostgREST query builder.

Run with:  python -m unittest backend.tests.test_query_sanitizer -v
"""

import unittest

from backend.services.query_sanitizer import (
    MAX_SEARCH_QUERY_LENGTH,
    QuerySanitizationError,
    sanitize_enum_filter,
    sanitize_identifier,
    sanitize_search_query,
    validate_pagination,
)


class SanitizeSearchQueryTests(unittest.TestCase):
    def test_plain_query_passes_through(self):
        self.assertEqual(sanitize_search_query("  printer not working  "), "printer not working")

    def test_empty_and_none(self):
        self.assertEqual(sanitize_search_query(""), "")
        self.assertEqual(sanitize_search_query(None), "")

    def test_overlong_query_rejected(self):
        with self.assertRaises(QuerySanitizationError):
            sanitize_search_query("a" * (MAX_SEARCH_QUERY_LENGTH + 1))

    def test_sql_metacharacters_stripped(self):
        self.assertEqual(
            sanitize_search_query("'); DROP TABLE tickets;--"),
            "DROP TABLE tickets",
        )

    def test_control_characters_stripped(self):
        self.assertEqual(sanitize_search_query("legit\x00\x1bticket"), "legitticket")

    def test_like_wildcards_escaped(self):
        self.assertEqual(sanitize_search_query("100%_done"), r"100\%\_done")

    def test_quotes_removed(self):
        self.assertEqual(sanitize_search_query("it's broken"), "its broken")


class SanitizeEnumFilterTests(unittest.TestCase):
    def test_allowed_value(self):
        self.assertEqual(sanitize_enum_filter(" open ", {"open", "closed"}), "open")

    def test_disallowed_value(self):
        with self.assertRaises(QuerySanitizationError):
            sanitize_enum_filter("open; DROP TABLE", {"open", "closed"})

    def test_none_returns_none(self):
        self.assertIsNone(sanitize_enum_filter(None, {"open", "closed"}))

    def test_overlong_rejected(self):
        with self.assertRaises(QuerySanitizationError):
            sanitize_enum_filter("x" * 65)


class SanitizeIdentifierTests(unittest.TestCase):
    def test_valid_identifier(self):
        self.assertEqual(sanitize_identifier("acme-corp_1"), "acme-corp_1")

    def test_injection_rejected(self):
        for bad in ("acme'; DROP TABLE tickets;--", "a b", "a/b", "a\\b"):
            with self.assertRaises(QuerySanitizationError):
                sanitize_identifier(bad)


class ValidatePaginationTests(unittest.TestCase):
    def test_defaults(self):
        self.assertEqual(validate_pagination(None, None), (50, 0))

    def test_clamps(self):
        self.assertEqual(validate_pagination(0, -5), (1, 0))
        self.assertEqual(validate_pagination(99999, None), (100, 0))

    def test_invalid_rejected(self):
        with self.assertRaises(QuerySanitizationError):
            validate_pagination("abc", None)


if __name__ == "__main__":
    unittest.main()
