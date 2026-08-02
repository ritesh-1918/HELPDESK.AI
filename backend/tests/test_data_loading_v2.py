"""
Test suite for backend/utils/data_loader.py (Issue #1144 - v2).

Covers:
- save_json_data with special characters in file path
- load_json_data returns copies (not references)
- Boolean/float values preserved in round-trip
- Nested objects 5 levels deep
- Edge cases: None, empty dict, large lists
"""

import sys
import os
import json
import tempfile
import shutil
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.utils.data_loader import load_json_data, save_json_data, get_data_dir


@pytest.fixture
def tmp_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)


# ---------------------------------------------------------------------------
# save_json_data tests
# ---------------------------------------------------------------------------

class TestSaveJsonData:
    def test_save_simple_list(self, tmp_dir):
        path = os.path.join(tmp_dir, "test.json")
        result = save_json_data(path, [{"id": 1}, {"id": 2}])
        assert result is True
        assert os.path.exists(path)

    def test_save_creates_parent_dirs(self, tmp_dir):
        path = os.path.join(tmp_dir, "deep", "nested", "file.json")
        result = save_json_data(path, [{"key": "value"}])
        assert result is True
        assert os.path.exists(path)

    def test_save_returns_false_on_permission_error(self, tmp_dir):
        # Use a read-only directory
        path = os.path.join("/nonexistent_dir_for_test", "file.json")
        result = save_json_data(path, [{"key": "value"}])
        assert result is False

    def test_save_boolean_values(self, tmp_dir):
        path = os.path.join(tmp_dir, "booleans.json")
        data = [{"active": True, "disabled": False}]
        save_json_data(path, data)
        loaded = load_json_data(path)
        assert loaded[0]["active"] is True
        assert loaded[0]["disabled"] is False

    def test_save_float_values(self, tmp_dir):
        path = os.path.join(tmp_dir, "floats.json")
        data = [{"score": 0.987654321, "threshold": 1.23e-4}]
        save_json_data(path, data)
        loaded = load_json_data(path)
        assert abs(loaded[0]["score"] - 0.987654321) < 1e-9
        assert abs(loaded[0]["threshold"] - 1.23e-4) < 1e-10

    def test_save_special_chars_in_filename(self, tmp_dir):
        # Use filename with dashes, underscores, dots
        path = os.path.join(tmp_dir, "my-data_v2.0.json")
        data = [{"key": "value"}]
        result = save_json_data(path, data)
        assert result is True
        assert os.path.exists(path)

    def test_save_special_chars_in_path_dir(self, tmp_dir):
        # Directory with parentheses and spaces (via encoded name)
        special_dir = os.path.join(tmp_dir, "test_data (v2)")
        os.makedirs(special_dir, exist_ok=True)
        path = os.path.join(special_dir, "data.json")
        result = save_json_data(path, [{"x": 1}])
        assert result is True

    def test_save_empty_list(self, tmp_dir):
        path = os.path.join(tmp_dir, "empty.json")
        result = save_json_data(path, [])
        assert result is True
        loaded = load_json_data(path)
        assert loaded == []

    def test_save_nested_5_levels_deep(self, tmp_dir):
        path = os.path.join(tmp_dir, "deep.json")
        data = [{"l1": {"l2": {"l3": {"l4": {"l5": "deepvalue"}}}}}]
        result = save_json_data(path, data)
        assert result is True

    def test_save_produces_valid_json_file(self, tmp_dir):
        path = os.path.join(tmp_dir, "valid.json")
        data = [{"a": 1, "b": "hello"}]
        save_json_data(path, data)
        with open(path, "r") as f:
            parsed = json.load(f)
        assert isinstance(parsed, list)
        assert parsed[0]["a"] == 1

    def test_save_overwrites_existing_file(self, tmp_dir):
        path = os.path.join(tmp_dir, "overwrite.json")
        save_json_data(path, [{"old": "data"}])
        save_json_data(path, [{"new": "data"}])
        loaded = load_json_data(path)
        assert loaded[0].get("new") == "data"
        assert "old" not in loaded[0]

    def test_save_dict_not_list(self, tmp_dir):
        path = os.path.join(tmp_dir, "dict.json")
        # save_json_data accepts Any, but load_json_data returns [] for non-lists
        result = save_json_data(path, {"key": "value"})
        assert result is True

    def test_save_unicode_content(self, tmp_dir):
        path = os.path.join(tmp_dir, "unicode.json")
        data = [{"text": "héllo wörld 中文 日本語"}]
        save_json_data(path, data)
        loaded = load_json_data(path)
        assert loaded[0]["text"] == "héllo wörld 中文 日本語"

    def test_save_large_list(self, tmp_dir):
        path = os.path.join(tmp_dir, "large.json")
        data = [{"id": i, "value": f"item_{i}"} for i in range(1000)]
        result = save_json_data(path, data)
        assert result is True
        loaded = load_json_data(path)
        assert len(loaded) == 1000


# ---------------------------------------------------------------------------
# load_json_data tests
# ---------------------------------------------------------------------------

class TestLoadJsonData:
    def test_returns_empty_list_for_missing_file(self, tmp_dir):
        path = os.path.join(tmp_dir, "nonexistent.json")
        result = load_json_data(path)
        assert result == []

    def test_returns_list_from_valid_file(self, tmp_dir):
        path = os.path.join(tmp_dir, "data.json")
        with open(path, "w") as f:
            json.dump([{"id": 1}], f)
        result = load_json_data(path)
        assert result == [{"id": 1}]

    def test_returns_empty_list_for_invalid_json(self, tmp_dir):
        path = os.path.join(tmp_dir, "bad.json")
        with open(path, "w") as f:
            f.write("not valid json {{{")
        result = load_json_data(path)
        assert result == []

    def test_returns_empty_list_when_json_is_not_list(self, tmp_dir):
        path = os.path.join(tmp_dir, "dict.json")
        with open(path, "w") as f:
            json.dump({"key": "value"}, f)
        result = load_json_data(path)
        assert result == []

    def test_round_trip_preserves_booleans(self, tmp_dir):
        path = os.path.join(tmp_dir, "bools.json")
        original = [{"flag": True, "other": False}]
        save_json_data(path, original)
        loaded = load_json_data(path)
        assert loaded[0]["flag"] is True
        assert loaded[0]["other"] is False

    def test_round_trip_preserves_floats(self, tmp_dir):
        path = os.path.join(tmp_dir, "floats.json")
        original = [{"pi": 3.14159, "e": 2.71828}]
        save_json_data(path, original)
        loaded = load_json_data(path)
        assert abs(loaded[0]["pi"] - 3.14159) < 1e-5
        assert abs(loaded[0]["e"] - 2.71828) < 1e-5

    def test_round_trip_preserves_integers(self, tmp_dir):
        path = os.path.join(tmp_dir, "ints.json")
        original = [{"count": 42, "neg": -7}]
        save_json_data(path, original)
        loaded = load_json_data(path)
        assert loaded[0]["count"] == 42
        assert loaded[0]["neg"] == -7

    def test_round_trip_preserves_none_values(self, tmp_dir):
        path = os.path.join(tmp_dir, "nones.json")
        original = [{"key": None, "other": "value"}]
        save_json_data(path, original)
        loaded = load_json_data(path)
        assert loaded[0]["key"] is None

    def test_round_trip_5_levels_deep(self, tmp_dir):
        path = os.path.join(tmp_dir, "deep.json")
        original = [{"l1": {"l2": {"l3": {"l4": {"l5": "deepvalue", "num": 42}}}}}]
        save_json_data(path, original)
        loaded = load_json_data(path)
        assert loaded[0]["l1"]["l2"]["l3"]["l4"]["l5"] == "deepvalue"
        assert loaded[0]["l1"]["l2"]["l3"]["l4"]["num"] == 42

    def test_returns_independent_copy_not_same_reference(self, tmp_dir):
        """load_json_data should return new objects, not references to file internals."""
        path = os.path.join(tmp_dir, "copy_test.json")
        original = [{"id": 1, "name": "Alice"}]
        save_json_data(path, original)

        result1 = load_json_data(path)
        result2 = load_json_data(path)

        # Modifying result1 should not affect result2
        result1[0]["name"] = "Modified"
        assert result2[0]["name"] == "Alice"

    def test_loaded_objects_are_independent_from_source(self, tmp_dir):
        """Two successive loads should return independent dicts."""
        path = os.path.join(tmp_dir, "independent.json")
        data = [{"x": 1}]
        save_json_data(path, data)

        a = load_json_data(path)
        b = load_json_data(path)

        a[0]["x"] = 999
        assert b[0]["x"] == 1

    def test_empty_file_returns_empty_list(self, tmp_dir):
        path = os.path.join(tmp_dir, "empty.json")
        with open(path, "w") as f:
            f.write("")
        result = load_json_data(path)
        assert result == []

    def test_returns_empty_list_for_empty_json_array(self, tmp_dir):
        path = os.path.join(tmp_dir, "emptyarray.json")
        with open(path, "w") as f:
            json.dump([], f)
        result = load_json_data(path)
        assert result == []

    def test_round_trip_mixed_types_in_one_dict(self, tmp_dir):
        path = os.path.join(tmp_dir, "mixed.json")
        original = [{"str": "hello", "int": 5, "float": 1.5, "bool": True, "none": None, "list": [1, 2, 3]}]
        save_json_data(path, original)
        loaded = load_json_data(path)
        item = loaded[0]
        assert item["str"] == "hello"
        assert item["int"] == 5
        assert abs(item["float"] - 1.5) < 1e-9
        assert item["bool"] is True
        assert item["none"] is None
        assert item["list"] == [1, 2, 3]


# ---------------------------------------------------------------------------
# get_data_dir tests
# ---------------------------------------------------------------------------

class TestGetDataDir:
    def test_returns_string(self):
        result = get_data_dir()
        assert isinstance(result, str)

    def test_is_absolute_path(self):
        result = get_data_dir()
        assert os.path.isabs(result)

    def test_ends_with_data(self):
        result = get_data_dir()
        assert result.endswith("data")

    def test_path_contains_backend(self):
        result = get_data_dir()
        assert "backend" in result


# ---------------------------------------------------------------------------
# Additional round-trip edge cases
# ---------------------------------------------------------------------------

class TestRoundTrip:
    def test_list_of_strings(self, tmp_dir):
        path = os.path.join(tmp_dir, "strings.json")
        data = ["alpha", "beta", "gamma"]
        save_json_data(path, data)
        # Note: load_json_data only returns list type items
        loaded = load_json_data(path)
        assert loaded == ["alpha", "beta", "gamma"]

    def test_nested_list_values(self, tmp_dir):
        path = os.path.join(tmp_dir, "nested_lists.json")
        data = [{"tags": ["a", "b", "c"], "scores": [0.1, 0.2, 0.3]}]
        save_json_data(path, data)
        loaded = load_json_data(path)
        assert loaded[0]["tags"] == ["a", "b", "c"]
        assert len(loaded[0]["scores"]) == 3

    def test_boolean_false_not_confused_with_zero(self, tmp_dir):
        path = os.path.join(tmp_dir, "bool_zero.json")
        data = [{"flag": False, "zero": 0}]
        save_json_data(path, data)
        loaded = load_json_data(path)
        assert loaded[0]["flag"] is False
        assert loaded[0]["zero"] == 0

    def test_boolean_true_not_confused_with_one(self, tmp_dir):
        path = os.path.join(tmp_dir, "bool_one.json")
        data = [{"flag": True, "one": 1}]
        save_json_data(path, data)
        loaded = load_json_data(path)
        assert loaded[0]["flag"] is True
        assert loaded[0]["one"] == 1

    def test_very_long_string_preserved(self, tmp_dir):
        path = os.path.join(tmp_dir, "longstr.json")
        long_str = "x" * 10000
        data = [{"content": long_str}]
        save_json_data(path, data)
        loaded = load_json_data(path)
        assert len(loaded[0]["content"]) == 10000

    def test_multiple_items_order_preserved(self, tmp_dir):
        path = os.path.join(tmp_dir, "ordered.json")
        data = [{"id": i} for i in range(50)]
        save_json_data(path, data)
        loaded = load_json_data(path)
        for i, item in enumerate(loaded):
            assert item["id"] == i
