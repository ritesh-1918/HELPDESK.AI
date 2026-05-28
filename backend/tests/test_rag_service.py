import sys
import pytest
from unittest.mock import patch, MagicMock

sentence_transformers_mock = MagicMock()
sys.modules["sentence_transformers"] = sentence_transformers_mock

supabase_mock = MagicMock()
sys.modules["supabase"] = supabase_mock

from backend.services.rag_service import RagService


class TestRagService:
    @pytest.fixture
    def service(self):
        with patch.dict("os.environ", {"SUPABASE_URL": "https://test.supabase.co", "SUPABASE_SERVICE_KEY": "test-key"}, clear=False):
            with patch("backend.services.rag_service.create_client") as mock_create:
                mock_create.return_value = MagicMock()
                s = RagService()
                s._loaded = True
                s._load_failed = False
                s.model = MagicMock()
                s.model.encode.return_value = MagicMock(tolist=lambda: [0.1] * 384)
                s.supabase = MagicMock()
                return s

    def test_is_available_returns_true_when_loaded(self, service):
        assert service.is_available() is True

    def test_is_available_returns_false_when_not_loaded(self, service):
        service._loaded = False
        assert service.is_available() is False

    def test_is_available_returns_false_on_load_failure(self, service):
        service._load_failed = True
        assert service.is_available() is False

    def test_load_skips_when_already_loaded(self, service):
        with patch.object(service.model, "encode") as mock_encode:
            service.load()
            mock_encode.assert_not_called()

    def test_search_knowledge_base_returns_none_when_not_loaded(self, service):
        service._loaded = False
        result = service.search_knowledge_base("test query")
        assert result is None

    def test_search_knowledge_base_returns_none_when_no_supabase(self, service):
        service.supabase = None
        result = service.search_knowledge_base("test query")
        assert result is None

    def test_search_knowledge_base_returns_match_when_found(self, service):
        mock_response = MagicMock()
        mock_response.data = [{"id": 1, "title": "Article", "content": "Content", "similarity": 0.92}]
        service.supabase.rpc.return_value.execute.return_value = mock_response

        result = service.search_knowledge_base("test query")
        assert result is not None
        assert result["id"] == 1
        assert result["similarity"] == 0.92

    def test_search_knowledge_base_returns_none_when_no_match(self, service):
        mock_response = MagicMock()
        mock_response.data = []
        service.supabase.rpc.return_value.execute.return_value = mock_response

        result = service.search_knowledge_base("test query")
        assert result is None

    def test_search_knowledge_base_returns_none_on_error(self, service):
        service.supabase.rpc.side_effect = Exception("RPC failed")

        result = service.search_knowledge_base("test query")
        assert result is None
