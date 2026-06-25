from pathlib import Path


def test_train_all_uses_existing_classifier_trainer_module():
    source = (Path(__file__).resolve().parents[2] / "backend" / "train_all.py").read_text(encoding="utf-8")

    assert "backend.training.classifier_trainer import" not in source
    assert "from backend.training.classifier_trainer_v3 import train_v3 as train_classifier" in source
