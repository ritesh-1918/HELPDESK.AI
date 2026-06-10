"""
HTML Input Sanitizer — prevents XSS in user-submitted ticket content.
"""
import re
import html
from urllib.parse import urlparse

ALLOWED_TAGS = {"b", "i", "u", "strong", "em", "p", "br", "ul", "ol", "li", "code", "pre", "iframe"}
ALLOWED_IFRAME_DOMAINS = {"youtube.com", "wistia.com", "vimeo.com", "player.vimeo.com", "www.youtube.com"}

DANGEROUS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"on\\w+\\s*=",
    r"<object[^>]*>",
    r"<embed[^>]*>",
    r"<link[^>]*>",
    r"<meta[^>]*>",
]


def sanitize_html(raw: str) -> str:
    """
    Strip dangerous HTML from user input while allowing safe formatting tags.

    Args:
        raw: Raw HTML string from user input.

    Returns:
        Sanitized HTML string safe for display.
    """
    if not raw:
        return ""

    # Remove dangerous patterns
    cleaned = raw
    for pattern in DANGEROUS_PATTERNS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Remove any remaining tags not in allowlist
    def replace_tag(m):
        tag_parts = m.group(1).lower().split() if m.group(1) else []
        tag = tag_parts[0] if tag_parts else ""
        if tag in ALLOWED_TAGS:
            if tag == "iframe":
                # Ensure src matches allowed domain
                src_match = re.search(r'src=["\\\'](https?://[^"\\\']+)["\\\']', m.group(0), re.IGNORECASE)
                if src_match:
                    url = src_match.group(1)
                    parsed = urlparse(url)
                    if parsed.netloc in ALLOWED_IFRAME_DOMAINS:
                        return m.group(0)
                return ""
            return m.group(0)
        return html.escape(m.group(0))

    cleaned = re.sub(r"<(/?\\w[^>]*)>", replace_tag, cleaned)
    return cleaned.strip()


def sanitize_plain_text(raw: str) -> str:
    """Strip all HTML tags and return plain text only."""
    if not raw:
        return ""
    no_tags = re.sub(r"<[^>]+>", "", raw)
    return html.unescape(no_tags).strip()
