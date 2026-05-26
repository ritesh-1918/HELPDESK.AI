import os
import base64
import logging
import hashlib
from typing import Any

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[Crypto] %(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

CRYPTOGRAPHY_AVAILABLE = False
_aesgcm = None
ENCRYPTION_ENABLED = False

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    logger.warning("The 'cryptography' library is not available. Running with database encryption disabled.")

# Key Parsing logic: supporting urlsafe-b64, hex, and SHA-256 stretching
def derive_cryptographic_key(raw_key: str | None) -> bytes | None:
    if not raw_key:
        return None
    
    # 1. Try URL-safe Base64 decode
    try:
        # Pad string appropriately if needed
        padded = raw_key + "=" * ((4 - len(raw_key) % 4) % 4)
        decoded = base64.urlsafe_b64decode(padded.encode('utf-8'))
        if len(decoded) == 32:
            return decoded
    except Exception:
        pass

    # 2. Try hex decode
    try:
        decoded = bytes.fromhex(raw_key)
        if len(decoded) == 32:
            return decoded
    except Exception:
        pass

    # 3. Fall back to SHA-256 stretch
    return hashlib.sha256(raw_key.encode('utf-8')).digest()


# Initialize Key and AESGCM instance
if CRYPTOGRAPHY_AVAILABLE:
    SECRET_KEY_ENV_VAR = "DB_ENCRYPTION_SECRET_KEY"
    raw_secret_key = os.environ.get(SECRET_KEY_ENV_VAR)
    
    if raw_secret_key:
        try:
            key_bytes = derive_cryptographic_key(raw_secret_key)
            if key_bytes:
                _aesgcm = AESGCM(key_bytes)
                ENCRYPTION_ENABLED = True
                logger.info("Database encryption key loaded and active.")
            else:
                logger.warning("Could not derive key from DB_ENCRYPTION_SECRET_KEY. Database encryption disabled.")
        except Exception as e:
            logger.warning(f"Failed to initialize AESGCM: {e}. Database encryption disabled.")
    else:
        logger.warning("DB_ENCRYPTION_SECRET_KEY is not set in environment. Running with database encryption disabled.")

# Tag prefix for identifying encrypted data
PREFIX = "enc:v1:"

def encrypt_value(value: str) -> str:
    """Encrypt a string value using AES-256-GCM. Returns 'enc:v1:<base64>'."""
    if not ENCRYPTION_ENABLED or _aesgcm is None:
        return value
    if not isinstance(value, str):
        return value
    # Double-encryption protection: if already encrypted, return as-is
    if value.startswith(PREFIX):
        return value
        
    try:
        # Generate 12-byte secure random nonce
        nonce = os.urandom(12)
        plaintext_bytes = value.encode('utf-8')
        # Encrypt (combines ciphertext and tag automatically in cryptography's AESGCM)
        ciphertext = _aesgcm.encrypt(nonce, plaintext_bytes, None)
        # Store nonce + ciphertext together
        payload = nonce + ciphertext
        encoded = base64.b64encode(payload).decode('utf-8')
        return f"{PREFIX}{encoded}"
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        return value

def decrypt_value(value: str) -> str:
    """Decrypt a string value that starts with 'enc:v1:'."""
    if not ENCRYPTION_ENABLED or _aesgcm is None:
        return value
    if not isinstance(value, str):
        return value
    # Graceful pass-through for legacy/plaintext rows
    if not value.startswith(PREFIX):
        return value
        
    try:
        encoded_str = value[len(PREFIX):]
        payload = base64.b64decode(encoded_str)
        if len(payload) < 12:
            return value
        nonce = payload[:12]
        ciphertext = payload[12:]
        decrypted_bytes = _aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        logger.error(f"Decryption failed: {e}")
        return value

# ORM Payload Processing Helpers
TARGET_FIELDS = {"contact_email", "description", "raw_text"}

def encrypt_row(row: dict) -> dict:
    if not isinstance(row, dict):
        return row
    new_row = dict(row)
    for field in TARGET_FIELDS:
        if field in new_row and new_row[field] is not None:
            new_row[field] = encrypt_value(str(new_row[field]))
    return new_row

def decrypt_row(row: dict) -> dict:
    if not isinstance(row, dict):
        return row
    new_row = dict(row)
    for field in TARGET_FIELDS:
        if field in new_row and new_row[field] is not None:
            new_row[field] = decrypt_value(str(new_row[field]))
    return new_row

def encrypt_payload(payload: Any) -> Any:
    if isinstance(payload, list):
        return [encrypt_row(row) for row in payload]
    elif isinstance(payload, dict):
        return encrypt_row(payload)
    return payload

def decrypt_payload(payload: Any) -> Any:
    if isinstance(payload, list):
        return [decrypt_row(row) for row in payload]
    elif isinstance(payload, dict):
        return decrypt_row(payload)
    return payload

# Transparent client query wrapper proxy
class WrappedRequestBuilder:
    def __init__(self, builder: Any, table_name: str):
        object.__setattr__(self, "_builder", builder)
        object.__setattr__(self, "_table_name", table_name)

    def insert(self, json: Any, *args, **kwargs) -> "WrappedRequestBuilder":
        if self._table_name == "tickets":
            json = encrypt_payload(json)
        res = self._builder.insert(json, *args, **kwargs)
        return WrappedRequestBuilder(res, self._table_name)

    def update(self, json: Any, *args, **kwargs) -> "WrappedRequestBuilder":
        if self._table_name == "tickets":
            json = encrypt_payload(json)
        res = self._builder.update(json, *args, **kwargs)
        return WrappedRequestBuilder(res, self._table_name)

    def execute(self, *args, **kwargs) -> Any:
        res = self._builder.execute(*args, **kwargs)
        if self._table_name == "tickets" and res and hasattr(res, "data"):
            res.data = decrypt_payload(res.data)
        return res

    def __getattr__(self, name: str) -> Any:
        attr = getattr(self._builder, name)
        if callable(attr):
            def wrapper(*args, **kwargs):
                res = attr(*args, **kwargs)
                if res is self._builder:
                    return self
                if hasattr(res, "execute") or hasattr(res, "table") or hasattr(res, "insert"):
                    return WrappedRequestBuilder(res, self._table_name)
                return res
            return wrapper
        return attr

    def __setattr__(self, name: str, value: Any) -> None:
        setattr(self._builder, name, value)


def wrap_client(client: Any) -> Any:
    """Wraps a Supabase client's table method for transparent tickets encryption."""
    if client is None:
        return None

    # Avoid double wrapping
    if hasattr(client, "_wrapped_by_crypto"):
        return client

    original_table = client.table

    def wrapped_table(table_name: str, *args, **kwargs) -> Any:
        builder = original_table(table_name, *args, **kwargs)
        if table_name == "tickets":
            return WrappedRequestBuilder(builder, table_name)
        return builder

    client.table = wrapped_table
    client._wrapped_by_crypto = True
    return client
