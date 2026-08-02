"""
Unit tests for backend/utils/date_utils.py.

Issue: 1447
"""

import os
import sys
import unittest
import datetime

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.utils.date_utils import (
    normalize_iso_string,
    parse_iso_string,
    normalize_date_for_output,
    normalize_record_dates,
    normalize_records,
    SAFE_DATE_KEYS,
)


class TestNormalizeIsoString(unittest.TestCase):
    """Tests for normalize_iso_string()."""

    def test_none_returns_none(self):
        self.assertIsNone(normalize_iso_string(None))

    def test_datetime_with_tz_utc(self):
        dt = datetime.datetime(2024, 1, 2, 3, 4, 5, tzinfo=datetime.timezone.utc)
        self.assertEqual(normalize_iso_string(dt), "2024-01-02T03:04:05Z")

    def test_datetime_naive_treated_as_utc(self):
        dt = datetime.datetime(2024, 1, 2, 3, 4, 5)
        self.assertEqual(normalize_iso_string(dt), "2024-01-02T03:04:05Z")

    def test_string_with_z_suffix(self):
        self.assertEqual(
            normalize_iso_string("2024-01-02T03:04:05Z"),
            "2024-01-02T03:04:05Z",
        )

    def test_string_with_offset_colon(self):
        self.assertEqual(
            normalize_iso_string("2024-01-02T05:04:05+02:00"),
            "2024-01-02T03:04:05Z",
        )

    def test_string_with_offset_no_colon_legacy(self):
        # The regex fallback path repairs "+0530" to "+05:30".
        self.assertEqual(
            normalize_iso_string("2024-01-02T08:34:05+0530"),
            "2024-01-02T03:04:05Z",
        )

    def test_string_negative_offset_no_colon(self):
        self.assertEqual(
            normalize_iso_string("2024-01-02T01:00:00-0200"),
            "2024-01-02T03:00:00Z",
        )

    def test_string_naive_assumed_utc(self):
        self.assertEqual(
            normalize_iso_string("2024-01-02T03:04:05"),
            "2024-01-02T03:04:05Z",
        )

    def test_empty_string_returns_none(self):
        self.assertIsNone(normalize_iso_string(""))

    def test_whitespace_string_returns_none(self):
        self.assertIsNone(normalize_iso_string("   "))

    def test_unsupported_string_raises_value_error(self):
        with self.assertRaises(ValueError):
            normalize_iso_string("not-an-iso-timestamp-zz")

    def test_int_input_returns_none(self):
        self.assertIsNone(normalize_iso_string(12345))

    def test_list_input_returns_none(self):
        self.assertIsNone(normalize_iso_string(["2024-01-02T00:00:00Z"]))


class TestParseIsoString(unittest.TestCase):
    """Tests for parse_iso_string()."""

    def test_none_returns_none(self):
        self.assertIsNone(parse_iso_string(None))

    def test_datetime_passthrough_with_tz(self):
        dt = datetime.datetime(2024, 1, 2, 3, 4, 5, tzinfo=datetime.timezone.utc)
        result = parse_iso_string(dt)
        self.assertEqual(result, dt)
        self.assertIsNotNone(result.tzinfo)

    def test_naive_datetime_gets_utc_tz(self):
        dt = datetime.datetime(2024, 1, 2, 3, 4, 5)
        result = parse_iso_string(dt)
        self.assertIsNotNone(result.tzinfo)
        self.assertEqual(result.utcoffset(), datetime.timedelta(0))

    def test_string_with_z_suffix(self):
        result = parse_iso_string("2024-01-02T03:04:05Z")
        self.assertEqual(result.year, 2024)
        self.assertEqual(result.hour, 3)
        self.assertEqual(result.utcoffset(), datetime.timedelta(0))

    def test_string_with_offset(self):
        result = parse_iso_string("2024-01-02T05:04:05+02:00")
        self.assertEqual(result.utcoffset(), datetime.timedelta(0))
        self.assertEqual(result.hour, 3)

    def test_unparseable_raises_value_error(self):
        # parse_iso_string delegates to normalize_iso_string which raises
        # ValueError on truly unparseable input; that contract is preserved.
        with self.assertRaises(ValueError):
            parse_iso_string("not-a-date")


class TestNormalizeDateForOutput(unittest.TestCase):
    """Tests for normalize_date_for_output()."""

    def test_none_returns_none(self):
        self.assertIsNone(normalize_date_for_output(None))

    def test_datetime_returns_iso(self):
        dt = datetime.datetime(2024, 1, 2, 3, 4, 5, tzinfo=datetime.timezone.utc)
        self.assertEqual(normalize_date_for_output(dt), "2024-01-02T03:04:05Z")

    def test_valid_string_returns_iso(self):
        self.assertEqual(
            normalize_date_for_output("2024-01-02T03:04:05Z"),
            "2024-01-02T03:04:05Z",
        )

    def test_invalid_string_passthrough(self):
        # The function returns the original string on ValueError.
        self.assertEqual(
            normalize_date_for_output("not-an-iso-timestamp"),
            "not-an-iso-timestamp",
        )

    def test_non_string_non_datetime_passthrough(self):
        # int / bool / dict fall through and are returned unchanged.
        self.assertEqual(normalize_date_for_output(42), 42)
        self.assertEqual(normalize_date_for_output({"a": 1}), {"a": 1})


class TestNormalizeRecordDates(unittest.TestCase):
    """Tests for normalize_record_dates() and _normalize_record_value()."""

    def test_empty_dict(self):
        self.assertEqual(normalize_record_dates({}), {})

    def test_non_dict_input_passthrough(self):
        self.assertEqual(normalize_record_dates("not a dict"), "not a dict")
        self.assertEqual(normalize_record_dates(None), None)

    def test_safe_date_key_normalised(self):
        record = {"created_at": "2024-01-02T03:04:05Z", "title": "Hello"}
        out = normalize_record_dates(record)
        self.assertEqual(out["created_at"], "2024-01-02T03:04:05Z")
        self.assertEqual(out["title"], "Hello")

    def test_suffix_at_normalised(self):
        record = {"resolved_at": "2024-01-02T03:04:05Z"}
        out = normalize_record_dates(record)
        self.assertEqual(out["resolved_at"], "2024-01-02T03:04:05Z")

    def test_non_date_key_passthrough(self):
        record = {"status": "open", "priority": 3, "metadata": {"k": "v"}}
        out = normalize_record_dates(record)
        self.assertEqual(out, record)

    def test_nested_dict(self):
        record = {"nested": {"created_at": "2024-01-02T03:04:05Z"}}
        out = normalize_record_dates(record)
        self.assertEqual(out["nested"]["created_at"], "2024-01-02T03:04:05Z")

    def test_list_of_strings(self):
        record = {"tags": ["a", "b"]}
        out = normalize_record_dates(record)
        self.assertEqual(out["tags"], ["a", "b"])

    def test_safe_date_keys_constant(self):
        self.assertIn("created_at", SAFE_DATE_KEYS)
        self.assertIn("updated_at", SAFE_DATE_KEYS)


class TestNormalizeRecords(unittest.TestCase):
    """Tests for normalize_records()."""

    def test_list_of_records(self):
        records = [
            {"id": 1, "created_at": "2024-01-02T03:04:05Z"},
            {"id": 2, "created_at": "2024-02-02T03:04:05Z"},
        ]
        out = normalize_records(records)
        self.assertEqual(len(out), 2)
        self.assertEqual(out[0]["created_at"], "2024-01-02T03:04:05Z")

    def test_single_record_dict(self):
        out = normalize_records({"created_at": "2024-01-02T03:04:05Z"})
        self.assertEqual(out["created_at"], "2024-01-02T03:04:05Z")

    def test_list_of_non_dicts_passthrough(self):
        out = normalize_records([1, 2, "x"])
        self.assertEqual(out, [1, 2, "x"])

    def test_unknown_input_passthrough(self):
        self.assertEqual(normalize_records("string"), "string")
        self.assertEqual(normalize_records(None), None)


if __name__ == "__main__":
    unittest.main()
