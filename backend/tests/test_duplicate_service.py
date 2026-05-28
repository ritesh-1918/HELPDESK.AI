import pytest
from unittest.mock import MagicMock, patch

from backend.services.duplicate_service import DuplicateService

@pytest.fixture
def mock_duplicate_service():
    """Returns a DuplicateService instance with loaded=True and an empty ticket store."""
    service = DuplicateService()
    # Prevent actual loading of models or hitting the disk during unit tests
    service._loaded = True
    service._load_failed = False
    service.model = MagicMock()
    # Mock encode to return a dummy tensor
    service.model.encode.return_value = MagicMock()
    service._tickets = []
    return service

def test_check_duplicate_degraded_mode(mock_duplicate_service):
    """Test that check_duplicate handles degraded mode (model not available) correctly."""
    mock_duplicate_service._loaded = False
    mock_duplicate_service._load_failed = True
    # is_available() should return False
    
    # Try to check duplicate
    result = mock_duplicate_service.check_duplicate("Some ticket text")
    
    assert result["is_duplicate"] is False
    assert result["duplicate_ticket_id"] is None
    assert result["similarity"] == 0.0
    mock_duplicate_service.model.encode.assert_not_called()

def test_check_duplicate_empty_store(mock_duplicate_service):
    """Test behavior when the ticket store is empty."""
    # is_available() returns True, but _tickets is empty
    assert mock_duplicate_service.is_available() is True
    assert len(mock_duplicate_service._tickets) == 0
    
    result = mock_duplicate_service.check_duplicate("New ticket")
    
    assert result["is_duplicate"] is False
    assert result["duplicate_ticket_id"] is None
    assert result["similarity"] == 0.0

@patch("backend.services.duplicate_service.util")
def test_check_duplicate_with_matches(mock_util, mock_duplicate_service):
    """Test check_duplicate when store has tickets."""
    # Setup the ticket store
    mock_duplicate_service._tickets = [
        ("t1", MagicMock(), "Existing ticket 1"),
        ("t2", MagicMock(), "Existing ticket 2")
    ]
    
    # Mock cosine similarity to return 0.85 for the first, 0.95 for the second
    # util.cos_sim returns a tensor with .item()
    mock_tensor_1 = MagicMock()
    mock_tensor_1.item.return_value = 0.85
    mock_tensor_2 = MagicMock()
    mock_tensor_2.item.return_value = 0.95
    
    mock_util.cos_sim.side_effect = [mock_tensor_1, mock_tensor_2]
    
    # Run the check with default threshold (0.70)
    result = mock_duplicate_service.check_duplicate("Query text")
    
    assert result["similarity"] == 0.95
    assert result["is_duplicate"] is True
    assert result["duplicate_ticket_id"] == "t2"

@patch("backend.services.duplicate_service.util")
def test_check_duplicate_threshold_override(mock_util, mock_duplicate_service):
    """Test that check_duplicate respects the threshold override parameter."""
    # Setup the ticket store
    mock_duplicate_service._tickets = [
        ("t1", MagicMock(), "Existing ticket")
    ]
    
    # Similarity is 0.80
    mock_tensor = MagicMock()
    mock_tensor.item.return_value = 0.80
    mock_util.cos_sim.return_value = mock_tensor
    
    # Should be duplicate under default (0.70) or override (0.75)
    result1 = mock_duplicate_service.check_duplicate("Query text", threshold=0.75)
    assert result1["is_duplicate"] is True
    assert result1["duplicate_ticket_id"] == "t1"
    
    # Should NOT be duplicate under strict override (0.90)
    # Reset mock since it was consumed
    mock_util.cos_sim.side_effect = [mock_tensor]
    result2 = mock_duplicate_service.check_duplicate("Query text", threshold=0.90)
    assert result2["is_duplicate"] is False
    assert result2["duplicate_ticket_id"] is None
