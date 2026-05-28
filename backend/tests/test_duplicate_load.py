import pytest
import json
from unittest.mock import patch, MagicMock
from backend.services.duplicate_service import DuplicateService


class TestDuplicateServiceLoad:
    @pytest.fixture
    def service(self):
        patch("backend.services.duplicate_service.SentenceTransformer").start()
        patch("backend.services.duplicate_service.os.path.exists", return_value=False).start()
        patch("backend.services.duplicate_service.os.makedirs").start()
        s = DuplicateService()
        s.save_to_disk = MagicMock()
        yield s
        patch.stopall()

    def test_load_returns_early_if_already_loaded(self, service):
        service._loaded = True
        with patch.object(service, "_load_and_init_model") as mock_load:
            service.load()
            mock_load.assert_not_called()

    def test_load_returns_early_if_load_failed(self, service):
        service._load_failed = True
        with patch.object(service, "_load_and_init_model") as mock_load:
            service.load()
            mock_load.assert_not_called()

    def test_load_from_local_path(self, service):
        with patch("backend.services.duplicate_service.os.path.exists") as mock_exists, \
             patch("backend.services.duplicate_service.os.environ.get") as mock_getenv, \
             patch("backend.services.duplicate_service.SentenceTransformer") as mock_st:
            mock_getenv.side_effect = lambda key, default=None: {
                "SENTENCE_TRANSFORMER_MODEL_PATH": "/tmp/model",
            }.get(key, default)
            mock_exists.side_effect = lambda p: p == "/tmp/model"

            service._loaded = False
            service._load_failed = False
            service.load()

            assert service._loaded is True
            mock_st.assert_called_once_with("/tmp/model")

    def test_load_from_huggingface_when_no_local_path(self, service):
        with patch("backend.services.duplicate_service.os.environ.get", return_value=None) as mock_getenv, \
             patch("backend.services.duplicate_service.SentenceTransformer") as mock_st, \
             patch("backend.services.duplicate_service.os.path.exists", return_value=False):
            service._loaded = False
            service._load_failed = False
            service.load()

            assert service._loaded is True
            mock_st.assert_called_once_with("all-MiniLM-L6-v2")

    def test_load_raises_on_failure_without_degraded_mode(self, service):
        with patch("backend.services.duplicate_service.os.environ.get", return_value=None) as mock_getenv, \
             patch("backend.services.duplicate_service.SentenceTransformer", side_effect=Exception("Model failed")):
            service._loaded = False
            service._load_failed = False

            with pytest.raises(Exception, match="Model failed"):
                service.load()

    def test_load_degrades_gracefully_when_allowed(self, service):
        with patch("backend.services.duplicate_service.os.environ.get") as mock_getenv, \
             patch("backend.services.duplicate_service.SentenceTransformer", side_effect=Exception("Model failed")):
            mock_getenv.side_effect = lambda key, default=None: {
                "ALLOW_DEGRADED_STARTUP": "1",
            }.get(key, default)
            service._loaded = False
            service._load_failed = False

            service.load()

            assert service._loaded is False
            assert service._load_failed is True
            assert service.model is None

    def test_load_degrades_with_env_path_but_no_existing_model_path(self, service):
        with patch("backend.services.duplicate_service.os.environ.get") as mock_getenv, \
             patch("backend.services.duplicate_service.SentenceTransformer", side_effect=Exception("Model failed")), \
             patch("backend.services.duplicate_service.os.path.exists", return_value=False):
            mock_getenv.side_effect = lambda key, default=None: {
                "SENTENCE_TRANSFORMER_MODEL_PATH": "/nonexistent/path",
                "ALLOW_DEGRADED_STARTUP": "1",
            }.get(key, default)
            service._loaded = False
            service._load_failed = False

            service.load()

            assert service._loaded is False
            assert service._load_failed is True

    def test_load_loads_ticket_history_from_storage(self, service):
        with patch("backend.services.duplicate_service.SentenceTransformer") as mock_st, \
             patch("backend.services.duplicate_service.os.path.exists", return_value=True), \
             patch("backend.services.duplicate_service.open", new_callable=MagicMock) as mock_open, \
             patch("backend.services.duplicate_service.json.load") as mock_json_load:
            mock_model = MagicMock()
            mock_model.encode.return_value = [0.1, 0.2, 0.3]
            mock_st.return_value = mock_model
            mock_json_load.return_value = [
                {"ticket_id": "ticket-1", "text": "first ticket"},
                {"ticket_id": "ticket-2", "text": "second ticket"},
            ]

            service._loaded = False
            service._load_failed = False
            service.load()

            assert service._loaded is True
            assert len(service._tickets) == 2
            assert service._tickets[0][0] == "ticket-1"

    def test_load_handles_corrupt_storage_gracefully(self, service):
        with patch("backend.services.duplicate_service.SentenceTransformer") as mock_st, \
             patch("backend.services.duplicate_service.os.path.exists", return_value=True), \
             patch("backend.services.duplicate_service.open", new_callable=MagicMock), \
             patch("backend.services.duplicate_service.json.load", side_effect=json.JSONDecodeError("corrupt", "", 0)):
            mock_model = MagicMock()
            mock_st.return_value = mock_model

            service._loaded = False
            service._load_failed = False
            service.load()

            assert service._loaded is True
            assert len(service._tickets) == 0

    def test_load_uses_correct_storage_path(self, service):
        with patch("backend.services.duplicate_service.os.path.dirname") as mock_dirname, \
             patch("backend.services.duplicate_service.os.path.exists", return_value=False), \
             patch("backend.services.duplicate_service.SentenceTransformer"):
            mock_dirname.return_value = "/app/backend/services"
            service._loaded = False
            service._load_failed = False
            service.load()

            expected_storage = "/app/backend/data/case_history_cache.json"
            assert service.storage_file == expected_storage
