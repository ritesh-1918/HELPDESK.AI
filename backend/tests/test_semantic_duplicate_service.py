import sys
import os
import unittest
from unittest.mock import MagicMock, AsyncMock, patch

os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mockkey'

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.semantic_duplicate_service import (
    SemanticDuplicateService,
    DEFAULT_SENSITIVITY,
)


class TestSemanticDuplicateDefaults(unittest.TestCase):

    def test_default_sensitivity_is_085(self):
        self.assertEqual(DEFAULT_SENSITIVITY, 0.85)


class TestSemanticDuplicateLoad(unittest.TestCase):

    def setUp(self):
        self.service = SemanticDuplicateService()

    def test_initial_not_loaded(self):
        self.assertFalse(self.service._loaded)

    def test_load_called_once(self):
        self.service._loaded = True
        with patch.object(self.service, 'load') as mock_load:
            _ = self.service.model
            mock_load.assert_not_called()

    def test_load_sets_loaded_flag(self):
        with patch('backend.services.semantic_duplicate_service.SentenceTransformer') as mock_st:
            self.service.load()
            self.assertTrue(self.service._loaded)
            mock_st.assert_called_once_with("all-MiniLM-L6-v2")

    def test_load_handles_import_error(self):
        with patch('backend.services.semantic_duplicate_service.SentenceTransformer', side_effect=ImportError):
            self.service.load()
            self.assertFalse(self.service._loaded)


class TestSemanticDuplicateGenerateEmbedding(unittest.TestCase):

    def setUp(self):
        self.service = SemanticDuplicateService()
        self.service._model = MagicMock()
        self.service._loaded = True

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    def test_cache_hit_returns_cached(self, mock_cache):
        mock_cache.get_embedding.return_value = [0.1, 0.2, 0.3]
        result = self.service.generate_embedding("test text")
        self.assertEqual(result, [0.1, 0.2, 0.3])
        self.service._model.encode.assert_not_called()

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    def test_cache_miss_generates_and_caches(self, mock_cache):
        mock_cache.get_embedding.return_value = None
        self.service._model.encode.return_value.tolist.return_value = [0.5, 0.6]
        result = self.service.generate_embedding("new text")
        self.assertEqual(result, [0.5, 0.6])
        mock_cache.set_embedding.assert_called_once_with("new text", [0.5, 0.6])

    def test_no_model_returns_none(self):
        self.service._model = None
        result = self.service.generate_embedding("text")
        self.assertIsNone(result)

    def test_encode_error_returns_none(self):
        self.service._model.encode.side_effect = Exception("encode error")
        result = self.service.generate_embedding("text")
        self.assertIsNone(result)


class TestSemanticDuplicateGetSensitivity(unittest.TestCase):

    async def test_no_supabase_returns_default(self):
        service = SemanticDuplicateService()
        result = await service.get_sensitivity()
        self.assertEqual(result, DEFAULT_SENSITIVITY)

    async def test_supabase_error_returns_default(self):
        mock_supa = MagicMock()
        mock_supa.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("DB error")
        service = SemanticDuplicateService(supabase_client=mock_supa)
        result = await service.get_sensitivity()
        self.assertEqual(result, DEFAULT_SENSITIVITY)

    async def test_fetches_from_supabase(self):
        mock_supa = MagicMock()
        mock_response = MagicMock()
        mock_response.data = {"value": {"sensitivity": 0.95}}
        mock_supa.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        service = SemanticDuplicateService(supabase_client=mock_supa)
        result = await service.get_sensitivity()
        self.assertEqual(result, 0.95)


class TestSemanticDuplicateCheckDuplicate(unittest.TestCase):

    def setUp(self):
        self.service = SemanticDuplicateService()
        self.service._model = MagicMock()
        self.service._loaded = True

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_no_embedding_returns_no_match(self, mock_cache):
        mock_cache.get_embedding.return_value = None
        self.service._model.encode.side_effect = Exception("no model")
        result = await self.service.check_duplicate("test")
        self.assertFalse(result["is_duplicate"])
        self.assertIsNone(result["duplicate_ticket_id"])

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_no_supabase_returns_no_match(self, mock_cache):
        mock_cache.get_embedding.return_value = [0.1, 0.2]
        result = await self.service.check_duplicate("test")
        self.assertFalse(result["is_duplicate"])
        self.assertEqual(result["candidates"], [])

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_with_candidates_returns_best_match(self, mock_cache):
        mock_cache.get_embedding.return_value = [0.1, 0.2]
        mock_supa = MagicMock()
        mock_rpc = MagicMock()
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "T-001", "similarity": 0.92, "subject": "Login issue", "status": "open", "assigned_team": "support", "created_at": "2026-01-01"},
            {"id": "T-002", "similarity": 0.70, "subject": "Other", "status": "open", "assigned_team": "support", "created_at": "2026-01-02"},
        ]
        mock_rpc.execute.return_value = mock_response
        mock_supa.rpc.return_value = mock_rpc
        service = SemanticDuplicateService(supabase_client=mock_supa)

        result = await service.check_duplicate("Login problem", threshold=0.85)
        self.assertTrue(result["is_duplicate"])
        self.assertEqual(result["duplicate_ticket_id"], "T-001")
        self.assertEqual(result["similarity"], 0.92)

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_below_threshold_not_duplicate(self, mock_cache):
        mock_cache.get_embedding.return_value = [0.1, 0.2]
        mock_supa = MagicMock()
        mock_rpc = MagicMock()
        mock_response = MagicMock()
        mock_response.data = [{"id": "T-001", "similarity": 0.60, "subject": "Other"}]
        mock_rpc.execute.return_value = mock_response
        mock_supa.rpc.return_value = mock_rpc
        service = SemanticDuplicateService(supabase_client=mock_supa)

        result = await service.check_duplicate("test", threshold=0.75)
        self.assertFalse(result["is_duplicate"])
        self.assertIsNone(result["duplicate_ticket_id"])


class TestSemanticDuplicateIndexTicket(unittest.TestCase):

    def setUp(self):
        self.service = SemanticDuplicateService()
        self.service._model = MagicMock()
        self.service._loaded = True

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_no_embedding_returns_false(self, mock_cache):
        mock_cache.get_embedding.return_value = None
        self.service._model.encode.side_effect = Exception("fail")
        result = await self.service.index_ticket("T-001", "text")
        self.assertFalse(result)

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_no_supabase_returns_false(self, mock_cache):
        mock_cache.get_embedding.return_value = [0.1, 0.2]
        result = await self.service.index_ticket("T-001", "text")
        self.assertFalse(result)

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_successful_index_returns_true(self, mock_cache):
        mock_cache.get_embedding.return_value = [0.1, 0.2]
        mock_supa = MagicMock()
        mock_supa.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
        service = SemanticDuplicateService(supabase_client=mock_supa)

        result = await service.index_ticket("T-001", "text")
        self.assertTrue(result)


class TestSemanticDuplicateReindexAll(unittest.TestCase):

    async def test_no_supabase_returns_zero(self):
        service = SemanticDuplicateService()
        result = await service.reindex_all()
        self.assertEqual(result, {"indexed": 0, "errors": 0})

    @patch('backend.services.semantic_duplicate_service.redis_cache')
    async def test_reindex_processes_tickets(self, mock_cache):
        mock_cache.get_embedding.return_value = [0.1, 0.2]
        mock_supa = MagicMock()
        mock_response1 = MagicMock()
        mock_response1.data = [{"id": "T-001", "description": "test1"}, {"id": "T-002", "description": "test2"}]
        mock_response2 = MagicMock()
        mock_response2.data = []

        mock_supa.table.return_value.select.return_value.is_.return_value.range.side_effect = [mock_response1, mock_response2]
        mock_supa.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

        service = SemanticDuplicateService(supabase_client=mock_supa)
        result = await service.reindex_all(batch_size=50)

        self.assertEqual(result["indexed"], 2)
        self.assertEqual(result["errors"], 0)


if __name__ == '__main__':
    unittest.main()
