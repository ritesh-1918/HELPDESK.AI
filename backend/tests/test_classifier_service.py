"""
Unit tests for ClassifierService — model loading, prediction pipeline,
priority/team mapping, auto-resolve logic, and regex override layer.
All torch/transformers deps are mocked at module level since classifier_service.py
imports them at the top level, making per-fixture mocking impossible.
"""

import os
import json
import sys
from unittest.mock import patch, MagicMock, PropertyMock, mock_open

# ─── Mock torch & transformers at module level ────────────────────

_mock_torch = MagicMock()
_mock_torch.cuda = MagicMock()
_mock_torch.cuda.is_available.return_value = False

# torch.no_grad as context manager
_mock_no_grad = MagicMock()
_mock_no_grad.__enter__ = MagicMock(return_value=None)
_mock_no_grad.__exit__ = MagicMock(return_value=None)
_mock_torch.no_grad = MagicMock(return_value=_mock_no_grad)

# torch.device — return string for easy assertion
_mock_torch.device = MagicMock(side_effect=lambda x: f"device({x})")

# torch.max — will be configured per-test via the fixture
_mock_max_result = None  # module-level state; fixture overwrites it

def _max_side_effect(probs, dim):
    if _mock_max_result is not None:
        return _mock_max_result
    # Default fallback
    return (MagicMock(**{"item.return_value": 0.9}),
            MagicMock(**{"item.return_value": 0}))

_mock_torch.max = MagicMock(side_effect=_max_side_effect)

_mock_f = MagicMock()
_mock_f.softmax = MagicMock()

_mock_torch.nn = MagicMock()
_mock_torch.nn.functional = _mock_f

sys.modules["torch"] = _mock_torch
sys.modules["torch.nn"] = _mock_torch.nn
sys.modules["torch.nn.functional"] = _mock_f

_mock_transformers = MagicMock()
_mock_transformers.DistilBertTokenizerFast = MagicMock()
_mock_transformers.DistilBertForSequenceClassification = MagicMock()
sys.modules["transformers"] = _mock_transformers

# Now import the service under test
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))
from classifier_service import ClassifierService, PRIORITY_MAP, TEAM_MAP, AUTO_RESOLVE_SUBS
import classifier_service as cs_module


import pytest


# ─── Auto-cleanup for module-level sys.modules patches ──────────
# The module-level torch/transformers mocks persist for the entire
# session unless cleaned up. This autouse fixture restores them
# after each test to avoid polluting other test files.

_MOCKED_MODULES = ["torch", "torch.nn", "torch.nn.functional", "transformers"]
_ORIGINAL_MODULES = {m: sys.modules.get(m) for m in _MOCKED_MODULES}


@pytest.fixture(autouse=True)
def cleanup_module_mocks():
    """Restore sys.modules after each test to prevent mock pollution."""
    yield
    for mod_name in _MOCKED_MODULES:
        if mod_name in sys.modules and mod_name not in _ORIGINAL_MODULES or            _ORIGINAL_MODULES.get(mod_name) is None:
            sys.modules.pop(mod_name, None)
        elif _ORIGINAL_MODULES.get(mod_name) is not None:
            sys.modules[mod_name] = _ORIGINAL_MODULES[mod_name]


# ─── Helpers ──────────────────────────────────────────────────────

def _make_torch_max_result(confidence_val, label_idx):
    """Create the (confidence, pred_idx) tuple that torch.max returns."""
    global _mock_max_result
    c = MagicMock()
    c.item.return_value = confidence_val
    i = MagicMock()
    i.item.return_value = label_idx
    _mock_max_result = (c, i)


# ─── Fixtures ─────────────────────────────────────────────────────

@pytest.fixture
def service():
    """Create a fresh ClassifierService instance."""
    return ClassifierService()


@pytest.fixture
def predict_fixture(service):
    """Set up the service's model/tokenizer for prediction tests.

    Returns (service, pred_fn) where pred_fn(text, conf=0.95, idx=0)
    calls service.predict with controlled torch.max output.
    """
    service._loaded = True
    service.id2label = {"0": "Software | Application Crash"}
    service.label2id = {"Software | Application Crash": 0}

    service.tokenizer = MagicMock()
    service.tokenizer.return_value = {
        "input_ids": MagicMock(),
        "attention_mask": MagicMock(),
    }

    service.model = MagicMock()
    service.model.return_value.logits = MagicMock()

    def _predict(text, confidence_val=0.95, label_idx=0):
        _make_torch_max_result(confidence_val, label_idx)
        return service.predict(text)

    return service, _predict


# ─── Initialization Tests ─────────────────────────────────────────

class TestClassifierServiceInit:
    """Tests for ClassifierService initialization."""

    def test_init_defaults(self):
        """Service initializes with correct defaults."""
        svc = ClassifierService()
        assert svc.model is None
        assert svc.tokenizer is None
        assert svc.id2label is None
        assert svc.label2id is None
        assert svc._loaded is False

    def test_device_detection_cpu(self):
        """DEVICE defaults to CPU when CUDA is unavailable."""
        _mock_torch.cuda.is_available.return_value = False
        import importlib
        importlib.reload(cs_module)
        assert "cpu" in str(cs_module.DEVICE)

    def test_max_len_constant(self):
        """MAX_LEN is 128 as expected by the tokenizer."""
        assert cs_module.MAX_LEN == 128

    def test_save_dir_exists(self):
        """SAVE_DIR points to the models/classifier directory."""
        assert "models" in cs_module.SAVE_DIR
        assert "classifier" in cs_module.SAVE_DIR


# ─── Model Loading Tests ──────────────────────────────────────────

class TestClassifierLoad:
    """Tests for ClassifierService.load()."""

    def test_load_model_not_found(self, service):
        """Loading raises FileNotFoundError when model file is missing."""
        with patch("os.path.exists", return_value=False):
            with pytest.raises(FileNotFoundError) as exc:
                service.load()
            assert "Classifier model not found" in str(exc.value)

    def test_load_success(self, service):
        """Loading proceeds successfully when model files exist."""
        with patch("os.path.exists", return_value=True):
            with patch("builtins.open", mock_open(read_data='{"0": "Software | Crash"}')):
                with patch("json.load", return_value={"0": "Software | Crash"}):
                    service.load()
                    assert service._loaded is True
                    assert service.tokenizer is not None
                    assert service.model is not None

    def test_load_idempotent(self, service):
        """Calling load() twice does not reload the model."""
        with patch("os.path.exists", return_value=True):
            with patch("builtins.open", mock_open(read_data="{}")):
                with patch("json.load", return_value={}):
                    service.load()
                    first_tokenizer = service.tokenizer
                    service.load()  # Second call is a no-op
                    assert service.tokenizer is first_tokenizer

    def test_load_label_mapping_files(self, service):
        """load() reads id2label.json and label2id.json."""
        id2label = {"0": "Software | Application Crash"}
        label2id = {"Software | Application Crash": 0}

        with patch("os.path.exists", return_value=True):
            with patch("json.load") as mock_json_load:
                mock_json_load.side_effect = [id2label, label2id]
                service.load()
                assert service.id2label == id2label
                assert service.label2id == label2id

    def test_load_invalid_label_format(self, service):
        """load() raises JSONDecodeError for invalid label files."""
        with patch("os.path.exists", return_value=True):
            with patch("json.load", side_effect=json.JSONDecodeError("", "", 0)):
                with pytest.raises(json.JSONDecodeError):
                    service.load()


# ─── Prediction Tests ─────────────────────────────────────────────

class TestClassifierPredict:
    """Tests for ClassifierService.predict()."""

    def test_predict_basic(self, predict_fixture):
        """predict() returns all expected fields."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Software | Application Crash"}
        result = predict("My application crashed again")
        assert result["category"] == "Software"
        assert result["subcategory"] == "Application Crash"
        assert result["priority"] == "High"
        assert result["auto_resolve"] is False
        assert result["assigned_team"] == "Application Support"
        assert result["confidence"] == 0.95

    def test_predict_unknown_label(self, predict_fixture):
        """predict() handles labels not in id2label with 'Unknown' fallback."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Known | Label"}
        result = predict("Some random text", label_idx=999)
        assert result["category"] == "Unknown"
        assert result["subcategory"] == "Unknown"

    @pytest.mark.parametrize("text", [None, "", "   "])
    def test_predict_empty_text_raises(self, predict_fixture, text):
        """predict() rejects missing or whitespace-only text at the boundary."""
        _svc, predict = predict_fixture

        with pytest.raises(ValueError, match="Classifier input text must not be empty"):
            predict(text)

    def test_predict_oversized_text(self, predict_fixture):
        """predict() handles very long input without crashing."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Software | Bug"}
        long_text = "error " * 5000
        result = predict(long_text.strip(), confidence_val=0.85)
        assert result["category"] == "Software"
        assert 0 <= result["confidence"] <= 1

    def test_predict_non_string_type_raises(self, predict_fixture):
        """predict() raises error for non-string input types."""
        _svc, predict = predict_fixture
        with pytest.raises((TypeError, ValueError)):
            predict(12345)
        with pytest.raises((TypeError, ValueError)):
            predict(["hello", "world"])

    def test_predict_auto_resolve_subcategories(self, predict_fixture):
        """predict() marks auto_resolve=True for known simple issues."""
        svc, make_pred = predict_fixture

        cases = [
            ("Password Reset", True),
            ("Account Unlock", True),
            ("Software Install", True),
            ("WiFi Issue", True),
            ("Printer Error", True),
            ("Application Crash", False),
            ("Hardware Failure", False),
        ]

        for idx, (sub, expected) in enumerate(cases):
            svc.id2label = {str(idx): f"Test | {sub}"}
            result = make_pred(f"Need {sub.lower()}", label_idx=idx)
            assert result["auto_resolve"] == expected, f"Failed for {sub}"

    def test_predict_calls_tokenizer_with_text(self, predict_fixture):
        """predict() passes the input text to the tokenizer."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Test | Case"}
        result = predict("Reset my password please")
        svc.tokenizer.assert_called_once()
        call_text = svc.tokenizer.call_args[0][0]
        assert call_text == "Reset my password please"


# ─── Mapping Tests ────────────────────────────────────────────────

class TestClassifierMappings:
    """Tests for priority and team mapping constants."""

    def test_priority_map_all_valid_levels(self):
        """All subcategories have a defined priority level."""
        for sub, priority in PRIORITY_MAP.items():
            assert priority in ("Critical", "High", "Medium", "Low"), \
                f"{sub} has unexpected priority {priority}"

    def test_priority_critical_subcategories(self):
        """Critical subcategories are correctly mapped."""
        for sub in ["Blue Screen", "Overheating", "Data Loss", "Hardware Failure"]:
            assert PRIORITY_MAP[sub] == "Critical"

    def test_team_map_valid_values(self):
        """All team mappings return valid team names."""
        assert TEAM_MAP["Access"] == "IAM Team"
        assert TEAM_MAP["Network"] == "Network Support"
        assert TEAM_MAP["Software"] == "Application Support"
        assert TEAM_MAP["Hardware"] == "Hardware Support"

    def test_unknown_category_default_team(self):
        """Unknown category returns 'General Support' as default."""
        assert TEAM_MAP.get("Unknown", "General Support") == "General Support"

    def test_auto_resolve_subcategories_set(self):
        """Auto-resolve subcategories match the expected set."""
        expected = {"Password Reset", "Account Unlock", "Software Install",
                    "WiFi Issue", "Printer Error", "Monitor Problem"}
        assert AUTO_RESOLVE_SUBS == expected

    def test_priority_map_count(self):
        """PRIORITY_MAP has a reasonable number of entries."""
        assert len(PRIORITY_MAP) >= 25


# ─── Regex Override Tests ─────────────────────────────────────────

class TestRegexOverride:
    """Tests for the keyword-based regex override layer in predict()."""

    def test_keyword_network_boost(self, predict_fixture):
        """Network keywords boost category from General to Network."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "General | Unknown"}
        result = predict("The DNS firewall is blocking our VPN connection",
                         confidence_val=0.60)
        assert result["category"] == "Network"

    def test_keyword_software_boost(self, predict_fixture):
        """Software keywords boost category from General to Software."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "General | Unknown"}
        result = predict("The production database is crashing with SQL errors",
                         confidence_val=0.70)
        assert result["category"] == "Software"

    def test_keyword_access_boost(self, predict_fixture):
        """Access keywords boost category from General to Access."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "General | Unknown"}
        result = predict("Cannot login with MFA authentication",
                         confidence_val=0.50)
        assert result["category"] == "Access"

    def test_keyword_skip_when_high_confidence(self, predict_fixture):
        """Keywords do not override if model confidence >= 0.9."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Hardware | Laptop Issue"}
        result = predict("Network connection keeps dropping while using laptop",
                         confidence_val=0.95)
        assert result["category"] == "Hardware"

    def test_keyword_case_insensitive(self, predict_fixture):
        """Keyword matching is case-insensitive."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "General | Unknown"}
        result = predict("VPN CONNECTION FAILED", confidence_val=0.60)
        assert result["category"] == "Network"

    def test_keyword_confidence_boost(self, predict_fixture):
        """Keyword match sets confidence to exactly 0.85."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "General | Unknown"}
        result = predict("DNS connection lost", confidence_val=0.60)
        assert result["confidence"] == 0.85

    def test_no_false_positive_keyword(self, predict_fixture):
        """Text without keywords doesn't trigger override."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "General | Printer Error"}
        result = predict("The weather is nice today", confidence_val=0.95)
        assert result["category"] == "General"

    def test_keyword_does_not_override_network(self, predict_fixture):
        """Specific cat stays when model is confident enough."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Network | WiFi Issue"}
        result = predict("Having trouble with my password login wifi",
                         confidence_val=0.99)
        assert result["category"] == "Network"


# ─── Confidence & Edge Case Tests ────────────────────────────────

class TestClassifierConfidence:
    """Tests for confidence scoring and edge cases."""

    def test_confidence_range(self, predict_fixture):
        """Confidence values are always between 0 and 1."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Software | Bug"}
        for conf in [0.0, 0.25, 0.5, 0.75, 1.0]:
            result = predict(f"Test {conf}", confidence_val=conf)
            assert 0 <= result["confidence"] <= 1
            assert result["confidence"] == conf

    def test_predict_with_special_characters(self, predict_fixture):
        """predict() handles special characters in input text."""
        svc, predict = predict_fixture
        svc.id2label = {"0": "Software | Bug"}
        result = predict("Error #404: page not found! (urgent) <test>",
                         confidence_val=0.85)
        assert result["category"] == "Software"
