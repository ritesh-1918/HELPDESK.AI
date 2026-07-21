"""OCR JSON safety helpers.

This module exists to provide a small, dependency-free surface for validating
client-supplied OCR inputs before handing them to model code.
"""

from __future__ import annotations

import base64
import binascii
import re
from typing import Final


MAX_BASE64_CHARS_DEFAULT: Final[int] = 5_000_000  # ~3.75MB raw bytes

_BASE64_RE: Final[re.Pattern[str]] = re.compile(r"^[A-Za-z0-9+/=\s]+$")


def sanitize_and_validate_base64_image(
    image_base64: str,
    *,
    max_chars: int = MAX_BASE64_CHARS_DEFAULT,
) -> str:
    """Validate a base64 image string and return a normalized payload.

    - Strips optional data URI prefix.
    - Adds missing padding.
    - Enforces a character limit.
    - Validates alphabet + decodability.

    Raises:
        ValueError: if the input is invalid or too large.
    """
    if not image_base64:
        raise ValueError("empty image_base64")

    payload = image_base64.strip()

    # Strip data URI prefix.
    if "," in payload:
        payload = payload.split(",", 1)[1].strip()

    if len(payload) > max_chars:
        raise ValueError(f"image_base64 too large (chars={len(payload)}, max={max_chars})")

    if not _BASE64_RE.match(payload):
        raise ValueError("image_base64 contains invalid characters")

    # Ensure correct padding for base64.
    missing_padding = len(payload) % 4
    if missing_padding:
        payload = payload + ("=" * (4 - missing_padding))

    try:
        base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError) as e:
        raise ValueError(f"image_base64 is not valid base64: {e}") from e

    return payload

