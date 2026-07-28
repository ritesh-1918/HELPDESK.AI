"""
Tests for backend/services/encryption_service.py (Issue #903).
Covers: encrypt/decrypt round-trip, different plaintexts produce different ciphertexts,
correct key decrypts, wrong key raises error, missing key graceful fallback,
empty string, unicode strings, very long strings, base64 encoding validity,
nonce uniqueness across encryptions.
"""

import sys
import os
import base64
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# 32-byte test key as hex (64 hex chars)
_TEST_KEY_HEX = "a" * 64  # 32 bytes of 0xAA


def _with_key(test_key_hex=_TEST_KEY_HEX):
    """Context manager that sets TICKET_ENCRYPTION_KEY and unloads the module cache."""
    return patch.dict(os.environ, {"TICKET_ENCRYPTION_KEY": test_key_hex})


def _without_key():
    """Context manager that removes TICKET_ENCRYPTION_KEY."""
    env = dict(os.environ)
    env.pop("TICKET_ENCRYPTION_KEY", None)
    return patch.dict(os.environ, env, clear=True)


def _import_svc():
    """Import encryption_service fresh (avoids module-level caching of key)."""
    import importlib
    if "backend.services.encryption_service" in sys.modules:
        del sys.modules["backend.services.encryption_service"]
    return importlib.import_module("backend.services.encryption_service")


def _pycryptodome_available():
    try:
        from Crypto.Cipher import AES  # noqa: F401
        return True
    except ImportError:
        return False


SKIP_IF_NO_CRYPTO = unittest.skipUnless(
    _pycryptodome_available(), "pycryptodome not installed"
)


class TestEncryptDecryptRoundTrip(unittest.TestCase):
    @SKIP_IF_NO_CRYPTO
    def test_basic_round_trip(self):
        with _with_key():
            svc = _import_svc()
            plaintext = "My printer is broken"
            encrypted = svc.encrypt_field(plaintext)
            decrypted = svc.decrypt_field(encrypted)
            self.assertEqual(decrypted, plaintext)

    @SKIP_IF_NO_CRYPTO
    def test_unicode_round_trip(self):
        with _with_key():
            svc = _import_svc()
            plaintext = "मेरा प्रिंटर काम नहीं कर रहा"
            encrypted = svc.encrypt_field(plaintext)
            decrypted = svc.decrypt_field(encrypted)
            self.assertEqual(decrypted, plaintext)

    @SKIP_IF_NO_CRYPTO
    def test_very_long_text_round_trip(self):
        with _with_key():
            svc = _import_svc()
            plaintext = "A" * 10000
            encrypted = svc.encrypt_field(plaintext)
            decrypted = svc.decrypt_field(encrypted)
            self.assertEqual(decrypted, plaintext)

    @SKIP_IF_NO_CRYPTO
    def test_special_characters_round_trip(self):
        with _with_key():
            svc = _import_svc()
            plaintext = "Error: 0x0000007B [!@#$%^&*()] — crash at 0xFF00\n\tStack trace..."
            encrypted = svc.encrypt_field(plaintext)
            decrypted = svc.decrypt_field(encrypted)
            self.assertEqual(decrypted, plaintext)

    @SKIP_IF_NO_CRYPTO
    def test_single_char_round_trip(self):
        with _with_key():
            svc = _import_svc()
            encrypted = svc.encrypt_field("X")
            decrypted = svc.decrypt_field(encrypted)
            self.assertEqual(decrypted, "X")


class TestDifferentPlaintextsDifferentCiphertexts(unittest.TestCase):
    @SKIP_IF_NO_CRYPTO
    def test_different_plaintexts_produce_different_ciphertexts(self):
        with _with_key():
            svc = _import_svc()
            enc1 = svc.encrypt_field("Ticket A")
            enc2 = svc.encrypt_field("Ticket B")
            self.assertNotEqual(enc1, enc2)

    @SKIP_IF_NO_CRYPTO
    def test_same_plaintext_produces_different_ciphertexts_nonce(self):
        with _with_key():
            svc = _import_svc()
            plaintext = "Same text"
            enc1 = svc.encrypt_field(plaintext)
            enc2 = svc.encrypt_field(plaintext)
            # Due to random nonce, same plaintext → different ciphertexts
            self.assertNotEqual(enc1, enc2)

    @SKIP_IF_NO_CRYPTO
    def test_nonce_uniqueness_across_10_encryptions(self):
        with _with_key():
            svc = _import_svc()
            nonces = set()
            for i in range(10):
                enc = svc.encrypt_field(f"ticket {i}")
                payload = base64.b64decode(enc)
                nonce = payload[:16]
                nonces.add(nonce)
            self.assertEqual(len(nonces), 10, "All 10 nonces must be unique")


class TestWrongKeyFailure(unittest.TestCase):
    @SKIP_IF_NO_CRYPTO
    def test_wrong_key_raises_value_error(self):
        key_a = "a" * 64  # 32 bytes of 0xAA
        key_b = "b" * 64  # 32 bytes of 0xBB

        with _with_key(key_a):
            svc_a = _import_svc()
            encrypted = svc_a.encrypt_field("sensitive data")

        with _with_key(key_b):
            svc_b = _import_svc()
            with self.assertRaises(ValueError):
                svc_b.decrypt_field(encrypted)


class TestMissingKeyGracefulFallback(unittest.TestCase):
    def test_encrypt_returns_plaintext_when_key_not_set(self):
        with _without_key():
            svc = _import_svc()
            result = svc.encrypt_field("plaintext data")
            self.assertEqual(result, "plaintext data")

    def test_decrypt_returns_input_when_key_not_set(self):
        with _without_key():
            svc = _import_svc()
            result = svc.decrypt_field("some data")
            self.assertEqual(result, "some data")

    def test_encrypt_empty_string_returns_empty(self):
        with _with_key():
            svc = _import_svc()
            result = svc.encrypt_field("")
            self.assertEqual(result, "")

    def test_decrypt_empty_string_returns_empty(self):
        with _with_key():
            svc = _import_svc()
            result = svc.decrypt_field("")
            self.assertEqual(result, "")


class TestBase64EncodingValidity(unittest.TestCase):
    @SKIP_IF_NO_CRYPTO
    def test_encrypted_output_is_valid_base64(self):
        with _with_key():
            svc = _import_svc()
            encrypted = svc.encrypt_field("Test ticket description")
            try:
                decoded = base64.b64decode(encrypted)
                self.assertIsInstance(decoded, bytes)
            except Exception as exc:
                self.fail(f"Encrypted output is not valid base64: {exc}")

    @SKIP_IF_NO_CRYPTO
    def test_encrypted_output_min_length(self):
        with _with_key():
            svc = _import_svc()
            encrypted = svc.encrypt_field("x")
            payload = base64.b64decode(encrypted)
            # nonce(16) + tag(16) + at least 1 byte ciphertext = 33
            self.assertGreaterEqual(len(payload), 33)


class TestEncryptTicketPII(unittest.TestCase):
    @SKIP_IF_NO_CRYPTO
    def test_encrypt_ticket_pii_encrypts_subject_and_description(self):
        with _with_key():
            svc = _import_svc()
            ticket = {
                "subject": "VPN Connection Issue",
                "description": "User cannot access internal systems",
                "category": "Network",
                "priority": "High",
            }
            result = svc.encrypt_ticket_pii(ticket)
            self.assertNotEqual(result["subject"], ticket["subject"])
            self.assertNotEqual(result["description"], ticket["description"])
            # Non-PII fields unchanged
            self.assertEqual(result["category"], "Network")
            self.assertEqual(result["priority"], "High")

    @SKIP_IF_NO_CRYPTO
    def test_decrypt_ticket_pii_restores_original(self):
        with _with_key():
            svc = _import_svc()
            ticket = {
                "subject": "Printer broken",
                "description": "Printer in room 204 not responding",
                "status": "open",
            }
            encrypted = svc.encrypt_ticket_pii(ticket)
            decrypted = svc.decrypt_ticket_pii(encrypted)
            self.assertEqual(decrypted["subject"], ticket["subject"])
            self.assertEqual(decrypted["description"], ticket["description"])
            self.assertEqual(decrypted["status"], "open")

    def test_encrypt_ticket_pii_does_not_mutate_input(self):
        with _without_key():
            svc = _import_svc()
            original = {"subject": "Test", "description": "Details"}
            svc.encrypt_ticket_pii(original)
            # Original dict must not be modified
            self.assertEqual(original["subject"], "Test")

    def test_decrypt_ticket_pii_handles_plaintext_fields(self):
        """Gracefully handles fields that were never encrypted (e.g. no key was set when saved)."""
        with _without_key():
            svc = _import_svc()
            ticket = {"subject": "plaintext", "description": "also plaintext"}
            result = svc.decrypt_ticket_pii(ticket)
            self.assertEqual(result["subject"], "plaintext")


if __name__ == "__main__":
    unittest.main()
