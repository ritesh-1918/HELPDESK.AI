import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.modules['sentence_transformers'] = MagicMock()

from backend.services.duplicate_service import DuplicateService


class TestDuplicateServiceAddTicket:
    """Tests for DuplicateService.add_ticket method"""

    def test_add_ticket_creates_embedding_and_persists(self):
        """Test that add_ticket stores ticket in memory and saves to disk"""
        svc = DuplicateService()
        mock_model = MagicMock()
        mock_embedding = MagicMock()
        mock_model.encode.return_value = mock_embedding
        svc.model = mock_model
        svc._loaded = True
        svc._load_failed = False

        with patch.object(svc, 'save_to_disk') as mock_save:
            svc.add_ticket("TICKET-001", "Test ticket text")

        assert len(svc._tickets) == 1
        assert svc._tickets[0][0] == "TICKET-001"
        assert svc._tickets[0][1] == mock_embedding
        assert svc._tickets[0][2] == "Test ticket text"
        mock_save.assert_called_once_with("TICKET-001", "Test ticket text")

    def test_add_ticket_degraded_mode_skips_embedding(self):
        """Test that add_ticket returns early when model is not available"""
        svc = DuplicateService()
        svc._loaded = False
        svc._load_failed = True

        with patch.object(svc, 'save_to_disk') as mock_save:
            svc.add_ticket("TICKET-002", "Another ticket")

        assert len(svc._tickets) == 0
        mock_save.assert_not_called()

    def test_add_ticket_multiple_tickets(self):
        """Test adding multiple tickets accumulates in memory"""
        svc = DuplicateService()
        mock_model = MagicMock()
        mock_model.encode.return_value = MagicMock()
        svc.model = mock_model
        svc._loaded = True

        with patch.object(svc, 'save_to_disk'):
            svc.add_ticket("TICKET-A", "First ticket")
            svc.add_ticket("TICKET-B", "Second ticket")
            svc.add_ticket("TICKET-C", "Third ticket")

        assert len(svc._tickets) == 3
        assert svc._tickets[0][0] == "TICKET-A"
        assert svc._tickets[1][0] == "TICKET-B"
        assert svc._tickets[2][0] == "TICKET-C"

    def test_add_ticket_persists_to_disk(self):
        """Test that add_ticket calls save_to_disk with correct args"""
        svc = DuplicateService()
        mock_model = MagicMock()
        mock_model.encode.return_value = MagicMock()
        svc.model = mock_model
        svc._loaded = True

        with patch.object(svc, 'save_to_disk', wraps=svc.save_to_disk) as mock_save:
            svc.add_ticket("DISK-001", "Persistent ticket")

        mock_save.assert_called_once_with("DISK-001", "Persistent ticket")