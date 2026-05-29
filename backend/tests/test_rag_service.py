"""
Unit tests for RAG (Retrieval-Augmented Generation) service.
Covers context retrieval, relevance scoring, empty query handling,
and degraded mode behavior.
"""

import pytest
import os
from unittest.mock import patch, MagicMock, PropertyMock


# ---------------------------------------------------------------------------
# Import the service under test
# ---------------------------------------------------------------------------
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.rag_service import RagService


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def rag():
    """Return a RagService instance with Supabase mocked out."""
    with patch.dict(os.environ, {"SUPABASE_URL": "", "SUPABASE_SERVICE_KEY": ""}):
        svc = RagService()
    return svc


@pytest.fixture
def rag_with_supabase():
    """Return a RagService instance with a mocked Supabase client."""
    with patch.dict(os.environ, {
        "SUPABASE_URL": "https://example.supabase.co",
        "SUPABASE_SERVICE_KEY": "fake-key"
    }):
        with patch("services.rag_service.create_client") as mock_create:
            mock_client = MagicMock()
            mock_create.return_value = mock_client
            svc = RagService()
    return svc, mock_client


# ---------------------------------------------------------------------------
# Tests: Initialization
# ---------------------------------------------------------------------------
class TestRagServiceInit:
    def test_default_state_not_loaded(self, rag):
        """Service should start in an unloaded state."""
        assert rag._loaded is False
        assert rag._load_failed is False

    def test_is_available_false_when_not_loaded(self, rag):
        """is_available() should return False when model not loaded."""
        assert rag.is_available() is False

    def test_supabase_none_without_env(self, rag):
        """Supabase client should be None without env vars."""
        assert rag.supabase is None


# ---------------------------------------------------------------------------
# Tests: Model loading
# ---------------------------------------------------------------------------
class TestRagServiceLoad:
    def test_load_sets_loaded_flag(self, rag):
        """Successful load should set _loaded to True."""
        with patch("services.rag_service.SentenceTransformer") as mock_st:
            mock_st.return_value = MagicMock()
            rag.load()
            assert rag._loaded is True
            assert rag._load_failed is False

    def test_load_local_model_path(self, rag):
        """Should load from local path when env var is set and path exists."""
        with patch.dict(os.environ, {"SENTENCE_TRANSFORMER_MODEL_PATH": "/fake/local/model"}):
            with patch("os.path.exists", return_value=True):
                with patch("services.rag_service.SentenceTransformer") as mock_st:
                    mock_st.return_value = MagicMock()
                    rag.load()
                    mock_st.assert_called_with("/fake/local/model")

    def test_load_downloads_from_huggingface_by_default(self, rag):
        """Should download all-MiniLM-L6-v2 when no local path."""
        with patch("services.rag_service.SentenceTransformer") as mock_st:
            mock_st.return_value = MagicMock()
            rag.load()
            mock_st.assert_called_with("all-MiniLM-L6-v2")

    def test_load_failure_sets_load_failed(self, rag):
        """Failed load should set _load_failed and re-raise."""
        with patch("services.rag_service.SentenceTransformer", side_effect=RuntimeError("OOM")):
            with pytest.raises(RuntimeError, match="OOM"):
                rag.load()
            assert rag._load_failed is True

    def test_load_failure_degraded_mode(self, rag):
        """In degraded mode, load failure should not raise."""
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            with patch("services.rag_service.SentenceTransformer", side_effect=RuntimeError("OOM")):
                rag.load()
                assert rag._load_failed is True
                assert rag._loaded is False
                assert rag.model is None

    def test_load_skip_if_already_loaded(self, rag):
        """Should not reload if already loaded."""
        rag._loaded = True
        with patch("services.rag_service.SentenceTransformer") as mock_st:
            rag.load()
            mock_st.assert_not_called()

    def test_load_skip_if_previously_failed(self, rag):
        """Should not retry if load previously failed."""
        rag._load_failed = True
        with patch("services.rag_service.SentenceTransformer") as mock_st:
            rag.load()
            mock_st.assert_not_called()


# ---------------------------------------------------------------------------
# Tests: search_knowledge_base
# ---------------------------------------------------------------------------
class TestSearchKnowledgeBase:
    def test_returns_none_when_not_loaded(self, rag_with_supabase):
        """Should return None when model is not loaded."""
        rag, _ = rag_with_supabase
        result = rag.search_knowledge_base("test query")
        assert result is None

    def test_returns_none_when_supabase_is_none(self, rag):
        """Should return None when Supabase is not configured."""
        rag._loaded = True
        result = rag.search_knowledge_base("test query")
        assert result is None

    def test_returns_none_when_load_failed(self, rag_with_supabase):
        """Should return None and print degraded message when load failed."""
        rag, _ = rag_with_supabase
        rag._load_failed = True
        result = rag.search_knowledge_base("test query")
        assert result is None

    def test_returns_result_when_match_found(self, rag_with_supabase):
        """Should return matched article when similarity exceeds threshold."""
        rag, mock_client = rag_with_supabase
        rag._loaded = True
        rag.model = MagicMock()
        rag.model.encode.return_value.tolist.return_value = [0.1] * 384

        mock_response = MagicMock()
        mock_response.data = [{
            "id": 1,
            "title": "Password Reset",
            "content": "To reset your password, click the link...",
            "similarity": 0.92
        }]
        mock_client.rpc.return_value.execute.return_value = mock_response

        result = rag.search_knowledge_base("how to reset password")
        assert result is not None
        assert result["id"] == 1
        assert result["title"] == "Password Reset"
        assert result["similarity"] == 0.92

    def test_returns_none_when_no_match(self, rag_with_supabase):
        """Should return None when no articles match."""
        rag, mock_client = rag_with_supabase
        rag._loaded = True
        rag.model = MagicMock()
        rag.model.encode.return_value.tolist.return_value = [0.1] * 384

        mock_response = MagicMock()
        mock_response.data = []
        mock_client.rpc.return_value.execute.return_value = mock_response

        result = rag.search_knowledge_base("unknown topic")
        assert result is None

    def test_handles_empty_query(self, rag_with_supabase):
        """Should handle empty query gracefully."""
        rag, mock_client = rag_with_supabase
        rag._loaded = True
        rag.model = MagicMock()
        rag.model.encode.return_value.tolist.return_value = [0.0] * 384

        mock_response = MagicMock()
        mock_response.data = []
        mock_client.rpc.return_value.execute.return_value = mock_response

        result = rag.search_knowledge_base("")
        assert result is None

    def test_handles_rpc_exception(self, rag_with_supabase):
        """Should return None when Supabase RPC fails."""
        rag, mock_client = rag_with_supabase
        rag._loaded = True
        rag.model = MagicMock()
        rag.model.encode.return_value.tolist.return_value = [0.1] * 384

        mock_client.rpc.side_effect = Exception("connection error")

        result = rag.search_knowledge_base("test")
        assert result is None

    def test_custom_threshold_and_count(self, rag_with_supabase):
        """Should pass custom threshold and match_count to RPC."""
        rag, mock_client = rag_with_supabase
        rag._loaded = True
        rag.model = MagicMock()
        rag.model.encode.return_value.tolist.return_value = [0.1] * 384

        mock_response = MagicMock()
        mock_response.data = []
        mock_client.rpc.return_value.execute.return_value = mock_response

        rag.search_knowledge_base("test", threshold=0.5, match_count=5)
        
        call_args = mock_client.rpc.call_args
        assert call_args[0][0] == "match_articles"
        params = call_args[0][1]
        assert params["match_threshold"] == 0.5
        assert params["match_count"] == 5

    def test_returns_best_match_only(self, rag_with_supabase):
        """Should return only the best (first) match even when multiple results."""
        rag, mock_client = rag_with_supabase
        rag._loaded = True
        rag.model = MagicMock()
        rag.model.encode.return_value.tolist.return_value = [0.1] * 384

        mock_response = MagicMock()
        mock_response.data = [
            {"id": 1, "title": "Best Match", "content": "Content 1", "similarity": 0.95},
            {"id": 2, "title": "Second Match", "content": "Content 2", "similarity": 0.88},
        ]
        mock_client.rpc.return_value.execute.return_value = mock_response

        result = rag.search_knowledge_base("test")
        assert result["id"] == 1
        assert result["title"] == "Best Match"


# ---------------------------------------------------------------------------
# Tests: is_available
# ---------------------------------------------------------------------------
class TestIsAvailable:
    def test_available_after_successful_load(self, rag):
        """Should be available after successful model load."""
        with patch("services.rag_service.SentenceTransformer") as mock_st:
            mock_st.return_value = MagicMock()
            rag.load()
            assert rag.is_available() is True

    def test_not_available_after_failed_load(self, rag):
        """Should not be available after load failure."""
        with patch("services.rag_service.SentenceTransformer", side_effect=RuntimeError("fail")):
            with pytest.raises(RuntimeError):
                rag.load()
            assert rag.is_available() is False
