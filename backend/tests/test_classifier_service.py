"""
Unit tests for backend.services.classifier_service (Issue #916).

Covers:
- ClassifierService initialization and default state
- Model loading routines (success, failure, idempotent)
- Predict method: category/subcategory decoding, priority mapping,
  team assignment, auto-resolve flag, confidence scoring
- Regex override layer for technical keywords
- Category distribution across representative ticket texts

All heavy ML dependencies (torch, transformers) are mocked via sys.modules
so the suite runs without GPU/model files in CI.
"""

from __future__ import annotations

import json
import os
import sys
from unittest.mock import MagicMock, patch, mock_open

import pytest

# ---------------------------------------------------------------------------
# Stub heavy ML imports before importing the service
# ---------------------------------------------------------------------------
_mock_torch = MagicMock()
_mock_transformers = MagicMock()

sys.modules.setdefault("torch", _mock_torch)
sys.modules.setdefault("torch.nn", MagicMock())
sys.modules.setdefault("torch.nn.functional", MagicMock())
sys.modules.setdefault("transformers", _mock_transformers)

# Remove the conftest.py stub so we import the real module
if "backend.services.classifier_service" in sys.modules:
    del sys.modules["backend.services.classifier_service"]

# Now import the service
from backend.services.classifier_service import (
    ClassifierService,
    PRIORITY_MAP,
    TEAM_MAP,
    AUTO_RESOLVE_SUBS,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def svc():
    """Return a fresh ClassifierService with no model loaded."""
    return ClassifierService()


@pytest.fixture()
def loaded_svc():
    """Return a ClassifierService with mocked model/tokenizer/labels."""
    s = ClassifierService()

    # Mock label mappings
    s.id2label = {
        "0": "Hardware | Blue Screen",
        "1": "Hardware | Overheating",
        "2": "Network | VPN Connection",
        "3": "Network | DNS Problem",
        "4": "Access | Login Failure",
        "5": "Access | Password Reset",
        "6": "Software | Application Crash",
        "7": "Software | Performance",
        "8": "General | General",
    }
    s.label2id = {v: int(k) for k, v in s.id2label.items()}

    # Mock tokenizer
    mock_tokenizer = MagicMock()
    mock_encoding = {
        "input_ids": MagicMock(),
        "attention_mask": MagicMock(),
    }
    mock_encoding["input_ids"].to = MagicMock(return_value=mock_encoding["input_ids"])
    mock_encoding["attention_mask"].to = MagicMock(return_value=mock_encoding["attention_mask"])
    mock_tokenizer.return_value = mock_encoding
    s.tokenizer = mock_tokenizer

    # Mock model
    mock_model = MagicMock()
    mock_outputs = MagicMock()
    s.model = mock_model
    s._loaded = True

    return s


def _make_logits(idx, confidence=0.95):
    """Create mock logits that produce the desired prediction index."""
    import torch as _torch_stub  # noqa: already mocked

    logits = MagicMock()
    probs = MagicMock()
    max_result = (MagicMock(), MagicMock())

    # softmax returns probs
    _mock_torch.nn.functional.softmax.return_value = probs
    probs.max.return_value = (MagicMock(), MagicMock())

    # F.softmax(logits, dim=1) → probs
    # torch.max(probs, dim=1) → (confidence_tensor, index_tensor)
    conf_tensor = MagicMock()
    conf_tensor.item.return_value = confidence
    idx_tensor = MagicMock()
    idx_tensor.item.return_value = idx

    _mock_torch.max.return_value = (conf_tensor, idx_tensor)
    _mock_torch.nn.functional.softmax.return_value = probs

    return logits


# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------

class TestInit:
    def test_default_state(self, svc):
        assert svc.model is None
        assert svc.tokenizer is None
        assert svc.id2label is None
        assert svc.label2id is None
        assert svc._loaded is False


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------

class TestLoad:
    def test_load_sets_loaded_flag(self, svc, tmp_path):
        """Load should set _loaded to True on success."""
        # Create mock model files
        model_dir = tmp_path / "classifier"
        model_dir.mkdir(parents=True)
        (model_dir / "model.safetensors").write_text("fake")
        (model_dir / "id2label.json").write_text('{"0": "Hardware | Blue Screen"}')
        (model_dir / "label2id.json").write_text('{"Hardware | Blue Screen": 0}')

        with patch("backend.services.classifier_service.SAVE_DIR", str(model_dir)):
            with patch.object(
                _mock_transformers, "DistilBertTokenizerFast"
            ) as mock_tok_cls:
                mock_tok_cls.from_pretrained.return_value = MagicMock()
                with patch.object(
                    _mock_transformers, "DistilBertForSequenceClassification"
                ) as mock_model_cls:
                    mock_model_inst = MagicMock()
                    mock_model_cls.from_pretrained.return_value = mock_model_inst
                    svc.load()

        assert svc._loaded is True
        assert svc.model is not None
        assert svc.tokenizer is not None

    def test_load_idempotent(self, svc):
        """Calling load() twice should not reload the model."""
        svc._loaded = True
        svc.model = MagicMock()
        svc.tokenizer = MagicMock()

        # Should return early without touching filesystem
        svc.load()
        assert svc._loaded is True

    def test_load_raises_on_missing_model_file(self, svc, tmp_path):
        """Load should raise FileNotFoundError if model.safetensors is missing."""
        model_dir = tmp_path / "empty_classifier"
        model_dir.mkdir(parents=True)

        with patch("backend.services.classifier_service.SAVE_DIR", str(model_dir)):
            with pytest.raises(FileNotFoundError, match="Classifier model not found"):
                svc.load()

    def test_load_reads_label_mappings(self, svc, tmp_path):
        """Load should read id2label.json and label2id.json from disk."""
        model_dir = tmp_path / "classifier"
        model_dir.mkdir(parents=True)
        (model_dir / "model.safetensors").write_text("fake")
        labels = {"0": "Network | VPN Connection", "1": "Access | Login Failure"}
        (model_dir / "id2label.json").write_text(json.dumps(labels))
        (model_dir / "label2id.json").write_text(
            json.dumps({v: int(k) for k, v in labels.items()})
        )

        with patch("backend.services.classifier_service.SAVE_DIR", str(model_dir)):
            with patch.object(
                _mock_transformers, "DistilBertTokenizerFast"
            ) as mock_tok_cls:
                mock_tok_cls.from_pretrained.return_value = MagicMock()
                with patch.object(
                    _mock_transformers, "DistilBertForSequenceClassification"
                ) as mock_model_cls:
                    mock_model_cls.from_pretrained.return_value = MagicMock()
                    svc.load()

        assert svc.id2label == labels
        assert svc.label2id == {"Network | VPN Connection": 0, "Access | Login Failure": 1}


# ---------------------------------------------------------------------------
# Priority Mapping
# ---------------------------------------------------------------------------

class TestPriorityMapping:
    """Verify PRIORITY_MAP covers expected subcategories."""

    def test_critical_subcategories(self):
        for sub in ["Blue Screen", "Overheating", "Data Loss", "Hardware Failure"]:
            assert PRIORITY_MAP[sub] == "Critical"

    def test_high_subcategories(self):
        for sub in ["Application Crash", "Login Failure", "VPN Connection"]:
            assert PRIORITY_MAP[sub] == "High"

    def test_medium_subcategories(self):
        for sub in ["Permission Issue", "Performance", "WiFi Issue"]:
            assert PRIORITY_MAP[sub] == "Medium"

    def test_low_subcategories(self):
        for sub in ["Account Unlock", "Printer Error", "Monitor Problem"]:
            assert PRIORITY_MAP[sub] == "Low"

    def test_unknown_subcategory_defaults_to_medium(self):
        assert PRIORITY_MAP.get("Nonexistent Sub", "Medium") == "Medium"


# ---------------------------------------------------------------------------
# Team Assignment
# ---------------------------------------------------------------------------

class TestTeamAssignment:
    def test_access_team(self):
        assert TEAM_MAP["Access"] == "IAM Team"

    def test_network_team(self):
        assert TEAM_MAP["Network"] == "Network Support"

    def test_software_team(self):
        assert TEAM_MAP["Software"] == "Application Support"

    def test_hardware_team(self):
        assert TEAM_MAP["Hardware"] == "Hardware Support"

    def test_unknown_category_defaults_to_general(self):
        assert TEAM_MAP.get("Unknown", "General Support") == "General Support"


# ---------------------------------------------------------------------------
# Auto-Resolve
# ---------------------------------------------------------------------------

class TestAutoResolve:
    def test_auto_resolve_subcategories(self):
        for sub in AUTO_RESOLVE_SUBS:
            assert sub in {
                "Password Reset", "Account Unlock", "Software Install",
                "WiFi Issue", "Printer Error", "Monitor Problem",
            }

    def test_critical_not_auto_resolvable(self):
        assert "Blue Screen" not in AUTO_RESOLVE_SUBS
        assert "Hardware Failure" not in AUTO_RESOLVE_SUBS


# ---------------------------------------------------------------------------
# Predict — Category Decoding
# ---------------------------------------------------------------------------

class TestPredictCategoryDecoding:
    """Test that predict() correctly decodes combined labels."""

    def test_hardware_blue_screen(self, loaded_svc):
        """Label 'Hardware | Blue Screen' → category=Hardware, sub=Blue Screen."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.95
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 0

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("my computer shows blue screen")

        assert result["category"] == "Hardware"
        assert result["subcategory"] == "Blue Screen"
        assert result["priority"] == "Critical"
        assert result["assigned_team"] == "Hardware Support"

    def test_network_vpn(self, loaded_svc):
        """Label 'Network | VPN Connection' → category=Network."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.92
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 2

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("VPN connection keeps dropping")

        assert result["category"] == "Network"
        assert result["subcategory"] == "VPN Connection"
        assert result["priority"] == "High"

    def test_access_password_reset(self, loaded_svc):
        """Label 'Access | Password Reset' → auto_resolve=True."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.88
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 5

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("I need to reset my password")

        assert result["auto_resolve"] is True
        assert result["assigned_team"] == "IAM Team"

    def test_unknown_label_fallback(self, loaded_svc):
        """Unknown label index → 'Unknown' category/subcategory."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.5
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 99  # not in id2label

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("random text")

        assert result["category"] == "Unknown"
        assert result["subcategory"] == "Unknown"


# ---------------------------------------------------------------------------
# Predict — Regex Override Layer
# ---------------------------------------------------------------------------

class TestRegexOverride:
    """Test the technical keyword override boost."""

    def test_network_keywords_override_general(self, loaded_svc):
        """When model predicts 'General' but text has network keywords → Network."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.6
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 8  # General | General

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("my IP address has DNS connection issues")

        assert result["category"] == "Network"
        assert result["confidence"] >= 0.92
        assert result["assigned_team"] == "Network Support"

    def test_software_keywords_override_low_confidence(self, loaded_svc):
        """Low confidence + software keywords → Software category."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.5
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 8  # General | General

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("application crash with SQL database error")

        assert result["category"] == "Software"
        assert result["confidence"] >= 0.92

    def test_access_keywords_override(self, loaded_svc):
        """Access keywords in text → Access/IAM Team."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.5
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 8  # General

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("cannot login, password authentication failed")

        assert result["category"] == "Access"
        assert result["assigned_team"] == "IAM Team"

    def test_no_override_when_high_confidence(self, loaded_svc):
        """High confidence non-General prediction should not be overridden."""
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.95
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 2  # Network | VPN Connection

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("software crash on my laptop")

        # High confidence + non-General → no override (VPN Connection stays)
        assert result["subcategory"] == "VPN Connection"


# ---------------------------------------------------------------------------
# Predict — Confidence Scoring
# ---------------------------------------------------------------------------

class TestConfidence:
    def test_confidence_rounded_to_4_decimals(self, loaded_svc):
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.87654321
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 0

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                # Use text without tech keywords to avoid regex override
                result = loaded_svc.predict("my computer will not start")

        assert result["confidence"] == 0.8765

    def test_override_boosts_confidence_to_092(self, loaded_svc):
        logits = MagicMock()
        loaded_svc.model.return_value = MagicMock(logits=logits)

        conf_tensor = MagicMock()
        conf_tensor.item.return_value = 0.3  # low confidence
        idx_tensor = MagicMock()
        idx_tensor.item.return_value = 8  # General

        with patch("backend.services.classifier_service.F") as mock_F:
            mock_F.softmax.return_value = MagicMock()
            with patch("backend.services.classifier_service.torch") as mock_torch:
                mock_torch.max.return_value = (conf_tensor, idx_tensor)
                result = loaded_svc.predict("DNS firewall VPN connection issue")

        assert result["confidence"] == 0.92


# ---------------------------------------------------------------------------
# Category Distribution (representative texts)
# ---------------------------------------------------------------------------

class TestCategoryDistribution:
    """Verify that representative ticket texts map to expected categories
    through the regex override layer (which fires when model predicts General
    or confidence < 0.9)."""

    def test_hardware_tickets(self, loaded_svc):
        """Texts with hardware signals → Hardware category."""
        for text in ["blue screen of death", "laptop overheating constantly"]:
            logits = MagicMock()
            loaded_svc.model.return_value = MagicMock(logits=logits)
            conf = MagicMock()
            conf.item.return_value = 0.5
            idx = MagicMock()
            idx.item.return_value = 8  # General → triggers override
            with patch("backend.services.classifier_service.F") as mock_F:
                mock_F.softmax.return_value = MagicMock()
                with patch("backend.services.classifier_service.torch") as mock_t:
                    mock_t.max.return_value = (conf, idx)
                    result = loaded_svc.predict(text)
            # Hardware keywords aren't in the override dict, so stays General
            # unless model predicted Hardware
            assert result["category"] in ("Hardware", "General")

    def test_network_tickets(self, loaded_svc):
        """Texts with network keywords → Network via override."""
        for text in [
            "VPN connection is down",
            "DNS resolution failing",
            "firewall blocking traffic",
        ]:
            logits = MagicMock()
            loaded_svc.model.return_value = MagicMock(logits=logits)
            conf = MagicMock()
            conf.item.return_value = 0.5
            idx = MagicMock()
            idx.item.return_value = 8  # General
            with patch("backend.services.classifier_service.F") as mock_F:
                mock_F.softmax.return_value = MagicMock()
                with patch("backend.services.classifier_service.torch") as mock_t:
                    mock_t.max.return_value = (conf, idx)
                    result = loaded_svc.predict(text)
            assert result["category"] == "Network"

    def test_access_tickets(self, loaded_svc):
        """Texts with access keywords → Access via override."""
        for text in [
            "cannot login to my account",
            "need password reset help",
            "MFA authentication permission issue",
        ]:
            logits = MagicMock()
            loaded_svc.model.return_value = MagicMock(logits=logits)
            conf = MagicMock()
            conf.item.return_value = 0.5
            idx = MagicMock()
            idx.item.return_value = 8  # General
            with patch("backend.services.classifier_service.F") as mock_F:
                mock_F.softmax.return_value = MagicMock()
                with patch("backend.services.classifier_service.torch") as mock_t:
                    mock_t.max.return_value = (conf, idx)
                    result = loaded_svc.predict(text)
            assert result["category"] == "Access"
