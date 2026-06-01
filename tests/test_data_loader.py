import pytest
import os
import json
from backend.utils.data_loader import load_json_data, save_json_data, get_data_dir

def test_load_non_existent_file():
    assert load_json_data("non_existent.json") == []

def test_save_and_load_valid_json(tmp_path):
    test_file = tmp_path / "test.json"
    data = [{"id": 1, "text": "test"}]
    assert save_json_data(str(test_file), data) is True
    assert load_json_data(str(test_file)) == data

def test_load_invalid_json(tmp_path):
    test_file = tmp_path / "invalid.json"
    with open(test_file, "w") as f:
        f.write("not json")
    assert load_json_data(str(test_file)) == []

def test_load_non_list_json(tmp_path):
    test_file = tmp_path / "object.json"
    with open(test_file, "w") as f:
        f.write('{"key": "value"}')
    assert load_json_data(str(test_file)) == []

def test_get_data_dir():
    data_dir = get_data_dir()
    assert os.path.isdir(data_dir)
    assert data_dir.endswith(os.path.join("backend", "data"))

def test_load_real_knowledge_base():
    data_dir = get_data_dir()
    kb_path = os.path.join(data_dir, "knowledge_base.json")
    data = load_json_data(kb_path)
    assert isinstance(data, list)
    if len(data) > 0:
        assert "text" in data[0]
