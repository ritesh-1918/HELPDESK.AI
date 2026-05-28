import sys
import pytest
from unittest.mock import patch, MagicMock, PropertyMock

torch_mock = MagicMock()
torch_mock.cuda.is_available.return_value = False
torch_mock.no_grad = MagicMock()
torch_mock.no_grad.return_value.__enter__ = MagicMock(return_value=None)
torch_mock.no_grad.return_value.__exit__ = MagicMock(return_value=None)
sys.modules["torch"] = torch_mock
sys.modules["torch.nn"] = MagicMock()

nn_func = MagicMock()
sys.modules["torch.nn.functional"] = nn_func

transformers_mock = MagicMock()
sys.modules["transformers"] = transformers_mock

from backend.services.classifier_service import ClassifierService, PRIORITY_MAP, TEAM_MAP, AUTO_RESOLVE_SUBS


class TestClassifierService:
    @pytest.fixture
    def service(self):
        s = ClassifierService()
        s._loaded = True
        s.model = MagicMock()
        s.tokenizer = MagicMock()
        s.id2label = {"0": "Access | Password Reset"}
        s.label2id = {"Access | Password Reset": 0}
        return s

    def test_load_raises_when_model_not_found(self):
        with patch("backend.services.classifier_service.os.path.exists", return_value=False):
            s = ClassifierService()
            with pytest.raises(FileNotFoundError):
                s.load()

    def test_predict_returns_expected_structure(self, service):
        mock_input = MagicMock()
        mock_probs = MagicMock()

        service.tokenizer.return_value = mock_input
        service.model.return_value = MagicMock(logits=MagicMock())

        mock_max = MagicMock()
        mock_max.item.return_value = 0.95
        mock_argmax = MagicMock()
        mock_argmax.item.return_value = 0

        with patch("backend.services.classifier_service.F.softmax", return_value=mock_probs), \
             patch("backend.services.classifier_service.torch.max", return_value=(mock_max, mock_argmax)):
            result = service.predict("reset my password")
            assert "category" in result
            assert "subcategory" in result
            assert "priority" in result
            assert "auto_resolve" in result
            assert "assigned_team" in result
            assert "confidence" in result

    def test_predict_returns_access_password_reset(self, service):
        mock_input = MagicMock()
        mock_probs = MagicMock()

        service.tokenizer.return_value = mock_input
        service.model.return_value = MagicMock(logits=MagicMock())

        mock_max = MagicMock()
        mock_max.item.return_value = 0.95
        mock_argmax = MagicMock()
        mock_argmax.item.return_value = 0

        with patch("backend.services.classifier_service.F.softmax", return_value=mock_probs), \
             patch("backend.services.classifier_service.torch.max", return_value=(mock_max, mock_argmax)):
            result = service.predict("I forgot my password and need to reset it")
            assert result["category"] == "Access"
            assert result["subcategory"] == "Password Reset"
            assert result["priority"] == "High"
            assert result["auto_resolve"] is True
            assert result["assigned_team"] == "IAM Team"

    def test_predict_default_team_for_unknown_category(self, service):
        service.id2label = {"0": "Unknown | Generic"}
        mock_input = MagicMock()
        mock_probs = MagicMock()

        service.tokenizer.return_value = mock_input
        service.model.return_value = MagicMock(logits=MagicMock())

        mock_max = MagicMock()
        mock_max.item.return_value = 0.5
        mock_argmax = MagicMock()
        mock_argmax.item.return_value = 0

        with patch("backend.services.classifier_service.F.softmax", return_value=mock_probs), \
             patch("backend.services.classifier_service.torch.max", return_value=(mock_max, mock_argmax)):
            result = service.predict("some random text")
            assert result["assigned_team"] == "General Support"

    def test_priority_map_contains_expected_keys(self):
        assert "Password Reset" in PRIORITY_MAP
        assert PRIORITY_MAP["Password Reset"] == "High"

    def test_team_map_contains_expected_keys(self):
        assert "Access" in TEAM_MAP
        assert TEAM_MAP["Access"] == "IAM Team"

    def test_auto_resolve_subs_contains_password_reset(self):
        assert "Password Reset" in AUTO_RESOLVE_SUBS

    def test_predict_network_keyword_overrides_category(self, service):
        service.id2label = {"0": "General | Question"}
        mock_input = MagicMock()
        mock_probs = MagicMock()

        service.tokenizer.return_value = mock_input
        service.model.return_value = MagicMock(logits=MagicMock())

        mock_max = MagicMock()
        mock_max.item.return_value = 0.75
        mock_argmax = MagicMock()
        mock_argmax.item.return_value = 0

        with patch("backend.services.classifier_service.F.softmax", return_value=mock_probs), \
             patch("backend.services.classifier_service.torch.max", return_value=(mock_max, mock_argmax)):
            result = service.predict("my VPN connection is not working")
            assert result["category"] == "Network"
            assert result["assigned_team"] == "Network Support"
