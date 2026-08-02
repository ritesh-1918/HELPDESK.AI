"""
Unit tests for NER Service.
Issue: #1150
"""

import os
import sys
import unittest
from unittest.mock import Mock, patch, MagicMock

# Mock torch and transformers before import
sys.modules["torch"] = Mock()
sys.modules["torch.nn.functional"] = Mock()
sys.modules["torch.cuda"] = Mock()
sys.modules["torch.cuda"].is_available.return_value = False
sys.modules["transformers"] = Mock()

sys.modules["dotenv"] = Mock()
sys.modules["dotenv"].load_dotenv = Mock()

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.services.ner_service import NERService, REGEX_PATTERNS


class TestNERServiceInit(unittest.TestCase):
    """Test NERService initialization."""

    def test_init_not_loaded(self):
        service = NERService()
        self.assertFalse(service._loaded)
        self.assertIsNone(service.model)
        self.assertIsNone(service.tokenizer)
        self.assertIsNone(service.id2label)
        self.assertIsNone(service.label2id)


class TestCleanLabel(unittest.TestCase):
    """Test _clean_label method."""

    def setUp(self):
        self.service = NERService()

    def test_clean_label_o(self):
        result = self.service._clean_label("O")
        self.assertEqual(result, ("O", ""))

    def test_clean_label_b_app_name(self):
        result = self.service._clean_label("B-B-APP_NAME")
        self.assertEqual(result, ("B", "APP_NAME"))

    def test_clean_label_i_app_name(self):
        result = self.service._clean_label("I-B-APP_NAME")
        self.assertEqual(result, ("I", "APP_NAME"))

    def test_clean_label_b_simple(self):
        result = self.service._clean_label("B-APP_NAME")
        self.assertEqual(result, ("B", "APP_NAME"))

    def test_clean_label_i_simple(self):
        result = self.service._clean_label("I-APP_NAME")
        self.assertEqual(result, ("I", "APP_NAME"))

    def test_clean_label_unknown(self):
        result = self.service._clean_label("X-UNKNOWN")
        self.assertEqual(result, ("O", ""))


class TestRegexPatterns(unittest.TestCase):
    """Test REGEX_PATTERNS extraction."""

    def test_ip_address_pattern(self):
        import re
        text = "Server IP is 192.168.1.1"
        matches = list(re.finditer(REGEX_PATTERNS["IP_ADDRESS"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)

    def test_hostname_pattern(self):
        import re
        text = "Hostname is srv-web-01"
        matches = list(re.finditer(REGEX_PATTERNS["HOSTNAME"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)

    def test_vlan_pattern(self):
        import re
        text = "VLAN 100 is configured"
        matches = list(re.finditer(REGEX_PATTERNS["VLAN"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)

    def test_database_pattern(self):
        import re
        text = "SQL database error"
        matches = list(re.finditer(REGEX_PATTERNS["DATABASE"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)

    def test_network_error_pattern(self):
        import re
        text = "Connection failed to server"
        matches = list(re.finditer(REGEX_PATTERNS["NETWORK_ERROR"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)

    def test_login_issue_pattern(self):
        import re
        text = "authentication failed for user"
        matches = list(re.finditer(REGEX_PATTERNS["LOGIN_ISSUE"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)

    def test_browser_pattern(self):
        import re
        text = "Issue in Chrome browser"
        matches = list(re.finditer(REGEX_PATTERNS["BROWSER"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)

    def test_system_pattern(self):
        import re
        text = "Production instance down"
        matches = list(re.finditer(REGEX_PATTERNS["SYSTEM"], text, re.IGNORECASE))
        self.assertTrue(len(matches) > 0)


class TestExtractEntitiesRegexOnly(unittest.TestCase):
    """Test extract_entities with regex fallback (no torch)."""

    def setUp(self):
        self.service = NERService()
        # Mock _loaded so load() is skipped
        self.service._loaded = True

    def test_extract_ip_address(self):
        text = "Server IP is 192.168.1.1"
        entities = self.service.extract_entities(text)
        ip_entities = [e for e in entities if e["label"] == "IP_ADDRESS"]
        self.assertTrue(len(ip_entities) > 0)
        self.assertEqual(ip_entities[0]["text"], "192.168.1.1")
        self.assertEqual(ip_entities[0]["confidence"], 0.99)

    def test_extract_hostname(self):
        text = "Hostname is srv-web-01"
        entities = self.service.extract_entities(text)
        host_entities = [e for e in entities if e["label"] == "HOSTNAME"]
        self.assertTrue(len(host_entities) > 0)

    def test_extract_vlan(self):
        text = "VLAN 100 is configured"
        entities = self.service.extract_entities(text)
        vlan_entities = [e for e in entities if e["label"] == "VLAN"]
        self.assertTrue(len(vlan_entities) > 0)

    def test_extract_database(self):
        text = "SQL database error occurred"
        entities = self.service.extract_entities(text)
        db_entities = [e for e in entities if e["label"] == "DATABASE"]
        self.assertTrue(len(db_entities) > 0)

    def test_extract_network_error(self):
        text = "Connection failed to remote server"
        entities = self.service.extract_entities(text)
        net_entities = [e for e in entities if e["label"] == "NETWORK_ERROR"]
        self.assertTrue(len(net_entities) > 0)

    def test_extract_login_issue(self):
        text = "authentication failed for user admin"
        entities = self.service.extract_entities(text)
        login_entities = [e for e in entities if e["label"] == "LOGIN_ISSUE"]
        self.assertTrue(len(login_entities) > 0)

    def test_extract_browser(self):
        text = "Issue in Chrome browser"
        entities = self.service.extract_entities(text)
        browser_entities = [e for e in entities if e["label"] == "BROWSER"]
        self.assertTrue(len(browser_entities) > 0)

    def test_extract_system(self):
        text = "Production instance is down"
        entities = self.service.extract_entities(text)
        sys_entities = [e for e in entities if e["label"] == "SYSTEM"]
        self.assertTrue(len(sys_entities) > 0)

    def test_extract_multiple_entities(self):
        text = "Server 192.168.1.1 (srv-web-01) has VLAN 100 and SQL database error in Chrome"
        entities = self.service.extract_entities(text)
        self.assertTrue(len(entities) >= 4)

    def test_empty_text(self):
        entities = self.service.extract_entities("")
        self.assertEqual(entities, [])

    def test_whitespace_text(self):
        entities = self.service.extract_entities("   ")
        self.assertEqual(entities, [])

    def test_no_entities(self):
        text = "Hello world this is a normal sentence"
        entities = self.service.extract_entities(text)
        # Should return empty or only regex matches if any
        self.assertIsInstance(entities, list)

    def test_duplicate_avoidance(self):
        text = "IP 192.168.1.1 and again 192.168.1.1"
        entities = self.service.extract_entities(text)
        ip_entities = [e for e in entities if e["label"] == "IP_ADDRESS"]
        # Should not duplicate
        self.assertEqual(len(ip_entities), 1)

    def test_confidence_for_regex(self):
        text = "IP is 10.0.0.1"
        entities = self.service.extract_entities(text)
        ip_entities = [e for e in entities if e["label"] == "IP_ADDRESS"]
        self.assertEqual(ip_entities[0]["confidence"], 0.99)


class TestLoadMethod(unittest.TestCase):
    """Test load method behavior."""

    def test_load_skips_if_already_loaded(self):
        service = NERService()
        service._loaded = True
        # Should not raise even without torch
        service.load()
        self.assertTrue(service._loaded)

    def test_load_without_torch(self):
        service = NERService()
        service._loaded = False
        # Mock _HAS_TORCH = False scenario
        with patch("backend.services.ner_service._HAS_TORCH", False):
            service.load()
            self.assertFalse(service._loaded)

    def test_load_raises_if_model_missing(self):
        service = NERService()
        service._loaded = False
        with patch("backend.services.ner_service._HAS_TORCH", True):
            with patch("os.path.exists", return_value=False):
                with self.assertRaises(FileNotFoundError):
                    service.load()


class TestLoadWithMockModel(unittest.TestCase):
    """Test load with mocked model files."""

    def setUp(self):
        self.service = NERService()
        self.service._loaded = False

    @patch("backend.services.ner_service._HAS_TORCH", True)
    @patch("os.path.exists", return_value=True)
    @patch("builtins.open")
    @patch("json.load")
    @patch("backend.services.ner_service.DistilBertTokenizerFast")
    @patch("backend.services.ner_service.DistilBertForTokenClassification")
    def test_load_success(self, mock_model_class, mock_tokenizer_class, mock_json_load, mock_open, mock_exists):
        mock_json_load.side_effect = [
            {"0": "O", "1": "B-B-APP_NAME"},  # id2label
            {"O": 0, "B-B-APP_NAME": 1}       # label2id
        ]
        mock_tokenizer = Mock()
        mock_tokenizer_class.from_pretrained.return_value = mock_tokenizer
        mock_model = Mock()
        mock_model_class.from_pretrained.return_value = mock_model
        
        self.service.load()
        self.assertTrue(self.service._loaded)
        self.assertIsNotNone(self.service.tokenizer)
        self.assertIsNotNone(self.service.model)


if __name__ == "__main__":
    unittest.main(verbosity=2)
