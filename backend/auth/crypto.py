"""
AES-256-GCM cryptographic helper for PII field encryption at rest.

Usage:
    from backend.auth.crypto import encrypt_field, decrypt_field, crypto_available

    # Encrypt before DB insert
    encrypted = encrypt_field("user@example.com")

    # Decrypt after DB read
    plaintext = decrypt_field(encrypted)

    # Check if encryption is active
    if crypto_available:
        ...
    else:
        # Log warning, skip encryption
        ...

Key:
    Read from ``DB_ENCRYPTION_SECRET_KEY`` environment variable.
    Must be a hex-encoded 64-character string (32 bytes = 256 bits).
    If unset, the module operates in degraded mode — all operations
    return the original value with a warning log.
"""

import os
import base64
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level state
# ---------------------------------------------------------------------------

_KEY: Optional[bytes] = None
"""Derived 32-byte AES key, or ``None`` in degraded mode."""

_NONCE_BYTES = 12
"""GCM standard nonce length (96 bits)."""
_TAG_BYTES = 16
"""GCM authentication tag (128 bits)."""


def _load_key() -> Optional[bytes]:
    """Read and validate the encryption key from the environment.

    Returns:
        A 32-byte key or ``None`` if the env var is missing or invalid.
    """
    raw = os.environ.get("DB_ENCRYPTION_SECRET_KEY", "").strip()
    if not raw:
        logger.warning(
            "[CRYPTO] DB_ENCRYPTION_SECRET_KEY is not set — PII encryption "
            "is DISABLED. Set a 64-char hex-encoded 256-bit key to enable."
        )
        return None

    try:
        key = bytes.fromhex(raw)
    except ValueError:
        logger.error(
            "[CRYPTO] DB_ENCRYPTION_SECRET_KEY is not valid hex — "
            "PII encryption DISABLED."
        )
        return None

    if len(key) != 32:
        logger.error(
            f"[CRYPTO] DB_ENCRYPTION_SECRET_KEY must be 32 bytes "
            f"(64 hex chars), got {len(key)} bytes — "
            f"PII encryption DISABLED."
        )
        return None

    return key


crypto_available: bool
"""``True`` when a valid encryption key is configured and AES is ready."""


def init() -> None:
    """(Re)load the encryption key.

    Called automatically at import time.  Idempotent — call again
    after changing ``DB_ENCRYPTION_SECRET_KEY`` at runtime if needed.
    """
    global _KEY, crypto_available
    _KEY = _load_key()
    crypto_available = _KEY is not None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def encrypt_field(plaintext: Optional[str]) -> Optional[str]:
    """Encrypt a single PII field value.

    Args:
        plaintext: The raw string to encrypt.  ``None`` and empty strings
            are passed through unchanged.

    Returns:
        Base64-encoded ciphertext (nonce + ciphertext + tag) when a key
        is configured, or the original value when running in degraded mode.
    """
    if not plaintext:
        return plaintext
    if _KEY is None:
        return plaintext

    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    nonce = os.urandom(_NONCE_BYTES)
    aesgcm = AESGCM(_KEY)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)

    # Pack: nonce (12) || ciphertext || tag (16) → base64
    payload = nonce + ciphertext
    return base64.b64encode(payload).decode("ascii")


def decrypt_field(ciphertext_b64: Optional[str]) -> Optional[str]:
    """Decrypt a single PII field value.

    Args:
        ciphertext_b64: Base64-encoded payload produced by :func:`encrypt_field`.

    Returns:
        The original plaintext string, or the original value when running
        in degraded mode.  Returns ``None`` for ``None`` inputs.

    Raises:
        ValueError: If the payload cannot be decoded or the authentication
            tag is invalid (tampered data or wrong key).
    """
    if not ciphertext_b64:
        return ciphertext_b64
    if _KEY is None:
        return ciphertext_b64

    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    try:
        payload = base64.b64decode(ciphertext_b64)
    except Exception as exc:
        raise ValueError("Failed to decode ciphertext payload") from exc

    if len(payload) < _NONCE_BYTES + _TAG_BYTES:
        raise ValueError(
            f"Ciphertext payload too short ({len(payload)} bytes). "
            f"Expected at least {_NONCE_BYTES + _TAG_BYTES} bytes."
        )

    nonce = payload[:_NONCE_BYTES]
    ciphertext = payload[_NONCE_BYTES:]

    aesgcm = AESGCM(_KEY)
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode("utf-8")


# ---------------------------------------------------------------------------
# Module initialisation
# ---------------------------------------------------------------------------
init()
