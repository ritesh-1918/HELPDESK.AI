import pytest
from unittest.mock import patch, MagicMock, PropertyMock
from backend.services.duplicate_service import DuplicateService, SIMILARITY_THRESHOLD


class TestDuplicateService:
    @pytest.fixture
    def service(self):
        with patch("backend.services.duplicate_service.SentenceTransformer"), \
             patch("backend.services.duplicate_service.os.path.exists", return_value=False), \
             patch("backend.services.duplicate_service.os.makedirs"):
            s = DuplicateService()
            s._loaded = True
            s._load_failed = False
            s.model = MagicMock()
            s.model.encode.return_value = [0.1, 0.2, 0.3]
            return s

    def test_check_duplicate_returns_no_match_when_store_empty(self, service):
        result = service.check_duplicate("test ticket text")
        assert result == {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "similarity": 0.0,
        }

    def test_check_duplicate_uses_custom_threshold(self, service):
        from sentence_transformers import util
        mock_emb = MagicMock()
        service.model.encode.return_value = mock_emb
        service._tickets = [("ticket-1", mock_emb, "similar text")]

        with patch.object(util, "cos_sim", return_value=MagicMock(item=MagicMock(return_value=0.6))):
            result = service.check_duplicate("test text", threshold=0.8)
            assert result["is_duplicate"] is False

            result2 = service.check_duplicate("test text", threshold=0.5)
            assert result2["is_duplicate"] is True

    def test_check_duplicate_handles_degraded_mode(self, service):
        service._loaded = False
        service._load_failed = True
        result = service.check_duplicate("test text")
        assert result == {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "similarity": 0.0,
        }

    def test_is_available_returns_true_when_loaded(self, service):
        assert service.is_available() is True

    def test_is_available_returns_false_when_not_loaded(self, service):
        service._loaded = False
        assert service.is_available() is False

    def test_is_available_returns_false_on_load_failure(self, service):
        service._load_failed = True
        assert service.is_available() is False

    def test_check_duplicate_finds_match_above_threshold(self, service):
        from sentence_transformers import util
        mock_emb = MagicMock()
        service.model.encode.return_value = mock_emb
        service._tickets = [("ticket-abc", mock_emb, "existing ticket text")]

        with patch.object(util, "cos_sim", return_value=MagicMock(item=MagicMock(return_value=0.85))):
            result = service.check_duplicate("similar text")
            assert result["is_duplicate"] is True
            assert result["duplicate_ticket_id"] == "ticket-abc"
            assert result["similarity"] == 0.85

    def test_check_duplicate_uses_default_threshold_when_not_provided(self, service):
        from sentence_transformers import util
        mock_emb = MagicMock()
        service.model.encode.return_value = mock_emb
        service._tickets = [("ticket-1", mock_emb, "text")]

        with patch.object(util, "cos_sim", return_value=MagicMock(item=MagicMock(return_value=SIMILARITY_THRESHOLD - 0.01))):
            result = service.check_duplicate("text")
            assert result["is_duplicate"] is False

    def test_add_ticket_adds_to_store(self, service):
        service.add_ticket("ticket-1", "new ticket text")
        assert len(service._tickets) == 1
        assert service._tickets[0][0] == "ticket-1"
