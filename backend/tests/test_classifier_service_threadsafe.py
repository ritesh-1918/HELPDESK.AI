import json
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import patch

from backend.services.classifier_service import ClassifierService


class _FakeModel:
    def to(self, device):
        return self

    def eval(self):
        return self


class _FakeTokenizer:
    def __call__(self, *args, **kwargs):
        return {"input_ids": [], "attention_mask": []}


class ClassifierServiceThreadSafetyTests(unittest.TestCase):
    def test_load_only_initializes_once_under_concurrency(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            model_dir = Path(tmpdir)
            (model_dir / "model.safetensors").write_text("stub", encoding="utf-8")
            (model_dir / "id2label.json").write_text(json.dumps({"0": "Access | Login Failure"}), encoding="utf-8")
            (model_dir / "label2id.json").write_text(json.dumps({"Access | Login Failure": 0}), encoding="utf-8")

            tokenizer_calls = []
            model_calls = []

            def fake_tokenizer_from_pretrained(path):
                tokenizer_calls.append(path)
                time.sleep(0.05)
                return _FakeTokenizer()

            def fake_model_from_pretrained(path):
                model_calls.append(path)
                time.sleep(0.05)
                return _FakeModel()

            service = ClassifierService()

            with patch("backend.services.classifier_service.SAVE_DIR", str(model_dir)), \
                 patch("backend.services.classifier_service.DistilBertTokenizerFast.from_pretrained", side_effect=fake_tokenizer_from_pretrained), \
                 patch("backend.services.classifier_service.DistilBertForSequenceClassification.from_pretrained", side_effect=fake_model_from_pretrained):

                threads = [threading.Thread(target=service.load) for _ in range(8)]
                for thread in threads:
                    thread.start()
                for thread in threads:
                    thread.join()

            self.assertTrue(service._loaded)
            self.assertEqual(len(tokenizer_calls), 1)
            self.assertEqual(len(model_calls), 1)


if __name__ == "__main__":
    unittest.main()
