import pytest
from pydantic import ValidationError
from backend.main import TicketRequest, TicketSaveRequest, TicketResponse, DuplicateInfo
from fastapi import HTTPException

def test_ticket_request_valid():
    req = TicketRequest(text="I need help with my laptop", confidence_threshold=0.5)
    assert req.text == "I need help with my laptop"
    assert req.confidence_threshold == 0.5

def test_ticket_request_invalid_threshold():
    with pytest.raises(ValidationError):
        TicketRequest(text="test", confidence_threshold=1.5)
    
    with pytest.raises(ValidationError):
        TicketRequest(text="test", confidence_threshold=-0.1)

def test_ticket_request_large_image():
    # 15MB string
    large_image = "a" * 15_000_000
    with pytest.raises(HTTPException) as exc:
        TicketRequest(text="test", image_base64=large_image)
    assert exc.value.status_code == 413

def test_ticket_save_request_defaults():
    # TicketSaveRequest has many required fields
    data = {
        "user_id": "user123",
        "subject": "broken screen",
        "description": "it is cracked",
        "category": "Hardware",
        "subcategory": "Monitor",
        "priority": "high",
        "assigned_team": "Hardware Support",
        "status": "open",
        "auto_resolve": False,
        "is_duplicate": False,
        "confidence": 0.95,
        "sla_breach_at": "2026-06-01T12:00:00Z"
    }
    req = TicketSaveRequest(**data)
    assert req.user_id == "user123"
    assert req.source == "text" # default value
    assert req.escalation_level == 0 # default value

def test_duplicate_info():
    dup = DuplicateInfo(is_duplicate=True, duplicate_ticket_id="T99", similarity=0.98)
    assert dup.is_duplicate is True
    assert dup.duplicate_ticket_id == "T99"
    assert dup.similarity == 0.98

def test_ticket_response_serialization():
    # Minimal data for TicketResponse
    data = {
        "summary": "Fix needed",
        "category": "Software",
        "subcategory": "OS",
        "priority": "low",
        "auto_resolve": False,
        "assigned_team": "IT",
        "entities": [],
        "duplicate_ticket": {"is_duplicate": False},
        "confidence": 0.8
    }
    res = TicketResponse(**data)
    assert res.summary == "Fix needed"
    assert res.version == "2.1.0-Neural-Diagnostic"
