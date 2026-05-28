import sys
import pytest
from unittest.mock import patch, MagicMock

torch_mock = MagicMock()
torch_mock.cuda.is_available.return_value = False
torch_mock.no_grad = MagicMock()
torch_mock.no_grad.return_value.__enter__ = MagicMock(return_value=None)
torch_mock.no_grad.return_value.__exit__ = MagicMock(return_value=None)
sys.modules["torch"] = torch_mock

nn_mock = MagicMock()
sys.modules["torch.nn"] = nn_mock
nn_func_mock = MagicMock()
sys.modules["torch.nn.functional"] = nn_func_mock

transformers_mock = MagicMock()
sys.modules["transformers"] = transformers_mock

from backend.services.ner_service import NERService


class TestNERService:
    @pytest.fixture
    def service(self):
        s = NERService()
        s._loaded = True
        s.model = MagicMock()
        s.tokenizer = MagicMock()
        s.id2label = {"0": "O", "1": "B-B-APP_NAME", "2": "I-B-APP_NAME"}
        s.label2id = {"O": 0, "B-B-APP_NAME": 1, "I-B-APP_NAME": 2}
        return s

    def test_load_raises_when_model_not_found(self):
        with patch("backend.services.ner_service.os.path.exists", return_value=False):
            s = NERService()
            with pytest.raises(FileNotFoundError):
                s.load()

    def test_extract_entities_returns_empty_for_empty_text(self, service):
        result = service.extract_entities("")
        assert result == []

    def test_clean_label_parses_O(self, service):
        bio, entity = service._clean_label("O")
        assert bio == "O"
        assert entity == ""

    def test_clean_label_parses_B_B_APP_NAME(self, service):
        bio, entity = service._clean_label("B-B-APP_NAME")
        assert bio == "B"
        assert entity == "APP_NAME"

    def test_extract_entities_uses_regex_fallback(self, service):
        with patch.object(service, "load"):
            encoding = MagicMock()
            encoding.word_ids.return_value = [None]
            service.tokenizer.return_value = encoding

            logits = MagicMock()
            mock_probs = MagicMock()
            mock_pred_ids = MagicMock()
            service.model.return_value = MagicMock(logits=logits)

            with patch("backend.services.ner_service.F.softmax", return_value=mock_probs):
                with patch.object(mock_probs, "argmax", return_value=mock_pred_ids):
                    mock_max_result = MagicMock()
                    mock_max_result.values = MagicMock()
                    mock_max_result.values.squeeze.return_value.cpu.return_value.tolist.return_value = [0.9]
                    with patch("backend.services.ner_service.torch.max", return_value=mock_max_result):
                        with patch("backend.services.ner_service.torch.no_grad"):
                            result = service.extract_entities("my IP Address is 192.168.1.1")
                            ip_entities = [e for e in result if e["label"] == "IP_ADDRESS"]
                            assert len(ip_entities) > 0

    def test_regex_finds_ip_address(self, service):
        with patch.object(service, "load"):
            encoding = MagicMock()
            encoding.word_ids.return_value = [None]
            service.tokenizer.return_value = encoding

            logits = MagicMock()
            mock_probs = MagicMock()
            mock_pred_ids = MagicMock()
            service.model.return_value = MagicMock(logits=logits)

            with patch("backend.services.ner_service.F.softmax", return_value=mock_probs):
                with patch.object(mock_probs, "argmax", return_value=mock_pred_ids):
                    mock_max_result = MagicMock()
                    mock_max_result.values = MagicMock()
                    mock_max_result.values.squeeze.return_value.cpu.return_value.tolist.return_value = [0.9]
                    with patch("backend.services.ner_service.torch.max", return_value=mock_max_result):
                        with patch("backend.services.ner_service.torch.no_grad"):
                            result = service.extract_entities("Server IP 10.0.0.1 has high latency")
                            ips = [e for e in result if e["label"] == "IP_ADDRESS"]
                            assert any("10.0.0.1" in e["text"] for e in ips)
