import pytest
from unittest.mock import patch, MagicMock


class TestRagServiceInit:
    def test_init_sets_defaults(self):
        from services.rag_service import RagService
        service = RagService()
        assert service.model is None
        assert service._loaded is False
        assert service._load_failed is False

    def test_init_creates_supabase_client_with_env(self):
        with patch.dict("os.environ", {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_SERVICE_KEY": "test-key"
        }, clear=False):
            from services.rag_service import RagService
            service = RagService()
            assert service.supabase is not None

    def test_init_supabase_is_none_without_env(self):
        with patch.dict("os.environ", {}, clear=True):
            import importlib
            import services.rag_service
            importlib.reload(services.rag_service)
            from services.rag_service import RagService
            service = RagService()
            assert service.supabase is None


class TestRagServiceIsAvailable:
    def test_returns_false_when_not_loaded(self):
        from services.rag_service import RagService
        service = RagService()
        assert service.is_available() is False

    def test_returns_true_when_loaded(self):
        from services.rag_service import RagService
        service = RagService()
        service._loaded = True
        assert service.is_available() is True

    def test_returns_false_when_load_failed(self):
        from services.rag_service import RagService
        service = RagService()
        service._load_failed = True
        assert service.is_available() is False

    def test_returns_false_when_loaded_but_load_failed(self):
        from services.rag_service import RagService
        service = RagService()
        service._loaded = True
        service._load_failed = True
        assert service.is_available() is False


class TestRagServiceLoad:
    def test_returns_early_if_already_loaded(self):
        from services.rag_service import RagService
        service = RagService()
        service._loaded = True
        with patch("services.rag_service.SentenceTransformer") as mock_st:
            service.load()
            mock_st.assert_not_called()

    def test_returns_early_if_load_failed(self):
        from services.rag_service import RagService
        service = RagService()
        service._load_failed = True
        with patch("services.rag_service.SentenceTransformer") as mock_st:
            service.load()
            mock_st.assert_not_called()

    def test_load_fails_when_sentence_transformers_missing(self):
        with patch("services.rag_service._HAS_SENTENCE", False), \
             patch.dict("os.environ", {"ALLOW_DEGRADED_STARTUP": "0"}, clear=False):
            from services.rag_service import RagService
            service = RagService()
            with pytest.raises(ImportError):
                service.load()

    def test_load_sets_load_failed_when_missing_in_degraded_mode(self):
        with patch("services.rag_service._HAS_SENTENCE", False), \
             patch.dict("os.environ", {"ALLOW_DEGRADED_STARTUP": "1"}, clear=False):
            from services.rag_service import RagService
            service = RagService()
            service.load()
            assert service._load_failed is True

    def test_load_sets_loaded_when_model_loads(self):
        with patch("services.rag_service._HAS_SENTENCE", True), \
             patch("services.rag_service.SentenceTransformer") as mock_st:
            mock_st.return_value = MagicMock()
            from services.rag_service import RagService
            service = RagService()
            service.load()
            assert service._loaded is True
            mock_st.assert_called_once()

    def test_load_from_local_path(self):
        import tempfile, os
        with tempfile.TemporaryDirectory() as tmpdir, \
             patch("services.rag_service._HAS_SENTENCE", True), \
             patch("services.rag_service.SentenceTransformer") as mock_st, \
             patch.dict("os.environ", {"SENTENCE_TRANSFORMER_MODEL_PATH": tmpdir}, clear=False):
            mock_st.return_value = MagicMock()
            from services.rag_service import RagService
            service = RagService()
            service.load()
            mock_st.assert_called_once_with(tmpdir)
