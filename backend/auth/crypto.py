"""
AES-256-GCM encryption helpers for PII fields stored in the tickets database.

The encryption key is read from the ``DB_ENCRYPTION_SECRET_KEY`` environment
variable. The key may be supplied either as:

* 32 raw bytes encoded as urlsafe base64 (44 chars), or
* a base64 / hex string that decodes to exactly 32 bytes, or
* any other UTF-8 string, which is then stretched to 32 bytes via SHA-256
  (convenient for development; production deployments should use a 32-byte key).

If the variable is not set, the helpers fall back to a transparent
pass-through so the server still boots. A warning is logged once on import
and again the first time encryption is requested.

Ciphertext format (base64 of ``nonce || ciphertext || tag``) is prefixed with
``enc:v1:`` so encrypted values can be detected on read without a schema
change.
"""

from __future__ import annotations

import base64
import logging
import os
from hashlib import sha256
from typing import Any, Iterable, Mapping, MutableMapping

logger = logging.getLogger(__name__)

# Fields on the ``tickets`` table that contain PII and must be encrypted at rest.
TICKET_PII_FIELDS: tuple[str, ...] = ("contact_email", "description", "raw_text")

_ENC_PREFIX = "enc:v1:"
_KEY_ENV = "DB_ENCRYPTION_SECRET_KEY"

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM  # type: ignore
    _CRYPTO_AVAILABLE = True
except Exception as _import_err:  # pragma: no cover - optional dep
    AESGCM = None  # type: ignore
    _CRYPTO_AVAILABLE = False
    logger.warning(
        "cryptography library not available (%s); ticket PII will be stored in plaintext.",
        _import_err,
    )


def _load_key() -> bytes | None:
    raw = os.environ.get(_KEY_ENV)
    if not raw:
        return None
    raw = raw.strip()
    # Try urlsafe base64 first, then standard base64, then hex.
    for decoder in (base64.urlsafe_b64decode, base64.b64decode, bytes.fromhex):
        try:
            candidate = decoder(raw)
            if len(candidate) == 32:
                return candidate
        except Exception:
            pass
    # Last resort: stretch arbitrary string to 32 bytes via SHA-256.
    logger.warning(
        "%s is set but is not a 32-byte base64/hex value; deriving a 32-byte key via SHA-256. "
        "Use a real 32-byte key in production.",
        _KEY_ENV,
    )
    return sha256(raw.encode("utf-8")).digest()


_KEY: bytes | None = _load_key() if _CRYPTO_AVAILABLE else None
_AESGCM = AESGCM(_KEY) if (_CRYPTO_AVAILABLE and _KEY) else None

if _AESGCM is None:
    logger.warning(
        "%s not set or cryptography unavailable; ticket PII encryption is DISABLED. "
        "Set a 32-byte key in %s to enable AES-256-GCM at rest.",
        _KEY_ENV,
        _KEY_ENV,
    )


def is_enabled() -> bool:
    """Return True if encryption is active (key set and library available)."""
    return _AESGCM is not None


def encrypt(plaintext: str | None) -> str | None:
    """Encrypt a single string value. Returns ``None`` / empty unchanged.

    If encryption is disabled, the plaintext is returned untouched so the
    caller can degrade gracefully.
    """
    if plaintext is None or plaintext == "":
        return plaintext
    if not isinstance(plaintext, str):
        return plaintext
    if _AESGCM is None:
        return plaintext
    if plaintext.startswith(_ENC_PREFIX):
        # Already encrypted; do not double-encrypt.
        return plaintext
    nonce = os.urandom(12)
    ct = _AESGCM.encrypt(nonce, plaintext.encode("utf-8"), None)
    return _ENC_PREFIX + base64.b64encode(nonce + ct).decode("ascii")


def decrypt(value: str | None) -> str | None:
    """Decrypt a value produced by :func:`encrypt`.

    Values that don't carry the ``enc:v1:`` prefix are returned untouched
    (covers legacy plaintext rows and the encryption-disabled case).
    """
    if value is None or not isinstance(value, str) or not value.startswith(_ENC_PREFIX):
        return value
    if _AESGCM is None:
        logger.warning("Encrypted value encountered but %s is not configured; returning as-is.", _KEY_ENV)
        return value
    try:
        blob = base64.b64decode(value[len(_ENC_PREFIX):])
        nonce, ct = blob[:12], blob[12:]
        return _AESGCM.decrypt(nonce, ct, None).decode("utf-8")
    except Exception as e:
        logger.error("Failed to decrypt ticket PII field: %s", e)
        return value


def encrypt_fields(record: MutableMapping[str, Any], fields: Iterable[str] = TICKET_PII_FIELDS) -> MutableMapping[str, Any]:
    """In-place encrypt PII fields on a record dict (write hook)."""
    if _AESGCM is None or record is None:
        return record
    for f in fields:
        if f in record and isinstance(record[f], str) and record[f]:
            record[f] = encrypt(record[f])
    return record


def decrypt_fields(record: Mapping[str, Any] | None, fields: Iterable[str] = TICKET_PII_FIELDS) -> Mapping[str, Any] | None:
    """Return a new dict with PII fields decrypted (read hook)."""
    if record is None:
        return record
    out = dict(record)
    for f in fields:
        v = out.get(f)
        if isinstance(v, str) and v.startswith(_ENC_PREFIX):
            out[f] = decrypt(v)
    return out


def decrypt_rows(rows: Any, fields: Iterable[str] = TICKET_PII_FIELDS) -> Any:
    """Decrypt PII fields across a list of records (or pass non-list through)."""
    if isinstance(rows, list):
        return [decrypt_fields(r, fields) for r in rows]
    if isinstance(rows, dict):
        return decrypt_fields(rows, fields)
    return rows
