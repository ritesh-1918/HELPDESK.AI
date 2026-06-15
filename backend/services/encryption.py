"""
AES-256-GCM Payload Encryption for Database Backups.

Provides authenticated encryption (AES-256-GCM) with key derivation
from passphrase (PBKDF2-HMAC-SHA256) and secure key management.

Follows industry best practices:
  - AES-256 in GCM mode (authenticated encryption with integrity check)
  - PBKDF2 key derivation with 600,000 iterations
  - Random 96-bit nonce per encryption (never reused)
  - Base64-encoded output with metadata envelope

FROZEN — Industrial-grade encryption for Supabase backup pipelines.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

# ── Constants ────────────────────────────────────────────────────────────

KEY_LENGTH = 32  # 256 bits
NONCE_LENGTH = 12  # 96 bits (GCM standard)
TAG_LENGTH = 16  # 128 bits (GCM authentication tag)
PBKDF2_ITERATIONS = 600_000
PBKDF2_HASH = "sha256"
KDF_SALT_LENGTH = 32


# ── Key derivation ────────────────────────────────────────────────────────

def derive_key(
    passphrase: str,
    salt: bytes | None = None,
    *,
    iterations: int = PBKDF2_ITERATIONS,
) -> tuple[bytes, bytes]:
    """Derive a 256-bit AES key from a passphrase using PBKDF2-HMAC-SHA256.

    Args:
        passphrase: User-provided passphrase or secret.
        salt: Optional salt (generated if None).
        iterations: PBKDF2 iteration count (default 600,000).

    Returns:
        (key: bytes[32], salt: bytes[32])
    """
    if salt is None:
        salt = secrets.token_bytes(KDF_SALT_LENGTH)

    key = hashlib.pbkdf2_hmac(
        PBKDF2_HASH,
        passphrase.encode("utf-8"),
        salt,
        iterations,
        dklen=KEY_LENGTH,
    )
    return key, salt


def generate_key() -> bytes:
    """Generate a random 256-bit key (no passphrase needed)."""
    return secrets.token_bytes(KEY_LENGTH)


# ── Encryption / Decryption ───────────────────────────────────────────────

def encrypt(
    plaintext: str | bytes,
    key: bytes,
    *,
    associated_data: bytes = b"",
) -> dict[str, Any]:
    """Encrypt data with AES-256-GCM.

    Args:
        plaintext: Data to encrypt (str or bytes).
        key: 256-bit encryption key (32 bytes).
        associated_data: Optional authenticated associated data (not encrypted
            but integrity-checked).

    Returns:
        {
            "ciphertext_b64": str,
            "nonce_b64": str,
            "tag_b64": str,
            "associated_data_b64": str,
        }
    """
    # Crypto imports here to avoid startup penalty when not in use
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    if isinstance(plaintext, str):
        plaintext = plaintext.encode("utf-8")

    key = _validate_key(key)
    nonce = secrets.token_bytes(NONCE_LENGTH)

    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)

    # AESGCM.encrypt appends the 16-byte tag to ciphertext
    # Split for explicit metadata
    tag = ciphertext[-TAG_LENGTH:]
    ct = ciphertext[:-TAG_LENGTH]

    return {
        "ciphertext_b64": base64.b64encode(ct).decode(),
        "nonce_b64": base64.b64encode(nonce).decode(),
        "tag_b64": base64.b64encode(tag).decode(),
        "associated_data_b64": base64.b64encode(associated_data).decode()
        if associated_data
        else "",
    }


def decrypt(
    encrypted: dict[str, Any],
    key: bytes,
) -> bytes:
    """Decrypt data encrypted with AES-256-GCM.

    Args:
        encrypted: Dict from encrypt() with ciphertext_b64, nonce_b64, tag_b64.
        key: 256-bit encryption key (32 bytes).

    Returns:
        Decrypted plaintext bytes.

    Raises:
        ValueError: If decryption/authentication fails.
    """
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    key = _validate_key(key)

    ct = base64.b64decode(encrypted["ciphertext_b64"])
    nonce = base64.b64decode(encrypted["nonce_b64"])
    tag = base64.b64decode(encrypted["tag_b64"])
    associated_data = (
        base64.b64decode(encrypted.get("associated_data_b64", ""))
        if encrypted.get("associated_data_b64")
        else b""
    )

    # Reconstruct ciphertext + tag as expected by AESGCM.decrypt
    ciphertext_with_tag = ct + tag

    aesgcm = AESGCM(key)
    try:
        plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, associated_data)
        return plaintext
    except Exception as e:
        raise ValueError("Decryption failed: authentication check failed") from e


# ── High-level encrypt_payload / decrypt_payload ──────────────────────────

def encrypt_payload(
    data: Any,
    passphrase: str | None = None,
    *,
    key: bytes | None = None,
) -> dict[str, Any]:
    """Encrypt any JSON-serializable payload.

    Args:
        data: JSON-serializable data (dict, list, str, etc.).
        passphrase: Passphrase for key derivation (or use key directly).
        key: Pre-derived key (takes precedence over passphrase).

    Returns:
        Envelope with encrypted payload and metadata.
    """
    if key is not None:
        enc_key = _validate_key(key)
        kdf_salt_b64 = None
    elif passphrase is not None:
        kdf_salt = secrets.token_bytes(KDF_SALT_LENGTH)
        enc_key, _ = derive_key(passphrase, salt=kdf_salt)
        kdf_salt_b64 = base64.b64encode(kdf_salt).decode()
    else:
        raise ValueError("Either passphrase or key must be provided")

    plaintext = json.dumps(data, ensure_ascii=False, sort_keys=True)
    encrypted = encrypt(plaintext, enc_key)

    return {
        "version": 1,
        "algorithm": "AES-256-GCM",
        "kdf": {
            "algorithm": f"PBKDF2-HMAC-{PBKDF2_HASH.upper()}",
            "iterations": PBKDF2_ITERATIONS,
            "salt_b64": kdf_salt_b64,
        },
        "encrypted": encrypted,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def decrypt_payload(
    envelope: dict[str, Any],
    passphrase: str | None = None,
    *,
    key: bytes | None = None,
) -> Any:
    """Decrypt a payload encrypted with encrypt_payload().

    Args:
        envelope: The envelope dict from encrypt_payload().
        passphrase: Passphrase to derive the key.
        key: Pre-derived key (takes precedence).

    Returns:
        Original JSON-deserialized data.
    """
    if key is not None:
        enc_key = _validate_key(key)
    elif passphrase is not None:
        kdf = envelope.get("kdf", {})
        kdf_salt = base64.b64decode(kdf.get("salt_b64", "")) if kdf.get("salt_b64") else None
        if kdf_salt is None:
            raise ValueError("KDF salt not found in envelope")
        enc_key, _ = derive_key(
            passphrase,
            salt=kdf_salt,
            iterations=kdf.get("iterations", PBKDF2_ITERATIONS),
        )
    else:
        raise ValueError("Either passphrase or key must be provided")

    plaintext_bytes = decrypt(envelope["encrypted"], enc_key)
    return json.loads(plaintext_bytes.decode("utf-8"))


# ── Key rotation helper ───────────────────────────────────────────────────

def re_encrypt(
    envelope: dict[str, Any],
    old_passphrase: str,
    new_passphrase: str,
) -> dict[str, Any]:
    """Re-encrypt a payload with a new passphrase (key rotation)."""
    data = decrypt_payload(envelope, passphrase=old_passphrase)
    return encrypt_payload(data, passphrase=new_passphrase)


# ── Validation ────────────────────────────────────────────────────────────

def _validate_key(key: bytes) -> bytes:
    if len(key) != KEY_LENGTH:
        raise ValueError(
            f"Key must be exactly {KEY_LENGTH} bytes (got {len(key)})"
        )
    return key
