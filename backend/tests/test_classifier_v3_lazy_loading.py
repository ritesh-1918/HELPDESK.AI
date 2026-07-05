import json
import pickle
from pathlib import Path

import torch
from sklearn.preprocessing import LabelEncoder

from backend.services import classifier_v3 as classifier_v3_module


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


def _write_encoder_dump(path: Path):
    encoders = {}
    for key, classes in {
        "category": ["Access", "Network", "Software"],
        "sub_category": ["Login", "VPN", "Crash"],
        "Priority": ["Low", "High", "Critical"],
        "auto_resolve": ["No", "Yes"],
        "assigned_team": ["IAM Team", "Support"],
    }.items():
        encoder = LabelEncoder()
        encoder.fit(classes)
        encoders[key] = encoder
    with open(path, "wb") as handle:
        pickle.dump(encoders, handle)


def test_classifier_v3_initialization_is_lazy(tmp_path, monkeypatch):
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
    _write_encoder_dump(model_dir / "label_encoders.pkl")

    monkeypatch.setattr(classifier_v3_module, "MODEL_DIR", str(model_dir))
    monkeypatch.setattr(
        classifier_v3_module.MultiOutputClassifierV3,
        "__init__",
        lambda self, num_labels_per_output: None,
    )
    monkeypatch.setattr(
        classifier_v3_module.MultiOutputClassifierV3,
        "to",
        lambda self, device: self,
    )
    monkeypatch.setattr(
        classifier_v3_module.MultiOutputClassifierV3,
        "load_state_dict",
        lambda self, state_dict: None,
    )
    monkeypatch.setattr(
        classifier_v3_module.MultiOutputClassifierV3,
        "eval",
        lambda self: None,
    )
    monkeypatch.setattr(
        classifier_v3_module.MultiOutputClassifierV3,
        "__call__",
        lambda self, input_ids=None, attention_mask=None: {
            "category": torch.tensor([[0.2, 0.3, 5.4]]),
            "sub_category": torch.tensor([[0.1, 0.2, 6.0]]),
            "Priority": torch.tensor([[7.0, 0.3, 0.1]]),
            "auto_resolve": torch.tensor([[0.2, 3.0]]),
            "assigned_team": torch.tensor([[0.1, 5.0]]),
        },
    )
    monkeypatch.setattr(
        classifier_v3_module.BertTokenizerFast,
        "from_pretrained",
        lambda *args, **kwargs: DummyTokenizer(),
    )
    monkeypatch.setattr(classifier_v3_module.torch, "load", lambda *args, **kwargs: {})
    monkeypatch.setattr(classifier_v3_module.torch.cuda, "is_available", lambda: False)

    service = classifier_v3_module.ClassifierServiceV3()

    assert service.model is None
    assert service._loaded is False

    service.load()
    result = service.predict("network vpn access issue")

    assert result["category"]["prediction"] == "Software"
    assert result["priority"]["prediction"] == "Critical"
    assert result["assigned_team"]["prediction"] == "Support"
    assert service._loaded is True
