"""
Unit tests for backend/utils/data_loader.py — extended edge cases.

Builds on the existing test_data_loader.py by covering save_json_data
edge cases, get_data_dir, and additional error paths.
"""

import json
from pathlib import Path

import pytest

from backend.utils.data_loader import (
    get_data_dir,
    load_json_data,
    save_json_data,
)


# ─── save_json_data ───────────────────────────────────────────────────────────

def test_save_and_reload(tmp_path):
    p = tmp_path / "sub" / "data.json"
    assert save_json_data(str(p), [{"a": 1}, {"b": 2}]) is True
    assert load_json_data(str(p)) == [{"a": 1}, {"b": 2}]


def test_creates_parent_directories(tmp_path):
    p = tmp_path / "deeply" / "nested" / "path" / "f.json"
    assert save_json_data(str(p), [1, 2, 3]) is True
    assert p.exists()


def test_save_empty_list(tmp_path):
    p = tmp_path / "f.json"
    assert save_json_data(str(p), []) is True
    assert load_json_data(str(p)) == []


def test_save_non_list_data(tmp_path):
    # save_json_data does not validate type; just writes JSON
    p = tmp_path / "f.json"
    assert save_json_data(str(p), {"a": 1}) is True
    assert '"a"' in p.read_text()


def test_save_json_data_unserializable_raises(tmp_path):
    p = tmp_path / "f.json"
    with pytest.raises((TypeError, ValueError)):
        save_json_data(str(p), [object()])


def test_save_json_data_read_only_dir(tmp_path):
    ro = tmp_path / "readonly"
    ro.mkdir()
    ro.chmod(0o444)
    try:
        result = save_json_data(str(ro / "f.json"), [1])
        assert result is False
    finally:
        ro.chmod(0o755)


# ─── load_json_data ───────────────────────────────────────────────────────────

@pytest.mark.parametrize("content", [
    '{"key": "value"}',
    '"just a string"',
    "42",
    "null",
    "true",
    "false",
])
def test_non_list_json_returns_empty(tmp_path, content):
    p = tmp_path / "f.json"
    p.write_text(content)
    assert load_json_data(str(p)) == []


def test_unicode_content(tmp_path):
    p = tmp_path / "f.json"
    p.write_text('[{"name": "中文"}]', encoding="utf-8")
    assert load_json_data(str(p)) == [{"name": "中文"}]


def test_nested_list(tmp_path):
    p = tmp_path / "f.json"
    p.write_text("[[1, 2], [3, 4]]")
    assert load_json_data(str(p)) == [[1, 2], [3, 4]]


def test_load_json_data_permission_error(tmp_path):
    p = tmp_path / "f.json"
    p.write_text("[1]")
    p.chmod(0o000)
    try:
        result = load_json_data(str(p))
        assert result == []
    finally:
        p.chmod(0o644)


def test_load_json_data_missing_file_returns_empty():
    assert load_json_data("/nonexistent/path/file.json") == []


def test_load_json_data_corrupt_json(tmp_path):
    p = tmp_path / "bad.json"
    p.write_text("{corrupt json{{")
    assert load_json_data(str(p)) == []


# ─── get_data_dir ─────────────────────────────────────────────────────────────

def test_get_data_dir_returns_absolute_path():
    assert Path(get_data_dir()).is_absolute()


def test_get_data_dir_ends_with_data():
    assert Path(get_data_dir()).name == "data"