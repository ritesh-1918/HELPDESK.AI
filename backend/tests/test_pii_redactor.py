"""
Tests for PII Redaction Engine — email, phone number, and API key masking.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))
from pii_redactor import redact_pii, find_pii, count_pii, REDACTED

import pytest


class TestEmailRedaction:
    def test_redacts_simple_email(self):
        result = redact_pii("Contact me at user@example.com")
        assert "[REDACTED]" in result
        assert "user@example.com" not in result

    def test_redacts_multiple_emails(self):
        result = redact_pii("a@b.com and c@d.com")
        assert result.count(REDACTED) == 2

    def test_redacts_email_with_subdomain(self):
        result = redact_pii("test@sub.domain.co.uk")
        assert "[REDACTED]" in result

    def test_redacts_email_in_middle_of_text(self):
        result = redact_pii("Hi user@example.com, your report is ready")
        assert REDACTED in result
        assert result.startswith("Hi ")
        assert result.endswith(", your report is ready")

    def test_no_email_false_positive_on_normal_text(self):
        result = redact_pii("Hello world this is normal text")
        assert result == "Hello world this is normal text"

    def test_empty_string(self):
        assert redact_pii("") == ""
        assert redact_pii(None) is None


class TestPhoneRedaction:
    def test_redacts_us_phone(self):
        result = redact_pii("Call me at 555-123-4567")
        assert REDACTED in result

    def test_redacts_phone_with_country_code(self):
        result = redact_pii("My number is +1 (555) 123-4567")
        assert REDACTED in result

    def test_redacts_indian_phone(self):
        result = redact_pii("WhatsApp: +91 9876543210")
        assert REDACTED in result

    def test_phone_in_text(self):
        result = redact_pii("Please contact 555-123-4567 for support")
        assert REDACTED in result
        assert result.startswith("Please contact ")
        assert result.endswith(" for support")


class TestKeyRedaction:
    def test_redacts_openai_key(self):
        result = redact_pii("API key: sk-pro...xxxx")
        assert REDACTED in result

    def test_redacts_long_hex_string(self):
        result = redact_pii("Secret: 0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b")
        assert REDACTED in result

    def test_redacts_token_in_environment_variable(self):
        result = redact_pii("export GITHUB_TOKEN=***
        assert REDACTED in result or "ghp_xx...xxxx" not in result


class TestCombinedAndEdgeCases:
    def test_redacts_multiple_pii_types(self):
        result = redact_pii(
            "User: test@example.com, Phone: 555-123-4567, Key: sk-secret123"
        )
        assert result.count(REDACTED) >= 2
        assert "test@example.com" not in result
        assert "555-123-4567" not in result

    def test_find_pii_returns_positions(self):
        matches = find_pii("Email: a@b.com Call: +1 555-123-4567")
        assert len(matches) >= 2
        for start, end in matches:
            assert start >= 0
            assert end > start

    def test_count_pii(self):
        assert count_pii("a@b.com and 555-123-4567") == 2
        assert count_pii("normal text") == 0
        assert count_pii("") == 0
        assert count_pii(None) == 0

    def test_redact_email_only(self):
        text = "Email: a@b.com, Phone: 555-123-4567"
        result = redact_pii(text, redact_emails=True, redact_phones=False)
        assert result == "Email: [REDACTED], Phone: 555-123-4567"

    def test_redact_phone_only(self):
        text = "Email: a@b.com, Phone: 555-123-4567"
        result = redact_pii(text, redact_emails=False, redact_phones=True)
        assert "a@b.com" in result
        assert REDACTED in result

    def test_overlapping_matches_merged(self):
        """If email and phone overlap weirdly, they should be merged."""
        result = redact_pii("test@example.com")
        assert result == REDACTED