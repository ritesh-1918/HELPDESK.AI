from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class EncryptionAuditLog(BaseModel):
    """Pydantic model representing a record in public.encryption_audit_logs."""
    id: Optional[str] = None
    user_id: Optional[str] = None
    organization_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    operation_type: str  # 'ENCRYPT', 'DECRYPT', 'ROTATE', 'RE-ENCRYPT'
    field_accessed: Optional[str] = None
    key_version: int
    request_source: Optional[str] = None
    status: str  # 'SUCCESS', 'FAILED'
    error_message: Optional[str] = None

class EncryptionKeyRotationHistory(BaseModel):
    """Pydantic model representing a record in public.encryption_key_rotation_history."""
    id: Optional[str] = None
    tenant_id: str
    key_version: int
    active_from: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    retired_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
