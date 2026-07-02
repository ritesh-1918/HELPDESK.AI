"""Tests for idempotent add_ticket in DuplicateService — issue #3124."""
import pytest
from unittest.mock import MagicMock, patch
import sys

sys.modules['sentence_transformers'] = MagicMock()

from backend.services.duplicate_service import DuplicateService


class TestIdempotentAddTicket:

    def _make_loaded_service(self):
        svc = DuplicateService()
        svc.model = MagicMock()
        svc.model.encode.return_value = MagicMock()
        svc._loaded = True
        svc._load_failed = False
        return svc

    def test_add_same_ticket_twice_does_not_duplicate(self):
        """Adding same ticket_id twice should result in only one entry."""
        svc = self._make_loaded_service()
        with patch.object(svc, 'save_to_disk'):
            svc.add_ticket("TICKET-001", "Printer not working")
            svc.add_ticket("TICKET-001", "Printer not working")  # duplicate call

        assert len(svc._tickets) == 1
        assert len(svc._ticket_id_set) == 1

    def test_add_different_tickets_both_indexed(self):
        """Two different ticket_ids should both be indexed."""
        svc = self._make_loaded_service()
        with patch.object(svc, 'save_to_disk'):
            svc.add_ticket("TICKET-001", "Printer not working")
            svc.add_ticket("TICKET-002", "VPN disconnecting")

        assert len(svc._tickets) == 2
        assert "TICKET-001" in svc._ticket_id_set
        assert "TICKET-002" in svc._ticket_id_set

    def test_add_ticket_returns_false_on_duplicate(self):
        """add_ticket should return False when ticket already indexed."""
        svc = self._make_loaded_service()
        with patch.object(svc, 'save_to_disk'):
            first = svc.add_ticket("TICKET-001", "Printer not working")
            second = svc.add_ticket("TICKET-001", "Printer not working")

        assert first is True
        assert second is False

    def test_add_ticket_degraded_mode_skips(self):
        """In degraded mode, add_ticket should skip and return False."""
        svc = DuplicateService()
        svc._loaded = False
        svc._load_failed = True

        with patch.object(svc, 'save_to_disk') as mock_save:
            result = svc.add_ticket("TICKET-001", "Some text")

        assert result is False
        assert len(svc._tickets) == 0
        mock_save.assert_not_called()

    def test_ticket_id_set_stays_consistent(self):
        """_ticket_id_set should mirror _tickets list exactly."""
        svc = self._make_loaded_service()
        with patch.object(svc, 'save_to_disk'):
            svc.add_ticket("T-1", "text one")
            svc.add_ticket("T-2", "text two")
            svc.add_ticket("T-1", "text one again")  # duplicate

        assert len(svc._tickets) == len(svc._ticket_id_set) == 2