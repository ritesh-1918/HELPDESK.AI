import unittest
import re

from backend.services.pii_redaction_service import redact_pii, detect_pii


class TestPIIRedaction(unittest.TestCase):

    def test_redact_email(self):
        text = "Contact support at admin@example.com for help."
        result = redact_pii(text)
        self.assertNotIn("admin@example.com", result)
        self.assertIn("[REDACTED]", result)
        self.assertIn("Contact support at", result)

    def test_redact_phone(self):
        text = "Call +1-555-0123 or 555-456-7890 for assistance."
        result = redact_pii(text)
        self.assertNotIn("+1-555-0123", result)
        self.assertNotIn("555-456-7890", result)

    def test_redact_api_key(self):
        text = "Set API key to sk-abc123def456ghi789jkl012mno345"
        result = redact_pii(text)
        self.assertNotIn("sk-abc123def456ghi789jkl012mno345", result)
        self.assertIn("[REDACTED]", result)

    def test_redact_github_token(self):
        text = "Token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij"
        result = redact_pii(text)
        self.assertNotIn("ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij", result)

    def test_redact_multiple_categories(self):
        text = "Email john@corp.com or call 555-123-4567. Key: sk-test1234567890abcdef"
        result = redact_pii(text)
        self.assertNotIn("john@corp.com", result)
        self.assertNotIn("555-123-4567", result)
        self.assertNotIn("sk-test1234567890abcdef", result)

    def test_category_filter(self):
        text = "Email admin@test.com and call 555-000-1111"
        result = redact_pii(text, categories={"email"})
        self.assertNotIn("admin@test.com", result)
        self.assertIn("555-000-1111", result)

    def test_no_pii(self):
        text = "The server is running fine with no issues."
        result = redact_pii(text)
        self.assertEqual(result, text)

    def test_empty_string(self):
        self.assertEqual(redact_pii(""), "")
        self.assertEqual(redact_pii(None), None)

    def test_non_string_input(self):
        self.assertEqual(redact_pii(123), 123)

    def test_detect_pii_returns_matches(self):
        text = "Reach alice@wonderland.io or call 555-867-5309"
        matches = detect_pii(text)
        categories = {m["category"] for m in matches}
        self.assertIn("email", categories)
        self.assertIn("phone", categories)
        for m in matches:
            self.assertIn("start", m)
            self.assertIn("end", m)
            self.assertGreaterEqual(m["end"], m["start"])

    def test_detect_pii_empty(self):
        self.assertEqual(detect_pii(""), [])
        self.assertEqual(detect_pii("No PII here."), [])

    def test_credit_card_redaction(self):
        text = "Charge card 4111 1111 1111 1111 for payment"
        result = redact_pii(text)
        self.assertNotIn("4111 1111 1111 1111", result)

    def test_ssn_redaction(self):
        text = "SSN on file: 123-45-6789"
        result = redact_pii(text)
        self.assertNotIn("123-45-6789", result)

    def test_ssn_not_redacted_when_filtered(self):
        text = "SSN: 123-45-6789, email: a@b.com"
        result = redact_pii(text, categories={"email"})
        self.assertIn("123-45-6789", result)
        self.assertNotIn("a@b.com", result)


if __name__ == "__main__":
    unittest.main()
