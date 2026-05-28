"""
Unit tests for Classifier Service.
Covers model loading, prediction, priority mapping, team assignment,
and auto-resolve logic.
"""

import pytest
import os
import json
import tempfile
from unittest.mock import patch, MagicMock

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.classifier_service import (
    ClassifierService, PRIORITY_MAP, TEAM_MAP, AUTO_RESOLVE_SUBS
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def classifier():
    """Return a ClassifierService with mocked internals."""
    svc = ClassifierService()
    svc._loaded = False
    return svc


@pytest.fixture
def loaded_classifier(classifier):
    """Return a loaded ClassifierService with mocked model."""
    classifier._loaded = True
    classifier.id2label = {"0": "Access | Password Reset", "1": "Network | WiFi Issue", "2": "Hardware | Blue Screen"}
    classifier.label2id = {"Access | Password Reset": 0, "Network | WiFi Issue": 1, "Hardware | Blue Screen": 2}
    classifier.model = MagicMock()
    classifier.tokenizer = MagicMock()
    return classifier


def _mock_predict_setup(classifier, label_idx=0, confidence=0.95):
    """Helper to set up mock prediction chain."""
    import torch
    mock_encoding = {"input_ids": MagicMock(), "attention_mask": MagicMock()}
    classifier.tokenizer.return_value = mock_encoding

    mock_outputs = MagicMock()
    mock_logits = MagicMock()
    mock_outputs.logits = mock_logits

    classifier.model.return_value = mock_outputs

    with patch("services.classifier_service.F") as mock_F:
        with patch("services.classifier_service.torch") as mock_torch:
            mock_probs = MagicMock()
            mock_F.softmax.return_value = mock_probs
            mock_conf = MagicMock()
            mock_conf.item.return_value = confidence
            mock_idx = MagicMock()
            mock_idx.item.return_value = label_idx
            mock_torch.max.return_value = (mock_conf, mock_idx)
            mock_torch.no_grad.return_value.__enter__ = MagicMock()
            mock_torch.no_grad.return_value.__exit__ = MagicMock(return_value=False)
            yield


# ---------------------------------------------------------------------------
# Tests: Initialization
# ---------------------------------------------------------------------------
class TestClassifierInit:
    def test_default_state(self, classifier):
        assert classifier.model is None
        assert classifier.tokenizer is None
        assert classifier.id2label is None
        assert classifier._loaded is False


# ---------------------------------------------------------------------------
# Tests: Priority mapping
# ---------------------------------------------------------------------------
class TestPriorityMap:
    def test_critical_priorities(self):
        assert PRIORITY_MAP["Blue Screen"] == "Critical"
        assert PRIORITY_MAP["Data Loss"] == "Critical"
        assert PRIORITY_MAP["Hardware Failure"] == "Critical"

    def test_high_priorities(self):
        assert PRIORITY_MAP["Login Failure"] == "High"
        assert PRIORITY_MAP["VPN Connection"] == "High"
        assert PRIORITY_MAP["MFA Problem"] == "High"

    def test_medium_priorities(self):
        assert PRIORITY_MAP["Software Install"] == "Medium"
        assert PRIORITY_MAP["WiFi Issue"] == "Medium"
        assert PRIORITY_MAP["Internet Slow"] == "Medium"

    def test_low_priorities(self):
        assert PRIORITY_MAP["Account Unlock"] == "Low"
        assert PRIORITY_MAP["Printer Error"] == "Low"
        assert PRIORITY_MAP["Battery Issue"] == "Low"


# ---------------------------------------------------------------------------
# Tests: Team mapping
# ---------------------------------------------------------------------------
class TestTeamMap:
    def test_access_team(self):
        assert TEAM_MAP["Access"] == "IAM Team"

    def test_network_team(self):
        assert TEAM_MAP["Network"] == "Network Support"

    def test_software_team(self):
        assert TEAM_MAP["Software"] == "Application Support"

    def test_hardware_team(self):
        assert TEAM_MAP["Hardware"] == "Hardware Support"


# ---------------------------------------------------------------------------
# Tests: Auto-resolve
# ---------------------------------------------------------------------------
class TestAutoResolve:
    def test_auto_resolvable_categories(self):
        assert "Password Reset" in AUTO_RESOLVE_SUBS
        assert "Account Unlock" in AUTO_RESOLVE_SUBS
        assert "WiFi Issue" in AUTO_RESOLVE_SUBS

    def test_non_auto_resolvable(self):
        assert "Blue Screen" not in AUTO_RESOLVE_SUBS
        assert "Login Failure" not in AUTO_RESOLVE_SUBS


# ---------------------------------------------------------------------------
# Tests: Load
# ---------------------------------------------------------------------------
class TestClassifierLoad:
    def test_load_raises_without_model_files(self, classifier):
        with patch("os.path.exists", return_value=False):
            with pytest.raises(FileNotFoundError):
                classifier.load()

    def test_skip_if_already_loaded(self, classifier):
        classifier._loaded = True
        with patch("os.path.exists", return_value=False):
            classifier.load()  # Should not raise


# ---------------------------------------------------------------------------
# Tests: Predict
# ---------------------------------------------------------------------------
class TestPredict:
    def test_predict_returns_expected_keys(self, loaded_classifier):
        """Prediction result should have all expected keys."""
        import torch
        
        # Mock tokenizer
        mock_encoding = {"input_ids": MagicMock(), "attention_mask": MagicMock()}
        loaded_classifier.tokenizer.return_value = mock_encoding
        
        # Mock model output
        mock_outputs = MagicMock()
        mock_logits = MagicMock()
        mock_outputs.logits = mock_logits
        loaded_classifier.model.return_value = mock_outputs
        
        with patch("services.classifier_service.F") as mock_F,              patch("services.classifier_service.torch") as mock_torch:
            mock_probs = MagicMock()
            mock_F.softmax.return_value = mock_probs
            mock_conf = MagicMock()
            mock_conf.item.return_value = 0.92
            mock_idx = MagicMock()
            mock_idx.item.return_value = 0
            mock_torch.max.return_value = (mock_conf, mock_idx)
            mock_torch.no_grad.return_value.__enter__ = MagicMock()
            mock_torch.no_grad.return_value.__exit__ = MagicMock(return_value=False)
            
            result = loaded_classifier.predict("I forgot my password")
            
            assert "category" in result
            assert "sub_category" in result
            assert "priority" in result
            assert "confidence" in result

    def test_predict_calls_load_if_not_loaded(self, classifier):
        """Predict should call load() if model not loaded."""
        classifier.load = MagicMock(side_effect=FileNotFoundError("no model"))
        with pytest.raises(FileNotFoundError):
            classifier.predict("test")
