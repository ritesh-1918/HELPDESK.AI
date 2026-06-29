import json
from pathlib import Path

import torch

from backend.services import classifier_v2 as classifier_v2_module


class DummyTokenizer:
    def __call__(self, *args, **kwargs):
        return DummyEncoding(
            {
                "input_ids": torch.tensor([[101, 102, 0, 0]]),
                "attention_mask": torch.tensor([[1, 1, 0, 0]]),
            }
        )


class DummyEncoding(dict):
    def to(self, device):
        return self


class DummyModel:
    def __init__(self, logits):
        self._logits = logits

    def to(self, device):
        return self

    def load_state_dict(self, state_dict):
        return None

    def eval(self):
        return None

    def __call__(self, input_ids=None, attention_mask=None):
        return self._logits


def test_classifier_v2_loads_safe_label_encoders_json(tmp_path, monkeypatch):
    model_dir = Path(tmp_path)
    (model_dir / "model_config.json").write_text(
        json.dumps(
            {
                "category": 3,
                "sub_category": 3,
                "Priority": 3,
                "auto_resolve": 2,
                "assigned_team": 2,
            }
        )
    )
    (model_dir / "label_encoders.json").write_text(
        json.dumps(
            {
                "category": ["Access", "Network", "Software"],
                "sub_category": ["Login", "VPN", "Crash"],
                "Priority": ["Low", "High", "Critical"],
                "auto_resolve": ["No", "Yes"],
                "assigned_team": ["IAM Team", "Support"],
            }
        )
    )

    monkeypatch.setattr(classifier_v2_module, "MODEL_DIR", str(model_dir))
    monkeypatch.setattr(
        classifier_v2_module.MultiOutputClassifierV2,
        "__init__",
        lambda self, num_labels_per_output: None,
    )
    monkeypatch.setattr(
        classifier_v2_module.MultiOutputClassifierV2,
        "to",
        lambda self, device: self,
    )
    monkeypatch.setattr(
        classifier_v2_module.MultiOutputClassifierV2,
        "load_state_dict",
        lambda self, state_dict: None,
    )
    monkeypatch.setattr(
        classifier_v2_module.MultiOutputClassifierV2,
        "eval",
        lambda self: None,
    )
    monkeypatch.setattr(
        classifier_v2_module.DistilBertTokenizerFast,
        "from_pretrained",
        lambda *args, **kwargs: DummyTokenizer(),
    )
    monkeypatch.setattr(classifier_v2_module.torch, "load", lambda *args, **kwargs: {})
    monkeypatch.setattr(classifier_v2_module.torch.cuda, "is_available", lambda: False)

    service = classifier_v2_module.ClassifierServiceV2()
    service.model = DummyModel(
        {
            "category": torch.tensor([[0.2, 0.3, 5.4]]),
            "sub_category": torch.tensor([[0.1, 0.2, 6.0]]),
            "Priority": torch.tensor([[0.1, 0.3, 7.0]]),
            "auto_resolve": torch.tensor([[0.2, 3.0]]),
            "assigned_team": torch.tensor([[0.1, 5.0]]),
        }
    )
    service.tokenizer = DummyTokenizer()

    result = service.predict("network vpn access issue")

    assert result["category"]["prediction"] == "Software"
    assert result["priority"]["prediction"] == "Critical"
    assert result["assigned_team"]["prediction"] == "Support"
    assert result["assigned_team"]["confidence"] > 0.9
