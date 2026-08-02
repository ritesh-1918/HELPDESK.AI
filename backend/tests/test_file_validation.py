"""
Unit tests for asset upload metadata validation (issue #3893).

Run with:  python -m unittest backend.tests.test_file_validation -v
"""

import unittest

from backend.services.file_validation import (
    MAX_ASSET_SIZE_BYTES,
    ALLOWED_ASSET_EXTENSIONS,
    AssetValidationError,
    validate_asset,
    validate_asset_extension,
    validate_asset_size,
)


class ValidateAssetExtensionTests(unittest.TestCase):
    def test_allowed_extensions_pass(self):
        for ext in ALLOWED_ASSET_EXTENSIONS:
            self.assertEqual(validate_asset_extension(f"report{ext}"), ext)

    def test_case_insensitive(self):
        self.assertEqual(validate_asset_extension("REPORT.PDF"), ".pdf")

    def test_disallowed_extension_rejected(self):
        for bad in ("virus.exe", "payload.sh", "doc.docx", "data.csv"):
            with self.assertRaises(AssetValidationError):
                validate_asset_extension(bad)

    def test_no_extension_rejected(self):
        with self.assertRaises(AssetValidationError):
            validate_asset_extension("noext")

    def test_empty_and_none_rejected(self):
        for bad in (None, ""):
            with self.assertRaises(AssetValidationError):
                validate_asset_extension(bad)

    def test_traversal_tokens_rejected(self):
        for bad in ("../../etc/passwd.pdf", "a.pdf\x00.exe", "/etc/secret.png"):
            with self.assertRaises(AssetValidationError):
                validate_asset_extension(bad)


class ValidateAssetSizeTests(unittest.TestCase):
    def test_under_limit_passes(self):
        validate_asset_size(1024)
        validate_asset_size(MAX_ASSET_SIZE_BYTES)

    def test_over_limit_rejected(self):
        with self.assertRaises(AssetValidationError):
            validate_asset_size(MAX_ASSET_SIZE_BYTES + 1)

    def test_invalid_sizes_rejected(self):
        for bad in (None, -1, "10"):
            with self.assertRaises(AssetValidationError):
                validate_asset_size(bad)


class ValidateAssetTests(unittest.TestCase):
    def test_valid_asset(self):
        self.assertEqual(validate_asset("debug.log", 512), ".log")

    def test_invalid_extension(self):
        with self.assertRaises(AssetValidationError):
            validate_asset("malware.sh", 512)

    def test_oversized(self):
        with self.assertRaises(AssetValidationError):
            validate_asset("big.pdf", MAX_ASSET_SIZE_BYTES + 100)


if __name__ == "__main__":
    unittest.main()
