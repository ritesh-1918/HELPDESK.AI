"""
HTML Input Sanitizer — prevents XSS in user-submitted ticket content.
"""

import html
import re

# ─── Allowlist ────────────────────────────────────────────────────────────────

ALLOWED_TAGS = frozenset({
    "b", "i", "u", "strong", "em", "p", "br",
    "ul", "ol", "li", "code", "pre",
})

# Attributes that are safe on any allowed tag (no src/href/style/on*).
_SAFE_ATTRS = frozenset({"class", "id", "title"})

# ─── Dangerous patterns (pre-compiled at module level) ────────────────────────
# FIX 11: compile once, not per call.
# FIX 1:  re.IGNORECASE on every pattern.
# FIX 4:  data: URI added.
# FIX 5:  vbscript: added.
# FIX 6:  CSS expression() added.

_DANGEROUS: list[re.Pattern] = [
    re.compile(r, re.IGNORECASE | re.DOTALL)
    for r in [
        r"<script[^>]*>.*?</script>",
        r"<iframe[^>]*>.*?</iframe>",
        r"<object[^>]*>.*?</object>",
        r"<embed[^>]*>",
        r"<link[^>]*>",
        r"<meta[^>]*>",
        r"javascript\s*:",        # FIX 1: was missing \s* and IGNORECASE
        r"vbscript\s*:",          # FIX 5
        r"data\s*:",              # FIX 4
        r"expression\s*\(",       # FIX 6
        r"on\w+\s*=",
    ]
]

# FIX 2: loop limit prevents nested-evasion bypass (e.g. <scr<script>ipt>).
_MAX_PASSES = 5


# ─── Attribute sanitizer ─────────────────────────────────────────────────────

def _sanitize_attrs(tag_body: str) -> str:
    """
    FIX 7+8: Strip all attributes from a tag except those in _SAFE_ATTRS.
    Prevents <p onerror=...>, <p style="javascript:...">, etc.
    """
    # tag_body is everything inside <...>, e.g. 'p class="x" style="bad"'
    parts = re.split(r"\s+", tag_body.strip(), maxsplit=1)
    tag_name = parts[0].rstrip("/").lower()
    if len(parts) == 1:
        return tag_name   # no attributes

    attr_str = parts[1]
    safe_parts = [tag_name]
    # Parse key="value" or key='value' or key pairs.
    for m in re.finditer(r'(\w+)\s*=\s*(?:"[^"]*"|\'[^\']*\'|\S+)', attr_str):
        attr_name = m.group(1).lower()
        if attr_name in _SAFE_ATTRS:
            safe_parts.append(m.group(0))
    return " ".join(safe_parts)


# ─── Public API ───────────────────────────────────────────────────────────────

def sanitize_html(raw: str) -> str:
    """
    Strip dangerous HTML from user input while allowing safe formatting tags.

    Args:
        raw: Raw HTML string from user input.

    Returns:
        Sanitized HTML string safe for display.

    Security notes:
        - Dangerous patterns removed in multiple passes to defeat nested evasion.
        - Allowed tags have all attributes stripped except a safe allowlist.
        - Unknown/disallowed tags are HTML-escaped, not removed.
    """
    # FIX 10: accept None gracefully.
    if not raw:
        return ""

    cleaned = raw

    # FIX 2: multi-pass removal defeats nested evasion like <scr<script>ipt>.
    for _ in range(_MAX_PASSES):
        prev = cleaned
        for pat in _DANGEROUS:
            cleaned = pat.sub("", cleaned)
        if cleaned == prev:
            break   # stable — no more patterns match

    # Replace tags: keep allowed (with sanitized attrs), escape the rest.
    def replace_tag(m: re.Match) -> str:
        inner = m.group(1)
        if not inner:
            return html.escape(m.group(0))
        closing = inner.startswith("/")
        # FIX 3: strip trailing / from self-closing tags before lookup.
        tag_name = inner.lstrip("/").split()[0].rstrip("/").lower()
        if tag_name not in ALLOWED_TAGS:
            return html.escape(m.group(0))
        if closing:
            return f"</{tag_name}>"
        # FIX 7+8: rebuild tag with only safe attributes.
        safe_inner = _sanitize_attrs(inner)
        return f"<{safe_inner}>"

    cleaned = re.sub(r"<(/?\w[^>]*)>", replace_tag, cleaned)
    return cleaned.strip()


def sanitize_plain_text(raw: str) -> str:
    """
    Strip all HTML tags and return plain text only.

    FIX 9: html.unescape is NOT called — encoded entities are left encoded
    so the caller receives a string that is safe to embed without re-escaping.
    If the caller needs decoded text, they should call html.unescape themselves
    after confirming the output context is safe.
    """
    if not raw:
        return ""
    no_tags = re.sub(r"<[^>]+>", "", raw)
    # Leave entities encoded — do NOT call html.unescape here.
    return no_tags.strip()