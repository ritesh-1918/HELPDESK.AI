"""Tests for backend.auth.crypto AES-256-GCM helpers."""

from __future__ import annotations

import base64
import importlib
import os
import sys


def _reload_crypto(key: str | None):
    if key is None:
        os.environ.pop("DB_ENCRYPTION_SECRET_KEY", None)
    else:
        os.environ["DB_ENCRYPTION_SECRET_KEY"] = key
    sys.modules.pop("backend.auth.crypto", None)
    return importlib.import_module("backend.auth.crypto")


def test_roundtrip_with_key():
    key = base64.urlsafe_b64encode(b"\x01" * 32).decode()
    crypto = _reload_crypto(key)
    assert crypto.is_enabled() is True

    ct = crypto.encrypt("hello@example.com")
    assert ct != "hello@example.com"
    assert ct.startswith("enc:v1:")
    assert crypto.decrypt(ct) == "hello@example.com"


def test_field_hooks_encrypt_only_pii():
    key = base64.urlsafe_b64encode(b"\x02" * 32).decode()
    crypto = _reload_crypto(key)

    row = {
        "id": "abc",
        "contact_email": "user@example.com",
        "description": "ticket body",
        "raw_text": "raw payload",
        "status": "open",
    }
    encrypted = crypto.encrypt_fields(dict(row))
    for f in crypto.TICKET_PII_FIELDS:
        assert encrypted[f].startswith("enc:v1:")
    # Non-PII untouched.
    assert encrypted["status"] == "open"
    assert encrypted["id"] == "abc"

    decrypted = crypto.decrypt_fields(encrypted)
    for f in crypto.TICKET_PII_FIELDS:
        assert decrypted[f] == row[f]


def test_graceful_degrade_without_key():
    crypto = _reload_crypto(None)
    assert crypto.is_enabled() is False
    # Encrypt is a no-op pass-through.
    assert crypto.encrypt("secret") == "secret"
    # Decrypting an already-plaintext value returns it unchanged.
    assert crypto.decrypt("plain") == "plain"
    # Field hooks must not corrupt records.
    row = {"contact_email": "user@example.com", "status": "open"}
    assert crypto.encrypt_fields(dict(row)) == row


def test_double_encrypt_is_noop():
    key = base64.urlsafe_b64encode(b"\x03" * 32).decode()
    crypto = _reload_crypto(key)
    ct = crypto.encrypt("payload")
    assert crypto.encrypt(ct) == ct


def test_decrypt_rows_handles_list_and_dict():
    key = base64.urlsafe_b64encode(b"\x04" * 32).decode()
    crypto = _reload_crypto(key)
    rows = [crypto.encrypt_fields({"description": "a"}), crypto.encrypt_fields({"description": "b"})]
    out = crypto.decrypt_rows(rows)
    assert [r["description"] for r in out] == ["a", "b"]
