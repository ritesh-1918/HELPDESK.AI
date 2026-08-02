"""
Encryption Service — AES-256-GCM field-level encryption for PII data.

Uses pycryptodome (Crypto.Cipher.AES) with GCM mode for authenticated encryption.
Each encryption produces a unique random 16-byte nonce — no two ciphertexts are alike.

Storage format (base64-encoded):
    nonce (16 bytes) + tag (16 bytes) + ciphertext (variable)
    → all concatenated and base64url-encoded as a single string

PII fields encrypted in tickets:
    - subject   — ticket title (may contain names, systems, etc.)
    - description — full ticket body

Configuration:
    TICKET_ENCRYPTION_KEY — 32-byte hex or base64 string (required for encryption)
    If not set, a warning is logged and plaintext is returned (graceful degradation).
"""

import os
import base64
import logging

logger = logging.getLogger(__name__)

# Lengths in bytes
_NONCE_LEN = 16
_TAG_LEN = 16
_KEY_LEN = 32  # AES-256

# PII field names to encrypt/decrypt in ticket dicts
_PII_FIELDS = ("subject", "description")


def _load_key() -> bytes | None:
    """
    Load the 32-byte encryption key from the TICKET_ENCRYPTION_KEY env var.
    Supports hex-encoded (64 chars) and base64-encoded (44 chars) formats.
    Returns None if not configured, with a logged warning.
    """
    raw = os.getenv("TICKET_ENCRYPTION_KEY", "").strip()
    if not raw:
        logger.warning(
            "[EncryptionService] TICKET_ENCRYPTION_KEY not set. "
            "PII encryption is disabled — storing plaintext."
        )
        return None

    # Try hex decoding (64-char hex string → 32 bytes)
    if len(raw) == 64:
        try:
            key = bytes.fromhex(raw)
            if len(key) == _KEY_LEN:
                return key
        except ValueError:
            pass

    # Try base64 decoding
    try:
        key = base64.b64decode(raw + "==")  # pad for safety
        if len(key) == _KEY_LEN:
            return key
    except Exception:
        pass

    logger.error(
        f"[EncryptionService] TICKET_ENCRYPTION_KEY has invalid length/format. "
        f"Expected 32 bytes (64-char hex or 44-char base64). Got {len(raw)} chars."
    )
    return None


def _aes_available() -> bool:
    """Check whether pycryptodome is installed."""
    try:
        from Crypto.Cipher import AES  # noqa: F401
        return True
    except ImportError:
        return False


def encrypt_field(plaintext: str) -> str:
    """
    Encrypt a plaintext string using AES-256-GCM.

    Args:
        plaintext: The UTF-8 string to encrypt.

    Returns:
        Base64-encoded string: nonce + tag + ciphertext
        Returns plaintext unchanged if key is not configured or pycryptodome unavailable.
    """
    if not plaintext:
        return plaintext

    key = _load_key()
    if key is None:
        return plaintext

    if not _aes_available():
        logger.warning("[EncryptionService] pycryptodome not installed; returning plaintext.")
        return plaintext

    try:
        from Crypto.Cipher import AES
        from Crypto.Random import get_random_bytes

        nonce = get_random_bytes(_NONCE_LEN)
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode("utf-8"))

        payload = nonce + tag + ciphertext
        return base64.b64encode(payload).decode("ascii")
    except Exception as exc:
        logger.error(f"[EncryptionService] Encryption failed: {exc}; returning plaintext.")
        return plaintext


def decrypt_field(ciphertext: str) -> str:
    """
    Decrypt a base64-encoded AES-256-GCM ciphertext.

    Args:
        ciphertext: Base64-encoded string produced by encrypt_field().

    Returns:
        Decrypted plaintext string.
        Returns the input unchanged if it does not appear to be encrypted
        (i.e. not valid base64 or too short).

    Raises:
        ValueError: If the key is set but decryption fails (authentication error).
    """
    if not ciphertext:
        return ciphertext

    key = _load_key()
    if key is None:
        return ciphertext  # passthrough

    if not _aes_available():
        return ciphertext

    try:
        payload = base64.b64decode(ciphertext)
    except Exception:
        # Not valid base64 — treat as plaintext
        return ciphertext

    min_len = _NONCE_LEN + _TAG_LEN + 1
    if len(payload) < min_len:
        # Too short to be a valid encrypted payload — treat as plaintext
        return ciphertext

    try:
        from Crypto.Cipher import AES

        nonce = payload[:_NONCE_LEN]
        tag = payload[_NONCE_LEN: _NONCE_LEN + _TAG_LEN]
        encrypted = payload[_NONCE_LEN + _TAG_LEN:]

        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        plaintext_bytes = cipher.decrypt_and_verify(encrypted, tag)
        return plaintext_bytes.decode("utf-8")
    except Exception as exc:
        raise ValueError(f"[EncryptionService] Decryption failed: {exc}") from exc


def encrypt_ticket_pii(ticket_dict: dict) -> dict:
    """
    Encrypt PII fields (subject, description) in a ticket dict.

    Args:
        ticket_dict: Ticket data dict (will not be mutated — returns a new dict).

    Returns:
        New dict with PII fields encrypted.
    """
    result = dict(ticket_dict)
    for field in _PII_FIELDS:
        if field in result and result[field]:
            result[field] = encrypt_field(str(result[field]))
    return result


def decrypt_ticket_pii(ticket_dict: dict) -> dict:
    """
    Decrypt PII fields (subject, description) in a ticket dict.

    Args:
        ticket_dict: Ticket data dict from DB (will not be mutated — returns a new dict).

    Returns:
        New dict with PII fields decrypted.
        Fields that fail decryption are left as-is (graceful degradation).
    """
    result = dict(ticket_dict)
    for field in _PII_FIELDS:
        if field in result and result[field]:
            try:
                result[field] = decrypt_field(str(result[field]))
            except ValueError as exc:
                logger.warning(
                    f"[EncryptionService] Could not decrypt field '{field}': {exc}. "
                    "Leaving original value."
                )
    return result
