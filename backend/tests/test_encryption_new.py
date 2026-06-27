"""Unit tests for backend.utils.encryption.

Issue #1101 asks for coverage around the encryption utility. These tests keep
the cryptography package real while patching key derivation where the exact
PBKDF2 output is not under test, making the suite fast and deterministic.
"""

import base64
from unittest.mock import MagicMock

import pytest

from backend.utils import encryption


FAST_TEST_KEY = b"0" * 32


class TestGetEncryptionKey:
    def test_uses_default_password_and_salt(self, monkeypatch):
        monkeypatch.delenv("ENCRYPTION_PASSWORD", raising=False)
        monkeypatch.delenv("ENCRYPTION_SALT", raising=False)

        mock_kdf = MagicMock()
        mock_kdf.derive.return_value = FAST_TEST_KEY
        kdf_cls = MagicMock(return_value=mock_kdf)
        monkeypatch.setattr(encryption, "PBKDF2HMAC", kdf_cls)

        assert encryption.get_encryption_key() == FAST_TEST_KEY
        kdf_cls.assert_called_once()
        mock_kdf.derive.assert_called_once_with(b"helpdesk-default-key")

    def test_uses_environment_password_and_salt(self, monkeypatch):
        monkeypatch.setenv("ENCRYPTION_PASSWORD", "env-password")
        monkeypatch.setenv("ENCRYPTION_SALT", "env-salt")

        mock_kdf = MagicMock()
        mock_kdf.derive.return_value = FAST_TEST_KEY
        kdf_cls = MagicMock(return_value=mock_kdf)
        monkeypatch.setattr(encryption, "PBKDF2HMAC", kdf_cls)

        assert encryption.get_encryption_key() == FAST_TEST_KEY
        kwargs = kdf_cls.call_args.kwargs
        assert kwargs["salt"] == b"env-salt"
        mock_kdf.derive.assert_called_once_with(b"env-password")

    def test_accepts_string_and_bytes_salt(self, monkeypatch):
        seen_salts = []

        def fake_kdf_factory(**kwargs):
            seen_salts.append(kwargs["salt"])
            mock_kdf = MagicMock()
            mock_kdf.derive.return_value = FAST_TEST_KEY
            return mock_kdf

        monkeypatch.setattr(encryption, "PBKDF2HMAC", fake_kdf_factory)

        assert encryption.get_encryption_key("pw", salt="string-salt") == FAST_TEST_KEY
        assert encryption.get_encryption_key("pw", salt=b"bytes-salt") == FAST_TEST_KEY
        assert seen_salts == [b"string-salt", b"bytes-salt"]


class TestAesGcmEncryption:
    @pytest.fixture(autouse=True)
    def fast_key(self, monkeypatch):
        monkeypatch.setattr(encryption, "get_encryption_key", lambda password=None: FAST_TEST_KEY)

    @pytest.mark.parametrize(
        "plaintext",
        [
            "normal password",
            "p@ssw0rd! $%^&*()",
            "unicode text: hola, こんにちは, 🔐",
            "x" * 10_000,
        ],
    )
    def test_encrypt_decrypt_roundtrip_for_various_inputs(self, plaintext):
        encrypted = encryption.encrypt_aes256_gcm(plaintext, password="secret")

        assert encrypted != plaintext
        assert isinstance(encrypted, str)
        assert encryption.decrypt_aes256_gcm(encrypted, password="secret") == plaintext

    def test_empty_values_are_preserved(self):
        assert encryption.encrypt_aes256_gcm("") == ""
        assert encryption.decrypt_aes256_gcm("") == ""

    def test_nonce_is_prepended_to_ciphertext(self, monkeypatch):
        monkeypatch.setattr(encryption.os, "urandom", lambda size: b"\x01" * size)

        encrypted = encryption.encrypt_aes256_gcm("hello")
        decoded = base64.b64decode(encrypted)

        assert decoded[:12] == b"\x01" * 12
        assert len(decoded) > 12

    def test_same_plaintext_uses_random_nonce(self):
        first = encryption.encrypt_aes256_gcm("same text")
        second = encryption.encrypt_aes256_gcm("same text")

        assert first != second
        assert encryption.decrypt_aes256_gcm(first) == "same text"
        assert encryption.decrypt_aes256_gcm(second) == "same text"

    def test_tampered_ciphertext_raises(self):
        encrypted = encryption.encrypt_aes256_gcm("sensitive")
        raw = bytearray(base64.b64decode(encrypted))
        raw[-1] ^= 1
        tampered = base64.b64encode(raw).decode("utf-8")

        with pytest.raises(Exception):
            encryption.decrypt_aes256_gcm(tampered)

    def test_invalid_base64_raises(self):
        with pytest.raises(Exception):
            encryption.decrypt_aes256_gcm("not valid base64")


class TestPiiRedaction:
    @pytest.mark.parametrize(
        ("text", "token", "secret"),
        [
            ("Email user@example.com", "[REDACTED_EMAIL]", "user@example.com"),
            ("Call +1 800-555-0199", "[REDACTED_PHONE]", "800-555-0199"),
            ("SSN 123-45-6789", "[REDACTED_SSN]", "123-45-6789"),
            ("Card 4111-1111-1111-1111", "[REDACTED_CREDIT_CARD]", "4111-1111-1111-1111"),
        ],
    )
    def test_redacts_supported_pii_types(self, text, token, secret):
        redacted = encryption.redact_pii(text)

        assert token in redacted
        assert secret not in redacted

    def test_redacts_multiple_pii_types_together(self):
        text = (
            "Email me@test.com, phone 123-456-7890, "
            "SSN 987-65-4321, card 5555 5555 5555 4444"
        )

        redacted = encryption.redact_pii(text)

        for token in (
            "[REDACTED_EMAIL]",
            "[REDACTED_PHONE]",
            "[REDACTED_SSN]",
            "[REDACTED_CREDIT_CARD]",
        ):
            assert token in redacted
        assert "me@test.com" not in redacted
        assert "987-65-4321" not in redacted

    def test_falsy_text_is_returned_unchanged(self):
        assert encryption.redact_pii("") == ""
        assert encryption.redact_pii(None) is None

    def test_text_without_pii_is_unchanged(self):
        text = "A normal support ticket without sensitive data."
        assert encryption.redact_pii(text) == text


class TestCombinedHelpers:
    @pytest.fixture(autouse=True)
    def fast_key(self, monkeypatch):
        monkeypatch.setattr(encryption, "get_encryption_key", lambda password=None: FAST_TEST_KEY)

    def test_redact_and_encrypt_hides_pii_before_encryption(self):
        encrypted = encryption.redact_and_encrypt("Contact user@example.com", password="secret")

        assert "user@example.com" not in encrypted
        decrypted = encryption.decrypt_and_reveal(encrypted, password="secret")
        assert decrypted == "Contact [REDACTED_EMAIL]"

    def test_empty_redact_and_encrypt_returns_empty(self):
        assert encryption.redact_and_encrypt("") == ""

    def test_decrypt_and_reveal_delegates_to_decrypt(self):
        encrypted = encryption.encrypt_aes256_gcm("Message [REDACTED_EMAIL]")

        assert encryption.decrypt_and_reveal(encrypted) == "Message [REDACTED_EMAIL]"
