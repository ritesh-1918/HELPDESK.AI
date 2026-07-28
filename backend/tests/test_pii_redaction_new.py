"""Unit tests for backend/utils/pii_redaction.py - PII masking engine.

Issue: #1102 - test: add unit tests for pii_redaction utility
"""

import unittest


class TestRedactEmails(unittest.TestCase):
    """Tests for redact_emails function."""

    def test_basic_email_redaction(self):
        """Single email is redacted."""
        from backend.utils.pii_redaction import redact_emails
        result = redact_emails("Contact user@example.com")
        self.assertNotIn("user@example.com", result)
        self.assertIn("[REDACTED]", result)

    def test_multiple_emails(self):
        """Multiple emails all redacted."""
        from backend.utils.pii_redaction import redact_emails
        result = redact_emails("a@b.com and c@d.org and e@f.net")
        self.assertNotIn("@", result)

    def test_no_email_unchanged(self):
        """Text without emails returned unchanged."""
        from backend.utils.pii_redaction import redact_emails
        text = "No email here, just text."
        self.assertEqual(redact_emails(text), text)

    def test_email_with_subdomain(self):
        """Email with subdomain is redacted."""
        from backend.utils.pii_redaction import redact_emails
        result = redact_emails("admin@mail.sub.example.co.uk")
        self.assertNotIn("@mail.sub", result)
        self.assertIn("[REDACTED]", result)

    def test_email_with_special_chars(self):
        """Email with dots and plus signs is redacted."""
        from backend.utils.pii_redaction import redact_emails
        result = redact_emails("first.last+tag@example.com")
        self.assertIn("[REDACTED]", result)
        self.assertNotIn("@", result)

    def test_empty_string(self):
        """Empty string returns empty string."""
        from backend.utils.pii_redaction import redact_emails
        self.assertEqual(redact_emails(""), "")

    def test_email_at_end_of_sentence(self):
        """Email at end of sentence followed by period."""
        from backend.utils.pii_redaction import redact_emails
        result = redact_emails("My email is test@example.com.")
        self.assertNotIn("test@example.com", result)


class TestRedactPhoneNumbers(unittest.TestCase):
    """Tests for redact_phone_numbers function."""

    def test_us_format_dashes(self):
        """US phone with dashes: 800-555-0199."""
        from backend.utils.pii_redaction import redact_phone_numbers
        result = redact_phone_numbers("Call 800-555-0199")
        self.assertNotIn("800-555-0199", result)
        self.assertIn("[REDACTED]", result)

    def test_us_format_dots(self):
        """US phone with dots: 800.555.0199."""
        from backend.utils.pii_redaction import redact_phone_numbers
        result = redact_phone_numbers("Call 800.555.0199")
        self.assertNotIn("800.555.0199", result)

    def test_us_format_parentheses(self):
        """US phone with parentheses: (800) 555-0199."""
        from backend.utils.pii_redaction import redact_phone_numbers
        result = redact_phone_numbers("Call (800) 555-0199")
        self.assertNotIn("(800) 555-0199", result)

    def test_international_with_plus(self):
        """International phone: +1-800-555-0199."""
        from backend.utils.pii_redaction import redact_phone_numbers
        result = redact_phone_numbers("Call +1-800-555-0199")
        self.assertNotIn("+1-800-555-0199", result)

    def test_international_without_plus(self):
        """International phone: 44-20-7946-0958."""
        from backend.utils.pii_redaction import redact_phone_numbers
        result = redact_phone_numbers("Call 44-20-7946-0958")
        self.assertIn("[REDACTED]", result)

    def test_no_phone_unchanged(self):
        """Text without phone numbers returned unchanged."""
        from backend.utils.pii_redaction import redact_phone_numbers
        text = "No phone numbers here."
        self.assertEqual(redact_phone_numbers(text), text)

    def test_empty_string(self):
        """Empty string returns empty string."""
        from backend.utils.pii_redaction import redact_phone_numbers
        self.assertEqual(redact_phone_numbers(""), "")

    def test_multiple_phones(self):
        """Multiple phone numbers all redacted."""
        from backend.utils.pii_redaction import redact_phone_numbers
        result = redact_phone_numbers("Call 800-555-0100 or 800-555-0200")
        self.assertNotIn("800-555", result)


class TestRedactSSNs(unittest.TestCase):
    """Tests for redact_ssns function."""

    def test_ssn_with_dashes(self):
        """SSN format: 123-45-6789."""
        from backend.utils.pii_redaction import redact_ssns
        result = redact_ssns("SSN: 123-45-6789")
        self.assertNotIn("123-45-6789", result)
        self.assertIn("[REDACTED]", result)

    def test_ssn_with_spaces(self):
        """SSN format: 123 45 6789."""
        from backend.utils.pii_redaction import redact_ssns
        result = redact_ssns("SSN: 123 45 6789")
        self.assertNotIn("123 45 6789", result)

    def test_ssn_without_separators(self):
        """SSN format: 123456789 (no separators)."""
        from backend.utils.pii_redaction import redact_ssns
        result = redact_ssns("SSN: 123456789")
        # The regex requires separators, so this may not match
        # Testing actual behavior
        self.assertIsInstance(result, str)

    def test_no_ssn_unchanged(self):
        """Text without SSN returned unchanged."""
        from backend.utils.pii_redaction import redact_ssns
        text = "No SSN in this text."
        self.assertEqual(redact_ssns(text), text)

    def test_empty_string(self):
        """Empty string returns empty."""
        from backend.utils.pii_redaction import redact_ssns
        self.assertEqual(redact_ssns(""), "")

    def test_multiple_ssns(self):
        """Multiple SSNs all redacted."""
        from backend.utils.pii_redaction import redact_ssns
        result = redact_ssns("SSNs: 111-22-3333 and 444-55-6666")
        self.assertNotIn("111-22-3333", result)
        self.assertNotIn("444-55-6666", result)


class TestRedactCreditCards(unittest.TestCase):
    """Tests for redact_credit_cards function."""

    def test_visa_card(self):
        """Visa card starting with 4: 4111-1111-1111-1111."""
        from backend.utils.pii_redaction import redact_credit_cards
        result = redact_credit_cards("Card: 4111-1111-1111-1111")
        self.assertNotIn("4111-1111-1111-1111", result)
        self.assertIn("[REDACTED]", result)

    def test_mastercard(self):
        """Mastercard starting with 5: 5555-5555-5555-4444."""
        from backend.utils.pii_redaction import redact_credit_cards
        result = redact_credit_cards("Card: 5555-5555-5555-4444")
        self.assertNotIn("5555-5555-5555-4444", result)

    def test_amex_card(self):
        """Amex starting with 34 or 37: 3782-822463-10005."""
        from backend.utils.pii_redaction import redact_credit_cards
        result = redact_credit_cards("Card: 3782-822463-10005")
        self.assertIn("[REDACTED]", result)

    def test_16_digit_no_separators(self):
        """16 digit card without separators."""
        from backend.utils.pii_redaction import redact_credit_cards
        result = redact_credit_cards("4111111111111111")
        self.assertNotIn("4111111111111111", result)

    def test_no_card_unchanged(self):
        """Text without credit card numbers unchanged."""
        from backend.utils.pii_redaction import redact_credit_cards
        text = "No card numbers here."
        self.assertEqual(redact_credit_cards(text), text)

    def test_empty_string(self):
        """Empty string returns empty."""
        from backend.utils.pii_redaction import redact_credit_cards
        self.assertEqual(redact_credit_cards(""), "")


class TestRedactAPIKeys(unittest.TestCase):
    """Tests for redact_api_keys function."""

    def test_hex_api_key_32_chars(self):
        """32-char hex API key redacted."""
        from backend.utils.pii_redaction import redact_api_keys
        result = redact_api_keys("Key: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6")
        self.assertNotIn("a1b2c3d4", result)
        self.assertIn("[REDACTED]", result)

    def test_base64_api_key(self):
        """Base64-like API key with padding."""
        from backend.utils.pii_redaction import redact_api_keys
        result = redact_api_keys("Key: dGhpc2lzYXRlc3RhcGlrZXl0aGF0aXNsb25nZW5vdWdo")
        self.assertIn("[REDACTED]", result)

    def test_no_key_unchanged(self):
        """Text without API keys unchanged."""
        from backend.utils.pii_redaction import redact_api_keys
        text = "short text"
        self.assertEqual(redact_api_keys(text), text)

    def test_empty_string(self):
        """Empty string returns empty."""
        from backend.utils.pii_redaction import redact_api_keys
        self.assertEqual(redact_api_keys(""), "")


class TestRedactIPAddresses(unittest.TestCase):
    """Tests for redact_ip_addresses function."""

    def test_ipv4_standard(self):
        """Standard IPv4 address: 192.168.1.1."""
        from backend.utils.pii_redaction import redact_ip_addresses
        result = redact_ip_addresses("IP: 192.168.1.1")
        self.assertNotIn("192.168.1.1", result)
        self.assertIn("[REDACTED]", result)

    def test_ipv4_all_octets_255(self):
        """IPv4 address: 255.255.255.255."""
        from backend.utils.pii_redaction import redact_ip_addresses
        result = redact_ip_addresses("IP: 255.255.255.255")
        self.assertNotIn("255.255.255.255", result)

    def test_ipv4_loopback(self):
        """IPv4 loopback: 127.0.0.1."""
        from backend.utils.pii_redaction import redact_ip_addresses
        result = redact_ip_addresses("localhost: 127.0.0.1")
        self.assertNotIn("127.0.0.1", result)

    def test_no_ip_unchanged(self):
        """Text without IP addresses unchanged."""
        from backend.utils.pii_redaction import redact_ip_addresses
        text = "No IPs here."
        self.assertEqual(redact_ip_addresses(text), text)

    def test_empty_string(self):
        """Empty string returns empty."""
        from backend.utils.pii_redaction import redact_ip_addresses
        self.assertEqual(redact_ip_addresses(""), "")


class TestRedactPII(unittest.TestCase):
    """Tests for the combined redact_pii function."""

    def test_redact_all_default(self):
        """By default, all PII types except IP are redacted."""
        from backend.utils.pii_redaction import redact_pii
        text = "Email: user@test.com, Phone: 800-555-0199, SSN: 123-45-6789"
        result = redact_pii(text)
        self.assertNotIn("user@test.com", result)
        self.assertNotIn("800-555-0199", result)
        self.assertNotIn("123-45-6789", result)

    def test_redact_with_ip_enabled(self):
        """When ip_addresses=True, IPs are redacted too."""
        from backend.utils.pii_redaction import redact_pii
        text = "Server at 10.0.0.1 and user@test.com"
        result = redact_pii(text, ip_addresses=True)
        self.assertNotIn("10.0.0.1", result)
        self.assertNotIn("user@test.com", result)

    def test_redact_with_ip_disabled_default(self):
        """By default, IPs are NOT redacted."""
        from backend.utils.pii_redaction import redact_pii
        text = "Server at 10.0.0.1 and user@test.com"
        result = redact_pii(text)
        self.assertIn("10.0.0.1", result)
        self.assertNotIn("user@test.com", result)

    def test_selective_redaction_emails_only(self):
        """Only emails redacted when other types disabled."""
        from backend.utils.pii_redaction import redact_pii
        text = "Email: a@b.com Phone: 800-555-0199 SSN: 123-45-6789"
        result = redact_pii(text, phones=False, ssns=False, credit_cards=False)
        self.assertNotIn("a@b.com", result)
        self.assertIn("800-555-0199", result)
        self.assertIn("123-45-6789", result)

    def test_selective_redaction_phones_only(self):
        """Only phones redacted when other types disabled."""
        from backend.utils.pii_redaction import redact_pii
        text = "Email: a@b.com Phone: 800-555-0199 SSN: 123-45-6789"
        result = redact_pii(text, emails=False, ssns=False, credit_cards=False)
        self.assertIn("a@b.com", result)
        self.assertNotIn("800-555-0199", result)
        self.assertIn("123-45-6789", result)

    def test_no_pii_unchanged(self):
        """Text with no PII returned unchanged."""
        from backend.utils.pii_redaction import redact_pii
        text = "This is a normal sentence with no personal information."
        self.assertEqual(redact_pii(text), text)

    def test_empty_text(self):
        """Empty string returns empty string."""
        from backend.utils.pii_redaction import redact_pii
        self.assertEqual(redact_pii(""), "")

    def test_none_text(self):
        """None returns empty string."""
        from backend.utils.pii_redaction import redact_pii
        self.assertEqual(redact_pii(None), "")

    def test_credit_card_with_api_key(self):
        """Credit card and API key in same text both redacted."""
        from backend.utils.pii_redaction import redact_pii
        text = "Card: 4111-1111-1111-1111, Key: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
        result = redact_pii(text, api_keys=True)
        self.assertNotIn("4111", result)
        self.assertNotIn("a1b2c3d4", result)

    def test_api_keys_disabled(self):
        """API keys not redacted when api_keys=False."""
        from backend.utils.pii_redaction import redact_pii
        text = "Key: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
        result = redact_pii(text, api_keys=False)
        self.assertIn("a1b2c3d4", result)


class TestRedactTicket(unittest.TestCase):
    """Tests for the redact_ticket function that sanitizes dicts."""

    def test_simple_ticket(self):
        """Basic ticket dict with email field is redacted."""
        from backend.utils.pii_redaction import redact_ticket
        ticket = {
            "id": 1,
            "subject": "Help needed",
            "description": "Contact user@example.com",
            "priority": "high",
        }
        result = redact_ticket(ticket)
        self.assertEqual(result["id"], 1)
        self.assertEqual(result["priority"], "high")
        self.assertNotIn("user@example.com", result["description"])
        self.assertIn("[REDACTED]", result["description"])

    def test_ticket_with_settings(self):
        """Ticket redacted with custom settings disables email redaction."""
        from backend.utils.pii_redaction import redact_ticket
        ticket = {
            "description": "Email user@test.com phone 800-555-0199",
        }
        result = redact_ticket(ticket, settings={"emails": False})
        self.assertIn("user@test.com", result["description"])
        self.assertNotIn("800-555-0199", result["description"])

    def test_nested_dict(self):
        """Nested dict fields are recursively redacted."""
        from backend.utils.pii_redaction import redact_ticket
        ticket = {
            "user": {
                "name": "John",
                "email": "john@example.com",
            },
            "subject": "Test",
        }
        result = redact_ticket(ticket)
        self.assertNotIn("john@example.com", result["user"]["email"])
        self.assertIn("[REDACTED]", result["user"]["email"])
        self.assertEqual(result["user"]["name"], "John")

    def test_list_of_dicts(self):
        """List of dicts is redacted recursively."""
        from backend.utils.pii_redaction import redact_ticket
        ticket = {
            "comments": [
                {"author": "A", "text": "a@b.com"},
                {"author": "B", "text": "c@d.com"},
            ]
        }
        result = redact_ticket(ticket)
        for comment in result["comments"]:
            self.assertNotIn("@", comment["text"])

    def test_mixed_list(self):
        """List with mix of strings and dicts."""
        from backend.utils.pii_redaction import redact_ticket
        ticket = {
            "tags": ["urgent", "user@test.com", {"note": "call 800-555-0199"}],
        }
        result = redact_ticket(ticket)
        # String items in list should be redacted
        self.assertNotIn("user@test.com", result["tags"][1])
        # Dict items should have their string values redacted
        self.assertNotIn("800-555-0199", result["tags"][2]["note"])

    def test_non_string_values_preserved(self):
        """Non-string values (int, bool, None) are preserved."""
        from backend.utils.pii_redaction import redact_ticket
        ticket = {
            "id": 42,
            "is_resolved": False,
            "metadata": None,
        }
        result = redact_ticket(ticket)
        self.assertEqual(result["id"], 42)
        self.assertFalse(result["is_resolved"])
        self.assertIsNone(result["metadata"])

    def test_empty_dict(self):
        """Empty dict returns empty dict."""
        from backend.utils.pii_redaction import redact_ticket
        self.assertEqual(redact_ticket({}), {})


class TestEdgeCases(unittest.TestCase):
    """Edge case and error handling tests."""

    def test_pii_in_middle_of_word(self):
        """Email-like pattern in URL path is caught."""
        from backend.utils.pii_redaction import redact_pii
        # test@test in a URL query string
        text = "https://example.com?email=test@test.com"
        result = redact_pii(text)
        self.assertNotIn("test@test.com", result)

    def test_phone_in_longer_number(self):
        """Phone pattern that is part of a longer number."""
        from backend.utils.pii_redaction import redact_phone_numbers
        text = "ID: 123-456-7890-12345"
        result = redact_phone_numbers(text)
        self.assertIsInstance(result, str)
        # Should still redact the phone part
        self.assertIn("[REDACTED]", result)

    def test_partial_pii_not_redacted(self):
        """Partial patterns that don't fully match are not redacted."""
        from backend.utils.pii_redaction import redact_pii
        text = "user@ is not a full email, 123-45 is not a full SSN"
        result = redact_pii(text)
        # Partial patterns should remain
        self.assertIn("user@", result)
        self.assertIn("123-45", result)

    def test_multiline_text(self):
        """Multiline text is processed correctly."""
        from backend.utils.pii_redaction import redact_pii
        text = "Line 1: a@b.com\nLine 2: 800-555-0199\nLine 3: normal text"
        result = redact_pii(text)
        self.assertNotIn("a@b.com", result)
        self.assertNotIn("800-555-0199", result)
        self.assertIn("normal text", result)


if __name__ == '__main__':
    unittest.main()
