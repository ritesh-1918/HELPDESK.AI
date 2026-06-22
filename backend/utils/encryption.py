"""
PII Encryption Utilities -- AES-256-GCM via pycryptodome.

Stores ciphertext as:  base64( nonce(12B) || ciphertext || tag(16B) )

Environment variables required:
    ENCRYPTION_PASSWORD  -- passphrase to derive key from
    ENCRYPTION_SALT      -- optional fixed salt (hex string); random if omitted
"""

import os
import base64
import hashlib

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes


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