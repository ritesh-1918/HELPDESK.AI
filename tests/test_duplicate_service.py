import pytest
from unittest.mock import MagicMock, patch
import os
import json
import torch
import numpy as np
from backend.services.duplicate_service import DuplicateService

@pytest.fixture
def mock_model():
    with patch("backend.services.duplicate_service.SentenceTransformer") as mock:
        model = MagicMock()
        mock.return_value = model
        # Mock encode to return a dummy tensor
        model.encode.side_effect = lambda text, **kwargs: torch.ones(384) if kwargs.get("convert_to_tensor") else torch.ones(384).numpy()
        yield model

@pytest.fixture
def duplicate_service(mock_model):
    with patch("backend.services.duplicate_service._HAS_SENTENCE", True):
        service = DuplicateService()
        service.storage_file = "test_case_history.json"
        yield service
        if os.path.exists("test_case_history.json"):
            os.remove("test_case_history.json")

def test_is_available(duplicate_service):
    assert not duplicate_service.is_available()
    duplicate_service.load()
    assert duplicate_service.is_available()

def test_add_and_check_duplicate(duplicate_service, mock_model):
    duplicate_service.load()
    
    # Mock model.encode to return different embeddings for different texts
    def side_effect(text, **kwargs):
        if text == "ticket 1":
            val = torch.zeros(384)
            val[0] = 1.0
        elif text == "ticket 2":
            val = torch.zeros(384)
            val[0] = 0.9 # High similarity
        else:
            val = torch.zeros(384)
            val[1] = 1.0 # Low similarity
        
        if kwargs.get("convert_to_tensor"):
            return val
        return val.numpy()

    mock_model.encode.side_effect = side_effect

    duplicate_service.add_ticket("T1", "ticket 1")
    
    # Check exact duplicate
    result = duplicate_service.check_duplicate("ticket 1")
    assert result["is_duplicate"] is True
    assert result["duplicate_ticket_id"] == "T1"
    assert result["similarity"] > 0.9

    # Check high similarity
    result = duplicate_service.check_duplicate("ticket 2")
    assert result["is_duplicate"] is True
    assert result["duplicate_ticket_id"] == "T1"

    # Check low similarity
    result = duplicate_service.check_duplicate("completely different")
    assert result["is_duplicate"] is False
    assert result["duplicate_ticket_id"] is None

def test_save_and_load_from_disk(duplicate_service, mock_model):
    duplicate_service.load()
    duplicate_service.add_ticket("T1", "some text")
    
    # Create a new service instance to test loading from disk
    with patch("backend.services.duplicate_service._HAS_SENTENCE", True):
        new_service = DuplicateService()
        new_service.storage_file = duplicate_service.storage_file
        new_service.load()
        
        assert len(new_service._tickets) == 1
        assert new_service._tickets[0][0] == "T1"
        assert new_service._tickets[0][2] == "some text"

def test_empty_tickets(duplicate_service):
    duplicate_service.load()
    result = duplicate_service.check_duplicate("any text")
    assert result["is_duplicate"] is False
    assert result["duplicate_ticket_id"] is None
    assert result["similarity"] == 0.0

def test_load_failure(mock_model):
    with patch("backend.services.duplicate_service._HAS_SENTENCE", False):
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "0"}):
            service = DuplicateService()
            with pytest.raises(ImportError):
                service.load()

def test_degraded_load(mock_model):
    with patch("backend.services.duplicate_service._HAS_SENTENCE", False):
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            service = DuplicateService()
            service.load()
            assert not service.is_available()
            result = service.check_duplicate("text")
            assert result["is_duplicate"] is False
