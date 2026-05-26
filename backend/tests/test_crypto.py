"""
Unit tests for the AES-256-GCM PII encryption helper module.

Run with:
    python -m pytest backend/tests/test_crypto.py -v
    python -m unittest backend.tests.test_crypto -v
"""

import os
import unittest
from unittest.mock import patch


class TestCryptoHelpers(unittest.TestCase):
    """Test encrypt_field / decrypt_field round-trip and edge cases."""

    @classmethod
    def setUpClass(cls):
        """Set a valid encryption key in the environment once for this class."""
        # A 32-byte (64 hex char) test key — never use this in production!
        cls.test_key = "5f6b0a491c0356b49974c3ab199edf611c39eeb477581b2754c9086af3196df6"
        cls.patcher = patch.dict(os.environ, {"DB_ENCRYPTION_SECRET_KEY": cls.test_key})
        cls.patcher.start()
        # Re-import / re-init so the module picks up the test key
        import backend.auth.crypto as crypto_mod
        crypto_mod.init()
        cls.crypto = crypto_mod

    @classmethod
    def tearDownClass(cls):
        cls.patcher.stop()

    def test_round_trip_encrypt_decrypt(self):
        """A plaintext value should survive a full encrypt → decrypt cycle."""
        plaintext = "user@example.com"
        encrypted = self.crypto.encrypt_field(plaintext)
        self.assertIsNotNone(encrypted)
        self.assertNotEqual(encrypted, plaintext)

        decrypted = self.crypto.decrypt_field(encrypted)
        self.assertEqual(decrypted, plaintext)

    def test_round_trip_long_text(self):
        """Long multi-line descriptions should encrypt and decrypt correctly."""
        plaintext = (
            "Dear support team,\n\n"
            "My laptop model ABC-123 is overheating after the latest BIOS update. "
            "I've tried restarting multiple times. Please help!\n\n"
            "Regards,\nJohn Doe\ncontact: john.doe@company.com"
        )
        encrypted = self.crypto.encrypt_field(plaintext)
        decrypted = self.crypto.decrypt_field(encrypted)
        self.assertEqual(decrypted, plaintext)

    def test_encrypt_different_each_time(self):
        """GCM mode uses a random nonce so the same plaintext should produce
        different ciphertext on each call."""
        plaintext = "always-the-same@example.com"
        c1 = self.crypto.encrypt_field(plaintext)
        c2 = self.crypto.encrypt_field(plaintext)
        self.assertNotEqual(c1, c2)

    def test_none_passthrough(self):
        """None values should pass through unchanged (no error)."""
        self.assertIsNone(self.crypto.encrypt_field(None))
        self.assertIsNone(self.crypto.decrypt_field(None))

    def test_empty_string_passthrough(self):
        """Empty strings should pass through unchanged."""
        self.assertEqual(self.crypto.encrypt_field(""), "")
        self.assertEqual(self.crypto.decrypt_field(""), "")

    def test_decrypt_invalid_base64_raises(self):
        """Tampered ciphertext should raise ValueError."""
        with self.assertRaises(ValueError):
            self.crypto.decrypt_field("this-is-not-valid-base64!!")

    def test_decrypt_wrong_key_raises(self):
        """Decrypting with a different key should raise an auth error."""
        plaintext = "secret-pii-data"
        encrypted = self.crypto.encrypt_field(plaintext)

        # Temporarily swap to a different key
        wrong_key = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        with patch.dict(os.environ, {"DB_ENCRYPTION_SECRET_KEY": wrong_key}):
            import backend.auth.crypto as crypto_mod
            crypto_mod.init()
            with self.assertRaises(Exception):
                crypto_mod.decrypt_field(encrypted)

    def test_crypto_available_flag(self):
        """crypto_available should be True when key is set."""
        self.assertTrue(self.crypto.crypto_available)


class TestCryptoDegradedMode(unittest.TestCase):
    """Behaviour when no encryption key is configured."""

    @classmethod
    def setUpClass(cls):
        cls.patcher = patch.dict(os.environ, {"DB_ENCRYPTION_SECRET_KEY": ""})
        cls.patcher.start()
        import backend.auth.crypto as crypto_mod
        crypto_mod.init()
        cls.crypto = crypto_mod

    @classmethod
    def tearDownClass(cls):
        cls.patcher.stop()

    def test_crypto_available_false(self):
        """crypto_available should be False without a key."""
        self.assertFalse(self.crypto.crypto_available)

    def test_encrypt_passthrough_degraded(self):
        """Without a key, encrypt_field should return the original value."""
        val = "user@example.com"
        self.assertEqual(self.crypto.encrypt_field(val), val)

    def test_decrypt_passthrough_degraded(self):
        """Without a key, decrypt_field should return the original value."""
        val = "some-encrypted-looking-value"
        self.assertEqual(self.crypto.decrypt_field(val), val)


class TestCryptoKeyValidation(unittest.TestCase):
    """Key validation edge cases on init()."""

    def test_invalid_hex_key_logs_error(self):
        """A key that is not valid hex should disable crypto."""
        with patch.dict(os.environ, {"DB_ENCRYPTION_SECRET_KEY": "not-hex-key!!"}):
            import backend.auth.crypto as crypto_mod
            crypto_mod.init()
            self.assertFalse(crypto_mod.crypto_available)

    def test_short_key_logs_error(self):
        """A hex key shorter than 32 bytes should disable crypto."""
        with patch.dict(os.environ, {"DB_ENCRYPTION_SECRET_KEY": "aabb"}):
            import backend.auth.crypto as crypto_mod
            crypto_mod.init()
            self.assertFalse(crypto_mod.crypto_available)

    def test_long_key_logs_error(self):
        """A hex key longer than 32 bytes should disable crypto."""
        with patch.dict(os.environ, {"DB_ENCRYPTION_SECRET_KEY": "aa" * 33}):
            import backend.auth.crypto as crypto_mod
            crypto_mod.init()
            self.assertFalse(crypto_mod.crypto_available)


if __name__ == "__main__":
    unittest.main()
