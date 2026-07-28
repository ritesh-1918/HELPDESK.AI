from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class AuditLog(BaseModel):
    audit_id: Optional[str] = Field(None, alias="id")
    timestamp: Optional[datetime] = None
    user_id: Optional[str] = None
    company_id: Optional[str] = None
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    operation_type: Optional[str] = None
    status: Optional[str] = None
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    origin: Optional[str] = None
    authentication_method: Optional[str] = None
    reason: Optional[str] = None
    approval_id: Optional[str] = None
    workflow_reference: Optional[str] = None
    hash: Optional[str] = None
    previous_hash: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
