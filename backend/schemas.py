from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any


class TicketRequest(BaseModel):
    text: str = Field(max_length=5000)
    image_base64: str = Field(default="", max_length=5_000_000)
    image_text: str = Field(default="", max_length=5000)
    user_id: str | None = Field(default=None, max_length=255)
    company: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=2048)
    confidence_threshold: float = Field(default=0.20, ge=0.0, le=1.0)
    duplicate_sensitivity: float = Field(default=0.85, ge=0.0, le=1.0)

    @field_validator("text")
    @classmethod
    def strip_control_chars(cls, v: str) -> str:
        if not v:
            return v
        sanitized = "".join(c for c in v if c.isprintable() or c in "\n\r\t")
        return sanitized[:5000]


class TicketSaveRequest(BaseModel):
    user_id: str = Field(max_length=255)
    subject: str = Field(max_length=500)
    description: str = Field(max_length=10000)
    category: str = Field(max_length=100)
    subcategory: str = Field(max_length=100)
    priority: str = Field(max_length=50)
    assigned_team: str = Field(max_length=100)
    status: str = Field(max_length=50)
    auto_resolve: bool = False
    is_duplicate: bool = False
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    image_url: str | None = Field(default=None, max_length=2048)
    company: str | None = Field(default=None, max_length=255)
    company_id: str | None = Field(default=None, max_length=255)
    sla_breach_at: str = Field(max_length=50)
    metadata: dict = Field(default_factory=dict)
    entities: list = Field(default_factory=list)
    solution_steps: list = Field(default_factory=list)
    ocr_text: str = Field(default="", max_length=10000)
    needs_review: bool = False
    routing_confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class DuplicateInfo(BaseModel):
    is_duplicate: bool = False
    duplicate_ticket_id: str | None = Field(default=None, max_length=255)
    similarity: float = Field(default=0.0, ge=0.0, le=1.0)


class EntityInfo(BaseModel):
    text: str = Field(max_length=500)
    label: str = Field(max_length=100)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class TroubleshootRequest(BaseModel):
    text: str = Field(max_length=5000)
    category: str = Field(max_length=100)
    history: list[dict] = Field(default_factory=list, max_length=50)


class TroubleshootResponse(BaseModel):
    step_text: str = Field(max_length=2000)
    options: list[str] = Field(default_factory=list)
    is_final: bool = False


class BugReportAnalysisRequest(BaseModel):
    bug_title: str = Field(max_length=500)
    description: str = Field(max_length=10000)
    steps_to_reproduce: str = Field(default="", max_length=5000)
    console_errors: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("bug_title")
    @classmethod
    def strip_control_chars_title(cls, v: str) -> str:
        return "".join(c for c in v if c.isprintable() or c in "\n\r\t")[:500]

    @field_validator("console_errors")
    @classmethod
    def limit_error_length(cls, v: list[str]) -> list[str]:
        return [e[:500] for e in v][:20]


class BugReportAnalysisResponse(BaseModel):
    probable_cause: str = Field(max_length=2000)


class HealthResponse(BaseModel):
    status: str = Field(max_length=50)
    message: str = Field(default="Backend system operational.", max_length=500)


class ReadinessResponse(BaseModel):
    status: str = Field(max_length=50)
    db_status: str = Field(default="ok", max_length=50)
    ai_status: str = Field(default="ready", max_length=50)


class Message(BaseModel):
    sender: str = Field(max_length=100)
    message: str = Field(max_length=5000)
    timestamp: str = Field(max_length=50)


class TicketRecord(BaseModel):
    ticket_id: str = Field(max_length=255)
    owner_id: str = Field(max_length=255)
    summary: str = Field(max_length=500)
    category: str = Field(max_length=100)
    subcategory: str = Field(max_length=100)
    priority: str = Field(max_length=50)
    status: str = Field(max_length=50)
    assigned_team: str = Field(max_length=100)
    created_at: str = Field(max_length=50)
    updated_at: str | None = Field(default=None, max_length=50)
    last_user_viewed_at: str | None = Field(default=None, max_length=50)
    messages: list[Message] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
    timeline: dict = Field(default_factory=dict)


class TicketResponse(BaseModel):
    id: str | int | None = None
    ticket_id: str | None = Field(default=None, max_length=255)
    summary: str = Field(max_length=500)
    category: str = Field(max_length=100)
    subcategory: str = Field(max_length=100)
    priority: str = Field(max_length=50)
    auto_resolve: bool = False
    assigned_team: str = Field(max_length=100)
    entities: list[EntityInfo] = Field(default_factory=list)
    duplicate_ticket: DuplicateInfo = Field(default_factory=DuplicateInfo)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    needs_review: bool = False
    reasoning: str = Field(default="", max_length=2000)
    decision_factors: list[str] = Field(default_factory=list)
    image_description: str = Field(default="", max_length=2000)
    ocr_text: str = Field(default="", max_length=10000)
    image_url: str | None = Field(default=None, max_length=2048)
    highlights: list[str] = Field(default_factory=list)
    timeline: dict = Field(default_factory=dict)
    env_metadata: dict = Field(default_factory=dict)
    sla_breach_at: str | None = Field(default=None, max_length=50)
    version: str = Field(default="2.1.0-Neural-Diagnostic", max_length=50)


