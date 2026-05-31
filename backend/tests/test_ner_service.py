import pytest
from unittest.mock import patch, MagicMock, PropertyMock


class TestCleanLabel:
    def test_returns_o_for_o_label(self):
        from services.ner_service import NERService
        service = NERService()
        bio, entity = service._clean_label("O")
        assert bio == "O"
        assert entity == ""

    def test_parses_bb_prefix(self):
        from services.ner_service import NERService
        service = NERService()
        bio, entity = service._clean_label("B-B-APP_NAME")
        assert bio == "B"
        assert entity == "APP_NAME"

    def test_parses_ib_prefix(self):
        from services.ner_service import NERService
        service = NERService()
        bio, entity = service._clean_label("I-B-APP_NAME")
        assert bio == "I"
        assert entity == "APP_NAME"

    def test_parses_b_prefix(self):
        from services.ner_service import NERService
        service = NERService()
        bio, entity = service._clean_label("B-PERSON")
        assert bio == "B"
        assert entity == "PERSON"

    def test_parses_i_prefix(self):
        from services.ner_service import NERService
        service = NERService()
        bio, entity = service._clean_label("I-PERSON")
        assert bio == "I"
        assert entity == "PERSON"

    def test_returns_o_for_unknown_format(self):
        from services.ner_service import NERService
        service = NERService()
        bio, entity = service._clean_label("XYZ")
        assert bio == "O"
        assert entity == ""


class TestRegexPatterns:
    def test_ip_address_pattern_matches(self):
        from services.ner_service import REGEX_PATTERNS
        import re
        pattern = REGEX_PATTERNS["IP_ADDRESS"]
        assert re.search(pattern, "IP is 192.168.1.1")
        assert re.search(pattern, "IP Address: 10.0.0.1")

    def test_hostname_pattern_matches(self):
        from services.ner_service import REGEX_PATTERNS
        import re
        pattern = REGEX_PATTERNS["HOSTNAME"]
        assert re.search(pattern, "srv-web-01")
        assert re.search(pattern, "Hostname: db-master")

    def test_network_error_pattern_matches(self):
        from services.ner_service import REGEX_PATTERNS
        import re
        pattern = REGEX_PATTERNS["NETWORK_ERROR"]
        assert re.search(pattern, "Connection failed")
        assert re.search(pattern, "Network issues reported")

    def test_login_issue_pattern_matches(self):
        from services.ner_service import REGEX_PATTERNS
        import re
        pattern = REGEX_PATTERNS["LOGIN_ISSUE"]
        assert re.search(pattern, "login error")
        assert re.search(pattern, "authentication failed")

    def test_database_pattern_matches(self):
        from services.ner_service import REGEX_PATTERNS
        import re
        pattern = REGEX_PATTERNS["DATABASE"]
        assert re.search(pattern, "SQL query failed")
        assert re.search(pattern, "Postgres connection")

    def test_browser_pattern_matches(self):
        from services.ner_service import REGEX_PATTERNS
        import re
        pattern = REGEX_PATTERNS["BROWSER"]
        assert re.search(pattern, "Chrome")
        assert re.search(pattern, "Firefox")


@pytest.fixture
def mock_service():
    """Create NERService with mocked torch dependencies."""
    with patch("services.ner_service._HAS_TORCH", True), \
         patch("services.ner_service.torch") as mock_torch, \
         patch("services.ner_service.F") as mock_F, \
         patch("services.ner_service.DistilBertTokenizerFast"), \
         patch("services.ner_service.DistilBertForTokenClassification"), \
         patch("os.path.exists", return_value=True), \
         patch("builtins.open", MagicMock()):
        import json
        import services.ner_service as ns
        service = ns.NERService()
        service.id2label = {
            "0": "O", "1": "B-B-APP_NAME", "2": "I-B-APP_NAME"
        }
        service.model = MagicMock()
        yield service


class TestNERServiceLoad:
    def test_load_returns_early_if_already_loaded(self):
        from services.ner_service import NERService
        service = NERService()
        service._loaded = True
        service.load()
        assert service._loaded is True

    def test_load_returns_early_if_no_torch(self):
        with patch("services.ner_service._HAS_TORCH", False):
            from services.ner_service import NERService
            service = NERService()
            service.load()
            assert service._loaded is False


class TestNERServiceInit:
    def test_init_sets_defaults(self):
        from services.ner_service import NERService
        service = NERService()
        assert service.model is None
        assert service.tokenizer is None
        assert service._loaded is False

    def test_save_dir_is_absolute_path(self):
        from services.ner_service import SAVE_DIR
        assert SAVE_DIR.startswith("/")
        assert "ner" in SAVE_DIR

    def test_device_is_none_when_no_torch(self):
        from services.ner_service import DEVICE
        import torch
        if torch is None:
            assert DEVICE is None
