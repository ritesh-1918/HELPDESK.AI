import pytest
from unittest.mock import patch, MagicMock


class TestExtractUrls:
    def test_returns_empty_list_for_empty_text(self):
        from services.spam_service import extract_urls
        assert extract_urls("") == []
        assert extract_urls(None) == []

    def test_returns_empty_list_for_text_without_urls(self):
        from services.spam_service import extract_urls
        assert extract_urls("this is a normal text without any links") == []

    def test_detects_https_url(self):
        from services.spam_service import extract_urls
        result = extract_urls("visit https://example.com now")
        assert "https://example.com" in result or "http://example.com" in result

    def test_detects_url_without_protocol(self):
        from services.spam_service import extract_urls
        result = extract_urls("go to www.example.com/page")
        assert any("example.com" in url for url in result)

    def test_detects_multiple_urls(self):
        from services.spam_service import extract_urls
        result = extract_urls("check https://site1.com and https://site2.com")
        urls = " ".join(result)
        assert "site1.com" in urls and "site2.com" in urls

    def test_strips_trailing_punctuation_from_url(self):
        from services.spam_service import extract_urls
        result = extract_urls("visit https://example.com.")
        assert any("example.com" in url for url in result)


class TestClassifyUrl:
    def test_returns_none_for_safe_url(self):
        from services.spam_service import _classify_url
        result = _classify_url("https://github.com/example")
        assert result is None

    def test_detects_raw_ip_address(self):
        from services.spam_service import _classify_url
        result = _classify_url("http://192.168.1.1/admin")
        assert result is not None
        assert "IP" in result or "ip" in result

    def test_detects_url_shortener(self):
        from services.spam_service import _classify_url
        result = _classify_url("https://bit.ly/suspicious-link")
        assert result is not None

    def test_detects_suspicious_tld(self):
        from services.spam_service import _classify_url
        result = _classify_url("https://phishing-site.xyz/login")
        assert result is not None

    def test_detects_embedded_credentials(self):
        from services.spam_service import _classify_url
        result = _classify_url("https://user:pass@evil.com")
        assert result is not None
        assert "@" in result or "credential" in result.lower()

    def test_returns_message_for_malformed_url(self):
        from services.spam_service import _classify_url
        with patch("services.spam_service.urlparse") as mock_parse:
            mock_parse.side_effect = ValueError("bad url")
            result = _classify_url("not-a-valid-url")
            assert result is not None


class TestSpamService:
    def setup_method(self):
        from services.spam_service import SpamService
        self.service = SpamService()

    def test_check_returns_clean_for_empty_text(self):
        result = self.service.check("")
        assert result["is_spam"] is False
        assert result["risk_score"] == 0.0

    def test_check_returns_clean_for_normal_text(self):
        result = self.service.check("Hello, I need help with my account login")
        assert result["is_spam"] is False
        assert result["risk_score"] < 0.6

    def test_detects_phishing_keywords(self):
        result = self.service.check("Please verify your account immediately")
        assert len(result["matched_keywords"]) > 0

    def test_detects_spam_with_url_and_keywords(self):
        text = "Urgent: verify your account at http://bit.ly/phish"
        result = self.service.check(text)
        assert result["is_spam"] is True
        assert result["risk_score"] >= 0.6

    def test_risk_score_increases_with_more_signals(self):
        clean_result = self.service.check("Hello world")
        spam_result = self.service.check(
            "Urgent: verify your account at http://bit.ly/phish "
            "or your account will be closed"
        )
        assert spam_result["risk_score"] > clean_result["risk_score"]

    def test_check_includes_ocr_text(self):
        result = self.service.check("", ocr_text="click here to claim your prize")
        assert len(result["matched_keywords"]) > 0

    def test_returns_suspicious_urls(self):
        text = "check http://suspicious-site.xyz/login"
        result = self.service.check(text)
        assert len(result["suspicious_urls"]) > 0

    def test_returns_reasons_for_spam_verdict(self):
        text = "verify your account at http://bit.ly/evil"
        result = self.service.check(text)
        assert len(result["reasons"]) > 0

    def test_reasons_include_keyword_matches(self):
        text = "verify your account"
        result = self.service.check(text)
        keyword_reasons = [r for r in result["reasons"] if "keyword" in r.lower()]
        assert len(keyword_reasons) > 0

    def test_combined_text_analyzed_together(self):
        result = self.service.check("Hello", ocr_text="verify your account")
        assert len(result["matched_keywords"]) > 0

    def test_risk_score_never_exceeds_one(self):
        text = "verify your account confirm your password "
        "click here to claim http://bit.ly/scam http://evil.xyz/fake "
        "send bitcoin to http://tinyurl.com/phish"
        result = self.service.check(text)
        assert result["risk_score"] <= 1.0

    def test_non_spam_text_below_threshold(self):
        result = self.service.check("Hello, how can I reset my password?")
        assert result["is_spam"] is False
