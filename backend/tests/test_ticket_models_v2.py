"""
Test suite for ticket Pydantic models (Issue #1145 - v2).

Defines local test copies of TicketRequest, TicketSaveRequest, TicketResponse
using pydantic and tests:
- model_dump() output structure
- field coercion types
- ValidationError messages
"""

import sys
import os
import pytest
from typing import Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from pydantic import BaseModel, field_validator, ValidationError


# ---------------------------------------------------------------------------
# Local test copies of the models (to avoid importing heavy backend deps)
# ---------------------------------------------------------------------------

class TicketRequest(BaseModel):
    text: str
    image_base64: str = ""
    image_text: str = ""
    user_id: Optional[str] = None
    company: Optional[str] = None
    company_id: Optional[str] = None
    image_url: Optional[str] = None
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


class DuplicateInfo(BaseModel):
    is_duplicate: bool
    duplicate_ticket_id: Optional[str] = None
    similarity: float = 0.0


class EntityInfo(BaseModel):
    text: str
    label: str
    confidence: float


class IncidentInfo(BaseModel):
    incident_id: Optional[str] = None
    is_major_incident: bool = False
    ticket_count: int = 0
    affected_users: int = 0
    similarity: float = 0.0


class SpamCheck(BaseModel):
    is_spam: bool = False
    risk_score: float = 0.0
    reasons: list = []
    suspicious_urls: list = []
    matched_keywords: list = []


class TicketResponse(BaseModel):
    id: Optional[str] = None
    ticket_id: Optional[str] = None
    summary: str
    category: str
    subcategory: str
    priority: str
    auto_resolve: bool
    assigned_team: str
    entities: list
    duplicate_ticket: DuplicateInfo
    incident: IncidentInfo = IncidentInfo()
    confidence: float
    needs_review: bool = False
    reasoning: str = ""
    decision_factors: list = []
    image_description: str = ""
    ocr_text: str = ""
    image_url: Optional[str] = None
    highlights: list = []
    timeline: dict = {}
    env_metadata: dict = {}
    sla_breach_at: Optional[str] = None
    original_text: Optional[str] = None
    source_language: str = "en"
    source_language_name: str = "English"
    was_translated: bool = False
    spam_check: SpamCheck = SpamCheck()
    version: str = "2.1.0-Neural-Diagnostic"


# ---------------------------------------------------------------------------
# TicketRequest tests
# ---------------------------------------------------------------------------

class TestTicketRequestModelDump:
    def test_basic_model_dump_contains_text(self):
        req = TicketRequest(text="My VPN is broken")
        d = req.model_dump()
        assert d["text"] == "My VPN is broken"

    def test_model_dump_contains_all_keys(self):
        req = TicketRequest(text="test")
        d = req.model_dump()
        required = {"text", "image_base64", "image_text", "user_id", "company",
                    "company_id", "image_url", "confidence_threshold", "duplicate_sensitivity"}
        assert required.issubset(d.keys())

    def test_default_image_base64_is_empty_string(self):
        req = TicketRequest(text="test")
        assert req.model_dump()["image_base64"] == ""

    def test_default_confidence_threshold(self):
        req = TicketRequest(text="test")
        assert req.model_dump()["confidence_threshold"] == 0.20

    def test_default_duplicate_sensitivity(self):
        req = TicketRequest(text="test")
        assert req.model_dump()["duplicate_sensitivity"] == 0.85

    def test_default_user_id_is_none(self):
        req = TicketRequest(text="test")
        assert req.model_dump()["user_id"] is None

    def test_default_company_is_none(self):
        req = TicketRequest(text="test")
        assert req.model_dump()["company"] is None

    def test_custom_values_in_dump(self):
        req = TicketRequest(
            text="issue", user_id="u1", company="ACME",
            confidence_threshold=0.75, duplicate_sensitivity=0.60
        )
        d = req.model_dump()
        assert d["user_id"] == "u1"
        assert d["company"] == "ACME"
        assert d["confidence_threshold"] == 0.75
        assert d["duplicate_sensitivity"] == 0.60


class TestTicketRequestFieldTypes:
    def test_text_is_string(self):
        req = TicketRequest(text="hello")
        assert isinstance(req.text, str)

    def test_confidence_threshold_is_float(self):
        req = TicketRequest(text="hello", confidence_threshold=0.5)
        assert isinstance(req.confidence_threshold, float)

    def test_duplicate_sensitivity_is_float(self):
        req = TicketRequest(text="hello")
        assert isinstance(req.duplicate_sensitivity, float)

    def test_image_base64_is_string(self):
        req = TicketRequest(text="hello")
        assert isinstance(req.image_base64, str)

    def test_user_id_is_none_by_default(self):
        req = TicketRequest(text="hello")
        assert req.user_id is None

    def test_user_id_accepts_string(self):
        req = TicketRequest(text="hello", user_id="u42")
        assert isinstance(req.user_id, str)

    def test_image_url_is_none_by_default(self):
        req = TicketRequest(text="hello")
        assert req.image_url is None


class TestTicketRequestValidation:
    def test_missing_text_raises_validation_error(self):
        with pytest.raises(ValidationError) as exc_info:
            TicketRequest()
        assert "text" in str(exc_info.value).lower()

    def test_confidence_threshold_above_1_raises_error(self):
        with pytest.raises(ValidationError) as exc_info:
            TicketRequest(text="test", confidence_threshold=1.5)
        assert "1.0" in str(exc_info.value) or "confidence_threshold" in str(exc_info.value)

    def test_confidence_threshold_below_0_raises_error(self):
        with pytest.raises(ValidationError):
            TicketRequest(text="test", confidence_threshold=-0.1)

    def test_duplicate_sensitivity_above_1_raises_error(self):
        with pytest.raises(ValidationError):
            TicketRequest(text="test", duplicate_sensitivity=2.0)

    def test_duplicate_sensitivity_at_0_is_valid(self):
        req = TicketRequest(text="test", duplicate_sensitivity=0.0)
        assert req.duplicate_sensitivity == 0.0

    def test_confidence_threshold_at_1_is_valid(self):
        req = TicketRequest(text="test", confidence_threshold=1.0)
        assert req.confidence_threshold == 1.0

    def test_duplicate_sensitivity_at_1_is_valid(self):
        req = TicketRequest(text="test", duplicate_sensitivity=1.0)
        assert req.duplicate_sensitivity == 1.0

    def test_empty_text_string_is_valid(self):
        req = TicketRequest(text="")
        assert req.text == ""

    def test_validation_error_message_mentions_value_must_be_between(self):
        with pytest.raises(ValidationError) as exc_info:
            TicketRequest(text="test", confidence_threshold=1.5)
        error_str = str(exc_info.value)
        assert "between" in error_str or "1.0" in error_str or "1.5" in error_str


# ---------------------------------------------------------------------------
# TicketSaveRequest tests
# ---------------------------------------------------------------------------

class TestTicketSaveRequestModelDump:
    def _make_valid(self, **overrides):
        defaults = {
            "user_id": "u1", "subject": "VPN down", "description": "Cannot connect",
            "category": "Network", "subcategory": "VPN Connection", "priority": "High",
            "assigned_team": "Network Support", "status": "open"
        }
        defaults.update(overrides)
        return TicketSaveRequest(**defaults)

    def test_model_dump_contains_all_fields(self):
        req = self._make_valid()
        d = req.model_dump()
        required = {"user_id", "subject", "description", "category", "subcategory",
                    "priority", "assigned_team", "status"}
        assert required == set(d.keys())

    def test_user_id_in_dump(self):
        req = self._make_valid(user_id="myuser")
        assert req.model_dump()["user_id"] == "myuser"

    def test_priority_in_dump(self):
        req = self._make_valid(priority="Critical")
        assert req.model_dump()["priority"] == "Critical"

    def test_status_in_dump(self):
        req = self._make_valid(status="resolved")
        assert req.model_dump()["status"] == "resolved"

    def test_missing_user_id_raises_validation_error(self):
        with pytest.raises(ValidationError) as exc_info:
            TicketSaveRequest(
                subject="test", description="test", category="test",
                subcategory="test", priority="Low", assigned_team="test", status="open"
            )
        assert "user_id" in str(exc_info.value).lower()

    def test_missing_subject_raises_validation_error(self):
        with pytest.raises(ValidationError) as exc_info:
            TicketSaveRequest(
                user_id="u1", description="test", category="test",
                subcategory="test", priority="Low", assigned_team="test", status="open"
            )
        assert "subject" in str(exc_info.value).lower()

    def test_all_fields_are_strings(self):
        req = self._make_valid()
        d = req.model_dump()
        for key, value in d.items():
            assert isinstance(value, str), f"Field {key} should be str, got {type(value)}"


# ---------------------------------------------------------------------------
# TicketResponse tests
# ---------------------------------------------------------------------------

class TestTicketResponseModelDump:
    def _make_valid(self, **overrides):
        defaults = {
            "summary": "VPN issue", "category": "Network", "subcategory": "VPN Connection",
            "priority": "High", "auto_resolve": False, "assigned_team": "Network Support",
            "entities": [], "duplicate_ticket": DuplicateInfo(is_duplicate=False),
            "confidence": 0.95
        }
        defaults.update(overrides)
        return TicketResponse(**defaults)

    def test_model_dump_contains_summary(self):
        resp = self._make_valid()
        assert resp.model_dump()["summary"] == "VPN issue"

    def test_model_dump_contains_category(self):
        resp = self._make_valid()
        assert resp.model_dump()["category"] == "Network"

    def test_default_version(self):
        resp = self._make_valid()
        assert "2.1.0" in resp.version

    def test_default_source_language(self):
        resp = self._make_valid()
        assert resp.source_language == "en"

    def test_default_was_translated(self):
        resp = self._make_valid()
        assert resp.was_translated is False

    def test_default_needs_review(self):
        resp = self._make_valid()
        assert resp.needs_review is False

    def test_entities_field_is_list(self):
        resp = self._make_valid()
        assert isinstance(resp.entities, list)

    def test_duplicate_ticket_is_duplicate_info(self):
        resp = self._make_valid()
        assert isinstance(resp.duplicate_ticket, DuplicateInfo)

    def test_incident_defaults_to_incident_info(self):
        resp = self._make_valid()
        assert isinstance(resp.incident, IncidentInfo)
        assert resp.incident.is_major_incident is False

    def test_spam_check_defaults_to_spam_check(self):
        resp = self._make_valid()
        assert isinstance(resp.spam_check, SpamCheck)
        assert resp.spam_check.is_spam is False

    def test_missing_summary_raises_validation_error(self):
        with pytest.raises(ValidationError) as exc_info:
            TicketResponse(
                category="Network", subcategory="VPN", priority="High",
                auto_resolve=False, assigned_team="Network Support",
                entities=[], duplicate_ticket=DuplicateInfo(is_duplicate=False),
                confidence=0.95
            )
        assert "summary" in str(exc_info.value).lower()

    def test_confidence_is_float(self):
        resp = self._make_valid(confidence=0.87)
        assert isinstance(resp.confidence, float)
        assert abs(resp.confidence - 0.87) < 1e-9

    def test_auto_resolve_is_bool(self):
        resp = self._make_valid(auto_resolve=True)
        assert isinstance(resp.auto_resolve, bool)
        assert resp.auto_resolve is True


# ---------------------------------------------------------------------------
# DuplicateInfo tests
# ---------------------------------------------------------------------------

class TestDuplicateInfo:
    def test_is_duplicate_true(self):
        d = DuplicateInfo(is_duplicate=True, duplicate_ticket_id="t42", similarity=0.91)
        assert d.is_duplicate is True
        assert d.duplicate_ticket_id == "t42"

    def test_default_similarity(self):
        d = DuplicateInfo(is_duplicate=False)
        assert d.similarity == 0.0

    def test_model_dump_keys(self):
        d = DuplicateInfo(is_duplicate=False)
        keys = set(d.model_dump().keys())
        assert {"is_duplicate", "duplicate_ticket_id", "similarity"}.issubset(keys)


# ---------------------------------------------------------------------------
# EntityInfo tests
# ---------------------------------------------------------------------------

class TestEntityInfo:
    def test_valid_entity(self):
        e = EntityInfo(text="VPN", label="PRODUCT", confidence=0.99)
        assert e.text == "VPN"
        assert e.label == "PRODUCT"
        assert abs(e.confidence - 0.99) < 1e-9

    def test_model_dump_has_three_keys(self):
        e = EntityInfo(text="IP", label="IP_ADDRESS", confidence=0.88)
        d = e.model_dump()
        assert {"text", "label", "confidence"} == set(d.keys())

    def test_missing_confidence_raises(self):
        with pytest.raises(ValidationError):
            EntityInfo(text="x", label="y")
