import re
from typing import List, Tuple


PII_PATTERNS: List[Tuple[str, str, str]] = [
    (r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "email", "[EMAIL]"),
    (r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "phone", "[PHONE]"),
    (r"\b\d{9,16}\b", "account_number", "[ACCOUNT]"),
    (r"\b(?:\d[ -]*?){13,16}\b", "credit_card", "[CARD]"),
    (r"\b\d{3}-\d{2}-\d{4}\b", "ssn", "[SSN]"),
    (r"\b(?:[0-9a-fA-F]{8}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{12})\b", "uuid", "[UUID]"),
    (r"(?:api[_-]?key|secret|password|token|auth)[:=]\s*\S+", "credential", "[CREDENTIAL]"),
    (r"\b\d{5}(?:-\d{4})?\b", "zip_code", "[ZIP]"),
    (r"(?i)\b(?:john|jane|joe|bob|alice|admin|test|guest)\s\w+\b", "common_name", "[NAME]"),
]


def redact_pii(text: str) -> str:
    if not text:
        return text
    result = text
    for pattern, label, replacement in PII_PATTERNS:
        result = re.sub(pattern, replacement, result)
    return result


def get_redaction_stats(original: str, redacted: str) -> dict:
    if not original:
        return {"fields_redacted": 0, "types": []}
    redacted_types = set()
    for pattern, label, replacement in PII_PATTERNS:
        if re.search(pattern, original):
            redacted_types.append(label)
    return {
        "fields_redacted": len(redacted_types),
        "types": redacted_types,
    }
