"""
Comprehensive unit tests for core backend services:
- KnowledgeGapService: low-confidence query logging and gap detection
- SpamService: phishing/spam heuristic detection
- rate_limit_config: rate limit parsing and configuration

Covers issue #1163: automated test suite for core controllers.
"""

import json
import os
import tempfile
import pytest
from unittest.mock import patch
from collections import Counter

# ---------------------------------------------------------------------------
# KnowledgeGapService tests
# ---------------------------------------------------------------------------
from backend.services.knowledge_gap_service import KnowledgeGapService


class TestKnowledgeGapServiceInit:
    """Tests for KnowledgeGapService initialization."""

    def test_default_storage_path(self):
        svc = KnowledgeGapService()
        assert svc.storage_path.endswith("knowledge_gaps.json")
        assert "data" in svc.storage_path

    def test_custom_storage_path(self, tmp_path):
        custom = str(tmp_path / "custom_gaps.json")
        svc = KnowledgeGapService(storage_path=custom)
        assert svc.storage_path == custom

    def test_gap_log_path_derived_from_default(self, tmp_path):
        custom = str(tmp_path / "data" / "gaps.json")
        svc = KnowledgeGapService(storage_path=custom)
        assert svc.gap_log_path.endswith("low_confidence_log.json")

    def test_creates_storage_directory(self, tmp_path):
        custom = str(tmp_path / "subdir" / "data" / "gaps.json")
        svc = KnowledgeGapService(storage_path=custom)
        assert os.path.isdir(os.path.dirname(custom))


class TestLogLowConfidenceQuery:
    """Tests for log_low_confidence_query method."""

    def test_creates_log_file_on_first_entry(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        svc.log_low_confidence_query("test query", 0.3, "Billing")

        assert os.path.exists(log_path)
        with open(log_path) as f:
            data = json.load(f)
        assert len(data) == 1
        assert data[0]["text"] == "test query"
        assert data[0]["confidence"] == 0.3
        assert data[0]["category"] == "Billing"
        assert "timestamp" in data[0]

    def test_appends_to_existing_log(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        svc.log_low_confidence_query("first", 0.4, "Tech")
        svc.log_low_confidence_query("second", 0.2, "Billing")

        with open(log_path) as f:
            data = json.load(f)
        assert len(data) == 2
        assert data[0]["text"] == "first"
        assert data[1]["text"] == "second"

    def test_caps_at_1000_entries(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        # Pre-populate with 1001 entries
        entries = [{"text": f"q{i}", "confidence": 0.3, "category": "Test", "timestamp": "2026-01-01T00:00:00Z"} for i in range(1001)]
        with open(log_path, "w") as f:
            json.dump(entries, f)

        svc.log_low_confidence_query("new_entry", 0.5, "New")

        with open(log_path) as f:
            data = json.load(f)
        assert len(data) == 1000
        assert data[-1]["text"] == "new_entry"
        assert data[0]["text"] == "q2"  # first two entries dropped (1002 -> keep last 1000)

    def test_handles_corrupt_json_gracefully(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        with open(log_path, "w") as f:
            f.write("{invalid json!!!")

        svc.log_low_confidence_query("recovery", 0.3, "Test")

        with open(log_path) as f:
            data = json.load(f)
        assert len(data) == 1
        assert data[0]["text"] == "recovery"

    def test_timestamp_format_is_iso8601(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        svc.log_low_confidence_query("test", 0.5, "Test")

        with open(log_path) as f:
            data = json.load(f)
        ts = data[0]["timestamp"]
        assert ts.endswith("Z")
        assert "T" in ts


class TestDetectGaps:
    """Tests for detect_gaps method."""

    def test_returns_empty_when_no_log_file(self, tmp_path):
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = str(tmp_path / "nonexistent.json")
        assert svc.detect_gaps() == []

    def test_returns_empty_when_log_is_empty(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        with open(log_path, "w") as f:
            json.dump([], f)

        assert svc.detect_gaps() == []

    def test_returns_empty_when_log_is_corrupt(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        with open(log_path, "w") as f:
            f.write("not json")

        assert svc.detect_gaps() == []

    def test_detects_gap_when_threshold_met(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        entries = [
            {"text": f"q{i}", "confidence": 0.3, "category": "Billing", "timestamp": "2026-01-01T00:00:00Z"}
            for i in range(5)
        ]
        with open(log_path, "w") as f:
            json.dump(entries, f)

        gaps = svc.detect_gaps()
        assert len(gaps) == 1
        assert gaps[0]["category"] == "Billing"
        assert gaps[0]["frequency"] == 5

    def test_ignores_categories_below_threshold(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        entries = [
            {"text": "q1", "confidence": 0.3, "category": "Rare", "timestamp": "2026-01-01T00:00:00Z"},
            {"text": "q2", "confidence": 0.3, "category": "Rare", "timestamp": "2026-01-01T00:00:00Z"},
        ]
        with open(log_path, "w") as f:
            json.dump(entries, f)

        gaps = svc.detect_gaps()
        assert len(gaps) == 0

    def test_returns_top_5_categories(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        entries = []
        for cat in ["A", "B", "C", "D", "E", "F"]:
            for i in range(5):
                entries.append({"text": f"q-{cat}-{i}", "confidence": 0.3, "category": cat, "timestamp": "2026-01-01T00:00:00Z"})
        with open(log_path, "w") as f:
            json.dump(entries, f)

        gaps = svc.detect_gaps()
        assert len(gaps) == 5  # top 5, not 6

    def test_gap_includes_suggested_topic(self, tmp_path):
        log_path = str(tmp_path / "log.json")
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = log_path

        entries = [{"text": f"q{i}", "confidence": 0.3, "category": "Shipping", "timestamp": "2026-01-01T00:00:00Z"} for i in range(4)]
        with open(log_path, "w") as f:
            json.dump(entries, f)

        gaps = svc.detect_gaps()
        assert "Shipping" in gaps[0]["suggested_topic"]
        assert "reason" in gaps[0]


class TestGetSummary:
    """Tests for get_summary method."""

    def test_summary_has_required_fields(self, tmp_path):
        svc = KnowledgeGapService(storage_path=str(tmp_path / "gaps.json"))
        svc.gap_log_path = str(tmp_path / "empty.json")
        with open(str(tmp_path / "empty.json"), "w") as f:
            json.dump([], f)

        summary = svc.get_summary()
        assert "detected_at" in summary
        assert "total_logs_analyzed" in summary
        assert "gaps" in summary
        assert isinstance(summary["gaps"], list)


# ---------------------------------------------------------------------------
# SpamService tests
# ---------------------------------------------------------------------------
from backend.services.spam_service import SpamService, extract_urls, _classify_url


class TestExtractUrls:
    """Tests for URL extraction utility."""

    def test_extracts_http_url(self):
        urls = extract_urls("Visit http://example.com for details")
        assert "http://example.com" in urls

    def test_extracts_https_url(self):
        urls = extract_urls("Go to https://secure.example.com/path?q=1")
        assert any("secure.example.com" in u for u in urls)

    def test_extracts_www_url(self):
        urls = extract_urls("Check www.example.com now")
        assert any("example.com" in u for u in urls)

    def test_returns_empty_for_no_urls(self):
        assert extract_urls("No links here") == []

    def test_returns_empty_for_none(self):
        assert extract_urls(None) == []

    def test_returns_empty_for_empty_string(self):
        assert extract_urls("") == []

    def test_strips_trailing_punctuation(self):
        urls = extract_urls("See https://example.com.")
        assert urls[0] == "https://example.com"

    def test_adds_http_prefix_for_bare_urls(self):
        urls = extract_urls("Visit www.example.com")
        assert urls[0].startswith("http://")

    def test_extracts_multiple_urls(self):
        text = "Links: https://a.com and http://b.org and www.c.net"
        urls = extract_urls(text)
        assert len(urls) == 3


class TestClassifyUrl:
    """Tests for URL classification utility."""

    def test_raw_ip_detected(self):
        reason = _classify_url("http://192.168.1.1/login")
        assert reason is not None
        assert "raw IP" in reason

    def test_url_shortener_detected(self):
        reason = _classify_url("https://bit.ly/abc123")
        assert reason is not None
        assert "shortener" in reason

    def test_suspicious_tld_detected(self):
        reason = _classify_url("http://malware.xyz/page")
        assert reason is not None
        assert ".xyz" in reason

    def test_embedded_credentials_detected(self):
        reason = _classify_url("http://user@evil.com@real.com/")
        assert reason is not None

    def test_clean_url_returns_none(self):
        reason = _classify_url("https://github.com/owner/repo")
        assert reason is None

    def test_clean_url_with_path(self):
        reason = _classify_url("https://docs.python.org/3/library/re.html")
        assert reason is None

    def test_disposable_tld_tk(self):
        reason = _classify_url("http://phish.tk/login")
        assert reason is not None
        assert ".tk" in reason

    def test_disposable_tld_ml(self):
        reason = _classify_url("http://phish.ml/login")
        assert reason is not None


class TestSpamServiceCheck:
    """Tests for SpamService.check method."""

    def setup_method(self):
        self.svc = SpamService()

    def test_empty_text_returns_clean(self):
        result = self.svc.check("")
        assert result["is_spam"] is False
        assert result["risk_score"] == 0.0

    def test_none_text_returns_clean(self):
        result = self.svc.check(None)
        assert result["is_spam"] is False

    def test_normal_text_returns_clean(self):
        result = self.svc.check("I need help resetting my password for the admin portal.")
        assert result["is_spam"] is False
        assert result["risk_score"] < 0.6

    def test_single_phishing_keyword_low_risk(self):
        result = self.svc.check("Please verify your account before proceeding.")
        assert len(result["matched_keywords"]) >= 1
        assert result["risk_score"] < self.svc.SPAM_THRESHOLD

    def test_multiple_keywords_triggers_spam(self):
        text = "Verify your identity! Your account has been suspended. Click here to claim your prize."
        result = self.svc.check(text)
        assert result["is_spam"] is True
        assert result["risk_score"] >= self.svc.SPAM_THRESHOLD
        assert len(result["matched_keywords"]) >= 2

    def test_suspicious_url_detected(self):
        result = self.svc.check("Check this link: http://192.168.1.1/phish")
        assert len(result["suspicious_urls"]) == 1
        assert result["risk_score"] > 0

    def test_url_shortener_detected(self):
        result = self.svc.check("Click here: https://bit.ly/steal-your-data")
        assert len(result["suspicious_urls"]) == 1

    def test_combined_keywords_and_url_high_score(self):
        text = "Verify your account at http://phish.tk/claim. You have won a prize!"
        result = self.svc.check(text)
        assert result["is_spam"] is True
        assert len(result["matched_keywords"]) >= 2
        assert len(result["suspicious_urls"]) >= 1

    def test_ocr_text_combined(self):
        result = self.svc.check("Normal ticket text", ocr_text="Send bitcoin to this address now!")
        assert "bitcoin" in str(result["matched_keywords"]).lower() or len(result["matched_keywords"]) > 0

    def test_score_capped_at_one(self):
        text = " ".join(["verify your account", "account has been suspended", "you have won",
                         "wire transfer", "send bitcoin", "act now", "urgent action required",
                         "http://1.2.3.4/", "https://bit.ly/x", "http://evil.tk/"])
        result = self.svc.check(text)
        assert result["risk_score"] <= 1.0

    def test_reasons_populated(self):
        text = "Verify your identity at http://phish.xyz/steal"
        result = self.svc.check(text)
        assert len(result["reasons"]) > 0

    def test_legitimate_it_ticket_not_flagged(self):
        text = "The user's password reset email is not arriving. Can you check the SMTP config?"
        result = self.svc.check(text)
        assert result["is_spam"] is False

    def test_case_insensitive_keyword_matching(self):
        result = self.svc.check("VERIFY YOUR ACCOUNT immediately")
        assert len(result["matched_keywords"]) >= 1


# ---------------------------------------------------------------------------
# rate_limit_config tests
# ---------------------------------------------------------------------------
from backend.services import rate_limit_config


class TestParseLimit:
    """Tests for _parse_limit helper."""

    def test_returns_default_when_env_empty(self):
        with patch.dict(os.environ, {}, clear=True):
            result = rate_limit_config._parse_limit("MISSING_KEY", "10/minute")
            assert result == "10/minute"

    def test_returns_env_value_when_valid(self):
        with patch.dict(os.environ, {"TEST_LIMIT": "20/hour"}):
            result = rate_limit_config._parse_limit("TEST_LIMIT", "10/minute")
            assert result == "20/hour"

    def test_returns_default_when_invalid_format(self):
        with patch.dict(os.environ, {"TEST_LIMIT": "not-a-limit"}):
            result = rate_limit_config._parse_limit("TEST_LIMIT", "10/minute")
            assert result == "10/minute"

    def test_returns_default_when_invalid_period(self):
        with patch.dict(os.environ, {"TEST_LIMIT": "10/century"}):
            result = rate_limit_config._parse_limit("TEST_LIMIT", "10/minute")
            assert result == "10/minute"

    def test_returns_default_when_non_numeric_count(self):
        with patch.dict(os.environ, {"TEST_LIMIT": "abc/minute"}):
            result = rate_limit_config._parse_limit("TEST_LIMIT", "10/minute")
            assert result == "10/minute"

    def test_valid_second_period(self):
        with patch.dict(os.environ, {"TEST_LIMIT": "5/second"}):
            result = rate_limit_config._parse_limit("TEST_LIMIT", "10/minute")
            assert result == "5/second"

    def test_valid_day_period(self):
        with patch.dict(os.environ, {"TEST_LIMIT": "1000/day"}):
            result = rate_limit_config._parse_limit("TEST_LIMIT", "10/minute")
            assert result == "1000/day"

    def test_whitespace_trimmed(self):
        with patch.dict(os.environ, {"TEST_LIMIT": "  15/hour  "}):
            result = rate_limit_config._parse_limit("TEST_LIMIT", "10/minute")
            assert result == "15/hour"


class TestGetAll:
    """Tests for get_all function."""

    def test_returns_dict_with_expected_keys(self):
        result = rate_limit_config.get_all()
        assert "ai" in result
        assert "tickets" in result
        assert "auth" in result

    def test_values_are_strings(self):
        result = rate_limit_config.get_all()
        for v in result.values():
            assert isinstance(v, str)


class TestGetRetryAfterSeconds:
    """Tests for get_retry_after_seconds function."""

    def test_minute_returns_60(self):
        assert rate_limit_config.get_retry_after_seconds("10/minute") == 60

    def test_hour_returns_3600(self):
        assert rate_limit_config.get_retry_after_seconds("100/hour") == 3600

    def test_day_returns_86400(self):
        assert rate_limit_config.get_retry_after_seconds("1000/day") == 86400

    def test_second_returns_1(self):
        assert rate_limit_config.get_retry_after_seconds("5/second") == 1

    def test_unknown_period_defaults_to_60(self):
        assert rate_limit_config.get_retry_after_seconds("10/week") == 60

    def test_malformed_string_defaults_to_60(self):
        assert rate_limit_config.get_retry_after_seconds("invalid") == 60


class TestModuleLevelConstants:
    """Tests for module-level rate limit constants."""

    def test_rate_limit_ai_is_string(self):
        assert isinstance(rate_limit_config.RATE_LIMIT_AI, str)

    def test_rate_limit_tickets_is_string(self):
        assert isinstance(rate_limit_config.RATE_LIMIT_TICKETS, str)

    def test_rate_limit_auth_is_string(self):
        assert isinstance(rate_limit_config.RATE_LIMIT_AUTH, str)

    def test_defaults_contain_slash(self):
        assert "/" in rate_limit_config.RATE_LIMIT_AI
        assert "/" in rate_limit_config.RATE_LIMIT_TICKETS
        assert "/" in rate_limit_config.RATE_LIMIT_AUTH
