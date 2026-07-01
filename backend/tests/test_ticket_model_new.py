"""
Unit tests for Ticket Pydantic models in backend/main.py
Issue: #1099 - test : add unit tests for ticket model serialization
"""

import sys
import os
import pytest
from pydantic import ValidationError

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from main import (
    TicketRequest,
    TicketSaveRequest,
    TicketResponse,
    EntityInfo,
    DuplicateInfo,
    IncidentInfo,
    RatingRequest,
    AgentCSATResponse,
)


# ---------------------------------------------------------------------------
# TicketRequest
# ---------------------------------------------------------------------------

class TestTicketRequest:
    def test_valid_minimal(self):
        t = TicketRequest(text="My printer is broken")
        assert t.text == "My printer is broken"
        assert t.image_base64 == ""
        assert t.confidence_threshold == 0.20
        assert t.duplicate_sensitivity == 0.85

    def test_valid_full(self):
        t = TicketRequest(
            text="Network down",
            image_base64="base64encodedstring",
            user_id="user123",
            company="Acme Corp",
            company_id="comp-001",
            confidence_threshold=0.50,
            duplicate_sensitivity=0.90,
        )
        assert t.user_id == "user123"
        assert t.company == "Acme Corp"
        assert t.company_id == "comp-001"
        assert t.confidence_threshold == 0.50

    def test_default_confidence_threshold(self):
        t = TicketRequest(text="Test")
        assert t.confidence_threshold == 0.20

    def test_confidence_threshold_zero(self):
        t = TicketRequest(text="Test", confidence_threshold=0.0)
        assert t.confidence_threshold == 0.0

    def test_confidence_threshold_one(self):
        t = TicketRequest(text="Test", confidence_threshold=1.0)
        assert t.confidence_threshold == 1.0

    def test_confidence_threshold_below_zero(self):
        with pytest.raises(ValidationError):
            TicketRequest(text="Test", confidence_threshold=-0.1)

    def test_confidence_threshold_above_one(self):
        with pytest.raises(ValidationError):
            TicketRequest(text="Test", confidence_threshold=1.1)

    def test_duplicate_sensitivity_below_zero(self):
        with pytest.raises(ValidationError):
            TicketRequest(text="Test", duplicate_sensitivity=-0.5)

    def test_duplicate_sensitivity_above_one(self):
        with pytest.raises(ValidationError):
            TicketRequest(text="Test", duplicate_sensitivity=2.0)

    def test_duplicate_sensitivity_zero(self):
        t = TicketRequest(text="Test", duplicate_sensitivity=0.0)
        assert t.duplicate_sensitivity == 0.0

    def test_duplicate_sensitivity_one(self):
        t = TicketRequest(text="Test", duplicate_sensitivity=1.0)
        assert t.duplicate_sensitivity == 1.0

    def test_text_required(self):
        with pytest.raises(ValidationError):
            TicketRequest()

    def test_image_base64_default(self):
        t = TicketRequest(text="Test")
        assert t.image_base64 == ""

    def test_user_id_optional(self):
        t = TicketRequest(text="Test")
        assert t.user_id is None

    def test_company_optional(self):
        t = TicketRequest(text="Test")
        assert t.company is None

    def test_unicode_text(self):
        t = TicketRequest(text="打印机坏了 プリンターが壊れた")
        assert "打印机" in t.text

    def test_long_text(self):
        long_text = "A" * 10000
        t = TicketRequest(text=long_text)
        assert len(t.text) == 10000

    def test_model_dump(self):
        t = TicketRequest(text="Test issue", user_id="u1")
        d = t.model_dump()
        assert d["text"] == "Test issue"
        assert d["user_id"] == "u1"


# ---------------------------------------------------------------------------
# TicketSaveRequest
# ---------------------------------------------------------------------------

class TestTicketSaveRequest:
    def test_valid_ticket(self):
        t = TicketSaveRequest(
            user_id="user1",
            subject="Login issue",
            description="Cannot login to dashboard",
            category="access",
            subcategory="login",
            priority="high",
            assigned_team="platform",
            status="open",
        )
        assert t.user_id == "user1"
        assert t.subject == "Login issue"
        assert t.priority == "high"
        assert t.status == "open"

    def test_missing_required_fields(self):
        with pytest.raises(ValidationError):
            TicketSaveRequest(user_id="u1")

    def test_empty_string_fields(self):
        t = TicketSaveRequest(
            user_id="u1",
            subject="",
            description="",
            category="",
            subcategory="",
            priority="medium",
            assigned_team="",
            status="open",
        )
        assert t.subject == ""

    def test_all_statuses(self):
        for status in ["open", "in_progress", "pending", "resolved", "closed"]:
            t = TicketSaveRequest(
                user_id="u1", subject="S", description="D",
                category="C", subcategory="SC", priority="medium",
                assigned_team="T", status=status,
            )
            assert t.status == status

    def test_all_priorities(self):
        for priority in ["critical", "high", "medium", "low"]:
            t = TicketSaveRequest(
                user_id="u1", subject="S", description="D",
                category="C", subcategory="SC", priority=priority,
                assigned_team="T", status="open",
            )
            assert t.priority == priority

    def test_model_dump_roundtrip(self):
        data = {
            "user_id": "u1", "subject": "Bug", "description": "Details",
            "category": "bug", "subcategory": "ui", "priority": "high",
            "assigned_team": "dev", "status": "open",
        }
        t = TicketSaveRequest(**data)
        dumped = t.model_dump()
        assert dumped["subject"] == "Bug"
        assert dumped["priority"] == "high"


# ---------------------------------------------------------------------------
# EntityInfo
# ---------------------------------------------------------------------------

class TestEntityInfo:
    def test_valid_entity(self):
        e = EntityInfo(text="192.168.1.1", label="IP_ADDRESS", confidence=0.99)
        assert e.text == "192.168.1.1"
        assert e.label == "IP_ADDRESS"
        assert e.confidence == 0.99

    def test_missing_fields(self):
        with pytest.raises(ValidationError):
            EntityInfo(text="test")


# ---------------------------------------------------------------------------
# DuplicateInfo
# ---------------------------------------------------------------------------

class TestDuplicateInfo:
    def test_not_duplicate(self):
        d = DuplicateInfo(is_duplicate=False)
        assert d.is_duplicate is False
        assert d.duplicate_ticket_id is None
        assert d.similarity == 0.0

    def test_is_duplicate(self):
        d = DuplicateInfo(is_duplicate=True, duplicate_ticket_id="T-123", similarity=0.95)
        assert d.is_duplicate is True
        assert d.duplicate_ticket_id == "T-123"
        assert d.similarity == 0.95


# ---------------------------------------------------------------------------
# IncidentInfo
# ---------------------------------------------------------------------------

class TestIncidentInfo:
    def test_default_no_incident(self):
        i = IncidentInfo()
        assert i.is_major_incident is False
        assert i.ticket_count == 0
        assert i.affected_users == 0

    def test_major_incident(self):
        i = IncidentInfo(
            incident_id="INC-001",
            is_major_incident=True,
            ticket_count=15,
            affected_users=50,
            similarity=0.88,
        )
        assert i.incident_id == "INC-001"
        assert i.is_major_incident is True
        assert i.ticket_count == 15


# ---------------------------------------------------------------------------
# RatingRequest
# ---------------------------------------------------------------------------

class TestRatingRequest:
    def test_valid_rating(self):
        r = RatingRequest(ticket_id="T-1", rating=5)
        assert r.ticket_id == "T-1"
        assert r.rating == 5

    def test_with_feedback(self):
        r = RatingRequest(ticket_id="T-2", rating=3, feedback="Ok service")
        assert r.feedback == "Ok service"

    def test_rating_without_feedback(self):
        r = RatingRequest(ticket_id="T-3", rating=4)
        assert r.feedback is None


# ---------------------------------------------------------------------------
# AgentCSATResponse
# ---------------------------------------------------------------------------

class TestAgentCSATResponse:
    def test_valid_response(self):
        a = AgentCSATResponse(
            agent_id="agent-1",
            avg_rating=4.5,
            total_ratings=100,
            ratings_distribution={"1": 5, "2": 10, "3": 15, "4": 30, "5": 40},
        )
        assert a.agent_id == "agent-1"
        assert a.avg_rating == 4.5
        assert a.total_ratings == 100
