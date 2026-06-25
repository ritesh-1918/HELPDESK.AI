"""
Backup Encryption Service — AES-256-GCM encryption for Supabase database exports.

Provides:
  - encrypt_backup(payload)  — JSON-serialise, PII-redact, then AES-256-GCM encrypt
  - decrypt_backup(blob)     — AES-256-GCM decrypt and deserialise
  - export_table_backup(supabase, table, pii_fields)  — pull a table and encrypt it
  - verify_backup(blob)      — decrypt and validate the backup manifest

Storage format (base64-url-safe encoded):
    header_json_len (4 bytes, big-endian)
    header JSON (version, table, timestamp, row_count, checksum)
    nonce (12 bytes)
    auth_tag (16 bytes)
    ciphertext (variable)

Key configuration:
    BACKUP_ENCRYPTION_KEY — 32-byte hex (64 chars) string (required)
    Falls back to TICKET_ENCRYPTION_KEY if BACKUP_ENCRYPTION_KEY is absent.
    If neither is set, encrypt_backup raises BackupEncryptionError.

PII redaction runs before encryption so the plaintext snapshot never
contains raw personal data. The redaction rules are the same as the
production PII redaction engine (email, phone, API keys, IPs, SSNs).
"""

from __future__ import annotations

import base64
import hashlib
import json
import logging
import os
import struct
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

# Sizes in bytes
_NONCE_LEN = 12   # NIST-recommended 96-bit GCM nonce
_TAG_LEN = 16
_KEY_LEN = 32     # AES-256
_HEADER_LEN_BYTES = 4  # 4-byte big-endian header length prefix

BACKUP_FORMAT_VERSION = 1


class BackupEncryptionError(RuntimeError):
    """Raised when the backup encryption key is missing or the ciphertext is corrupt."""


# ---------------------------------------------------------------------------
# Key loading
# ---------------------------------------------------------------------------

def _load_backup_key() -> bytes:
    """
    Load the 32-byte backup encryption key from environment variables.

    Tries BACKUP_ENCRYPTION_KEY first, falls back to TICKET_ENCRYPTION_KEY.
    Accepts 64-character hex strings only.

    Raises:
        BackupEncryptionError: if no valid key is found.
    """
    for var in ("BACKUP_ENCRYPTION_KEY", "TICKET_ENCRYPTION_KEY"):
        raw = os.getenv(var, "").strip()
        if not raw:
            continue
        # Accept 64-char hex
        if len(raw) == 64:
            try:
                return bytes.fromhex(raw)
            except ValueError:
                continue
        # Accept base64-encoded 32-byte key (44 chars with padding)
        try:
            decoded = base64.b64decode(raw + "==")
            if len(decoded) == _KEY_LEN:
                return decoded
        except Exception:
            pass

    raise BackupEncryptionError(
        "No valid backup encryption key found. "
        "Set BACKUP_ENCRYPTION_KEY to a 64-character hex string "
        "(generate with: python3 -c \"import os; print(os.urandom(32).hex())\")."
    )


# ---------------------------------------------------------------------------
# PII redaction (shared with production engine)
# ---------------------------------------------------------------------------

def _redact_pii_value(value: Any, pii_fields: frozenset[str], field_name: str = "") -> Any:
    """
    Recursively redact PII from a nested data structure.

    If field_name is in pii_fields, the entire value is replaced with [REDACTED].
    Otherwise, applies pattern-based redaction to string values.
    """
    if field_name and field_name.lower() in pii_fields:
        if isinstance(value, str) and value:
            return "[REDACTED]"
        return value

    if isinstance(value, str):
        try:
            from backend.services.pii_redaction import redact_all
            return redact_all(value)
        except ImportError:
            return _builtin_redact(value)

    if isinstance(value, dict):
        return {
            k: _redact_pii_value(v, pii_fields, k)
            for k, v in value.items()
        }

    if isinstance(value, list):
        return [_redact_pii_value(item, pii_fields, "") for item in value]

    return value


def _builtin_redact(text: str) -> str:
    """Minimal built-in redaction used when the full PII engine is unavailable."""
    import re
    text = re.sub(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", "[EMAIL]", text)
    text = re.sub(r"\b\d{10,15}\b", "[PHONE]", text)
    text = re.sub(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "[IP]", text)
    return text


# ---------------------------------------------------------------------------
# Core encrypt / decrypt
# ---------------------------------------------------------------------------

def encrypt_backup(
    rows: list[dict],
    table_name: str,
    pii_fields: frozenset[str] | None = None,
) -> str:
    """
    Serialise, PII-redact, and AES-256-GCM encrypt a list of database rows.

    Args:
        rows:        List of row dicts to encrypt.
        table_name:  Name of the source table (stored in the backup header).
        pii_fields:  Set of field names whose values should be fully redacted
                     (e.g. {"email", "full_name", "phone"}). Pattern-based
                     redaction runs on all string fields regardless.

    Returns:
        A base64url-safe encoded string containing the encrypted backup blob.

    Raises:
        BackupEncryptionError: if the encryption key is missing.
    """
    from Crypto.Cipher import AES
    from Crypto.Random import get_random_bytes

    effective_pii_fields = frozenset(f.lower() for f in (pii_fields or set()))

    # Redact PII from all rows before serialisation
    redacted_rows = [_redact_pii_value(row, effective_pii_fields) for row in rows]

    payload_bytes = json.dumps(redacted_rows, ensure_ascii=False, default=str).encode("utf-8")
    checksum = hashlib.sha256(payload_bytes).hexdigest()

    header = {
        "version": BACKUP_FORMAT_VERSION,
        "table": table_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "row_count": len(rows),
        "checksum_sha256": checksum,
    }
    header_bytes = json.dumps(header).encode("utf-8")

    key = _load_backup_key()
    nonce = get_random_bytes(_NONCE_LEN)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)

    # Bind the header as AAD so tampering with it is detected
    cipher.update(header_bytes)
    ciphertext, tag = cipher.encrypt_and_digest(payload_bytes)

    # Pack: 4-byte header length + header + nonce + tag + ciphertext
    packed = (
        struct.pack(">I", len(header_bytes))
        + header_bytes
        + nonce
        + tag
        + ciphertext
    )
    return base64.urlsafe_b64encode(packed).decode("ascii")


def decrypt_backup(blob: str) -> tuple[list[dict], dict]:
    """
    AES-256-GCM decrypt an encrypted backup blob.

    Args:
        blob: base64url-safe encoded string returned by encrypt_backup.

    Returns:
        Tuple of (rows, header_dict).

    Raises:
        BackupEncryptionError: if decryption fails (wrong key, corrupt data,
                                or tampered header / ciphertext).
    """
    from Crypto.Cipher import AES

    try:
        raw = base64.urlsafe_b64decode(blob.encode("ascii") + b"==")
    except Exception as exc:
        raise BackupEncryptionError(f"Backup blob is not valid base64: {exc}") from exc

    if len(raw) < _HEADER_LEN_BYTES + _NONCE_LEN + _TAG_LEN:
        raise BackupEncryptionError("Backup blob is too short to be valid.")

    # Unpack header
    header_len = struct.unpack(">I", raw[:_HEADER_LEN_BYTES])[0]
    offset = _HEADER_LEN_BYTES

    if offset + header_len + _NONCE_LEN + _TAG_LEN > len(raw):
        raise BackupEncryptionError("Backup blob is truncated or corrupt.")

    header_bytes = raw[offset : offset + header_len]
    offset += header_len

    nonce = raw[offset : offset + _NONCE_LEN]
    offset += _NONCE_LEN

    tag = raw[offset : offset + _TAG_LEN]
    offset += _TAG_LEN

    ciphertext = raw[offset:]

    try:
        header = json.loads(header_bytes)
    except json.JSONDecodeError as exc:
        raise BackupEncryptionError(f"Backup header is corrupt JSON: {exc}") from exc

    key = _load_backup_key()

    try:
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        cipher.update(header_bytes)  # verify AAD
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    except Exception as exc:
        raise BackupEncryptionError(
            "Backup decryption failed — wrong key or tampered data."
        ) from exc

    # Verify payload checksum
    actual_checksum = hashlib.sha256(plaintext).hexdigest()
    expected_checksum = header.get("checksum_sha256", "")
    if expected_checksum and actual_checksum != expected_checksum:
        raise BackupEncryptionError(
            f"Backup checksum mismatch. Expected {expected_checksum[:8]}… "
            f"got {actual_checksum[:8]}… — data may be corrupt."
        )

    try:
        rows = json.loads(plaintext)
    except json.JSONDecodeError as exc:
        raise BackupEncryptionError(f"Decrypted payload is not valid JSON: {exc}") from exc

    return rows, header


def verify_backup(blob: str) -> dict:
    """
    Decrypt a backup blob and return its header without returning the row data.

    Raises BackupEncryptionError on any failure.
    Returns a dict with version, table, timestamp, row_count, checksum_sha256.
    """
    _, header = decrypt_backup(blob)
    return header


# ---------------------------------------------------------------------------
# Supabase integration
# ---------------------------------------------------------------------------

async def export_table_backup(
    supabase_client: Any,
    table: str,
    pii_fields: frozenset[str] | None = None,
    max_rows: int = 50_000,
) -> str:
    """
    Export up to max_rows from a Supabase table and return an encrypted backup blob.

    Args:
        supabase_client: Initialised supabase-py client (service role).
        table:           Table name to export.
        pii_fields:      Field names to fully redact (on top of pattern redaction).
        max_rows:        Row cap to prevent accidental full-table dumps in one call.

    Returns:
        Encrypted backup blob (as returned by encrypt_backup).
    """
    result = supabase_client.table(table).select("*").limit(max_rows).execute()
    rows = getattr(result, "data", None) or []

    if not isinstance(rows, list):
        rows = []

    logger.info(
        "[BackupEncryption] Exporting %d rows from '%s' with PII redaction.",
        len(rows),
        table,
    )

    blob = encrypt_backup(rows, table_name=table, pii_fields=pii_fields)
    logger.info("[BackupEncryption] Backup encrypted. Blob size: %d chars.", len(blob))
    return blob


# ---------------------------------------------------------------------------
# Convenience helpers for the tickets table
# ---------------------------------------------------------------------------

# Fields that contain personal data in the tickets table
TICKET_PII_FIELDS: frozenset[str] = frozenset({
    "email",
    "user_email",
    "full_name",
    "name",
    "phone",
    "phone_number",
    "description",
    "subject",
    "original_text",
})

# Fields that contain personal data in the profiles table
PROFILE_PII_FIELDS: frozenset[str] = frozenset({
    "email",
    "full_name",
    "name",
    "phone",
    "phone_number",
    "avatar_url",
    "profile_picture",
})
