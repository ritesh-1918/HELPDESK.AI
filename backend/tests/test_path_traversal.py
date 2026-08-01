"""
Security regression tests for ticket attachment path traversal (issue #3948).

Verifies that user-supplied filenames cannot escape the uploads directory
through ``..`` tokens, NULL bytes, leading slashes, or nested separators.

Run with:  python -m unittest backend.tests.test_path_traversal -v
"""

import os
import tempfile
import unittest

from backend.services.ocr_service import resolve_safe_attachment_path


class PathTraversalTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.uploads_dir = os.path.join(self.tmp, "uploads")
        os.makedirs(self.uploads_dir, exist_ok=True)
        self.victim = os.path.join(self.tmp, "secrets.env")
        with open(self.victim, "w") as f:
            f.write("SUPABASE_SERVICE_KEY=super-secret")
        with open(os.path.join(self.uploads_dir, "report.pdf"), "w") as f:
            f.write("pdf-data")

    def test_basename_used_for_plain_name(self):
        target = resolve_safe_attachment_path("report.pdf", self.uploads_dir)
        self.assertEqual(str(target), os.path.join(self.uploads_dir, "report.pdf"))

    def test_rejects_dotdot_traversal(self):
        with self.assertRaises(ValueError):
            resolve_safe_attachment_path("../../secrets.env", self.uploads_dir)

    def test_rejects_encoded_dotdot(self):
        with self.assertRaises(ValueError):
            resolve_safe_attachment_path("..%2f..%2fsecrets.env", self.uploads_dir)

    def test_rejects_leading_slash_absolute_path(self):
        with self.assertRaises(ValueError):
            resolve_safe_attachment_path(self.victim, self.uploads_dir)

    def test_rejects_null_bytes(self):
        with self.assertRaises(ValueError):
            resolve_safe_attachment_path("report.pdf\x00.jpg", self.uploads_dir)

    def test_rejects_empty_name(self):
        with self.assertRaises(ValueError):
            resolve_safe_attachment_path("", self.uploads_dir)
        with self.assertRaises(ValueError):
            resolve_safe_attachment_path(None, self.uploads_dir)

    def test_nested_separator_collapses_into_uploads_dir(self):
        # "sub/report.pdf" -> basename "report.pdf" stays inside uploads_dir.
        target = resolve_safe_attachment_path("sub/report.pdf", self.uploads_dir)
        self.assertEqual(str(target), os.path.join(self.uploads_dir, "report.pdf"))

    def test_missing_file_raises_not_found(self):
        with self.assertRaises(FileNotFoundError):
            resolve_safe_attachment_path("does-not-exist.pdf", self.uploads_dir)

    def test_outside_file_not_served_even_if_named_similarly(self):
        # A file with the same basename outside uploads_dir is never reachable.
        outside = os.path.join(self.tmp, "report.pdf")
        with open(outside, "w") as f:
            f.write("outside")
        target = resolve_safe_attachment_path("report.pdf", self.uploads_dir)
        self.assertEqual(str(target), os.path.join(self.uploads_dir, "report.pdf"))
        with open(str(target)) as f:
            self.assertEqual(f.read(), "pdf-data")


if __name__ == "__main__":
    unittest.main()
