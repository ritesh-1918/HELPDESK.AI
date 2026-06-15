"""
Unit tests for AES-256-GCM Encryption + PII Redaction + DB Backup Pipeline.

Tests the encryption.py and db_backup.py modules against the existing
pii_redaction.py engine on the gssoc branch.

Run: python -m pytest backend/services/test_backup_security.py -v
"""

from __future__ import annotations

import hashlib
import os
import sys

import pytest

# Ensure backend is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.services.pii_redaction import (
    IP_PATTERN,
    CREDIT_CARD_PATTERN,
    EMAIL_PATTERN,
    PHONE_PATTERN,
    SSN_PATTERN,
    redact_all,
    redact_emails,
    redact_phones,
    redact_ssns,
    redact_credit_cards,
    redact_ip_addresses,
    redact_api_keys,
    redact_row,
    set_pii_redaction_enabled,
    is_pii_redaction_enabled,
    _luhn_check,
)
from backend.services.encryption import (
    decrypt,
    decrypt_payload,
    derive_key,
    encrypt,
    encrypt_payload,
    generate_key,
    re_encrypt,
)


# ═══════════════════════════════════════════════════════════════════════════
# PII Redaction Tests (against existing gssoc pii_redaction.py)
# ═══════════════════════════════════════════════════════════════════════════

class TestPIIDetection:
    """Test PII pattern detection via redaction functions."""

    def test_detect_email(self):
        text = "Contact john.doe@example.com for help"
        result = redact_emails(text)
        assert "john.doe@example.com" not in result
        assert "[REDACTED]" in result

    def test_detect_phone_country_code(self):
        text = "Call +1-555-123-4567 for support"
        result = redact_phones(text)
        assert "555" not in result
        assert "[REDACTED]" in result

    def test_detect_phone_parenthesized(self):
        text = "Phone: (555) 123-4567"
        result = redact_phones(text)
        assert "555" not in result
        assert "[REDACTED]" in result

    def test_detect_phone_dot_separated(self):
        text = "Call 555.123.4567"
        result = redact_phones(text)
        assert "555.123.4567" not in result
        assert "[REDACTED]" in result

    def test_detect_ssn(self):
        text = "SSN: 123-45-6789 was used"
        result = redact_ssns(text)
        assert "123-45-6789" not in result
        assert "[REDACTED]" in result

    def test_detect_credit_card(self):
        # 4111111111111111 is a valid Luhn test card
        text = "Card: 4111-1111-1111-1111"
        result = redact_credit_cards(text)
        assert "4111-1111-1111-1111" not in result
        assert "[REDACTED]" in result

    def test_detect_ip_public(self):
        text = "Connected from 8.8.8.8"
        result = redact_ip_addresses(text)
        assert "8.8.8.8" not in result
        assert "[REDACTED]" in result

    def test_skip_private_ip(self):
        text = "Internal IP 192.168.1.100"
        result = redact_ip_addresses(text)
        assert "192.168.1.100" in result  # Not redacted (private IP)

    def test_detect_api_key_aws(self):
        text = "Access key: AKIA0123456789ABCDEF"
        result = redact_api_keys(text)
        assert "AKIA" not in result
        assert "[REDACTED]" in result

    def test_detect_api_key_github(self):
        text = "Token: ghp_abcdefghijklmnopqrstuvwxyz0123456789"
        result = redact_api_keys(text)
        assert "ghp_" not in result
        assert "[REDACTED]" in result

    def test_redact_all_multiple(self):
        text = "Email alice@test.com and phone (555) 123-4567"
        result = redact_all(text)
        assert "alice@test.com" not in result
        assert "555" not in result
        assert result.count("[REDACTED]") >= 2


class TestPIIRedactionEdgeCases:
    """Test edge cases for PII redaction."""

    def test_redact_non_string(self):
        assert redact_all(None) is None  # type: ignore
        assert redact_all(42) == 42  # type: ignore

    def test_redact_empty_string(self):
        assert redact_all("") == ""

    def test_redact_preserves_non_pii(self):
        text = "The server is running on port 8080"
        result = redact_all(text)
        assert "8080" in result  # Not a phone number pattern
        assert "server" in result

    def test_phone_not_false_positive_port(self):
        """Port numbers like 8080 should not be redacted."""
        result = redact_phones("Port 8080 is open")
        assert "8080" in result

    def test_luhn_check_valid(self):
        assert _luhn_check("4111111111111111") is True

    def test_luhn_check_invalid(self):
        assert _luhn_check("1234567890123456") is False


class TestRedactRow:
    """Test row-level redaction."""

    def test_redact_row_email_field(self):
        set_pii_redaction_enabled(True)
        row = {
            "id": 1,
            "contact_email": "alice@test.com",
            "description": "Fix login bug",
            "status": "open",
        }
        result = redact_row(row)
        assert "alice@test.com" not in result.get("contact_email", "")
        assert "Fix login bug" in result.get("description", "")
        assert result["id"] == 1
        set_pii_redaction_enabled(False)

    def test_redact_row_disabled(self):
        set_pii_redaction_enabled(False)
        row = {"contact_email": "alice@test.com"}
        result = redact_row(row)
        assert "alice@test.com" in result.get("contact_email", "")
        set_pii_redaction_enabled(False)

    def test_redact_row_nested(self):
        set_pii_redaction_enabled(True)
        row = {
            "id": 1,
            "metadata": {"original_text": "Email user@nest.com for help"},
        }
        result = redact_row(row)
        assert "user@nest.com" not in str(result)
        set_pii_redaction_enabled(False)

    def test_is_pii_redaction_enabled(self):
        set_pii_redaction_enabled(True)
        assert is_pii_redaction_enabled() is True
        set_pii_redaction_enabled(False)
        assert is_pii_redaction_enabled() is False


# ═══════════════════════════════════════════════════════════════════════════
# AES-256-GCM Encryption Tests
# ═══════════════════════════════════════════════════════════════════════════

class TestKeyDerivation:
    """Test key derivation functions."""

    def test_derive_key_length(self):
        key, salt = derive_key("my-secure-passphrase")
        assert len(key) == 32  # 256 bits
        assert len(salt) == 32

    def test_derive_key_deterministic(self):
        key1, _ = derive_key("pass", salt=b"x" * 32)
        key2, _ = derive_key("pass", salt=b"x" * 32)
        assert key1 == key2

    def test_derive_key_different_passphrase(self):
        key1, _ = derive_key("pass1", salt=b"x" * 32)
        key2, _ = derive_key("pass2", salt=b"x" * 32)
        assert key1 != key2

    def test_generate_key_length(self):
        key = generate_key()
        assert len(key) == 32

    def test_generate_key_random(self):
        key1 = generate_key()
        key2 = generate_key()
        assert key1 != key2


class TestEncryptionRoundTrip:
    """Test encrypt/decrypt round-trip."""

    def test_encrypt_decrypt_string(self):
        key = generate_key()
        plaintext = "Hello, secure world!"
        encrypted = encrypt(plaintext, key)
        decrypted = decrypt(encrypted, key)
        assert decrypted.decode() == plaintext

    def test_encrypt_decrypt_bytes(self):
        key = generate_key()
        plaintext = b"\x00\x01\x02\x03" * 10
        encrypted = encrypt(plaintext, key)
        decrypted = decrypt(encrypted, key)
        assert decrypted == plaintext

    def test_encrypt_decrypt_empty(self):
        key = generate_key()
        encrypted = encrypt("", key)
        decrypted = decrypt(encrypted, key)
        assert decrypted == b""

    def test_encrypt_decrypt_unicode(self):
        key = generate_key()
        plaintext = "你好世界 🚀 émojis work too"
        encrypted = encrypt(plaintext, key)
        decrypted = decrypt(encrypted, key)
        assert decrypted.decode() == plaintext

    def test_encrypt_decrypt_large(self):
        key = generate_key()
        plaintext = "A" * 10000
        encrypted = encrypt(plaintext, key)
        decrypted = decrypt(encrypted, key)
        assert decrypted.decode() == plaintext

    def test_wrong_key_fails(self):
        key = generate_key()
        wrong_key = generate_key()
        encrypted = encrypt("secret", key)
        with pytest.raises(ValueError, match="authentication check failed"):
            decrypt(encrypted, wrong_key)

    def test_tampered_ciphertext_fails(self):
        key = generate_key()
        encrypted = encrypt("secret", key)
        # Tamper with ciphertext
        encrypted["ciphertext_b64"] = "AAAA" + encrypted["ciphertext_b64"][4:]
        with pytest.raises(ValueError):
            decrypt(encrypted, key)

    def test_invalid_key_length_raises(self):
        with pytest.raises(ValueError, match="exactly 32"):
            encrypt("test", b"short")

    def test_nonce_is_unique(self):
        key = generate_key()
        e1 = encrypt("data", key)
        e2 = encrypt("data", key)
        assert e1["nonce_b64"] != e2["nonce_b64"]
        assert e1["ciphertext_b64"] != e2["ciphertext_b64"]

    def test_associated_data(self):
        key = generate_key()
        ad = b"metadata-for-auth"
        encrypted = encrypt("payload", key, associated_data=ad)
        decrypted = decrypt(encrypted, key)
        assert decrypted == b"payload"


class TestPayloadEncryption:
    """Test high-level encrypt_payload / decrypt_payload."""

    def test_encrypt_decrypt_payload_passphrase(self):
        data = {"users": [{"name": "Alice"}]}
        envelope = encrypt_payload(data, passphrase="strong-passphrase")
        assert envelope["version"] == 1
        assert envelope["algorithm"] == "AES-256-GCM"
        assert "encrypted" in envelope
        assert envelope["kdf"]["algorithm"] == "PBKDF2-HMAC-SHA256"
        assert envelope["kdf"]["iterations"] == 600_000

        decrypted = decrypt_payload(envelope, passphrase="strong-passphrase")
        assert decrypted == data

    def test_encrypt_decrypt_payload_key(self):
        key = generate_key()
        data = [1, 2, 3, {"nested": True}]
        envelope = encrypt_payload(data, key=key)
        decrypted = decrypt_payload(envelope, key=key)
        assert decrypted == data

    def test_wrong_passphrase_fails(self):
        data = {"secret": "top"}
        envelope = encrypt_payload(data, passphrase="correct")
        with pytest.raises(ValueError, match="authentication check failed"):
            decrypt_payload(envelope, passphrase="wrong")

    def test_missing_passphrase_raises(self):
        with pytest.raises(ValueError, match="passphrase or key"):
            encrypt_payload({"data": 1})


class TestReEncryption:
    """Test key rotation."""

    def test_re_encrypt(self):
        data = {"secret": "rotate-me"}
        envelope = encrypt_payload(data, passphrase="old-key")
        re_encrypted = re_encrypt(envelope, "old-key", "new-key")
        decrypted = decrypt_payload(re_encrypted, passphrase="new-key")
        assert decrypted == data

    def test_re_encrypt_old_key_fails(self):
        data = {"secret": "rotate-me"}
        envelope = encrypt_payload(data, passphrase="old-key")
        re_encrypted = re_encrypt(envelope, "old-key", "new-key")
        with pytest.raises(ValueError):
            decrypt_payload(re_encrypted, passphrase="old-key")


# ═══════════════════════════════════════════════════════════════════════════
# Integration: Redaction → Encryption pipeline
# ═══════════════════════════════════════════════════════════════════════════

class TestRedactAndEncrypt:
    """Test full redaction + encryption pipeline."""

    def test_redact_then_encrypt_roundtrip(self):
        set_pii_redaction_enabled(True)

        records = [
            {
                "id": 1,
                "contact_email": "user@acme.com",
                "phone": "(555) 123-4567",
                "description": "regular note",
            },
            {
                "id": 2,
                "contact_email": "admin@acme.com",
                "phone": "(555) 987-6543",
                "description": "no PII content",
            },
        ]

        # Redact each record
        redacted_rows = [redact_row(r) for r in records]

        # Verify redaction
        assert "user@acme.com" not in redacted_rows[0].get("contact_email", "")
        assert "(555) 123-4567" not in redacted_rows[0].get("phone", "")
        assert redacted_rows[0]["description"] == "regular note"

        # Encrypt the redacted data
        envelope = encrypt_payload(
            {"data": redacted_rows, "summary": "redacted backup"},
            passphrase="backup-key",
        )

        # Decrypt and verify
        restored = decrypt_payload(envelope, passphrase="backup-key")
        assert len(restored["data"]) == 2
        assert restored["data"][0]["id"] == 1
        assert "user@acme.com" not in restored["data"][0].get("contact_email", "")

        set_pii_redaction_enabled(False)

    def test_redact_then_encrypt_key_rotation(self):
        set_pii_redaction_enabled(True)

        data = {"contact_email": "a@b.com", "description": "test"}
        envelope = encrypt_payload(data, passphrase="v1")
        re_encrypted = re_encrypt(envelope, "v1", "v2")
        restored = decrypt_payload(re_encrypted, passphrase="v2")
        assert restored == data

        set_pii_redaction_enabled(False)

    def test_full_pipeline_unredacted_fields(self):
        """Non-PII fields should survive redaction unchanged."""
        set_pii_redaction_enabled(True)

        row = {
            "id": 42,
            "subject": "Login page timeout",
            "description": "Users on Chrome 120 see 504 timeout at login",
            "contact_email": "dev@company.io",
            "status": "open",
            "priority": "high",
            "created_at": "2026-06-15T10:00:00Z",
        }
        result = redact_row(row)

        assert result["id"] == 42
        assert result["subject"] == "Login page timeout"
        assert result["status"] == "open"
        assert result["priority"] == "high"
        assert "dev@company.io" not in result.get("contact_email", "")
        assert "Chrome 120" in result.get("description", "")  # Not PII

        # Encrypt and verify full roundtrip
        envelope = encrypt_payload(result, passphrase="test-key")
        restored = decrypt_payload(envelope, passphrase="test-key")
        assert restored["id"] == 42
        assert restored["subject"] == "Login page timeout"

        set_pii_redaction_enabled(False)
