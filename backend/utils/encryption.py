"""
PII Encryption and Redaction Utilities -- AES-256-GCM and regex patterns.

Stores ciphertext as:  base64( nonce(12B) || ciphertext || tag(16B) )

Environment variables required:
    ENCRYPTION_PASSWORD  -- passphrase to derive key from
    ENCRYPTION_SALT      -- optional fixed salt (hex string); random if omitted
"""

import os
import re
import base64
import hashlib

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

# PII patterns for redaction. Must be ordered so specific patterns (like SSN, Credit Card)
# are matched and replaced before more general patterns (like phone).
PII_PATTERNS = {
    "email": re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
    "ssn": re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
    "credit_card": re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'),
    "phone": re.compile(r'\+?[\d\s\-()]{7,15}'),
}


def _get_key() -> bytes:
    """Derive a 256-bit AES key from ENCRYPTION_PASSWORD env var using PBKDF2-SHA256."""
    password = os.getenv("ENCRYPTION_PASSWORD")
    if not password:
        raise ValueError(
            "ENCRYPTION_PASSWORD environment variable must be set."
        )
    salt_env = os.getenv("ENCRYPTION_SALT", "helpdesk-ai-default-salt")
    salt = salt_env.encode("utf-8")

    return hashlib.pbkdf2_hmac(
        hash_name="sha256",
        password=password.encode("utf-8"),
        salt=salt,
        iterations=480000,
        dklen=32,
    )


# Alias for backward compatibility
get_encryption_key = _get_key


def encrypt_aes256_gcm(plaintext: str, password: str | None = None) -> str:
    """Encrypt plaintext using AES-256-GCM. Returns base64-encoded ciphertext."""
    if not plaintext:
        return ""

    key = get_encryption_key(password)
    nonce = os.urandom(12)
    aesgcm = AESGCM(key)

    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    # Prepend nonce to ciphertext for decryption
    encrypted = nonce + ciphertext
    return base64.b64encode(encrypted).decode("utf-8")


def decrypt_aes256_gcm(encrypted_b64: str, password: str | None = None) -> str:
    """Decrypt AES-256-GCM encrypted base64 string."""
    if not encrypted_b64:
        return ""

    key = get_encryption_key(password)
    try:
        raw = base64.b64decode(encrypted_b64)
        if len(raw) < 12:
            raise ValueError("Ciphertext too short")
        nonce = raw[:12]
        ciphertext = raw[12:]

        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Failed to decrypt: {e}")


def redact_pii(text: str) -> str:
    """Redact PII from text by replacing with [REDACTED]."""
    if not text:
        return text

    redacted = text
    for pii_type, pattern in PII_PATTERNS.items():
        redacted = pattern.sub(f"[REDACTED_{pii_type.upper()}]", redacted)

    return redacted


def redact_and_encrypt(text: str, password: str | None = None) -> str:
    """Redact PII and then encrypt the result."""
    redacted = redact_pii(text)
    return encrypt_aes256_gcm(redacted, password)


def decrypt_and_reveal(encrypted_b64: str, password: str | None = None) -> str:
    """Decrypt previously redacted and encrypted text."""
    return decrypt_aes256_gcm(encrypted_b64, password)


# Legacy/Pycryptodome fallback functions if needed by any imports
def _get_key() -> bytes:
    hex_key = os.environ.get("ENCRYPTION_KEY", "")
    if len(hex_key) != 64:
        import warnings
        warnings.warn(
            "ENCRYPTION_KEY not set or invalid (must be 64-char hex = 32 bytes). "
            "Using INSECURE deterministic fallback key -- DO NOT use in production!"
        )
        hex_key = "00" * 32
    return bytes.fromhex(hex_key)


def encrypt_pii(plaintext: str) -> str:
    """
    Encrypt plaintext with AES-256-GCM.
    Returns base64-encoded bundle: nonce(12B) || ciphertext || tag(16B)
    """
    if plaintext is None:
        raise ValueError("encrypt_pii: plaintext must not be None")
    if plaintext == "":
        return ""

    key = _get_key()
    nonce = get_random_bytes(12)

    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode("utf-8"))

    bundle = nonce + ciphertext + tag
    return base64.b64encode(bundle).decode("ascii")


def decrypt_pii(cipher_b64: str) -> str:
    """
    Decrypt AES-256-GCM bundle back to plaintext.
    Handles empty strings and legacy plaintext gracefully.
    """
    if cipher_b64 == "":
        return ""

    try:
        bundle = base64.b64decode(cipher_b64, validate=True)
    except Exception:
        return cipher_b64  # legacy plaintext

    if len(bundle) < 29:  # nonce(12) + min 1 byte + tag(16)
        return cipher_b64  # too short, legacy plaintext

    nonce = bundle[:12]
    tag = bundle[-16:]
    ciphertext = bundle[12:-16]

    try:
        key = _get_key()
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        return cipher.decrypt_and_verify(ciphertext, tag).decode("utf-8")
    except Exception:
        return cipher_b64  # corrupt or legacy