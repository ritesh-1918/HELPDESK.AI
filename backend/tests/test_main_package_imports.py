import ast
import importlib
import sys
import types
from pathlib import Path

import pytest


def test_main_uses_package_safe_imports_for_local_modules():
    source = (Path(__file__).resolve().parents[2] / "backend" / "main.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    import_from_modules = [node.module for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)]

    assert "encryption" not in import_from_modules
    assert "pii_redaction" not in import_from_modules
    assert "services.encryption_service" not in import_from_modules
    assert "backend.encryption" in import_from_modules
    assert "backend.pii_redaction" in import_from_modules
    assert "backend.services.encryption_service" in import_from_modules


def test_main_imports_as_package_module(monkeypatch):
    monkeypatch.setenv("ALLOW_DEGRADED_STARTUP", "1")
    monkeypatch.setenv("SUPABASE_URL", "https://placeholder.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "placeholder_key")
    sys.modules.pop("backend.main", None)
    monkeypatch.setitem(sys.modules, "Crypto", types.ModuleType("Crypto"))
    monkeypatch.setitem(sys.modules, "Crypto.Cipher", types.ModuleType("Crypto.Cipher"))
    monkeypatch.setitem(sys.modules, "Crypto.Random", types.ModuleType("Crypto.Random"))
    fake_aes = types.SimpleNamespace(MODE_GCM=1, new=lambda *args, **kwargs: None)
    sys.modules["Crypto.Cipher"].AES = fake_aes
    sys.modules["Crypto.Random"].get_random_bytes = lambda size: b"0" * size

    try:
        module = importlib.import_module("backend.main")
    except ModuleNotFoundError as exc:
        if exc.name in {"encryption", "pii_redaction", "services"}:
            raise
        pytest.skip(f"backend.main import requires optional dependency {exc.name!r}")

    assert hasattr(module, "app")
