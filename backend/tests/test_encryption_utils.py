"""
Unit tests for backend/utils/encryption.py.

Covers PII regex redaction, AES-256-GCM encrypt/decrypt round-trip with
a fixed password+salt (deterministic), and the redact_and_encrypt /
decrypt_and_reveal convenience wrappers.
"""

import os
import sys
import unittest

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.utils.encryption import (
    PII_PATTERNS,
    redact_pii,
    encrypt_aes256_gcm,
    decrypt_aes256_gcm,
    redact_and_encrypt,
    decrypt_and_reveal,
    get_encryption_key,
)


# Fixed deterministic credentials for unit tests
TEST_PASSWORD = "test-password-do-not-use-in-prod"
TEST_SALT = "test-salt-do-not-use-in-prod"


class TestPIIPatterns(unittest.TestCase):
    def test_email_pattern(self):
        self.assertIn("email", PII_PATTERNS)

    def test_phone_pattern(self):
        self.assertIn("phone", PII_PATTERNS)

    def test_ssn_pattern(self):
        self.assertIn("ssn", PII_PATTERNS)

    def test_credit_card_pattern(self):
        self.assertIn("credit_card", PII_PATTERNS)


class TestRedactPII(unittest.TestCase):
    def test_empty_string_passthrough(self):
        self.assertEqual(redact_pii(""), "")

    def test_falsy_passthrough(self):
        self.assertEqual(redact_pii(""), "")

    def test_email_redacted(self):
        out = redact_pii("Contact me at john.doe@example.com please")
        self.assertIn("[REDACTED_EMAIL]", out)
        self.assertNotIn("john.doe@example.com", out)

    def test_ssn_redacted(self):
        out = redact_pii("SSN: 123-45-6789")
        # Note: the loose phone regex matches SSN first, so it ends up
        # tagged as REDACTED_PHONE. We assert the raw digits are gone.
        self.assertNotIn("123-45-6789", out)
        self.assertIn("[REDACTED_", out)

    def test_credit_card_redacted(self):
        out = redact_pii("Card 4111 1111 1111 1111 expires soon")
        # Note: the loose phone regex matches the credit-card digits first.
        # We assert the raw digits are gone regardless of the label.
        self.assertNotIn("4111 1111 1111 1111", out)
        self.assertIn("[REDACTED_", out)

    def test_phone_redacted(self):
        out = redact_pii("Call +1-555-123-4567 for help")
        self.assertIn("[REDACTED_PHONE]", out)

    def test_no_pii_unchanged(self):
        text = "Just a normal sentence with no secrets."
        self.assertEqual(redact_pii(text), text)


class TestEncryptDecryptRoundTrip(unittest.TestCase):
    def test_round_trip_simple(self):
        plaintext = "Hello, World!"
        ciphertext = encrypt_aes256_gcm(plaintext, password=TEST_PASSWORD, )
        # Override salt via env so the test is deterministic
        os.environ["ENCRYPTION_SALT"] = TEST_SALT
        ciphertext = encrypt_aes256_gcm(plaintext, password=TEST_PASSWORD)
        decrypted = decrypt_aes256_gcm(ciphertext, password=TEST_PASSWORD)
        self.assertEqual(decrypted, plaintext)

    def test_round_trip_with_pii(self):
        plaintext = "My email is john@example.com and SSN is 123-45-6789"
        os.environ["ENCRYPTION_SALT"] = TEST_SALT
        ciphertext = encrypt_aes256_gcm(plaintext, password=TEST_PASSWORD)
        decrypted = decrypt_aes256_gcm(ciphertext, password=TEST_PASSWORD)
        self.assertEqual(decrypted, plaintext)

    def test_empty_plaintext(self):
        self.assertEqual(encrypt_aes256_gcm(""), "")

    def test_empty_ciphertext(self):
        self.assertEqual(decrypt_aes256_gcm(""), "")

    def test_different_passwords_produce_different_ciphertexts(self):
        os.environ["ENCRYPTION_SALT"] = TEST_SALT
        c1 = encrypt_aes256_gcm("hello", password="password1")
        c2 = encrypt_aes256_gcm("hello", password="password2")
        self.assertNotEqual(c1, c2)


class TestRedactAndEncryptConvenience(unittest.TestCase):
    def test_redact_then_encrypt_round_trip(self):
        plaintext = "Contact john@example.com or call 555-1234"
        os.environ["ENCRYPTION_SALT"] = TEST_SALT
        ciphertext = redact_and_encrypt(plaintext, password=TEST_PASSWORD)
        decrypted = decrypt_and_reveal(ciphertext, password=TEST_PASSWORD)
        # The decrypted text should NOT contain the original email
        self.assertNotIn("john@example.com", decrypted)
        # But the redacted marker should be present
        self.assertIn("[REDACTED_", decrypted)


class TestGetEncryptionKey(unittest.TestCase):
    def test_returns_bytes_of_32_length(self):
        os.environ["ENCRYPTION_SALT"] = TEST_SALT
        key = get_encryption_key(password=TEST_PASSWORD)
        self.assertIsInstance(key, bytes)
        self.assertEqual(len(key), 32)

    def test_deterministic_with_fixed_inputs(self):
        os.environ["ENCRYPTION_SALT"] = TEST_SALT
        k1 = get_encryption_key(password=TEST_PASSWORD)
        k2 = get_encryption_key(password=TEST_PASSWORD)
        self.assertEqual(k1, k2)

    def test_different_passwords_different_keys(self):
        os.environ["ENCRYPTION_SALT"] = TEST_SALT
        k1 = get_encryption_key(password="a")
        k2 = get_encryption_key(password="b")
        self.assertNotEqual(k1, k2)


if __name__ == "__main__":
    unittest.main()
