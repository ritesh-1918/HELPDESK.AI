"""
User Profile model with AES-256 GCM encryption for sensitive PII fields.
Logs every encrypt/decrypt operation to encryption_audit_logs table.
"""

import logging
from backend.models.encryption import encrypt_pii, decrypt_pii
from backend.models.encryption_key_lo import EncryptionAuditLog

logger = logging.getLogger(__name__)

SENSITIVE_FIELDS = ("phone_number", "address", "employee_id", "department")
KEY_VERSION = 1


def _log_audit(supabase, operation: str, field: str, user_id: str, org_id: str, status: str, error: str = None):
    try:
        entry = EncryptionAuditLog(
            user_id=user_id,
            organization_id=org_id,
            operation_type=operation,
            field_accessed=field,
            key_version=KEY_VERSION,
            request_source="tenant_middleware",
            status=status,
            error_message=error,
        )
        if supabase:
            supabase.table("encryption_audit_logs").insert(entry.model_dump(exclude_none=True)).execute()
    except Exception as e:
        logger.warning(f"[EncryptionAudit] Failed to write audit log: {e}")


def encrypt_profile(profile: dict, supabase=None, actor_id: str = None) -> dict:
    result = profile.copy()
    org_id = profile.get("company_id", "unknown")
    for field in SENSITIVE_FIELDS:
        if result.get(field):
            try:
                result[field] = encrypt_pii(str(result[field]))
                _log_audit(supabase, "ENCRYPT", field, actor_id, org_id, "SUCCESS")
            except Exception as e:
                _log_audit(supabase, "ENCRYPT", field, actor_id, org_id, "FAILED", str(e))
                raise
    return result


def decrypt_profile(profile: dict, supabase=None, actor_id: str = None) -> dict:
    result = profile.copy()
    org_id = profile.get("company_id", "unknown")
    for field in SENSITIVE_FIELDS:
        if result.get(field):
            try:
                result[field] = decrypt_pii(result[field])
                _log_audit(supabase, "DECRYPT", field, actor_id, org_id, "SUCCESS")
            except Exception as e:
                _log_audit(supabase, "DECRYPT", field, actor_id, org_id, "FAILED", str(e))
    return result
