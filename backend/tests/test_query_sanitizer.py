"""Tests for query parameter sanitization — issue #3890."""

import pytest
from backend.utils.query_sanitizer import (
    sanitize_string,
    sanitize_uuid,
    sanitize_int,
    sanitize_enum,
    MAX_PARAM_LENGTH,
)


class TestSanitizeString:
    def test_normal_string_passes(self):
        assert sanitize_string("VPN not working") == "VPN not working"

    def test_strips_whitespace(self):
        assert sanitize_string("  hello  ") == "hello"

    def test_none_returns_none(self):
        assert sanitize_string(None) is None

    def test_empty_returns_none(self):
        assert sanitize_string("") is None

    def test_sql_union_select_blocked(self):
        with pytest.raises(ValueError):
            sanitize_string("' UNION SELECT * FROM users--")

    def test_sql_drop_table_blocked(self):
        with pytest.raises(ValueError):
            sanitize_string("DROP TABLE tickets")

    def test_sql_comment_blocked(self):
        with pytest.raises(ValueError):
            sanitize_string("admin'--")

    def test_or_1_equals_1_blocked(self):
        with pytest.raises(ValueError):
            sanitize_string("' OR 1=1")

    def test_sleep_injection_blocked(self):
        with pytest.raises(ValueError):
            sanitize_string("SLEEP(5)")

    def test_truncates_long_string(self):
        long_str = "a" * (MAX_PARAM_LENGTH + 100)
        result = sanitize_string(long_str)
        assert len(result) == MAX_PARAM_LENGTH


class TestSanitizeUUID:
    def test_valid_uuid_passes(self):
        uuid = "123e4567-e89b-12d3-a456-426614174000"
        assert sanitize_uuid(uuid) == uuid

    def test_none_returns_none(self):
        assert sanitize_uuid(None) is None

    def test_invalid_uuid_raises(self):
        with pytest.raises(ValueError):
            sanitize_uuid("not-a-uuid")

    def test_sql_injection_in_uuid_raises(self):
        with pytest.raises(ValueError):
            sanitize_uuid("' OR 1=1--")

    def test_uuid_normalised_to_lowercase(self):
        uuid = "123E4567-E89B-12D3-A456-426614174000"
        assert sanitize_uuid(uuid) == uuid.lower()

    def test_empty_returns_none(self):
        assert sanitize_uuid("") is None


class TestSanitizeInt:
    def test_normal_int_passes(self):
        assert sanitize_int(50) == 50

    def test_clamps_above_max(self):
        assert sanitize_int(9999, max_val=1000) == 1000

    def test_clamps_below_min(self):
        assert sanitize_int(-5, min_val=0) == 0

    def test_none_returns_min(self):
        assert sanitize_int(None, min_val=0) == 0

    def test_invalid_type_raises(self):
        with pytest.raises(ValueError):
            sanitize_int("abc")


class TestSanitizeEnum:
    def test_valid_value_passes(self):
        assert sanitize_enum("open", ["open", "closed", "pending"]) == "open"

    def test_invalid_value_raises(self):
        with pytest.raises(ValueError):
            sanitize_enum("hacked", ["open", "closed"])

    def test_none_returns_none(self):
        assert sanitize_enum(None, ["open", "closed"]) is None

    def test_empty_returns_none(self):
        assert sanitize_enum("", ["open", "closed"]) is None