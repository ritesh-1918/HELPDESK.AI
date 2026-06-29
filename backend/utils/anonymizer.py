from __future__ import annotations

import re
import ipaddress
from typing import Any, Iterable, Tuple

_REDACTION_TAGS = {
    "connection_string": "[REDACTED_CONNECTION_STRING]",
    "email": "[REDACTED_EMAIL]",
    "ip_address": "[REDACTED_IP_ADDRESS]",
    "credentials": "[REDACTED_CREDENTIALS]",
}

_PATTERN_RULES: list[tuple[str, re.Pattern[str], str]] = [
    (
        "connection_string",
        re.compile(
            r"\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|mariadb|redis|amqp|amqps)://[^\s'\"`<>]+",
            re.IGNORECASE,
        ),
        _REDACTION_TAGS["connection_string"],
    ),
    (
        "email",
        re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE),
        _REDACTION_TAGS["email"],
    ),
    (
        "ipv4",
        re.compile(
            r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b"
        ),
        _REDACTION_TAGS["ip_address"],
    ),
    (
        "provider_token",
        re.compile(
            r"\b(?:sk_(?:live|test)|ghp|ghs|xox[baprs])[_-]?[A-Za-z0-9_-]{10,}\b",
            re.IGNORECASE,
        ),
        _REDACTION_TAGS["credentials"],
    ),
    (
        "bearer_token",
        re.compile(r"\bBearer\s+[A-Za-z0-9._\-+/=]{10,}\b", re.IGNORECASE),
        "Bearer " + _REDACTION_TAGS["credentials"],
    ),
]

_ASSIGNMENT_PATTERN = re.compile(
    r"(?i)\b(password|passwd|pass|secret|token|api[_-]?key)\s*([:=])\s*([^\s,;]+)"
)


def _add_findings(findings: list[str], labels: Iterable[str]) -> None:
    for label in labels:
        if label not in findings:
            findings.append(label)


def anonymize_sensitive_text(text: str) -> Tuple[str, list[str]]:
    """Mask common secrets, PII, and credentials in free-form ticket text."""
    if not text:
        return "", []

    redacted = text
    findings: list[str] = []

    for label, pattern, replacement in _PATTERN_RULES:
        redacted, count = pattern.subn(replacement, redacted)
        if count:
            findings.append(label)

    def _replace_assignment(match: re.Match[str]) -> str:
        findings.append("credentials")
        return f"{match.group(1)}{match.group(2)} {_REDACTION_TAGS['credentials']}"

    redacted = _ASSIGNMENT_PATTERN.sub(_replace_assignment, redacted)

    def _replace_ip_candidate(match: re.Match[str]) -> str:
        candidate = match.group(0)
        try:
            ip_obj = ipaddress.ip_address(candidate)
        except ValueError:
            return candidate
        if ip_obj.version == 6:
            findings.append("ipv6")
        findings.append("ip_address")
        return _REDACTION_TAGS["ip_address"]

    redacted = re.sub(
        r"(?<![\w])(?:[0-9A-Fa-f:.]{2,})(?![\w])",
        _replace_ip_candidate,
        redacted,
    )

    # Normalize duplicate findings while preserving order.
    deduped_findings: list[str] = []
    _add_findings(deduped_findings, findings)
    return redacted, deduped_findings


def anonymize_sensitive_value(value: Any) -> Tuple[Any, list[str]]:
    """Recursively anonymize text values inside dict/list payloads."""
    if isinstance(value, str):
        return anonymize_sensitive_text(value)
    if isinstance(value, dict):
        redacted: dict[str, Any] = {}
        findings: list[str] = []
        for key, item in value.items():
            sanitized_item, item_findings = anonymize_sensitive_value(item)
            redacted[key] = sanitized_item
            _add_findings(findings, item_findings)
        return redacted, findings
    if isinstance(value, list):
        redacted_list = []
        findings: list[str] = []
        for item in value:
            sanitized_item, item_findings = anonymize_sensitive_value(item)
            redacted_list.append(sanitized_item)
            _add_findings(findings, item_findings)
        return redacted_list, findings
    return value, []
