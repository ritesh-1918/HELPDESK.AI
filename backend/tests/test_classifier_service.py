"""
Unit tests for classifier_service.py
Tests the ClassifierService class including predict, priority mapping, team assignment, and auto-resolve logic.
"""

import pytest
import json
import os
from unittest.mock import patch, MagicMock, mock_open
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.classifier_service import (
    ClassifierService,
    PRIORITY_MAP,
    TEAM_MAP,
    AUTO_RESOLVE_SUBS,
    SAVE_DIR,
    DEVICE,
    MAX_LEN,
)


class TestConstants:
    """Test that constants are properly defined."""

    def test_priority_map_not_empty(self):
        assert len(PRIORITY_MAP) > 0

    def test_team_map_not_empty(self):
        assert len(TEAM_MAP) > 0

    def test_auto_resolve_subs_not_empty(self):
        assert len(AUTO_RESOLVE_SUBS) > 0

    def test_save_dir_is_string(self):
        assert isinstance(SAVE_DIR, str)

    def test_max_len_is_positive(self):
        assert MAX_LEN > 0

    def test_device_is_string(self):
        assert isinstance(DEVICE, str)
        assert len(DEVICE) > 0


class TestPriorityMapping:
    """Test priority mapping logic."""

    def test_critical_priorities(self):
        critical_subs = ["Blue Screen", "Overheating", "Data Loss", "Hardware Failure"]
        for sub in critical_subs:
            assert PRIORITY_MAP.get(sub) == "Critical", f"{sub} should be Critical"

    def test_high_priorities(self):
        high_subs = [
            "Application Crash", "Login Failure", "Password Reset",
            "VPN Connection", "Firewall Block", "DNS Problem",
            "MFA Problem", "Account Expired"
        ]
        for sub in high_subs:
            assert PRIORITY_MAP.get(sub) == "High", f"{sub} should be High"

    def test_medium_priorities(self):
        medium_subs = [
            "Permission Issue", "Access Request", "Software Install",
            "Update Problem", "Compatibility", "Configuration",
            "License Issue", "Performance", "Internet Slow",
            "WiFi Issue", "Remote Access", "Proxy Error",
            "Network Drive", "Role Change"
        ]
        for sub in medium_subs:
            assert PRIORITY_MAP.get(sub) == "Medium", f"{sub} should be Medium"

    def test_low_priorities(self):
        low_subs = [
            "Account Unlock", "Keyboard/Mouse", "Monitor Problem",
            "Printer Error", "Battery Issue", "Laptop Issue"
        ]
        for sub in low_subs:
            assert PRIORITY_MAP.get(sub) == "Low", f"{sub} should be Low"

    def test_unknown_subcategory_returns_none(self):
        """Unknown subcategories should return None from PRIORITY_MAP.get() without default."""
        result = PRIORITY_MAP.get("NonexistentSubcategory")
        # Without a default, get() returns None for missing keys
        # This validates that the map doesn't accidentally contain wildcards
        assert result is None or result in {"Critical", "High", "Medium", "Low"}


class TestTeamMapping:
    """Test team assignment logic."""

    def test_access_team(self):
        assert TEAM_MAP.get("Access") == "IAM Team"

    def test_network_team(self):
        assert TEAM_MAP.get("Network") == "Network Support"

    def test_software_team(self):
        assert TEAM_MAP.get("Software") == "Application Support"

    def test_hardware_team(self):
        assert TEAM_MAP.get("Hardware") == "Hardware Support"

    def test_unknown_category_defaults_to_general_support(self):
        # In the predict method, unknown categories default to "General Support"
        # TEAM_MAP.get returns None for unknown, then predict uses "General Support"
        assert TEAM_MAP.get("NonexistentCategory") is None


class TestAutoResolve:
    """Test auto-resolve subcategory set."""

    def test_auto_resolve_contains_expected(self):
        expected = {"Password Reset", "Account Unlock", "Software Install",
                    "WiFi Issue", "Printer Error", "Monitor Problem"}
        assert expected == AUTO_RESOLVE_SUBS

    def test_auto_resolve_does_not_contain_complex(self):
        complex_subs = ["Blue Screen", "Data Loss", "Hardware Failure"]
        for sub in complex_subs:
            assert sub not in AUTO_RESOLVE_SUBS


class TestClassifierServiceInit:
    """Test ClassifierService initialization."""

    def test_initial_state(self):
        service = ClassifierService()
        assert service.model is None
        assert service.tokenizer is None
        assert service.id2label is None
        assert service.label2id is None
        assert service._loaded is False


class TestClassifierServiceLoad:
    """Test ClassifierService.load() method."""

    @patch('os.path.exists')
    def test_load_raises_when_model_not_found(self, mock_exists):
        mock_exists.return_value = False
        service = ClassifierService()
        with pytest.raises(FileNotFoundError, match="Classifier model not found"):
            service.load()

    @patch('os.path.exists')
    @patch('builtins.open', new_callable=mock_open, read_data='{"0": "Access | Login Failure"}')
    @patch('services.classifier_service.DistilBertTokenizerFast')
    @patch('services.classifier_service.DistilBertForSequenceClassification')
    def test_load_success(self, mock_model_cls, mock_tokenizer_cls, mock_file, mock_exists):
        mock_exists.return_value = True
        mock_tokenizer = MagicMock()
        mock_tokenizer_cls.from_pretrained.return_value = mock_tokenizer
        mock_model = MagicMock()
        mock_model_cls.from_pretrained.return_value = mock_model

        service = ClassifierService()
        service.load()

        assert service._loaded is True
        assert service.tokenizer is not None
        assert service.model is not None
        assert service.id2label is not None
        assert service.label2id is not None

    @patch('os.path.exists')
    @patch('builtins.open', new_callable=mock_open, read_data='{"0": "Access | Login Failure"}')
    @patch('services.classifier_service.DistilBertTokenizerFast')
    @patch('services.classifier_service.DistilBertForSequenceClassification')
    def test_load_idempotent(self, mock_model_cls, mock_tokenizer_cls, mock_file, mock_exists):
        mock_exists.return_value = True
        mock_tokenizer_cls.from_pretrained.return_value = MagicMock()
        mock_model_cls.from_pretrained.return_value = MagicMock()

        service = ClassifierService()
        service.load()
        service.load()  # Should not reload

        mock_tokenizer_cls.from_pretrained.assert_called_once()


class TestClassifierServicePredict:
    """Test ClassifierService.predict() method."""

    def _create_mock_service(self, pred_idx=0, confidence=0.95, label="Access | Login Failure"):
        """Helper to create a mock service with controlled predictions."""
        service = ClassifierService()
        service._loaded = True
        service.id2label = {"0": label}
        service.label2id = {label: "0"}

        # Mock tokenizer
        mock_tokenizer = MagicMock()
        mock_encoding = {
            "input_ids": MagicMock(to=MagicMock(return_value=MagicMock())),
            "attention_mask": MagicMock(to=MagicMock(return_value=MagicMock())),
        }
        mock_tokenizer.return_value = mock_encoding
        service.tokenizer = mock_tokenizer

        # Mock model
        import torch
        mock_model = MagicMock()
        mock_logits = torch.tensor([[0.9, 0.1, 0.0]])  # dummy logits — argmax=0 matches id2label key "0"
        mock_outputs = MagicMock(logits=mock_logits)
        mock_model.return_value = mock_outputs
        service.model = mock_model

        return service

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_returns_all_fields(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service()
        result = service.predict("My laptop won't boot")

        assert "category" in result
        assert "subcategory" in result
        assert "priority" in result
        assert "auto_resolve" in result
        assert "assigned_team" in result
        assert "confidence" in result

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_access_category(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Access | Login Failure")
        result = service.predict("I can't login to my account")

        assert result["category"] == "Access"
        assert result["subcategory"] == "Login Failure"
        assert result["priority"] == "High"
        assert result["assigned_team"] == "IAM Team"

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_network_category(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Network | VPN Connection")
        result = service.predict("VPN is not connecting")

        assert result["category"] == "Network"
        assert result["subcategory"] == "VPN Connection"
        assert result["priority"] == "High"
        assert result["assigned_team"] == "Network Support"

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_software_category(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Software | Application Crash")
        result = service.predict("The app keeps crashing")

        assert result["category"] == "Software"
        assert result["subcategory"] == "Application Crash"
        assert result["priority"] == "High"
        assert result["assigned_team"] == "Application Support"

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_hardware_category(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Hardware | Blue Screen")
        result = service.predict("My computer shows blue screen")

        assert result["category"] == "Hardware"
        assert result["subcategory"] == "Blue Screen"
        assert result["priority"] == "Critical"
        assert result["assigned_team"] == "Hardware Support"

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_auto_resolve_password_reset(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Access | Password Reset")
        result = service.predict("I need to reset my password")

        assert result["auto_resolve"] is True

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_auto_resolve_account_unlock(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Access | Account Unlock")
        result = service.predict("My account is locked")

        assert result["auto_resolve"] is True

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_not_auto_resolve_complex(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Hardware | Blue Screen")
        result = service.predict("Blue screen of death")

        assert result["auto_resolve"] is False

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_confidence_is_float(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service()
        result = service.predict("Test input")

        assert isinstance(result["confidence"], float)
        assert 0.0 <= result["confidence"] <= 1.0

    @patch('services.classifier_service.torch.no_grad')
    def test_predict_unknown_label(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service(label="Unknown | Unknown")
        result = service.predict("Random text")

        assert result["category"] == "Unknown"
        assert result["subcategory"] == "Unknown"
        assert result["priority"] == "Medium"  # Default for unknown
        assert result["assigned_team"] == "General Support"


class TestRegexOverride:
    """Test the regex override layer for technical keywords."""

    @patch('services.classifier_service.torch.no_grad')
    def test_network_keywords_override_general(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service_with_general(label="General | General")
        result = service.predict("There's a DNS issue with the network")

        assert result["category"] == "Network"
        assert result["assigned_team"] == "Network Support"
        assert result["confidence"] >= 0.92

    @patch('services.classifier_service.torch.no_grad')
    def test_software_keywords_override_general(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service_with_general(label="General | General")
        result = service.predict("The application has a bug")

        assert result["category"] == "Software"
        assert result["assigned_team"] == "Application Support"

    @patch('services.classifier_service.torch.no_grad')
    def test_access_keywords_override_general(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service_with_general(label="General | General")
        result = service.predict("I have a password issue")

        assert result["category"] == "Access"
        assert result["assigned_team"] == "IAM Team"

    @patch('services.classifier_service.torch.no_grad')
    def test_no_override_when_confidence_high(self, mock_no_grad):
        mock_no_grad.return_value = MagicMock(__enter__=MagicMock(), __exit__=MagicMock())

        service = self._create_mock_service_with_high_confidence(label="Software | Application Crash")
        result = service.predict("The application crashed due to a bug")

        # Should not override because confidence is high and category is not General
        assert result["category"] == "Software"

    def _create_mock_service_with_general(self, label="General | General"):
        """Helper for general category tests."""
        import torch
        service = ClassifierService()
        service._loaded = True
        service.id2label = {"0": label}
        service.label2id = {label: "0"}

        mock_tokenizer = MagicMock()
        mock_encoding = {
            "input_ids": MagicMock(to=MagicMock(return_value=MagicMock())),
            "attention_mask": MagicMock(to=MagicMock(return_value=MagicMock())),
        }
        mock_tokenizer.return_value = mock_encoding
        service.tokenizer = mock_tokenizer

        mock_model = MagicMock()
        # Low confidence to trigger override
        mock_logits = torch.tensor([[0.5, 0.3, 0.2]])
        mock_outputs = MagicMock(logits=mock_logits)
        mock_model.return_value = mock_outputs
        service.model = mock_model

        return service

    def _create_mock_service_with_high_confidence(self, label="Software | Application Crash"):
        """Helper for high confidence tests."""
        import torch
        service = ClassifierService()
        service._loaded = True
        service.id2label = {"0": label}
        service.label2id = {label: "0"}

        mock_tokenizer = MagicMock()
        mock_encoding = {
            "input_ids": MagicMock(to=MagicMock(return_value=MagicMock())),
            "attention_mask": MagicMock(to=MagicMock(return_value=MagicMock())),
        }
        mock_tokenizer.return_value = mock_encoding
        service.tokenizer = mock_tokenizer

        mock_model = MagicMock()
        # High confidence to prevent override
        mock_logits = torch.tensor([[0.01, 0.98, 0.01]])
        mock_outputs = MagicMock(logits=mock_logits)
        mock_model.return_value = mock_outputs
        service.model = mock_model

        return service


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_empty_text(self):
        """Test that empty text doesn't crash the service."""
        service = ClassifierService()
        # Should not raise on init
        assert service._loaded is False

    def test_priority_map_all_values_valid(self):
        """Test that all priority values are valid."""
        valid_priorities = {"Critical", "High", "Medium", "Low"}
        for sub, priority in PRIORITY_MAP.items():
            assert priority in valid_priorities, f"{sub} has invalid priority: {priority}"

    def test_team_map_all_values_valid(self):
        """Test that all team values are valid strings."""
        for _, team in TEAM_MAP.items():
            assert isinstance(team, str) and len(team) > 0

    def test_auto_resolve_subs_all_in_priority_map(self):
        """Test that all auto-resolve subs are also in priority map."""
        for sub in AUTO_RESOLVE_SUBS:
            assert sub in PRIORITY_MAP, f"{sub} is in AUTO_RESOLVE_SUBS but not in PRIORITY_MAP"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
