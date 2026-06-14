from pydantic import BaseModel
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


class CorrectionLogRequest(BaseModel):
    ticket_id: str = ""
    original_text: str = ""
    ocr_text: str = ""
    confidence: float = 0.0
    original_prediction: dict = {}
    corrected_prediction: dict = {}


class Message(BaseModel):
    sender: str = ""
    message: str = ""
    timestamp: str = ""


class TicketRecord(BaseModel):
    ticket_id: str = ""
    owner_id: str = ""
    summary: str = ""
    category: str = ""
    subcategory: str = ""
    priority: str = ""
    status: str = ""
    assigned_team: str = ""
    created_at: str = ""
    updated_at: str | None = None
    last_user_viewed_at: str | None = None
    messages: list[Message] = []
    metadata: dict = {}
    timeline: dict = {}


class HealthResponse(BaseModel):
    status: str = "healthy"
    message: str = "Backend system operational."


class ReadinessResponse(BaseModel):
    status: str = "healthy"
    db_status: str = "ok"
    ai_status: str = "ready"


