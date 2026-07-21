"""
Comprehensive unit tests for backend/utils/data_loader.py — Issue #1139.

Covers:
- load_json_data: missing file, valid list, dict root (not a list), empty file,
  JSON decode error, OS/permission error, unicode content, deeply nested list
- save_json_data: writes file, creates parent dirs, overwrites existing file,
  returns True on success, returns False on exception
- get_data_dir: returns absolute path, path ends with 'data', path is string
- Round-trip: save then load returns identical data
"""

import json
import os
import sys
import tempfile
import unittest
from unittest.mock import patch, mock_open, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.utils.data_loader import load_json_data, save_json_data, get_data_dir


# ═══════════════════════════════════════════════════════════════════════════════
# 1 — load_json_data
# ═══════════════════════════════════════════════════════════════════════════════

class TestLoadJsonData(unittest.TestCase):

    def _tmp(self, content: str, suffix=".json") -> str:
        f = tempfile.NamedTemporaryFile(mode="w", suffix=suffix, delete=False,
                                        encoding="utf-8")
        f.write(content)
        f.close()
        return f.name

    def tearDown(self):
        pass

    def test_missing_file_returns_empty_list(self):
        result = load_json_data("/nonexistent/path/file.json")
        self.assertEqual(result, [])

    def test_valid_list_returned(self):
        path = self._tmp('[{"id": 1}, {"id": 2}]')
        try:
            result = load_json_data(path)
            self.assertEqual(len(result), 2)
            self.assertEqual(result[0]["id"], 1)
        finally:
            os.unlink(path)

    def test_return_type_is_list(self):
        path = self._tmp('[{"x": "y"}]')
        try:
            self.assertIsInstance(load_json_data(path), list)
        finally:
            os.unlink(path)

    def test_dict_root_returns_empty_list(self):
        path = self._tmp('{"key": "value"}')
        try:
            result = load_json_data(path)
            self.assertEqual(result, [])
        finally:
            os.unlink(path)

    def test_malformed_json_returns_empty_list(self):
        path = self._tmp('{this is not json')
        try:
            result = load_json_data(path)
            self.assertEqual(result, [])
        finally:
            os.unlink(path)

    def test_empty_list_json_returns_empty_list(self):
        path = self._tmp('[]')
        try:
            result = load_json_data(path)
            self.assertEqual(result, [])
        finally:
            os.unlink(path)

    def test_unicode_content_handled(self):
        path = self._tmp('[{"name": "テスト"}, {"name": "café"}]')
        try:
            result = load_json_data(path)
            self.assertEqual(len(result), 2)
            self.assertEqual(result[0]["name"], "テスト")
        finally:
            os.unlink(path)

    def test_nested_list_items_preserved(self):
        data = [{"tags": ["a", "b"]}, {"nested": {"deep": True}}]
        path = self._tmp(json.dumps(data))
        try:
            result = load_json_data(path)
            self.assertEqual(result[0]["tags"], ["a", "b"])
            self.assertTrue(result[1]["nested"]["deep"])
        finally:
            os.unlink(path)

    def test_single_item_list(self):
        path = self._tmp('[{"only": "one"}]')
        try:
            result = load_json_data(path)
            self.assertEqual(len(result), 1)
        finally:
            os.unlink(path)

    def test_null_root_returns_empty_list(self):
        path = self._tmp('null')
        try:
            result = load_json_data(path)
            self.assertEqual(result, [])
        finally:
            os.unlink(path)

    def test_numeric_root_returns_empty_list(self):
        path = self._tmp('42')
        try:
            result = load_json_data(path)
            self.assertEqual(result, [])
        finally:
            os.unlink(path)

    def test_string_root_returns_empty_list(self):
        path = self._tmp('"just a string"')
        try:
            result = load_json_data(path)
            self.assertEqual(result, [])
        finally:
            os.unlink(path)

    def test_large_list_all_items_returned(self):
        data = [{"id": i} for i in range(100)]
        path = self._tmp(json.dumps(data))
        try:
            result = load_json_data(path)
            self.assertEqual(len(result), 100)
        finally:
            os.unlink(path)

    def test_os_error_returns_empty_list(self):
        with patch("builtins.open", side_effect=OSError("permission denied")):
            with patch("os.path.exists", return_value=True):
                result = load_json_data("/some/path.json")
        self.assertEqual(result, [])

    def test_value_error_returns_empty_list(self):
        with patch("builtins.open", mock_open(read_data="[")):
            with patch("os.path.exists", return_value=True):
                result = load_json_data("/some/path.json")
        self.assertEqual(result, [])

    def test_mixed_type_list_items_returned(self):
        path = self._tmp('[{"a": 1}, {"b": "two"}, {"c": [1, 2]}]')
        try:
            result = load_json_data(path)
            self.assertEqual(len(result), 3)
        finally:
            os.unlink(path)


# ═══════════════════════════════════════════════════════════════════════════════
# 2 — save_json_data
# ═══════════════════════════════════════════════════════════════════════════════

class TestSaveJsonData(unittest.TestCase):

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_returns_true_on_success(self):
        path = os.path.join(self.tmpdir, "out.json")
        result = save_json_data(path, [{"id": 1}])
        self.assertTrue(result)

    def test_file_is_created(self):
        path = os.path.join(self.tmpdir, "new.json")
        save_json_data(path, [{"x": 1}])
        self.assertTrue(os.path.exists(path))

    def test_saved_content_is_valid_json(self):
        path = os.path.join(self.tmpdir, "data.json")
        save_json_data(path, [{"a": 1}])
        with open(path, "r") as f:
            parsed = json.load(f)
        self.assertEqual(parsed, [{"a": 1}])

    def test_saves_empty_list(self):
        path = os.path.join(self.tmpdir, "empty.json")
        save_json_data(path, [])
        with open(path) as f:
            content = json.load(f)
        self.assertEqual(content, [])

    def test_saves_dict(self):
        path = os.path.join(self.tmpdir, "dict.json")
        save_json_data(path, {"key": "value"})
        with open(path) as f:
            content = json.load(f)
        self.assertEqual(content["key"], "value")

    def test_creates_nested_directories(self):
        path = os.path.join(self.tmpdir, "subdir", "nested", "file.json")
        result = save_json_data(path, [{"id": 1}])
        self.assertTrue(result)
        self.assertTrue(os.path.exists(path))

    def test_overwrites_existing_file(self):
        path = os.path.join(self.tmpdir, "over.json")
        save_json_data(path, [{"old": True}])
        save_json_data(path, [{"new": True}])
        with open(path) as f:
            content = json.load(f)
        self.assertEqual(content[0]["new"], True)
        self.assertNotIn("old", content[0])

    def test_returns_false_on_exception(self):
        with patch("builtins.open", side_effect=OSError("disk full")):
            with patch("os.makedirs"):
                result = save_json_data("/some/path.json", [])
        self.assertFalse(result)

    def test_saves_unicode_content(self):
        path = os.path.join(self.tmpdir, "unicode.json")
        data = [{"name": "テスト", "emoji": "🚀"}]
        save_json_data(path, data)
        with open(path, encoding="utf-8") as f:
            content = json.load(f)
        self.assertEqual(content[0]["name"], "テスト")

    def test_saves_with_indentation(self):
        path = os.path.join(self.tmpdir, "pretty.json")
        save_json_data(path, [{"id": 1}])
        with open(path) as f:
            raw = f.read()
        self.assertIn("\n", raw)

    def test_saves_large_list(self):
        data = [{"id": i, "text": f"ticket {i}"} for i in range(200)]
        path = os.path.join(self.tmpdir, "large.json")
        result = save_json_data(path, data)
        self.assertTrue(result)
        with open(path) as f:
            loaded = json.load(f)
        self.assertEqual(len(loaded), 200)


# ═══════════════════════════════════════════════════════════════════════════════
# 3 — get_data_dir
# ═══════════════════════════════════════════════════════════════════════════════

class TestGetDataDir(unittest.TestCase):

    def test_returns_string(self):
        self.assertIsInstance(get_data_dir(), str)

    def test_returns_absolute_path(self):
        self.assertTrue(os.path.isabs(get_data_dir()))

    def test_path_ends_with_data(self):
        result = get_data_dir()
        self.assertTrue(result.endswith("data") or result.endswith("data/"))

    def test_non_empty_string(self):
        self.assertTrue(get_data_dir().strip())

    def test_same_value_on_repeated_calls(self):
        self.assertEqual(get_data_dir(), get_data_dir())


# ═══════════════════════════════════════════════════════════════════════════════
# 4 — Round-trip: save then load
# ═══════════════════════════════════════════════════════════════════════════════

class TestRoundTrip(unittest.TestCase):

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_simple_list_round_trip(self):
        data = [{"id": "abc", "status": "Open"}]
        path = os.path.join(self.tmpdir, "rt.json")
        save_json_data(path, data)
        result = load_json_data(path)
        self.assertEqual(result, data)

    def test_complex_nested_round_trip(self):
        data = [
            {"id": "t-1", "tags": ["bug", "urgent"], "metadata": {"source": "email"}},
            {"id": "t-2", "priority": "High", "score": 0.95},
        ]
        path = os.path.join(self.tmpdir, "complex_rt.json")
        save_json_data(path, data)
        result = load_json_data(path)
        self.assertEqual(result[0]["tags"], ["bug", "urgent"])
        self.assertEqual(result[1]["score"], 0.95)

    def test_empty_list_round_trip(self):
        path = os.path.join(self.tmpdir, "empty_rt.json")
        save_json_data(path, [])
        result = load_json_data(path)
        self.assertEqual(result, [])

    def test_unicode_round_trip(self):
        data = [{"name": "テスト", "city": "Montréal"}]
        path = os.path.join(self.tmpdir, "unicode_rt.json")
        save_json_data(path, data)
        result = load_json_data(path)
        self.assertEqual(result[0]["name"], "テスト")
        self.assertEqual(result[0]["city"], "Montréal")

    def test_100_items_round_trip(self):
        data = [{"i": i} for i in range(100)]
        path = os.path.join(self.tmpdir, "bulk_rt.json")
        save_json_data(path, data)
        result = load_json_data(path)
        self.assertEqual(len(result), 100)
        self.assertEqual(result[50]["i"], 50)


if __name__ == "__main__":
    unittest.main()
