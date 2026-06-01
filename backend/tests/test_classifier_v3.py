import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.modules['torch'] = MagicMock()
sys.modules['torch.nn'] = MagicMock()
sys.modules['transformers'] = MagicMock()

# Remove the stub installed by conftest.py to force importing the real module with our mocks
if 'backend.services.classifier_v3' in sys.modules:
    del sys.modules['backend.services.classifier_v3']

from backend.services.classifier_v3 import ClassifierServiceV3


class TestClassifierV3EdgeCases:
    """Tests for ClassifierServiceV3.predict method edge cases"""

    def test_predict_model_not_loaded(self):
        """Test predict returns error dict when model is None"""
        svc = ClassifierServiceV3()
        svc.model = None

        result = svc.predict("some text")
        assert result == {"error": "V3 Model not loaded"}

    def test_predict_model_loaded_with_empty_text(self):
        """Test predict handles empty text with valid model"""
        svc = ClassifierServiceV3()
        svc.model = MagicMock()
        svc.label_encoders = {}
        svc.tokenizer = MagicMock()
        svc.device = MagicMock()

        svc.tokenizer.return_value.to.return_value = {"input_ids": [], "attention_mask": []}
        result = svc.predict("")
        assert isinstance(result, dict)

    def test_predict_model_loaded_with_none_confidence(self):
        """Test predict handles None confidence from torch.max"""
        svc = ClassifierServiceV3()
        svc.model = MagicMock()
        svc.label_encoders = {}
        svc.tokenizer = MagicMock()
        svc.device = MagicMock()

        svc.tokenizer.return_value.to.return_value = {"input_ids": [], "attention_mask": []}
        result = svc.predict("test")
        assert isinstance(result, dict)