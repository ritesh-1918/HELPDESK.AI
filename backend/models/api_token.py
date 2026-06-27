"""
API Token data model for HelpDesk.AI.

Describes the shape of an api_token row as exchanged between the
token-management service and FastAPI route handlers.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Supported permission scopes
# ---------------------------------------------------------------------------

VALID_SCOPES: List[str] = [
    "tickets:read",
    "tickets:write",
    "tickets:delete",
    "users:read",
    "analytics:read",
    "attachments:read",
    "status:read",
]


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class APITokenCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    scopes: List[str] = Field(..., min_length=1)
    expires_in_days: Optional[int] = Field(default=90, ge=1, le=365)
    allowed_ips: List[str] = Field(default_factory=list)


class APITokenResponse(BaseModel):
    id: str
    name: str
    token_prefix: str
    scopes: List[str]
    status: str
    expires_at: Optional[str]
    allowed_ips: List[str]
    last_used_at: Optional[str]
    last_used_ip: Optional[str]
    created_at: str


class APITokenCreatedResponse(APITokenResponse):
    """Extends the base token response with the one-time plaintext secret."""
    raw_token: str = Field(
        ...,
        description="Displayed once at creation time. Store it securely — it cannot be recovered.",
    )


class APITokenRevokeRequest(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=500)


class APITokenUsageRecord(BaseModel):
    id: str
    token_id: str
    endpoint: str
    method: str
    status_code: int
    ip_address: Optional[str]
    response_ms: Optional[int]
    created_at: str


class APITokenUsageSummary(BaseModel):
    total_requests: int
    requests_last_24h: int
    requests_last_7d: int
    top_endpoints: List[dict]
    error_rate: float
    last_used_at: Optional[str]
    last_used_ip: Optional[str]
