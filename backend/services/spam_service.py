"""
Spam & Phishing Detection Service — lightweight, dependency-free heuristics.

Scans ticket text (and OCR-extracted text) for common phishing patterns,
suspicious URLs, and social-engineering keywords. Designed to run before the
classification cascade so high-risk tickets can be flagged in the UI and
kept away from support agents' inboxes.
"""

import re
from urllib.parse import urlparse


# Common phishing / social-engineering keywords. Kept conservative to avoid
# false-positives on legitimate IT tickets ("password reset" is normal).
_PHISHING_KEYWORDS = [
    "verify your account",
    "verify your identity",
    "confirm your password",
    "update your password immediately",
    "account has been suspended",
    "account will be closed",
    "unusual sign-in activity",
    "unusual login attempt",
    "click here to claim",
    "you have won",
    "congratulations you",
    "wire transfer",
    "send bitcoin",
    "send btc",
    "gift card",
    "limited time offer",
    "act now",
    "urgent action required",
    "final notice",
]

# Free / disposable / known-abused TLDs. Not exhaustive — a starting list.
_SUSPICIOUS_TLDS = {
    "zip", "mov", "xyz", "top", "click", "country", "stream", "gq", "tk",
    "ml", "cf", "ga", "work", "loan", "kim", "men",
}

# Common URL shorteners — frequently used to hide phishing destinations.
_URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly",
    "shorte.st", "adf.ly", "cutt.ly", "rebrand.ly", "rb.gy", "s.id",
}

_URL_RE = re.compile(
    r"\b((?:https?://|www\.)[^\s<>\"')]+)",
    re.IGNORECASE,
)

_IP_HOST_RE = re.compile(r"^\d{1,3}(?:\.\d{1,3}){3}$")


def extract_urls(text: str) -> list[str]:
    """Return all URLs found in the text, lightly normalized."""
    if not text:
        return []
    urls = []
    for match in _URL_RE.findall(text):
        url = match.rstrip(".,);:!?")
        if not url.lower().startswith(("http://", "https://")):
            url = "http://" + url
        urls.append(url)
    return urls


def _classify_url(url: str) -> str | None:
    """Return a reason string if the URL looks suspicious, else None."""
    try:
        parsed = urlparse(url)
    except ValueError:
        return "Malformed URL"

    host = (parsed.hostname or "").lower()
    if not host:
        return "URL missing host"

    if _IP_HOST_RE.match(host):
        return f"URL uses raw IP address ({host})"

    if host in _URL_SHORTENERS:
        return f"URL shortener detected ({host})"

    tld = host.rsplit(".", 1)[-1] if "." in host else ""
    if tld in _SUSPICIOUS_TLDS:
        return f"Suspicious TLD .{tld} ({host})"

    # "@" inside the authority is a classic phishing trick to hide the real host.
    if "@" in (parsed.netloc or ""):
        return f"URL contains embedded credentials ({parsed.netloc})"

    return None


class SpamService:
    """Stateless heuristic spam / phishing detector."""

    # Risk score thresholds — kept on the conservative side.
    SPAM_THRESHOLD = 0.6

    def check(self, text: str, ocr_text: str = "") -> dict:
        """
        Analyze `text` (and optional `ocr_text`) and return a structured verdict.

        Returns:
            {
                "is_spam": bool,
                "risk_score": float,         # 0.0–1.0
                "reasons": list[str],
                "suspicious_urls": list[str],
                "matched_keywords": list[str],
            }
        """
        combined = " ".join(filter(None, [text or "", ocr_text or ""])).strip()
        if not combined:
            return {
                "is_spam": False,
                "risk_score": 0.0,
                "reasons": [],
                "suspicious_urls": [],
                "matched_keywords": [],
            }

        lowered = combined.lower()
        matched_keywords = [kw for kw in _PHISHING_KEYWORDS if kw in lowered]

        suspicious_urls: list[str] = []
        url_reasons: list[str] = []
        for url in extract_urls(combined):
            reason = _classify_url(url)
            if reason:
                suspicious_urls.append(url)
                url_reasons.append(reason)

        reasons: list[str] = []
        if matched_keywords:
            reasons.append(
                f"Matched {len(matched_keywords)} phishing keyword(s): "
                + ", ".join(matched_keywords[:3])
            )
        reasons.extend(url_reasons)

        # Score: 0.35 per keyword hit + 0.4 per suspicious URL, capped at 1.0.
        score = min(1.0, 0.35 * len(matched_keywords) + 0.4 * len(suspicious_urls))

        return {
            "is_spam": score >= self.SPAM_THRESHOLD,
            "risk_score": round(score, 3),
            "reasons": reasons,
            "suspicious_urls": suspicious_urls,
            "matched_keywords": matched_keywords,
        }
