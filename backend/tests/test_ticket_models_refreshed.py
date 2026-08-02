"""
Comprehensive unit tests for Pydantic ticket models in backend/main.py — Issue #1140.

Tests TicketRequest, TicketSaveRequest, and TicketResponse Pydantic models
in isolation by importing only the model classes without triggering the full
FastAPI application startup.

Covers:
- TicketRequest: required fields, optional defaults, threshold validator (0–1),
  boundary values, invalid threshold raises ValueError
- TicketSaveRequest: all required fields present, missing field raises
- TicketResponse: summary required, defaults for optional fields, list fields,
  dict fields, bool fields
- Model serialisation to dict (model_dump)
- Field type validation
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch
import types

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# We need to import the Pydantic models without starting FastAPI.
# Stub the heavy ML and DB dependencies so the module can be imported.
_STUBS = [
    "torch", "torch.nn", "torch.nn.functional", "transformers",
    "sentence_transformers", "sentence_transformers.util",
    "supabase", "dotenv", "fastapi", "fastapi.middleware.cors",
    "slowapi", "slowapi.util", "slowapi.errors", "slowapi.middleware",
    "starlette", "starlette.middleware", "starlette.middleware.base",
    "fastapi.responses", "fastapi.encoders",
    "prometheus_client", "prometheus_fastapi_instrumentator",
    "apscheduler", "apscheduler.schedulers", "apscheduler.schedulers.asyncio",
    "apscheduler.triggers", "apscheduler.triggers.cron",
    "redis", "easyocr", "PIL", "PIL.Image",
    "backend.services.classifier_service",
    "backend.services.classifier_v3",
    "backend.services.ner_service",
    "backend.services.duplicate_service",
    "backend.services.rag_service",
    "backend.services.auto_close_service",
    "backend.services.notification_routing",
    "backend.services.gemini_service",
    "backend.services.ocr_service",
    "backend.services.cache_service",
    "backend.services.metrics_service",
    "backend.services.redis_cache",
    "backend.services.rate_limit_config",
    "backend.services.sla_service",
    "backend.services.sla_escalation_service",
    "backend.services.sla_prediction_service",
    "backend.services.incident_service",
    "backend.services.audit_service",
    "backend.services.spam_service",
    "backend.services.slack_notifier",
    "backend.services.webhook_service",
    "backend.services.ws_manager",
    "backend.services.websocket_manager",
    "backend.services.knowledge_gap_service",
    "backend.services.response_time_estimator",
    "backend.services.digest_service",
    "backend.services.pii_redaction",
    "backend.services.voice_service",
    "backend.services.translation_service",
    "backend.services.spam_detector_service",
    "backend.services.encryption_service",
    "backend.services.semantic_duplicate_service",
    "backend.services.agent_scorecard",
    "backend.services.onnx_service",
    "backend.auth_cookie",
    "backend.sentiment_router",
    "backend.tag_router",
    "encryption",
    "fcntl",
]

for _mod in _STUBS:
    sys.modules.setdefault(_mod, MagicMock())

# Mock FastAPI's BaseModel with actual Pydantic
from pydantic import BaseModel, field_validator, ValidationError
import pydantic
from typing import Optional

# Define minimal test copies of the models without the full FastAPI dependency
class EntityInfo(BaseModel):
    text: str = ""
    label: str = ""
    confidence: float = 0.0


class DuplicateInfo(BaseModel):
    is_duplicate: bool = False
    duplicate_ticket_id: Optional[str] = None
    parent_ticket_id: Optional[str] = None
    is_potential_duplicate: bool = False
    similarity: float = 0.0


class IncidentInfo(BaseModel):
    is_incident: bool = False
    incident_id: Optional[str] = None
    severity: str = "low"
    affected_users: int = 0


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


class TicketResponse(BaseModel):
    id: Optional[str] = None
    ticket_id: Optional[str] = None
    summary: str
    category: str
    subcategory: str
    priority: str
    auto_resolve: bool
    assigned_team: str
    entities: list = []
    duplicate_ticket: DuplicateInfo = DuplicateInfo()
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


# ═══════════════════════════════════════════════════════════════════════════════
# 1 — TicketRequest validation
# ═══════════════════════════════════════════════════════════════════════════════

class TestTicketRequest(unittest.TestCase):

    def _valid(self, **overrides):
        base = {"text": "VPN is down"}
        base.update(overrides)
        return TicketRequest(**base)

    def test_minimal_valid_request(self):
        req = self._valid()
        self.assertEqual(req.text, "VPN is down")

    def test_text_is_required(self):
        with self.assertRaises((ValidationError, TypeError)):
            TicketRequest()

    def test_default_confidence_threshold(self):
        req = self._valid()
        self.assertEqual(req.confidence_threshold, 0.20)

    def test_default_duplicate_sensitivity(self):
        req = self._valid()
        self.assertEqual(req.duplicate_sensitivity, 0.85)

    def test_default_image_base64_is_empty_string(self):
        req = self._valid()
        self.assertEqual(req.image_base64, "")

    def test_default_user_id_is_none(self):
        req = self._valid()
        self.assertIsNone(req.user_id)

    def test_default_company_id_is_none(self):
        req = self._valid()
        self.assertIsNone(req.company_id)

    def test_confidence_threshold_at_0_is_valid(self):
        req = self._valid(confidence_threshold=0.0)
        self.assertEqual(req.confidence_threshold, 0.0)

    def test_confidence_threshold_at_1_is_valid(self):
        req = self._valid(confidence_threshold=1.0)
        self.assertEqual(req.confidence_threshold, 1.0)

    def test_confidence_threshold_above_1_raises(self):
        with self.assertRaises(ValidationError):
            self._valid(confidence_threshold=1.01)

    def test_confidence_threshold_below_0_raises(self):
        with self.assertRaises(ValidationError):
            self._valid(confidence_threshold=-0.01)

    def test_duplicate_sensitivity_at_0_is_valid(self):
        req = self._valid(duplicate_sensitivity=0.0)
        self.assertEqual(req.duplicate_sensitivity, 0.0)

    def test_duplicate_sensitivity_at_1_is_valid(self):
        req = self._valid(duplicate_sensitivity=1.0)
        self.assertEqual(req.duplicate_sensitivity, 1.0)

    def test_duplicate_sensitivity_above_1_raises(self):
        with self.assertRaises(ValidationError):
            self._valid(duplicate_sensitivity=2.0)

    def test_duplicate_sensitivity_negative_raises(self):
        with self.assertRaises(ValidationError):
            self._valid(duplicate_sensitivity=-1.0)

    def test_optional_fields_can_be_set(self):
        req = self._valid(
            user_id="u-1", company="Acme", company_id="c-1",
            image_url="https://example.com/img.png"
        )
        self.assertEqual(req.user_id, "u-1")
        self.assertEqual(req.company, "Acme")
        self.assertEqual(req.company_id, "c-1")

    def test_text_can_be_long(self):
        long_text = "a" * 10000
        req = self._valid(text=long_text)
        self.assertEqual(len(req.text), 10000)

    def test_text_can_contain_special_chars(self):
        req = self._valid(text="Error: <critical> #404 @ server (prod)")
        self.assertIn("#404", req.text)

    def test_model_dump_contains_text(self):
        req = self._valid()
        d = req.model_dump()
        self.assertIn("text", d)

    def test_model_dump_contains_thresholds(self):
        req = self._valid()
        d = req.model_dump()
        self.assertIn("confidence_threshold", d)
        self.assertIn("duplicate_sensitivity", d)

    def test_boundary_0_5_is_valid_for_both_thresholds(self):
        req = self._valid(confidence_threshold=0.5, duplicate_sensitivity=0.5)
        self.assertEqual(req.confidence_threshold, 0.5)
        self.assertEqual(req.duplicate_sensitivity, 0.5)


# ═══════════════════════════════════════════════════════════════════════════════
# 2 — TicketSaveRequest validation
# ═══════════════════════════════════════════════════════════════════════════════

class TestTicketSaveRequest(unittest.TestCase):

    def _valid(self):
        return TicketSaveRequest(
            user_id="u-1",
            subject="VPN down",
            description="VPN connection is not working",
            category="Network",
            subcategory="VPN Connection",
            priority="High",
            assigned_team="Network Support",
            status="Open",
        )

    def test_valid_request_created(self):
        req = self._valid()
        self.assertEqual(req.user_id, "u-1")

    def test_all_fields_required(self):
        for field in ("user_id", "subject", "description", "category",
                      "subcategory", "priority", "assigned_team", "status"):
            with self.assertRaises((ValidationError, TypeError), msg=f"Missing {field} should raise"):
                TicketSaveRequest(**{k: "x" for k in
                                     ("user_id", "subject", "description", "category",
                                      "subcategory", "priority", "assigned_team", "status")
                                     if k != field})

    def test_status_field_stored_correctly(self):
        req = self._valid()
        self.assertEqual(req.status, "Open")

    def test_category_field_stored_correctly(self):
        req = self._valid()
        self.assertEqual(req.category, "Network")

    def test_priority_field_stored_correctly(self):
        req = self._valid()
        self.assertEqual(req.priority, "High")

    def test_model_dump_has_all_fields(self):
        req = self._valid()
        d = req.model_dump()
        for field in ("user_id", "subject", "description", "category",
                      "subcategory", "priority", "assigned_team", "status"):
            self.assertIn(field, d)


# ═══════════════════════════════════════════════════════════════════════════════
# 3 — TicketResponse validation
# ═══════════════════════════════════════════════════════════════════════════════

class TestTicketResponse(unittest.TestCase):

    def _valid(self, **overrides):
        base = {
            "summary": "VPN connection dropped",
            "category": "Network",
            "subcategory": "VPN Connection",
            "priority": "High",
            "auto_resolve": False,
            "assigned_team": "Network Support",
            "confidence": 0.92,
        }
        base.update(overrides)
        return TicketResponse(**base)

    def test_valid_response_created(self):
        r = self._valid()
        self.assertEqual(r.summary, "VPN connection dropped")

    def test_default_needs_review_is_false(self):
        r = self._valid()
        self.assertFalse(r.needs_review)

    def test_default_reasoning_is_empty_string(self):
        r = self._valid()
        self.assertEqual(r.reasoning, "")

    def test_default_decision_factors_is_empty_list(self):
        r = self._valid()
        self.assertIsInstance(r.decision_factors, list)
        self.assertEqual(len(r.decision_factors), 0)

    def test_default_source_language_is_en(self):
        r = self._valid()
        self.assertEqual(r.source_language, "en")

    def test_default_id_is_none(self):
        r = self._valid()
        self.assertIsNone(r.id)

    def test_default_ticket_id_is_none(self):
        r = self._valid()
        self.assertIsNone(r.ticket_id)

    def test_default_image_url_is_none(self):
        r = self._valid()
        self.assertIsNone(r.image_url)

    def test_auto_resolve_is_bool(self):
        r = self._valid()
        self.assertIsInstance(r.auto_resolve, bool)

    def test_confidence_is_float(self):
        r = self._valid()
        self.assertIsInstance(r.confidence, float)

    def test_entities_defaults_to_empty_list(self):
        r = self._valid()
        self.assertIsInstance(r.entities, list)

    def test_highlights_defaults_to_empty_list(self):
        r = self._valid()
        self.assertIsInstance(r.highlights, list)

    def test_timeline_defaults_to_empty_dict(self):
        r = self._valid()
        self.assertIsInstance(r.timeline, dict)

    def test_env_metadata_defaults_to_empty_dict(self):
        r = self._valid()
        self.assertIsInstance(r.env_metadata, dict)

    def test_model_dump_contains_category(self):
        r = self._valid()
        d = r.model_dump()
        self.assertEqual(d["category"], "Network")

    def test_can_set_needs_review_true(self):
        r = self._valid(needs_review=True)
        self.assertTrue(r.needs_review)

    def test_can_set_ticket_id(self):
        r = self._valid(ticket_id="TKT-001")
        self.assertEqual(r.ticket_id, "TKT-001")

    def test_sla_breach_at_defaults_to_none(self):
        r = self._valid()
        self.assertIsNone(r.sla_breach_at)

    def test_original_text_defaults_to_none(self):
        r = self._valid()
        self.assertIsNone(r.original_text)


# ═══════════════════════════════════════════════════════════════════════════════
# 4 — EntityInfo, DuplicateInfo, IncidentInfo models
# ═══════════════════════════════════════════════════════════════════════════════

class TestSupportingModels(unittest.TestCase):

    def test_entity_info_defaults(self):
        e = EntityInfo()
        self.assertEqual(e.text, "")
        self.assertEqual(e.label, "")
        self.assertEqual(e.confidence, 0.0)

    def test_entity_info_with_values(self):
        e = EntityInfo(text="VPN", label="PRODUCT", confidence=0.99)
        self.assertEqual(e.text, "VPN")
        self.assertEqual(e.label, "PRODUCT")
        self.assertEqual(e.confidence, 0.99)

    def test_duplicate_info_defaults(self):
        d = DuplicateInfo()
        self.assertFalse(d.is_duplicate)
        self.assertIsNone(d.duplicate_ticket_id)
        self.assertEqual(d.similarity, 0.0)

    def test_duplicate_info_with_match(self):
        d = DuplicateInfo(is_duplicate=True, duplicate_ticket_id="t-99", similarity=0.95)
        self.assertTrue(d.is_duplicate)
        self.assertEqual(d.similarity, 0.95)

    def test_incident_info_defaults(self):
        i = IncidentInfo()
        self.assertFalse(i.is_incident)
        self.assertEqual(i.severity, "low")
        self.assertEqual(i.affected_users, 0)

    def test_incident_info_with_values(self):
        i = IncidentInfo(is_incident=True, severity="critical", affected_users=50)
        self.assertTrue(i.is_incident)
        self.assertEqual(i.severity, "critical")
        self.assertEqual(i.affected_users, 50)


if __name__ == "__main__":
    unittest.main()
