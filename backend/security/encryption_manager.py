import os
import json
import base64
import logging
import queue
import threading
from contextvars import ContextVar
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from backend.security.kms_client import get_kms_provider

logger = logging.getLogger(__name__)

# Request-scoped context containing user_id, company_id, and request_source
request_context = ContextVar("request_context", default={})

# Thread-safe queue and background worker for asynchronous audit logging
audit_queue = queue.Queue()
_supabase_client = None

def get_supabase_client():
    global _supabase_client
    if _supabase_client is None:
        try:
            from backend.main import supabase
            _supabase_client = supabase
        except Exception:
            pass
    return _supabase_client

def audit_worker():
    while True:
        try:
            log_entry = audit_queue.get()
            if log_entry is None:
                break
            
            client = get_supabase_client()
            if client:
                try:
                    # Write to database using the raw postgrest request
                    client.table("encryption_audit_logs").insert(log_entry).execute()
                except Exception as e:
                    logger.error(f"[Audit Queue Error] Failed to write audit log to database: {e}")
            else:
                logger.warning(f"[Audit Queue Warning] Supabase client unavailable. Audit log: {log_entry}")
            
            audit_queue.task_done()
        except Exception as e:
            logger.error(f"[Audit Worker Error]: {e}")

# Start background daemon thread for logging
threading.Thread(target=audit_worker, daemon=True).start()

def log_audit_event(operation_type: str, organization_id: str | None, field_accessed: str | None, key_version: int, status: str, error_message: str | None = None):
    """Queue audit log event for background processing."""
    ctx = request_context.get() or {}
    user_id = ctx.get("user_id")
    request_source = ctx.get("request_source", "unknown")
    
    log_entry = {
        "user_id": user_id,
        "organization_id": organization_id or "global",
        "operation_type": operation_type,
        "field_accessed": field_accessed,
        "key_version": key_version,
        "request_source": request_source,
        "status": status,
        "error_message": error_message
    }
    audit_queue.put(log_entry)


# Cache for retired keys to avoid database roundtrips during decrypt operations
# Keys are stored as (tenant_id, version) -> bool
RETIRED_KEYS_CACHE = {}
_master_key_cache = None

def clear_caches():
    """Clear in-memory caches (mainly for testing)."""
    global _master_key_cache
    _master_key_cache = None
    RETIRED_KEYS_CACHE.clear()

def _unpack_rpc_result(data):
    """Unpack a Postgrest RPC result, handling lists, dicts, or scalars."""
    if data is None:
        return None
    if isinstance(data, list):
        if not data:
            return None
        data = data[0]
    if isinstance(data, dict):
        if not data:
            return None
        data = list(data.values())[0]
    return data

def get_master_key() -> bytes:
    """Retrieve the plaintext Master Key. Uses cloud KMS envelope decryption if configured, otherwise Supabase Vault."""
    global _master_key_cache
    if _master_key_cache is not None:
        return _master_key_cache

    provider_type = os.environ.get("KMS_PROVIDER", "local").strip().lower()
    
    # 1. Try Cloud KMS decryption if KMS provider is configured
    if provider_type in ("aws", "azure", "gcp"):
        encrypted_key_b64 = os.environ.get("ENCRYPTED_MASTER_KEY")
        if encrypted_key_b64:
            try:
                kms_client = get_kms_provider()
                ciphertext = base64.b64decode(encrypted_key_b64)
                plaintext_key = kms_client.decrypt(ciphertext)
                _master_key_cache = plaintext_key
                return plaintext_key
            except Exception as e:
                logger.error(f"Failed to decrypt MASTER_KEY via KMS: {e}")
    
    # 2. Fall back to Supabase Vault / internal_config via RPC
    client = get_supabase_client()
    if client:
        try:
            res = client.rpc("get_master_encryption_key").execute()
            raw_val = _unpack_rpc_result(res.data)
            if raw_val:
                # Master key is hex-encoded 32-byte string from RPC
                plaintext_key = bytes.fromhex(str(raw_val))
                _master_key_cache = plaintext_key
                return plaintext_key
        except Exception as e:
            logger.warning(f"Failed to fetch master key from Supabase Vault RPC: {e}")
            
    # 3. Last resort fallback to local environment variable for testing/degraded mode
    secret = os.environ.get("DB_ENCRYPTION_SECRET_KEY")
    if secret:
        import hashlib
        plaintext_key = hashlib.sha256(secret.encode()).digest()
        _master_key_cache = plaintext_key
        return plaintext_key
        
    raise ValueError("No master encryption key configuration could be retrieved or initialized.")

def derive_tenant_key(master_key: bytes, tenant_id: str) -> bytes:
    """Derive a tenant-specific key using HKDF-SHA256."""
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=tenant_id.encode(),
    )
    return hkdf.derive(master_key)

def derive_dek(tenant_key: bytes, tenant_id: str, version: int) -> bytes:
    """Derive a versioned Data Encryption Key (DEK) from the tenant key."""
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=f"{tenant_id}:dek_version:{version}".encode(),
    )
    return hkdf.derive(tenant_key)

def get_active_key_version(tenant_id: str) -> int:
    """Get active key version from Supabase. Automatically rotates if expired."""
    client = get_supabase_client()
    if client:
        try:
            res = client.rpc("get_active_key_version", {"p_tenant_id": tenant_id}).execute()
            raw_val = _unpack_rpc_result(res.data)
            if raw_val is not None:
                return int(raw_val)
        except Exception as e:
            logger.warning(f"Failed to get active key version for tenant {tenant_id}: {e}")
            
    # Return version 1 as fallback
    return 1

def is_key_version_retired(tenant_id: str, version: int) -> bool:
    """Check if the key version has been retired."""
    cache_key = (tenant_id, version)
    if cache_key in RETIRED_KEYS_CACHE:
        return RETIRED_KEYS_CACHE[cache_key]
        
    client = get_supabase_client()
    if client:
        try:
            res = client.table("encryption_key_rotation_history")\
                .select("retired_at")\
                .eq("tenant_id", tenant_id)\
                .eq("key_version", version)\
                .execute()
            if res.data:
                is_retired = res.data[0].get("retired_at") is not None
                RETIRED_KEYS_CACHE[cache_key] = is_retired
                return is_retired
        except Exception as e:
            logger.warning(f"Failed to check if key version is retired: {e}")
            
    return False

def encrypt_field(plain_text: str, tenant_id: str | None = None, field_name: str | None = None) -> str:
    """Encrypt a PII field using tenant-specific versioned key, returning metadata JSON."""
    if not plain_text:
        return plain_text
        
    t_id = tenant_id or "global"
    
    try:
        # Get active version
        version = get_active_key_version(t_id)
        
        # Derive key material
        master_key = get_master_key()
        tenant_key = derive_tenant_key(master_key, t_id)
        dek = derive_dek(tenant_key, t_id, version)
        
        # Encrypt using AESGCM
        cipher = AESGCM(dek)
        nonce = os.urandom(12)
        encrypted_bytes = cipher.encrypt(nonce, plain_text.encode('utf-8'), None)
        
        # Split ciphertext and GCM authentication tag
        tag = encrypted_bytes[-16:]
        ciphertext = encrypted_bytes[:-16]
        
        # Formulate JSON payload
        payload = {
            "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
            "iv": base64.b64encode(nonce).decode('utf-8'),
            "tag": base64.b64encode(tag).decode('utf-8'),
            "key_version": version
        }
        
        log_audit_event("ENCRYPT", t_id, field_name, version, "SUCCESS")
        return json.dumps(payload)
        
    except Exception as e:
        logger.error(f"Encryption failed for field {field_name}: {e}")
        log_audit_event("ENCRYPT", t_id, field_name, 0, "FAILED", str(e))
        return plain_text

def decrypt_field(payload_str: str, tenant_id: str | None = None, field_name: str | None = None) -> str:
    """Decrypt a PII field. Support version-aware JSON decryption, legacy fallback, and grace period retirement."""
    if not payload_str:
        return payload_str
        
    t_id = tenant_id or "global"
    
    # Check if payload is in JSON format
    is_json = False
    try:
        stripped = payload_str.strip()
        if stripped.startswith("{") and stripped.endswith("}"):
            payload = json.loads(stripped)
            if all(k in payload for k in ("ciphertext", "iv", "tag", "key_version")):
                is_json = True
    except Exception:
        pass
        
    if not is_json:
        # 1. Fallback to legacy decryption (using env-based DB_ENCRYPTION_SECRET_KEY)
        try:
            from backend.auth.crypto import legacy_decrypt
            return legacy_decrypt(payload_str)
        except Exception as e:
            logger.warning(f"Legacy decryption failed for field {field_name}: {e}")
            return payload_str

    # 2. Versioned decryption
    version = payload.get("key_version")
    
    try:
        # Check if retired
        if is_key_version_retired(t_id, version):
            raise ValueError(f"Key version {version} for tenant {t_id} is retired and cannot be used for decryption.")
            
        master_key = get_master_key()
        tenant_key = derive_tenant_key(master_key, t_id)
        dek = derive_dek(tenant_key, t_id, version)
        
        # Re-assemble ciphertext and tag
        ciphertext = base64.b64decode(payload["ciphertext"])
        nonce = base64.b64decode(payload["iv"])
        tag = base64.b64decode(payload["tag"])
        combined_encrypted = ciphertext + tag
        
        cipher = AESGCM(dek)
        decrypted = cipher.decrypt(nonce, combined_encrypted, None)
        
        log_audit_event("DECRYPT", t_id, field_name, version, "SUCCESS")
        return decrypted.decode('utf-8')
        
    except Exception as e:
        logger.error(f"Decryption failed for field {field_name} (version {version}): {e}")
        log_audit_event("DECRYPT", t_id, field_name, version, "FAILED", str(e))
        return payload_str
