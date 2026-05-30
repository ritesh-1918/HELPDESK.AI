"""
PII Redaction Service — scans ticket text for Personally Identifiable Information
and replaces matches with [REDACTED] placeholders before storage/backup.

Detects:
  - Email addresses
  - Phone numbers (international + US formats)
  - API keys / secret tokens (common prefixes)
  - Credit card numbers (basic Luhn-like patterns)
  - Social security numbers (SSN-like patterns)
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_PATTERNS: list[tuple[str, re.Pattern]] = [
    (
        "email",
        re.compile(
            r"(?i)\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"
        ),
    ),
    (
        "phone",
        re.compile(
            r"(?:\+?\d{1,3}[\s\-.]?)?"
            r"\(?\d{2,4}\)?"
            r"[\s\-.]?\d{3,4}"
            r"[\s\-.]?\d{3,4}\b"
        ),
    ),
    (
        "api_key",
        re.compile(
            r"(?i)\b(?:sk|pk|ghp|gho|xox[bpas]|AKIA|AIza)[\-_]?[A-Za-z0-9\-_]{16,}\b"
        ),
    ),
    (
        "credit_card",
        re.compile(
            r"\b(?:\d[ -]*?){13,19}\b"
        ),
    ),
    (
        "ssn",
        re.compile(
            r"\b\d{3}[ -]?\d{2}[ -]?\d{4}\b"
        ),
    ),
]

_REDACTED = "[REDACTED]"


def redact_pii(text: str, categories: Optional[set[str]] = None) -> str:
    """Replace PII in *text* with ``[REDACTED]``.

    Parameters
    ----------
    text:
        The input string to scan.
    categories:
        Optional set of category names to redact.  If ``None`` all
        categories are redacted.  Valid names: ``email``, ``phone``,
        ``api_key``, ``credit_card``, ``ssn``.

    Returns
    -------
    str
        The redacted string.
    """
    if not text or not isinstance(text, str):
        return text

    filter_cats = categories if categories is not None else None
    redacted = text

    for cat_name, pattern in _PATTERNS:
        if filter_cats is not None and cat_name not in filter_cats:
            continue
        redacted = pattern.sub(_REDACTED, redacted)

    return redacted


def detect_pii(text: str) -> list[dict]:
    """Return a list of PII matches found in *text* without modifying it.

    Each entry contains ``category``, ``match``, ``start``, and ``end``.
    """
    if not text or not isinstance(text, str):
        return []

    matches: list[dict] = []
    for cat_name, pattern in _PATTERNS:
        for m in pattern.finditer(text):
            matches.append(
                {
                    "category": cat_name,
                    "match": m.group(),
                    "start": m.start(),
                    "end": m.end(),
                }
            )

    matches.sort(key=lambda e: e["start"])
    return matches
