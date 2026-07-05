from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from backend.sanitization import sanitize_text

_ALLOWED_CATEGORIES = {
    "Hardware", "Software", "Network", "Security", "Access",
    "Email", "Account", "Billing", "Other"
}
_ALLOWED_PRIORITIES = {"Low", "Medium", "High", "Critical"}
_ALLOWED_TEAMS = {
    "Hardware Support", "Software Support", "Network Support",
    "Security Support", "Access Support", "Email Support",
    "Account Support", "Billing Support", "General Support"
}
_ALLOWED_STATUSES = {"Open", "In Progress", "Resolved", "Closed", "Escalated"}
class TicketRequest(BaseModel):
    text: str
    image_base64: str = ""
    image_text: str = "" # Keep for backward compatibility
    user_id: str | None = None
    company: str | None = None
    image_url: str | None = None
    confidence_threshold: float = 0.20
    duplicate_sensitivity: float = 0.85

class TicketSaveRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=256)
    subject: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1, max_length=10000)
    category: str = Field(..., min_length=1, max_length=50)
    subcategory: str = Field("", max_length=100)
    priority: str = Field(..., min_length=1, max_length=20)
    assigned_team: str = Field(..., min_length=1, max_length=50)
    status: str = Field(..., min_length=1, max_length=30)
    auto_resolve: bool = False
    is_duplicate: bool = False
    confidence: float = Field(..., ge=0.0, le=1.0)
    image_url: str | None = Field(None, max_length=2048)
    company: str | None = Field(None, max_length=256)
    company_id: str | None = Field(None, max_length=64)
    sla_breach_at: str = Field(..., max_length=64)
    metadata: dict = Field(default_factory=dict)
    entities: list = Field(default_factory=list)
    solution_steps: list = Field(default_factory=list)
    ocr_text: str = Field("", max_length=5000)
    needs_review: bool = False
    routing_confidence: float = Field(..., ge=0.0, le=1.0)

    @field_validator("subject", "description", "ocr_text", mode="before")
    @classmethod
    def strip_xss(cls, v):
        if isinstance(v, str):
            return sanitize_text(v, strip_html=True, max_length=10000)
        return v

    @field_validator("category", "priority", "assigned_team", "status", mode="after")
    @classmethod
    def validate_enum_fields(cls, v, info):
        field_name = info.field_name
        allowed = {
            "category": _ALLOWED_CATEGORIES,
            "priority": _ALLOWED_PRIORITIES,
            "assigned_team": _ALLOWED_TEAMS,
            "status": _ALLOWED_STATUSES,
        }.get(field_name)
        if allowed and v not in allowed:
            raise ValueError(
                f"Invalid {field_name}: '{v}'. Must be one of: {', '.join(sorted(allowed))}"
            )
        return v


class DuplicateInfo(BaseModel):
    is_duplicate: bool
    duplicate_ticket_id: str | None = None
    similarity: float = 0.0


class EntityInfo(BaseModel):
    text: str
    label: str
    confidence: float


class TicketResponse(BaseModel):
    id: str | int | None = None
    ticket_id: str | None = None
    summary: str
    category: str
    subcategory: str
    priority: str
    auto_resolve: bool
    assigned_team: str
    entities: list[EntityInfo]
    duplicate_ticket: DuplicateInfo
    confidence: float
    needs_review: bool = False
    reasoning: str = ""
    decision_factors: list[str] = []
    image_description: str = ""
    ocr_text: str = ""
    image_url: str | None = None
    highlights: list[str] = []
    timeline: dict = {} # Map of step_name: timestamp
    env_metadata: dict = {} # IP, Hostname, Browser/OS
    sla_breach_at: str | None = None
    version: str = "2.1.0-Neural-Diagnostic"
    rag_suggestions: list = []
    rag_recommendations: list = []


# ─── Profile update schema (closes #2894) ──────────────────────────────────
# `extra="forbid"` rejects unknown fields, so a client cannot smuggle
# `role`, `status`, `company_id`, `email`, etc. into the PATCH body.
# Fields are all Optional so PATCH can update a subset; the handler uses
# `exclude_unset=True` to only persist what was actually sent.
class ProfileUpdate(BaseModel):
    model_config = {"extra": "forbid"}

    full_name: Optional[str] = Field(default=None, max_length=200)
    avatar_url: Optional[str] = Field(default=None, max_length=2048)
    bio: Optional[str] = Field(default=None, max_length=1000)
    phone: Optional[str] = Field(default=None, max_length=32)
    timezone: Optional[str] = Field(default=None, max_length=64)
    locale: Optional[str] = Field(default=None, max_length=16)

    @field_validator("avatar_url")
    @classmethod
    def _validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("avatar_url must be an http(s) URL")
        return v


class TicketRecord(BaseModel):
    ticket_id: str
    owner_id: str
    company_id: str | None = None
    subject: str
    description: str
    category: str
    subcategory: str
    priority: str
    assigned_team: str
    status: str
    auto_resolve: bool
    is_duplicate: bool
    confidence: float
    sla_breach_at: str
    routing_confidence: float
    metadata: dict = {}


TICKETS_DB: list[TicketRecord] = []

