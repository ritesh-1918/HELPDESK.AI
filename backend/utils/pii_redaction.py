"""
PII Masking Engine — scans ticket text and redacts emails, phone numbers,
API keys, and other personally identifiable information before backup/storage.
"""

import re
from typing import Union

# ---------------------------------------------------------------------------
# Compiled regex patterns for common PII types
# ---------------------------------------------------------------------------

_EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

# International phone numbers: +1-800-555-0100, (800) 555 0100, 800.555.0100
_PHONE_RE = re.compile(
    r"(\+?\d{1,3}[\s\-.])?(\(?\d{3}\)?[\s\-.])\d{3}[\s\-.]\d{4}",
)

# Generic high-entropy tokens that look like API keys / secrets (20+ hex/base64 chars)
_API_KEY_RE = re.compile(
    r"\b(?:[A-Za-z0-9+/]{20,}={0,2}|[0-9a-fA-F]{32,})\b",
)

# Social Security Numbers (US)
_SSN_RE = re.compile(r"\b\d{3}[- ]?\d{2}[- ]?\d{4}\b")

# Credit card numbers (Visa/MC/Amex/Discover — Luhn not validated, pattern only)
_CC_RE = re.compile(
    r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b"
)

# IPv4 addresses
_IP_RE = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b"
)

REDACTED = "[REDACTED]"


def redact_emails(text: str) -> str:
    return _EMAIL_RE.sub(REDACTED, text)


def redact_phone_numbers(text: str) -> str:
    return _PHONE_RE.sub(REDACTED, text)


def redact_api_keys(text: str) -> str:
    return _API_KEY_RE.sub(REDACTED, text)


def redact_ssns(text: str) -> str:
    return _SSN_RE.sub(REDACTED, text)


def redact_credit_cards(text: str) -> str:
    return _CC_RE.sub(REDACTED, text)


def redact_ip_addresses(text: str) -> str:
    return _IP_RE.sub(REDACTED, text)


def redact_pii(
    text: Union[str, None],
    *,
    emails: bool = True,
    phones: bool = True,
    api_keys: bool = True,
    ssns: bool = True,
    credit_cards: bool = True,
    ip_addresses: bool = False,
) -> str:
    """
    Run all enabled redaction passes over *text* and return the sanitised string.

    Parameters mirror the admin toggle flags so callers can pass the settings
    dict directly:

        safe = redact_pii(raw_text, **settings.pii_redaction_flags)
    """
    if not text:
        return text or ""

    if emails:
        text = redact_emails(text)
    if phones:
        text = redact_phone_numbers(text)
    if api_keys:
        text = redact_api_keys(text)
    if ssns:
        text = redact_ssns(text)
    if credit_cards:
        text = redact_credit_cards(text)
    if ip_addresses:
        text = redact_ip_addresses(text)

    return text


def redact_ticket(ticket: dict, *, settings: dict | None = None) -> dict:
    """
    Return a copy of *ticket* with PII removed from all string fields.

    *settings* is an optional dict with boolean keys matching the keyword
    arguments of :func:`redact_pii`.  When omitted, all passes are enabled.
    """
    flags: dict = settings or {}
    sanitised = {}
    for key, value in ticket.items():
        if isinstance(value, str):
            sanitised[key] = redact_pii(value, **flags)
        elif isinstance(value, dict):
            sanitised[key] = redact_ticket(value, settings=settings)
        elif isinstance(value, list):
            sanitised[key] = [
                redact_ticket(item, settings=settings) if isinstance(item, dict)
                else (redact_pii(item, **flags) if isinstance(item, str) else item)
                for item in value
            ]
        else:
            sanitised[key] = value
    return sanitised
