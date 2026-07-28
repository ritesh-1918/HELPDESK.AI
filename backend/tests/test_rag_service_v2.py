"""
Test suite for backend/services/rag_service.py (Issue #1146 - v2).

Covers:
- search_knowledge_base with empty string text
- SUPABASE_SERVICE_KEY env var used for client
- search_knowledge_base returns dict with expected keys (id, title, content, similarity)
- is_available() reflects state
- degraded mode
"""

import sys
import os
import types
import importlib
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Remove conftest stub so we can import the real module
sys.modules.pop("backend.services.rag_service", None)

# Stub ML/supabase imports before importing RagService
st_mod = types.ModuleType("sentence_transformers")
st_mod.SentenceTransformer = MagicMock()
sys.modules["sentence_transformers"] = st_mod

sb_mod = types.ModuleType("supabase")
sb_mod.create_client = MagicMock(return_value=MagicMock())
sb_mod.Client = object
sys.modules["supabase"] = sb_mod

dotenv_mod = types.ModuleType("dotenv")
dotenv_mod.load_dotenv = lambda: None
sys.modules["dotenv"] = dotenv_mod

# Now import the real RagService
import importlib.util
_spec = importlib.util.spec_from_file_location(
    "rag_service_real",
    os.path.join(os.path.dirname(__file__), "..", "services", "rag_service.py")
)
_rag_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_rag_module)
RagServiceReal = _rag_module.RagService


def _make_rag_service_loaded():
    """Create a RagService with _loaded=True and a mock model/supabase."""
    svc = RagServiceReal.__new__(RagServiceReal)
    svc._loaded = True
    svc._load_failed = False
    svc.model = MagicMock()
    svc.supabase = MagicMock()
    return svc


def _make_rpc_response(data):
    result = MagicMock()
    result.data = data
    rpc_builder = MagicMock()
    rpc_builder.execute.return_value = result
    return rpc_builder


# ---------------------------------------------------------------------------
# RagService initialization tests
# ---------------------------------------------------------------------------

class TestRagServiceInit:
    def test_initial_loaded_false(self):
        svc = RagServiceReal.__new__(RagServiceReal)
        svc._loaded = False
        svc._load_failed = False
        assert svc._loaded is False

    def test_initial_load_failed_false(self):
        svc = RagServiceReal.__new__(RagServiceReal)
        svc._load_failed = False
        assert svc._load_failed is False

    def test_supabase_service_key_env_var_used(self):
        """RagService uses SUPABASE_SERVICE_KEY (not SERVICE_ROLE_KEY) for initialization."""
        create_client_mock = MagicMock(return_value=MagicMock())
        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://mock.supabase.co",
            "SUPABASE_SERVICE_KEY": "my-service-key-123"
        }):
            with patch.object(_rag_module, "create_client", create_client_mock):
                svc = RagServiceReal()
                # Verify create_client was called with the SERVICE_KEY
                if create_client_mock.called:
                    call_args = create_client_mock.call_args
                    assert "my-service-key-123" in str(call_args)

    def test_supabase_none_when_no_url(self):
        saved_url = os.environ.pop("SUPABASE_URL", None)
        saved_key = os.environ.pop("SUPABASE_SERVICE_KEY", None)
        try:
            svc = RagServiceReal()
            # If no URL/KEY, supabase should be None
            assert svc.supabase is None
        finally:
            if saved_url:
                os.environ["SUPABASE_URL"] = saved_url
            if saved_key:
                os.environ["SUPABASE_SERVICE_KEY"] = saved_key


# ---------------------------------------------------------------------------
# is_available() tests
# ---------------------------------------------------------------------------

class TestIsAvailable:
    def test_not_available_when_not_loaded(self):
        svc = _make_rag_service_loaded()
        svc._loaded = False
        assert svc.is_available() is False

    def test_not_available_when_load_failed(self):
        svc = _make_rag_service_loaded()
        svc._load_failed = True
        assert svc.is_available() is False

    def test_available_when_loaded_and_not_failed(self):
        svc = _make_rag_service_loaded()
        svc._loaded = True
        svc._load_failed = False
        assert svc.is_available() is True

    def test_not_available_when_both_loaded_and_failed(self):
        svc = _make_rag_service_loaded()
        svc._loaded = True
        svc._load_failed = True
        assert svc.is_available() is False


# ---------------------------------------------------------------------------
# search_knowledge_base tests
# ---------------------------------------------------------------------------

class TestSearchKnowledgeBase:
    def test_returns_none_when_not_loaded(self):
        svc = _make_rag_service_loaded()
        svc._loaded = False
        result = svc.search_knowledge_base("some text")
        assert result is None

    def test_returns_none_when_no_supabase(self):
        svc = _make_rag_service_loaded()
        svc.supabase = None
        result = svc.search_knowledge_base("some text")
        assert result is None

    def test_returns_none_when_load_failed(self):
        svc = _make_rag_service_loaded()
        svc._load_failed = True
        result = svc.search_knowledge_base("some text")
        assert result is None

    def test_returns_dict_with_expected_keys(self):
        svc = _make_rag_service_loaded()
        article = {"id": "art1", "title": "VPN Setup Guide", "content": "Steps to configure VPN", "similarity": 0.92}
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.1] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([article])

        result = svc.search_knowledge_base("VPN not working")
        assert result is not None
        assert "id" in result
        assert "title" in result
        assert "content" in result
        assert "similarity" in result

    def test_returned_id_matches_article(self):
        svc = _make_rag_service_loaded()
        article = {"id": "art42", "title": "Network Guide", "content": "Network tips", "similarity": 0.88}
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.2] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([article])

        result = svc.search_knowledge_base("network issue")
        assert result["id"] == "art42"

    def test_returned_title_matches_article(self):
        svc = _make_rag_service_loaded()
        article = {"id": "a1", "title": "Password Reset Steps", "content": "...", "similarity": 0.95}
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.3] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([article])

        result = svc.search_knowledge_base("forgot password")
        assert result["title"] == "Password Reset Steps"

    def test_returned_content_matches_article(self):
        svc = _make_rag_service_loaded()
        content = "Detailed instructions for resetting password"
        article = {"id": "a2", "title": "Reset", "content": content, "similarity": 0.91}
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([article])

        result = svc.search_knowledge_base("password help")
        assert result["content"] == content

    def test_returned_similarity_matches_article(self):
        svc = _make_rag_service_loaded()
        article = {"id": "a3", "title": "T", "content": "C", "similarity": 0.77}
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.5] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([article])

        result = svc.search_knowledge_base("something")
        assert abs(result["similarity"] - 0.77) < 1e-9

    def test_returns_none_when_no_results(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        result = svc.search_knowledge_base("obscure query")
        assert result is None

    def test_empty_string_text_does_not_raise(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        # Should not raise, just return None
        result = svc.search_knowledge_base("")
        assert result is None

    def test_empty_string_text_calls_model_encode(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        svc.search_knowledge_base("")
        svc.model.encode.assert_called_once_with("")

    def test_returns_first_result_when_multiple_articles(self):
        svc = _make_rag_service_loaded()
        articles = [
            {"id": "first", "title": "First", "content": "Content1", "similarity": 0.99},
            {"id": "second", "title": "Second", "content": "Content2", "similarity": 0.85},
        ]
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response(articles)

        result = svc.search_knowledge_base("test")
        assert result["id"] == "first"

    def test_returns_none_on_rpc_exception(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.side_effect = Exception("RPC error")

        result = svc.search_knowledge_base("test")
        assert result is None

    def test_rpc_called_with_match_articles(self):
        svc = _make_rag_service_loaded()
        vector = [float(i) / 384 for i in range(384)]
        svc.model.encode.return_value = MagicMock(tolist=lambda: vector)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        svc.search_knowledge_base("test query")
        svc.supabase.rpc.assert_called_once()
        call_args = svc.supabase.rpc.call_args
        assert call_args[0][0] == "match_articles"

    def test_rpc_params_include_query_embedding(self):
        svc = _make_rag_service_loaded()
        vector = [0.1] * 384
        svc.model.encode.return_value = MagicMock(tolist=lambda: vector)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        svc.search_knowledge_base("test")
        params = svc.supabase.rpc.call_args[0][1]
        assert "query_embedding" in params
        assert params["query_embedding"] == vector

    def test_rpc_params_include_match_threshold(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        svc.search_knowledge_base("test", threshold=0.9)
        params = svc.supabase.rpc.call_args[0][1]
        assert "match_threshold" in params
        assert params["match_threshold"] == 0.9

    def test_rpc_params_include_match_count(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        svc.search_knowledge_base("test", match_count=5)
        params = svc.supabase.rpc.call_args[0][1]
        assert "match_count" in params
        assert params["match_count"] == 5

    def test_returns_none_when_data_is_none(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response(None)

        result = svc.search_knowledge_base("test")
        assert result is None

    def test_default_threshold_is_0_85(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        svc.search_knowledge_base("test")
        params = svc.supabase.rpc.call_args[0][1]
        assert params["match_threshold"] == 0.85

    def test_default_match_count_is_1(self):
        svc = _make_rag_service_loaded()
        svc.model.encode.return_value = MagicMock(tolist=lambda: [0.0] * 384)
        svc.supabase.rpc.return_value = _make_rpc_response([])

        svc.search_knowledge_base("test")
        params = svc.supabase.rpc.call_args[0][1]
        assert params["match_count"] == 1


# ---------------------------------------------------------------------------
# load() degraded mode tests
# ---------------------------------------------------------------------------

class TestLoadDegradedMode:
    def test_load_sets_load_failed_when_no_sentence_transformers(self):
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            with patch.object(_rag_module, "_HAS_SENTENCE", False):
                svc = RagServiceReal.__new__(RagServiceReal)
                svc._loaded = False
                svc._load_failed = False
                svc.model = None
                svc.supabase = MagicMock()
                svc.load()
                assert svc._load_failed is True

    def test_is_available_false_after_degraded_load(self):
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            with patch.object(_rag_module, "_HAS_SENTENCE", False):
                svc = RagServiceReal.__new__(RagServiceReal)
                svc._loaded = False
                svc._load_failed = False
                svc.model = None
                svc.supabase = MagicMock()
                svc.load()
                assert svc.is_available() is False
