import os
import pytest
from unittest.mock import MagicMock, patch
from backend.services.duplicate_service import DuplicateService, SIMILARITY_THRESHOLD

@pytest.fixture
def duplicate_service():
    service = DuplicateService()
    # Prevent creating data files during tests
    service.storage_file = "dummy_storage.json"
    
    # Mock the save to disk to avoid actual file operations
    service.save_to_disk = MagicMock()
    return service

def test_check_duplicate_returns_no_match_when_store_empty(duplicate_service):
    # Setup mock to simulate model loaded successfully
    duplicate_service.is_available = MagicMock(return_value=True)
    duplicate_service.load = MagicMock()
    duplicate_service.model = MagicMock()
    duplicate_service._tickets = []

    result = duplicate_service.check_duplicate("Some new ticket text")

    assert result["is_duplicate"] is False
    assert result["duplicate_ticket_id"] is None
    assert result["similarity"] == 0.0

@patch("backend.services.duplicate_service.util.cos_sim")
def test_check_duplicate_uses_custom_threshold(mock_cos_sim, duplicate_service):
    # Setup mock to simulate model loaded successfully
    duplicate_service.is_available = MagicMock(return_value=True)
    duplicate_service.load = MagicMock()
    
    mock_model = MagicMock()
    mock_model.encode.return_value = "mock_embedding"
    duplicate_service.model = mock_model
    
    # Add a mock ticket
    duplicate_service._tickets = [("ticket_1", "stored_emb", "Stored text")]
    
    # Mock cos_sim to return a score that is below default but above custom threshold
    mock_tensor = MagicMock()
    mock_tensor.item.return_value = 0.65
    mock_cos_sim.return_value = mock_tensor
    
    # Default SIMILARITY_THRESHOLD is 0.70. With default, it shouldn't be a duplicate
    result_default = duplicate_service.check_duplicate("Test text")
    assert result_default["is_duplicate"] is False
    
    # With a custom threshold of 0.60, it should be a duplicate
    result_custom = duplicate_service.check_duplicate("Test text", threshold=0.60)
    assert result_custom["is_duplicate"] is True
    assert result_custom["duplicate_ticket_id"] == "ticket_1"
    assert result_custom["similarity"] == 0.65

def test_check_duplicate_handles_degraded_mode(duplicate_service):
    # Setup mock to simulate model failed to load or degraded mode
    duplicate_service.is_available = MagicMock(return_value=False)
    duplicate_service.load = MagicMock()
    
    # Even if there are tickets, it shouldn't try to use the model
    duplicate_service._tickets = [("ticket_1", "emb", "text")]
    
    result = duplicate_service.check_duplicate("Some new ticket text")
    
    assert result["is_duplicate"] is False
    assert result["duplicate_ticket_id"] is None
    assert result["similarity"] == 0.0
