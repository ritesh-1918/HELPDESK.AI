from types import SimpleNamespace

import torch

from backend.services.classifier_service import ClassifierService


class DummyTokenizer:
    def __call__(self, *args, **kwargs):
        return {
            "input_ids": torch.tensor([[101, 102, 0, 0]]),
            "attention_mask": torch.tensor([[1, 1, 0, 0]]),
        }


class DummyModel:
    def __init__(self, logits):
        self._logits = logits

    def __call__(self, input_ids=None, attention_mask=None):
        return SimpleNamespace(logits=self._logits)


def _build_service(logits):
    service = ClassifierService()
    service._loaded = True
    service.tokenizer = DummyTokenizer()
    service.model = DummyModel(logits)
    service.id2label = {
        "0": "Access | Login Failure",
        "1": "Network | VPN Connection",
        "2": "Software | Application Crash",
    }
    return service


def test_predict_preserves_high_confidence_model_result():
    service = _build_service(torch.tensor([[0.1, 0.2, 6.0]]))

    result = service.predict("login authentication issue")

    assert result["category"] == "Software"
    assert result["assigned_team"] == "Application Support"
    assert result["confidence"] > 0.9


def test_predict_uses_keyword_fallback_when_model_is_uncertain():
    service = _build_service(torch.tensor([[0.1, 0.2, 0.3]]))

    result = service.predict("login authentication issue")

    assert result["category"] == "Access"
    assert result["assigned_team"] == "IAM Team"
    assert result["confidence"] >= 0.7
