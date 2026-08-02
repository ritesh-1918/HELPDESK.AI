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

# Initialize AESGCM with 32-byte key derived from secret key
SECRET_KEY = os.environ.get("DB_ENCRYPTION_SECRET_KEY")

_cipher = None
if SECRET_KEY:
    # Hash secret key to ensure it is exactly 32 bytes (256 bits)
    key_bytes = hashlib.sha256(SECRET_KEY.encode()).digest()
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    _cipher = AESGCM(key_bytes)
else:
    logger.warning("DB_ENCRYPTION_SECRET_KEY is not set in environment. Running with database encryption disabled.")

# Tag prefix for identifying encrypted data
PREFIX = "enc:v1:"

def legacy_decrypt(cipher_text: str) -> str:
    """Decrypt base64 encoded ciphertext using AES-256 GCM and return plain text (legacy fallback)."""
    if not _cipher or not cipher_text:
        return cipher_text
        
    text_to_decrypt = cipher_text
    if cipher_text.startswith(PREFIX):
        text_to_decrypt = cipher_text[len(PREFIX):]
        
    try:
        try:
            combined = base64.b64decode(text_to_decrypt.encode('utf-8'))
        except Exception:
            return cipher_text  # Return as-is if not valid base64
            
        if len(combined) < 12:
            return cipher_text  # Not enough bytes for nonce
            
        nonce = combined[:12]
        ciphertext = combined[12:]
        decrypted_bytes = _cipher.decrypt(nonce, ciphertext, None)
        return decrypted_bytes.decode('utf-8')
    except Exception:
        # If decryption fails, it might be unencrypted plaintext (graceful degrade for old records)
        return cipher_text

def encrypt(plain_text: str, tenant_id: str | None = None, field_name: str | None = None) -> str:
    """Encrypt plain text using the Encryption Manager."""
    from backend.security.encryption_manager import encrypt_field
    return encrypt_field(plain_text, tenant_id=tenant_id, field_name=field_name)

def decrypt(cipher_text: str, tenant_id: str | None = None, field_name: str | None = None) -> str:
    """Decrypt base64 encoded ciphertext using the Encryption Manager."""
    if cipher_text and cipher_text.startswith(PREFIX):
        return legacy_decrypt(cipher_text)
        
    from backend.security.encryption_manager import decrypt_field
    return decrypt_field(cipher_text, tenant_id=tenant_id, field_name=field_name)

# ORM Payload Processing Helpers
TABLE_PII_FIELDS = {
    "tickets": {"contact_email", "description", "raw_text"},
    "profiles": {"email", "full_name", "phone"},
}

def encrypt_row(row: dict, table_name: str = "tickets") -> dict:
    if not isinstance(row, dict):
        return row
    new_row = dict(row)
    company_id = row.get("company_id")
    fields = TABLE_PII_FIELDS.get(table_name, set())
    for field in fields:
        if field in new_row and new_row[field] is not None:
            new_row[field] = encrypt(str(new_row[field]), tenant_id=company_id, field_name=field)
    return new_row

def decrypt_row(row: dict, table_name: str = "tickets") -> dict:
    if not isinstance(row, dict):
        return row
    new_row = dict(row)
    company_id = row.get("company_id")
    fields = TABLE_PII_FIELDS.get(table_name, set())
    for field in fields:
        if field in new_row and new_row[field] is not None:
            new_row[field] = decrypt(str(new_row[field]), tenant_id=company_id, field_name=field)
    return new_row

def encrypt_payload(payload: Any, table_name: str = "tickets") -> Any:
    if isinstance(payload, list):
        return [encrypt_row(row, table_name) for row in payload]
    elif isinstance(payload, dict):
        return encrypt_row(payload, table_name)
    return payload

def decrypt_payload(payload: Any, table_name: str = "tickets") -> Any:
    if isinstance(payload, list):
        return [decrypt_row(row, table_name) for row in payload]
    elif isinstance(payload, dict):
        return decrypt_row(payload, table_name)
    return payload

# Transparent client query wrapper proxy
class WrappedRequestBuilder:
    def __init__(self, builder: Any, table_name: str):
        object.__setattr__(self, "_builder", builder)
        object.__setattr__(self, "_table_name", table_name)

    def insert(self, json: Any, *args, **kwargs) -> "WrappedRequestBuilder":
        if self._table_name in TABLE_PII_FIELDS:
            json = encrypt_payload(json, self._table_name)
        res = self._builder.insert(json, *args, **kwargs)
        return WrappedRequestBuilder(res, self._table_name)

    def update(self, json: Any, *args, **kwargs) -> "WrappedRequestBuilder":
        if self._table_name in TABLE_PII_FIELDS:
            json = encrypt_payload(json, self._table_name)
        res = self._builder.update(json, *args, **kwargs)
        return WrappedRequestBuilder(res, self._table_name)

    def execute(self, *args, **kwargs) -> Any:
        res = self._builder.execute(*args, **kwargs)
        if self._table_name in TABLE_PII_FIELDS and res and hasattr(res, "data"):
            res.data = decrypt_payload(res.data, self._table_name)
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
    """Wraps a Supabase client's table method for transparent encryption."""
    if client is None:
        return None

    # Avoid double wrapping
    if hasattr(client, "_wrapped_by_crypto"):
        return client

    original_table = client.table

    def wrapped_table(table_name: str, *args, **kwargs) -> Any:
        builder = original_table(table_name, *args, **kwargs)
        if table_name in TABLE_PII_FIELDS:
            return WrappedRequestBuilder(builder, table_name)
        return builder

    client.table = wrapped_table
    client._wrapped_by_crypto = True
    return client

def apply_db_encryption_patch():
    """Apply transparent monkeypatch to Postgrest/Supabase client execute method for PII-encrypted tables."""
    try:
        from postgrest._sync.request_builder import SyncQueryRequestBuilder
        
        _original_execute = SyncQueryRequestBuilder.execute

        def custom_execute(self):
            path_str = getattr(self.request.path, "path", "")
            table_name = path_str.split('/')[-1]
            
            if table_name in TABLE_PII_FIELDS:
                payload = self.request.json
                fields = TABLE_PII_FIELDS[table_name]
                if isinstance(payload, dict):
                    company_id = payload.get("company_id")
                    for field in fields:
                        if field in payload and payload[field] is not None:
                            payload[field] = encrypt(str(payload[field]), tenant_id=company_id, field_name=field)
                elif isinstance(payload, list):
                    for item in payload:
                        if isinstance(item, dict):
                            company_id = item.get("company_id")
                            for field in fields:
                                if field in item and item[field] is not None:
                                    item[field] = encrypt(str(item[field]), tenant_id=company_id, field_name=field)
                                    
            res = _original_execute(self)
            
            if table_name in TABLE_PII_FIELDS and res and hasattr(res, "data"):
                data = res.data
                fields = TABLE_PII_FIELDS[table_name]
                if isinstance(data, dict):
                    company_id = data.get("company_id")
                    for field in fields:
                        if field in data and data[field] is not None:
                            data[field] = decrypt(str(data[field]), tenant_id=company_id, field_name=field)
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            company_id = item.get("company_id")
                            for field in fields:
                                if field in item and item[field] is not None:
                                    item[field] = decrypt(str(item[field]), tenant_id=company_id, field_name=field)
                                    
            return res

        SyncQueryRequestBuilder.execute = custom_execute
        print("[Crypto] Supabase database encryption patch applied successfully.")
    except Exception as e:
        print(f"[Crypto WARNING] Failed to apply database encryption patch: {e}")

# Automatically apply the monkeypatch on module load
apply_db_encryption_patch()
