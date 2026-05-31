import pytest
from unittest.mock import patch, MagicMock
from services.classifier_service import (
    ClassifierService,
    PRIORITY_MAP,
    TEAM_MAP,
    AUTO_RESOLVE_SUBS,
)


class TestClassifierService:
    def setup_method(self):
        self.service = ClassifierService()

    def test_priority_map_coverage(self):
        assert "Blue Screen" in PRIORITY_MAP
        assert PRIORITY_MAP["Blue Screen"] == "Critical"
        assert "Password Reset" in PRIORITY_MAP
        assert "Printer Error" in PRIORITY_MAP

    @patch("services.classifier_service.DistilBertTokenizerFast.from_pretrained")
    @patch("services.classifier_service.DistilBertForSequenceClassification.from_pretrained")
    @patch("services.classifier_service.os.path.exists")
    @patch("builtins.open")
    def test_priority_derivation(self, mock_open, mock_exists, mock_model, mock_tokenizer, tmp_path):
        id2label = {"0": "Network | VPN Connection"}
        label2id = {"Network | VPN Connection": 0}
        mock_open.return_value.__enter__.return_value.read.side_effect = [
            str(id2label),
            str(label2id),
        ]
        mock_exists.return_value = True
        self.service.SAVE_DIR = str(tmp_path)

        with patch("services.classifier_service.torch.no_grad"):
            with patch("services.classifier_service.F.softmax") as mock_softmax:
                probs = MagicMock()
                probs.max.return_value = (MagicMock(), MagicMock())
                probs.max.return_value[0].item.return_value = 0.95
                probs.max.return_value[1].item.return_value = 0
                mock_softmax.return_value = probs

                self.service.load()

    @patch("services.classifier_service.DistilBertTokenizerFast.from_pretrained")
    @patch("services.classifier_service.DistilBertForSequenceClassification.from_pretrained")
    @patch("services.classifier_service.os.path.exists")
    @patch("builtins.open")
    def test_predict_returns_required_keys(self, mock_open, mock_exists, mock_model, mock_tokenizer, tmp_path):
        id2label = {"0": "Network | VPN Connection"}
        label2id = {"Network | VPN Connection": 0}
        mock_open.return_value.__enter__.return_value.read.side_effect = [
            str(id2label),
            str(label2id),
        ]
        mock_exists.return_value = True
        self.service.SAVE_DIR = str(tmp_path)

        mock_tokenizer.return_value = MagicMock()
        mock_model.return_value = MagicMock()

        with patch("services.classifier_service.torch.no_grad"):
            with patch("services.classifier_service.F.softmax") as mock_softmax:
                probs = MagicMock()
                probs.max.return_value = (MagicMock(), MagicMock())
                probs.max.return_value[0].item.return_value = 0.95
                probs.max.return_value[1].item.return_value = 0
                mock_softmax.return_value = probs

                self.service.load()

                tokenizer_instance = mock_tokenizer.return_value
                encoding = {"input_ids": MagicMock(), "attention_mask": MagicMock()}
                tokenizer_instance.return_value = encoding

                result = self.service.predict("VPN connection is down")

                assert "category" in result
                assert "subcategory" in result
                assert "priority" in result
                assert "auto_resolve" in result
                assert "assigned_team" in result
                assert "confidence" in result

    def test_auto_resolve_subcategories(self):
        assert "Password Reset" in AUTO_RESOLVE_SUBS
        assert "Account Unlock" in AUTO_RESOLVE_SUBS
        assert "Blue Screen" not in AUTO_RESOLVE_SUBS

    def test_team_map_coverage(self):
        assert TEAM_MAP["Access"] == "IAM Team"
        assert TEAM_MAP["Network"] == "Network Support"
        assert TEAM_MAP["Software"] == "Application Support"
        assert TEAM_MAP["Hardware"] == "Hardware Support"

    def test_priority_map_all_values_are_valid(self):
        valid_priorities = {"Critical", "High", "Medium", "Low"}
        for subcategory, priority in PRIORITY_MAP.items():
            assert priority in valid_priorities, f"{subcategory} has invalid priority {priority}"

    def test_team_map_categories_exist_in_priority_map(self):
        priority_subcategories = set(PRIORITY_MAP.keys())
        for team_category in TEAM_MAP:
            subs = [s for s in priority_subcategories]
            assert team_category in ["Access", "Network", "Software", "Hardware"]
