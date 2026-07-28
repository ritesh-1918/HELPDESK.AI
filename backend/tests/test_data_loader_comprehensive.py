"""
Comprehensive tests for backend/utils/data_loader.py
Extended coverage: edge cases, error handling, encoding, nested structures.
"""

import pytest
import os
import json
import tempfile
from backend.utils.data_loader import load_json_data, save_json_data, get_data_dir


class TestLoadJsonData:
    """Tests for load_json_data function."""

    def test_non_existent_file_returns_empty_list(self):
        assert load_json_data("non_existent_file.json") == []

    def test_non_existent_nested_path_returns_empty_list(self):
        assert load_json_data("/tmp/deep/nested/nonexistent.json") == []

    def test_empty_file_returns_empty_list(self, tmp_path):
        test_file = tmp_path / "empty.json"
        test_file.write_text("")
        assert load_json_data(str(test_file)) == []

    def test_valid_json_list(self, tmp_path):
        test_file = tmp_path / "valid.json"
        data = [{"id": 1, "name": "test"}, {"id": 2, "name": "test2"}]
        test_file.write_text(json.dumps(data))
        assert load_json_data(str(test_file)) == data

    def test_valid_json_empty_list(self, tmp_path):
        test_file = tmp_path / "empty_list.json"
        test_file.write_text("[]")
        assert load_json_data(str(test_file)) == []

    def test_invalid_json_returns_empty_list(self, tmp_path):
        test_file = tmp_path / "invalid.json"
        test_file.write_text("not json at all")
        assert load_json_data(str(test_file)) == []

    def test_malformed_json_returns_empty_list(self, tmp_path):
        test_file = tmp_path / "malformed.json"
        test_file.write_text('{"incomplete": ')
        assert load_json_data(str(test_file)) == []

    def test_json_object_returns_empty_list(self, tmp_path):
        """Non-list JSON should return empty list."""
        test_file = tmp_path / "object.json"
        test_file.write_text('{"key": "value"}')
        assert load_json_data(str(test_file)) == []

    def test_json_string_returns_empty_list(self, tmp_path):
        test_file = tmp_path / "string.json"
        test_file.write_text('"just a string"')
        assert load_json_data(str(test_file)) == []

    def test_json_number_returns_empty_list(self, tmp_path):
        test_file = tmp_path / "number.json"
        test_file.write_text("42")
        assert load_json_data(str(test_file)) == []

    def test_json_null_returns_empty_list(self, tmp_path):
        test_file = tmp_path / "null.json"
        test_file.write_text("null")
        assert load_json_data(str(test_file)) == []

    def test_nested_list_structure(self, tmp_path):
        test_file = tmp_path / "nested.json"
        data = [[1, 2], [3, 4]]
        test_file.write_text(json.dumps(data))
        assert load_json_data(str(test_file)) == data

    def test_unicode_content(self, tmp_path):
        test_file = tmp_path / "unicode.json"
        data = [{"text": "こんにちは世界", "emoji": "🎯"}]
        test_file.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        result = load_json_data(str(test_file))
        assert result == data

    def test_large_file(self, tmp_path):
        test_file = tmp_path / "large.json"
        data = [{"id": i, "value": f"item_{i}"} for i in range(1000)]
        test_file.write_text(json.dumps(data))
        result = load_json_data(str(test_file))
        assert len(result) == 1000

    def test_read_real_knowledge_base(self):
        """Integration test: load the actual knowledge_base.json."""
        data_dir = get_data_dir()
        kb_path = os.path.join(data_dir, "knowledge_base.json")
        if os.path.exists(kb_path):
            data = load_json_data(kb_path)
            assert isinstance(data, list)


class TestSaveJsonData:
    """Tests for save_json_data function."""

    def test_save_valid_data(self, tmp_path):
        test_file = tmp_path / "output.json"
        data = [{"id": 1, "text": "test"}]
        assert save_json_data(str(test_file), data) is True
        assert test_file.exists()

    def test_saved_data_is_loadable(self, tmp_path):
        test_file = tmp_path / "roundtrip.json"
        data = [{"id": 1, "name": "test"}, {"id": 2, "name": "test2"}]
        save_json_data(str(test_file), data)
        loaded = load_json_data(str(test_file))
        assert loaded == data

    def test_save_creates_parent_directories(self, tmp_path):
        test_file = tmp_path / "nested" / "dir" / "output.json"
        assert save_json_data(str(test_file), [{"key": "value"}]) is True
        assert test_file.exists()

    def test_save_empty_list(self, tmp_path):
        test_file = tmp_path / "empty.json"
        assert save_json_data(str(test_file), []) is True
        loaded = load_json_data(str(test_file))
        assert loaded == []

    def test_save_dict(self, tmp_path):
        test_file = tmp_path / "dict.json"
        data = {"key": "value", "nested": {"a": 1}}
        assert save_json_data(str(test_file), data) is True
        with open(test_file) as f:
            loaded = json.load(f)
        assert loaded == data

    def test_save_overwrites_existing(self, tmp_path):
        test_file = tmp_path / "overwrite.json"
        save_json_data(str(test_file), [{"old": True}])
        save_json_data(str(test_file), [{"new": True}])
        loaded = load_json_data(str(test_file))
        assert loaded == [{"new": True}]

    def test_save_unicode(self, tmp_path):
        test_file = tmp_path / "unicode.json"
        data = [{"text": "こんにちは", "emoji": "🎯"}]
        assert save_json_data(str(test_file), data) is True
        loaded = load_json_data(str(test_file))
        assert loaded == data

    def test_save_pretty_printed(self, tmp_path):
        test_file = tmp_path / "pretty.json"
        data = [{"id": 1}]
        save_json_data(str(test_file), data)
        content = test_file.read_text()
        assert "\n" in content  # Should be indented
        assert "  " in content  # Should have 2-space indent


class TestGetDataDir:
    """Tests for get_data_dir function."""

    def test_returns_absolute_path(self):
        data_dir = get_data_dir()
        assert os.path.isabs(data_dir)

    def test_ends_with_backend_data(self):
        data_dir = get_data_dir()
        assert data_dir.endswith(os.path.join("backend", "data"))

    def test_directory_exists(self):
        data_dir = get_data_dir()
        assert os.path.isdir(data_dir)

    def test_returns_string(self):
        data_dir = get_data_dir()
        assert isinstance(data_dir, str)

    def test_consistent_results(self):
        """Multiple calls should return the same path."""
        dir1 = get_data_dir()
        dir2 = get_data_dir()
        assert dir1 == dir2
