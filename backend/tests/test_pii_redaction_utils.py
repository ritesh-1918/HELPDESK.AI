"""
Unit tests for backend/utils/pii_redaction.py — category-level coverage.

Covers each individual redact_* helper and the redact_pii dispatch with
flags=True/False for each category. Also covers redact_ticket with
nested dicts/lists and selective flags.
"""

import os
import sys
import unittest

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.utils.pii_redaction import (
    REDACTED,
    redact_emails,
    redact_phone_numbers,
    redact_api_keys,
    redact_ssns,
    redact_credit_cards,
    redact_ip_addresses,
    redact_pii,
    redact_ticket,
)


class TestConstants(unittest.TestCase):
    def test_redacted_placeholder(self):
        self.assertEqual(REDACTED, "[REDACTED]")


class TestRedactEmails(unittest.TestCase):
    def test_single_email(self):
        out = redact_emails("Email me at john@example.com please")
        self.assertNotIn("john@example.com", out)
        self.assertIn(REDACTED, out)

    def test_multiple_emails(self):
        out = redact_emails("Contact a@x.com or b@y.com")
        self.assertNotIn("a@x.com", out)
        self.assertNotIn("b@y.com", out)
        self.assertEqual(out.count(REDACTED), 2)

    def test_no_email_unchanged(self):
        text = "No emails here."
        self.assertEqual(redact_emails(text), text)

    def test_case_insensitive(self):
        out = redact_emails("John@Example.COM")
        self.assertNotIn("John@Example.COM", out)


class TestRedactPhoneNumbers(unittest.TestCase):
    def test_dashed_format(self):
        out = redact_phone_numbers("Call 555-123-4567")
        self.assertNotIn("555-123-4567", out)

    def test_dotted_format(self):
        out = redact_phone_numbers("Call 555.123.4567")
        self.assertNotIn("555.123.4567", out)

    def test_no_phone_unchanged(self):
        text = "no phone here"
        self.assertEqual(redact_phone_numbers(text), text)


class TestRedactApiKeys(unittest.TestCase):
    def test_long_hex_key(self):
        out = redact_api_keys("key=abcdef0123456789abcdef0123456789 end")
        self.assertNotIn("abcdef0123456789abcdef0123456789", out)

    def test_long_base64_key(self):
        out = redact_api_keys("token: ABCDEFGHIJKLMNOPQRSTUV==")
        # The 22+ char base64 token should be redacted
        self.assertNotIn("ABCDEFGHIJKLMNOPQRSTUV==", out)


class TestRedactSsns(unittest.TestCase):
    def test_dashed_ssn(self):
        out = redact_ssns("SSN 123-45-6789")
        self.assertNotIn("123-45-6789", out)

    def test_spaced_ssn(self):
        out = redact_ssns("SSN 123 45 6789")
        self.assertNotIn("123 45 6789", out)


class TestRedactCreditCards(unittest.TestCase):
    def test_visa(self):
        out = redact_credit_cards("Card 4111111111111111")
        self.assertNotIn("4111111111111111", out)

    def test_mastercard(self):
        out = redact_credit_cards("Card 5500000000000000")
        self.assertNotIn("5500000000000000", out)


class TestRedactIpAddresses(unittest.TestCase):
    def test_ipv4(self):
        out = redact_ip_addresses("Server 192.168.1.1 is down")
        self.assertNotIn("192.168.1.1", out)

    def test_public_ip(self):
        out = redact_ip_addresses("IP 8.8.8.8")
        self.assertNotIn("8.8.8.8", out)


class TestRedactPiiDispatch(unittest.TestCase):
    def test_empty_text(self):
        self.assertEqual(redact_pii(""), "")
        self.assertEqual(redact_pii(None), "")

    def test_default_flags_redact_email(self):
        out = redact_pii("email a@b.com")
        self.assertNotIn("a@b.com", out)

    def test_emails_disabled(self):
        out = redact_pii("email a@b.com", emails=False)
        # Email is preserved
        self.assertIn("a@b.com", out)

    def test_phones_enabled(self):
        out = redact_pii("Call 555-123-4567", phones=True, emails=False)
        self.assertNotIn("555-123-4567", out)

    def test_phones_disabled(self):
        out = redact_pii("Call 555-123-4567", phones=False, emails=False)
        self.assertIn("555-123-4567", out)

    def test_ssns_disabled(self):
        out = redact_pii("SSN 123-45-6789", ssns=False, phones=False, emails=False)
        self.assertIn("123-45-6789", out)

    def test_credit_cards_disabled(self):
        out = redact_pii("CC 4111111111111111", credit_cards=False, emails=False)
        self.assertIn("4111111111111111", out)

    def test_ip_addresses_disabled_by_default(self):
        # IP address redaction defaults to off
        out = redact_pii("IP 1.2.3.4", emails=False)
        self.assertIn("1.2.3.4", out)

    def test_ip_addresses_enabled(self):
        out = redact_pii("IP 1.2.3.4", ip_addresses=True, emails=False)
        self.assertNotIn("1.2.3.4", out)


class TestRedactTicket(unittest.TestCase):
    def test_simple_ticket(self):
        ticket = {
            "subject": "Email me at a@b.com",
            "status": "open",
        }
        out = redact_ticket(ticket)
        self.assertIn(REDACTED, out["subject"])
        self.assertNotIn("a@b.com", out["subject"])
        self.assertEqual(out["status"], "open")

    def test_nested_dict(self):
        ticket = {
            "customer": {
                "email": "a@b.com",
                "name": "John",
            }
        }
        out = redact_ticket(ticket)
        self.assertIn(REDACTED, out["customer"]["email"])
        self.assertEqual(out["customer"]["name"], "John")

    def test_list_of_strings(self):
        ticket = {"comments": ["a@b.com wrote this", "no pii here"]}
        out = redact_ticket(ticket)
        self.assertNotIn("a@b.com", out["comments"][0])
        self.assertEqual(out["comments"][1], "no pii here")

    def test_list_of_dicts(self):
        ticket = {"comments": [{"body": "a@b.com"}, {"body": "ok"}]}
        out = redact_ticket(ticket)
        self.assertIn(REDACTED, out["comments"][0]["body"])
        self.assertEqual(out["comments"][1]["body"], "ok")

    def test_non_string_values_preserved(self):
        ticket = {"count": 42, "tags": ["a", "b"], "is_open": True, "extra": None}
        out = redact_ticket(ticket)
        self.assertEqual(out, ticket)

    def test_custom_settings(self):
        ticket = {"body": "a@b.com"}
        out = redact_ticket(ticket, settings={"emails": False})
        self.assertEqual(out["body"], "a@b.com")


if __name__ == "__main__":
    unittest.main()
