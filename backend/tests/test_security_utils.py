"""
Unit tests for backend.services.security_utils.

Run with:  python -m unittest backend.tests.test_security_utils -v
"""

import time
import unittest

from backend.services.security_utils import (
    constant_time_compare,
    hash_password,
    verify_password,
    secure_compare_sha256,
)


class ConstantTimeCompareTests(unittest.TestCase):
    def test_equal_bytes(self):
        self.assertTrue(constant_time_compare(b"secret", b"secret"))

    def test_equal_str(self):
        self.assertTrue(constant_time_compare("secret", "secret"))

    def test_mixed_types(self):
        self.assertTrue(constant_time_compare("secret", b"secret"))

    def test_different_values(self):
        self.assertFalse(constant_time_compare("secret", "wrong"))

    def test_different_lengths(self):
        self.assertFalse(constant_time_compare("abc", "abcd"))

    def test_empty_values(self):
        self.assertTrue(constant_time_compare("", ""))
        self.assertFalse(constant_time_compare("", "x"))

    def test_invalid_type(self):
        with self.assertRaises(TypeError):
            constant_time_compare(None, "secret")
        with self.assertRaises(TypeError):
            constant_time_compare(123, 123)

    def test_whitespace_matters(self):
        self.assertFalse(constant_time_compare(" secret", "secret"))

    def test_unicode(self):
        self.assertTrue(constant_time_compare("pässwörd", "pässwörd"))
        self.assertFalse(constant_time_compare("pässwörd", "passwörd"))

    def test_timing_is_constant_for_equal_length(self):
        a = "x" * 1000
        b = "y" * 1000
        c = "y" * 1000
        # Compare the near-match and exact-match timings; both scan the full
        # buffer so they should be in the same ballpark.
        near_start = time.perf_counter()
        constant_time_compare(a, b)
        near_elapsed = time.perf_counter() - near_start
        exact_start = time.perf_counter()
        constant_time_compare(b, c)
        exact_elapsed = time.perf_counter() - exact_start
        self.assertLess(abs(near_elapsed - exact_elapsed), 0.5)


class PasswordHashTests(unittest.TestCase):
    def test_hash_and_verify_roundtrip(self):
        stored = hash_password("hunter2")
        self.assertTrue(stored.startswith("pbkdf2_sha256$"))
        self.assertTrue(verify_password("hunter2", stored))

    def test_verify_rejects_wrong_password(self):
        stored = hash_password("hunter2")
        self.assertFalse(verify_password("hunter3", stored))

    def test_salt_is_random(self):
        self.assertNotEqual(hash_password("same"), hash_password("same"))

    def test_verify_malformed_hash(self):
        self.assertFalse(verify_password("pw", "not-a-real-hash"))
        self.assertFalse(verify_password("pw", "bcrypt$4$salt$hash"))
        self.assertFalse(verify_password("pw", ""))
        self.assertFalse(verify_password("pw", None))

    def test_verify_empty_password(self):
        stored = hash_password("")
        self.assertTrue(verify_password("", stored))
        self.assertFalse(verify_password(" ", stored))

    def test_verify_wrong_type(self):
        self.assertFalse(verify_password(None, hash_password("pw")))
        self.assertFalse(verify_password("pw", 42))

    def test_hash_rejects_non_str(self):
        with self.assertRaises(TypeError):
            hash_password(None)


class SecureCompareSha256Tests(unittest.TestCase):
    def test_short_prefix(self):
        self.assertEqual(len(secure_compare_sha256("user-123")), 8)

    def test_deterministic(self):
        self.assertEqual(secure_compare_sha256("abc"), secure_compare_sha256("abc"))

    def test_differs_for_distinct_inputs(self):
        self.assertNotEqual(secure_compare_sha256("abc"), secure_compare_sha256("abd"))


if __name__ == "__main__":
    unittest.main()
