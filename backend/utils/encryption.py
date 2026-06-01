"""
AES-256-GCM Encryption and PII Redaction Utility
Secure encryption for sensitive ticket data and database backups.
"""

import os
import re
import base64
import hashlib
import logging
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

logger = logging.getLogger(__name__)

# PII patterns for redaction
PII_PATTERNS = {
    "email": re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
    "phone": re.compile(r'\+?[\d\s\-()]{7,15}'),
    "ssn": re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
    "credit_card": re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'),
}


def get_encryption_key(password: str | None = None, salt: bytes | None = None) -> bytes:
    """Derive a 256-bit encryption key from password using PBKDF2."""
    if password is None:
        password = os.getenv("ENCRYPTION_PASSWORD", "helpdesk-default-key")
    if salt is None:
        salt = os.getenv("ENCRYPTION_SALT", "helpdesk-salt").encode()
    elif isinstance(salt, str):
        salt = salt.encode()

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
    )
    return kdf.derive(password.encode())


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
    raw = base64.b64decode(encrypted_b64)
    nonce = raw[:12]
    ciphertext = raw[12:]

    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode("utf-8")


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
