"""
PII Redaction Engine for HELPDESK.AI

Scans ticket content (descriptions, subjects, comments) and automatically
masks Personally Identifiable Information before storage or backup.

Supported PII types:
- Email addresses
- Phone numbers (international and domestic formats)
- API keys and tokens (common patterns)
- IPv4 addresses (optional, controlled by admin toggle)
- Credit card numbers (basic Luhn-valid patterns)
- SSN-like patterns (US format)

Usage:
    from pii_redaction import redact_pii, redact_pii_dict

    # Redact a single string
    cleaned = redact_pii("Contact john@example.com or call +1-555-123-4567")

    # Redact all string fields in a dict
    cleaned_data = redact_pii_dict(ticket_data, fields=["subject", "description"])
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Module-level toggle — set by admin settings
_pii_redaction_enabled = False

def set_pii_redaction_enabled(enabled: bool) -> None:
    """Toggle PII redaction globally (called from system settings)."""
    global _pii_redaction_enabled
    _pii_redaction_enabled = enabled
    logger.info("[PIIRedaction] PII redaction %s", "ENABLED" if enabled else "DISABLED")

def is_pii_redaction_enabled() -> bool:
    """Check if PII redaction is currently enabled."""
    return _pii_redaction_enabled

# --- PII Patterns ---

# Email: standard RFC 5322 simplified
_EMAIL_RE = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
)

# Phone: international (+1-555-123-4567, +44 20 7946 0958) and domestic (555-123-4567, (555) 123-4567)
_PHONE_RE = re.compile(
    r"(?<!\w)"
    r"(?:\+?\d{1,3}[\s.-]?)?"
    r"(?:\(?\d{2,4}\)?[\s.-]?)"
    r"\d{3,4}[\s.-]?\d{3,4}"
    r"(?!\w)"
)

# API keys / tokens: common patterns (sk-, ghp_, gho_, glpat-, xoxb-, AKIA, etc.)
_API_KEY_RE = re.compile(
    r"\b(?:"
    r"sk-[A-Za-z0-9]{20,}"           # OpenAI
    r"|ghp_[A-Za-z0-9]{36,}"         # GitHub personal
    r"|gho_[A-Za-z0-9]{36,}"         # GitHub OAuth
    r"|glpat-[A-Za-z0-9\-]{20,}"     # GitLab
    r"|xoxb-[A-Za-z0-9\-]{10,}"      # Slack bot
    r"|xoxp-[A-Za-z0-9\-]{10,}"      # Slack user
    r"|AKIA[A-Z0-9]{16}"             # AWS access key
    r"|eyJ[A-Za-z0-9_-]{20,}"        # JWT tokens
    r"|sbp_[A-Za-z0-9]{20,}"         # Supabase service role
    r")\b"
)

# IPv4: 0.0.0.0 to 255.255.255.255
_IPV4_RE = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}"
    r"(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b"
)

# Credit card: 13-19 digit sequences with optional separators
_CREDIT_CARD_RE = re.compile(
    r"\b(?:\d{4}[\s-]?){3}\d{1,7}\b"
)

# SSN: 3-2-4 digit pattern (US)
_SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")


def _luhn_check(number_str: str) -> bool:
    """Validate a number string using the Luhn algorithm (for credit cards)."""
    digits = [int(d) for d in number_str if d.isdigit()]
    if len(digits) < 13 or len(digits) > 19:
        return False
    checksum = 0
    reverse = digits[::-1]
    for i, d in enumerate(reverse):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def _is_valid_credit_card(match: str) -> bool:
    """Check if a matched string is a valid credit card number (Luhn)."""
    digits_only = "".join(c for c in match if c.isdigit())
    return _luhn_check(digits_only)


def redact_pii(
    text: Optional[str],
    *,
    redact_emails: bool = True,
    redact_phones: bool = True,
    redact_api_keys: bool = True,
    redact_ips: bool = False,
    redact_credit_cards: bool = True,
    redact_ssns: bool = True,
    replacement: str = "[REDACTED]",
) -> Optional[str]:
    """
    Redact PII from a text string.

    Args:
        text: Input text to scan and redact.
        redact_emails: Mask email addresses.
        redact_phones: Mask phone numbers.
        redact_api_keys: Mask API keys and tokens.
        redact_ips: Mask IPv4 addresses.
        redact_credit_cards: Mask credit card numbers (Luhn-validated).
        redact_ssns: Mask SSN-like patterns.
        replacement: Replacement string for redacted content.

    Returns:
        Text with PII replaced, or None if input is None.
    """
    if not text or not isinstance(text, str):
        return text

    result = text

    if redact_emails:
        result = _EMAIL_RE.sub(replacement, result)

    if redact_phones:
        result = _PHONE_RE.sub(replacement, result)

    if redact_api_keys:
        result = _API_KEY_RE.sub(replacement, result)

    if redact_credit_cards:
        # Only replace if Luhn-valid
        def _cc_replace(m):
            return replacement if _is_valid_credit_card(m.group(0)) else m.group(0)
        result = _CREDIT_CARD_RE.sub(_cc_replace, result)

    if redact_ssns:
        result = _SSN_RE.sub(replacement, result)

    if redact_ips:
        result = _IPV4_RE.sub(replacement, result)

    return result


def redact_pii_dict(
    data: dict,
    fields: Optional[list[str]] = None,
    redact_ips: bool = False,
) -> dict:
    """
    Redact PII from specified string fields in a dictionary.

    Args:
        data: Dictionary with ticket data.
        fields: List of keys to scan. Defaults to common text fields.
        redact_ips: Whether to also redact IP addresses.

    Returns:
        New dictionary with PII redacted in specified fields.
    """
    if fields is None:
        fields = [
            "subject", "description", "text", "summary",
            "ocr_text", "company", "metadata",
        ]

    result = dict(data)
    for field in fields:
        if field in result and isinstance(result[field], str):
            result[field] = redact_pii(result[field], redact_ips=redact_ips)

    return result


def scan_pii(text: Optional[str]) -> dict[str, list[str]]:
    """
    Scan text for PII without redacting. Returns found PII grouped by type.

    Useful for auditing and reporting PII exposure.

    Args:
        text: Input text to scan.

    Returns:
        Dict mapping PII type to list of found values.
    """
    if not text or not isinstance(text, str):
        return {}

    findings = {}

    emails = _EMAIL_RE.findall(text)
    if emails:
        findings["email"] = emails

    phones = _PHONE_RE.findall(text)
    if phones:
        findings["phone"] = phones

    api_keys = _API_KEY_RE.findall(text)
    if api_keys:
        findings["api_key"] = api_keys

    ips = _IPV4_RE.findall(text)
    if ips:
        findings["ipv4"] = ips

    cc_matches = _CREDIT_CARD_RE.findall(text)
    valid_cc = [m for m in cc_matches if _is_valid_credit_card(m)]
    if valid_cc:
        findings["credit_card"] = valid_cc

    ssns = _SSN_RE.findall(text)
    if ssns:
        findings["ssn"] = ssns

    return findings
