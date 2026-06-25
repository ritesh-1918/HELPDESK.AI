"""
Enhanced unit tests for Pydantic ticket models.

Coverage Includes:
- Validation rules
- Serialization / deserialization
- Boundary conditions
- Default values
- Nested model behavior
- Parametrized edge cases
"""

import pytest
from pydantic import BaseModel, ValidationError, field_validator


# ============================================================================
# Models
# ============================================================================


class TicketRequest(BaseModel):
    text: str
    image_base64: str = ""
    image_text: str = ""
    user_id: str | None = None
    company: str | None = None
    company_id: str | None = None
    image_url: str | None = None
    confidence_threshold: float = 0.20
    duplicate_sensitivity: float = 0.85

    @field_validator("confidence_threshold", "duplicate_sensitivity")
    @classmethod
    def validate_threshold_range(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"Value must be between 0.0 and 1.0, got {v}")
        return v


class TicketSaveRequest(BaseModel):
    user_id: str
    subject: str
    description: str
    category: str
    subcategory: str
    priority: str
    assigned_team: str
    status: str


class RatingRequest(BaseModel):
    ticket_id: str
    rating: int
    feedback: str | None = None


class DuplicateInfo(BaseModel):
    is_duplicate: bool
    duplicate_ticket_id: str | None = None
    similarity: float = 0.0


class IncidentInfo(BaseModel):
    incident_id: str | None = None
    is_major_incident: bool = False
    ticket_count: int = 0
    affected_users: int = 0
    similarity: float = 0.0


class EntityInfo(BaseModel):
    text: str
    label: str
    confidence: float


class SpamCheck(BaseModel):
    is_spam: bool = False
    risk_score: float = 0.0
    reasons: list[str] = []
    suspicious_urls: list[str] = []
    matched_keywords: list[str] = []


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
    incident: IncidentInfo = IncidentInfo()
    confidence: float
    needs_review: bool = False
    reasoning: str = ""
    decision_factors: list[str] = []
    spam_check: SpamCheck = SpamCheck()
    version: str = "2.1.0-Neural-Diagnostic"


class Message(BaseModel):
    sender: str
    message: str
    timestamp: str


# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture
def valid_ticket_request():
    return {
        "text": "System crash issue",
        "confidence_threshold": 0.5,
        "duplicate_sensitivity": 0.8,
    }


@pytest.fixture
def valid_response_payload():
    return {
        "summary": "Login issue",
        "category": "Authentication",
        "subcategory": "Password Reset",
        "priority": "medium",
        "auto_resolve": False,
        "assigned_team": "Support",
        "entities": [],
        "duplicate_ticket": DuplicateInfo(is_duplicate=False),
        "confidence": 0.92,
    }


# ============================================================================
# TicketRequest Tests
# ============================================================================


class TestTicketRequest:

    def test_valid_request(self, valid_ticket_request):
        ticket = TicketRequest(**valid_ticket_request)

        assert ticket.text == "System crash issue"
        assert ticket.confidence_threshold == 0.5

    @pytest.mark.parametrize(
        "field,value",
        [
            ("confidence_threshold", -0.1),
            ("confidence_threshold", 1.5),
            ("duplicate_sensitivity", -1),
            ("duplicate_sensitivity", 2),
        ],
    )
    def test_invalid_thresholds(self, field, value, valid_ticket_request):
        valid_ticket_request[field] = value

        with pytest.raises(ValidationError):
            TicketRequest(**valid_ticket_request)

    @pytest.mark.parametrize(
        "text",
        [
            "",
            " ",
            "🔥 Critical production outage",
            "a" * 1000,
        ],
    )
    def test_edge_case_text_inputs(self, text):
        ticket = TicketRequest(text=text)

        assert ticket.text == text

    def test_optional_fields_default_none(self):
        ticket = TicketRequest(text="Test")

        assert ticket.user_id is None
        assert ticket.company is None
        assert ticket.company_id is None

    def test_serialization_roundtrip(self):
        ticket = TicketRequest(
            text="API issue",
            user_id="u123",
            confidence_threshold=0.75,
        )

        restored = TicketRequest.model_validate_json(
            ticket.model_dump_json()
        )

        assert restored == ticket

    def test_missing_required_text(self):
        with pytest.raises(ValidationError):
            TicketRequest()


# ============================================================================
# TicketSaveRequest Tests
# ============================================================================


class TestTicketSaveRequest:

    @pytest.fixture
    def payload(self):
        return {
            "user_id": "u1",
            "subject": "Login failed",
            "description": "Cannot login",
            "category": "Access",
            "subcategory": "Authentication",
            "priority": "high",
            "assigned_team": "Support",
            "status": "open",
        }

    def test_valid_save_request(self, payload):
        model = TicketSaveRequest(**payload)

        assert model.priority == "high"

    def test_missing_required_fields(self):
        with pytest.raises(ValidationError):
            TicketSaveRequest(user_id="u1")

    def test_model_serialization(self, payload):
        model = TicketSaveRequest(**payload)

        dumped = model.model_dump()

        assert dumped["status"] == "open"
        assert len(dumped.keys()) == 8


# ============================================================================
# RatingRequest Tests
# ============================================================================


class TestRatingRequest:

    @pytest.mark.parametrize("rating", [1, 2, 3, 4, 5])
    def test_valid_ratings(self, rating):
        model = RatingRequest(
            ticket_id="tkt_001",
            rating=rating,
        )

        assert model.rating == rating

    def test_optional_feedback(self):
        model = RatingRequest(
            ticket_id="tkt_001",
            rating=5,
            feedback="Resolved quickly",
        )

        assert model.feedback == "Resolved quickly"


# ============================================================================
# DuplicateInfo Tests
# ============================================================================


class TestDuplicateInfo:

    def test_default_similarity(self):
        info = DuplicateInfo(is_duplicate=False)

        assert info.similarity == 0.0

    def test_duplicate_ticket(self):
        info = DuplicateInfo(
            is_duplicate=True,
            duplicate_ticket_id="TKT-99",
            similarity=0.97,
        )

        assert info.is_duplicate is True
        assert info.similarity > 0.9


# ============================================================================
# IncidentInfo Tests
# ============================================================================


class TestIncidentInfo:

    def test_default_values(self):
        incident = IncidentInfo()

        assert incident.ticket_count == 0
        assert incident.is_major_incident is False

    def test_major_incident_case(self):
        incident = IncidentInfo(
            incident_id="INC-001",
            is_major_incident=True,
            ticket_count=150,
            affected_users=3000,
        )

        assert incident.is_major_incident is True
        assert incident.affected_users == 3000


# ============================================================================
# EntityInfo Tests
# ============================================================================


class TestEntityInfo:

    def test_valid_entity(self):
        entity = EntityInfo(
            text="Windows 11",
            label="OS",
            confidence=0.94,
        )

        assert entity.label == "OS"

    def test_missing_required_field(self):
        with pytest.raises(ValidationError):
            EntityInfo(text="Server")


# ============================================================================
# SpamCheck Tests
# ============================================================================


class TestSpamCheck:

    def test_default_values(self):
        spam = SpamCheck()

        assert spam.is_spam is False
        assert spam.reasons == []

    def test_spam_detection(self):
        spam = SpamCheck(
            is_spam=True,
            risk_score=0.96,
            reasons=["Suspicious links"],
            suspicious_urls=["http://spam.com"],
        )

        assert spam.is_spam is True
        assert len(spam.suspicious_urls) == 1


# ============================================================================
# TicketResponse Tests
# ============================================================================


class TestTicketResponse:

    def test_minimal_response(self, valid_response_payload):
        response = TicketResponse(**valid_response_payload)

        assert response.version == "2.1.0-Neural-Diagnostic"

    def test_nested_entities(self, valid_response_payload):
        valid_response_payload["entities"] = [
            EntityInfo(
                text="Linux",
                label="OS",
                confidence=0.91,
            )
        ]

        response = TicketResponse(**valid_response_payload)

        assert len(response.entities) == 1

    def test_spam_check_integration(self, valid_response_payload):
        valid_response_payload["spam_check"] = SpamCheck(
            is_spam=True,
            risk_score=0.88,
        )

        response = TicketResponse(**valid_response_payload)

        assert response.spam_check.is_spam is True

    def test_serialization_roundtrip(self, valid_response_payload):
        response = TicketResponse(**valid_response_payload)

        restored = TicketResponse.model_validate_json(
            response.model_dump_json()
        )

        assert restored == response

    @pytest.mark.parametrize("ticket_id", ["TKT-001", 101])
    def test_id_accepts_string_or_int(self, ticket_id, valid_response_payload):
        valid_response_payload["id"] = ticket_id

        response = TicketResponse(**valid_response_payload)

        assert response.id == ticket_id


# ============================================================================
# Message Tests
# ============================================================================


class TestMessage:

    def test_valid_message(self):
        msg = Message(
            sender="agent",
            message="Issue resolved",
            timestamp="2026-06-05T10:00:00Z",
        )

        assert msg.sender == "agent"

    def test_missing_timestamp(self):
        with pytest.raises(ValidationError):
            Message(
                sender="user",
                message="Help needed",
            )

    def test_serialization(self):
        msg = Message(
            sender="system",
            message="Maintenance scheduled",
            timestamp="2026-06-05T11:00:00Z",
        )

        dumped = msg.model_dump()

        assert dumped["sender"] == "system"