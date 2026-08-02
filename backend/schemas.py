from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
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
    user_id: str
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
    image_url: str | None = None
    company: str | None = None
    company_id: str | None = None
    sla_breach_at: str
    metadata: dict
    entities: list = []
    solution_steps: list = []
    ocr_text: str = ""
    needs_review: bool = False
    routing_confidence: float


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
    # Translation fields
    detected_language: str | None = None
    original_text: str | None = None
    translated_text: str | None = None
    translation_confidence: float | None = None


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

