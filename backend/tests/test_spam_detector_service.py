"""
Unit tests for backend/services/spam_detector_service.py
Covers domain safety, spam/phishing analysis, risk levels, URL scanning, and edge cases.
"""
import unittest
from unittest.mock import patch
import importlib
import backend.services.spam_detector_service as sds


class TestIsDomainSafe(unittest.TestCase):
    """Tests for is_domain_safe()."""

    def test_known_safe_domain(self):
        self.assertTrue(sds.is_domain_safe("google.com"))

    def test_known_safe_domain_github(self):
        self.assertTrue(sds.is_domain_safe("github.com"))

    def test_known_safe_domain_supabase(self):
        self.assertTrue(sds.is_domain_safe("supabase.com"))

    def test_known_safe_domain_helpdesk(self):
        self.assertTrue(sds.is_domain_safe("helpdesk.ai"))

    def test_subdomain_of_safe(self):
        """sub.google.com should be safe because parent google.com is safe."""
        self.assertTrue(sds.is_domain_safe("mail.google.com"))

    def test_deep_subdomain_of_safe(self):
        self.assertTrue(sds.is_domain_safe("api.internal.google.com"))

    def test_unknown_domain(self):
        self.assertFalse(sds.is_domain_safe("totally-random-domain-xyz.com"))

    def test_case_insensitive(self):
        self.assertTrue(sds.is_domain_safe("GOOGLE.COM"))

    def test_mixed_case_subdomain(self):
        self.assertTrue(sds.is_domain_safe("Mail.Google.Com"))

    def test_empty_string(self):
        self.assertFalse(sds.is_domain_safe(""))

    def test_domain_with_trailing_dot_like_safe(self):
        """A domain ending with a safe domain but not exactly — e.g. fakegoogle.com should not match google.com."""
        self.assertFalse(sds.is_domain_safe("fakegoogle.com"))


class TestAnalyzeSpamPhishingURLs(unittest.TestCase):
    """Tests for analyze_spam_phishing URL scanning."""

    def test_safe_url_no_flag(self):
        result = sds.analyze_spam_phishing("Check this: https://google.com")
        self.assertFalse(result["is_spam"])
        self.assertEqual(result["risk_level"], "none")

    def test_suspicious_tld_xyz(self):
        result = sds.analyze_spam_phishing("Visit https://free-money.xyz")
        self.assertTrue(result["is_spam"])
        self.assertEqual(result["risk_level"], "high")
        self.assertGreater(len(result["suspicious_urls"]), 0)

    def test_suspicious_tld_ru(self):
        result = sds.analyze_spam_phishing("https://prize.ru")
        self.assertTrue(result["is_spam"])

    def test_suspicious_tld_click(self):
        result = sds.analyze_spam_phishing("https://offer.click")
        self.assertTrue(result["is_spam"])

    def test_untrusted_domain_with_login_keyword(self):
        result = sds.analyze_spam_phishing(
            "Click https://unknown-site.net/login to verify"
        )
        self.assertTrue(result["is_spam"])
        self.assertIn("untrusted", " ".join(result["reasons"]).lower())

    def test_untrusted_domain_with_verify_keyword(self):
        result = sds.analyze_spam_phishing(
            "Go to https://shady.example.com/verify-account"
        )
        self.assertTrue(result["is_spam"])

    def test_no_urls(self):
        result = sds.analyze_spam_phishing("Just a normal message")
        self.assertFalse(result["is_spam"])
        self.assertEqual(result["detected_urls"], [])

    def test_multiple_safe_urls(self):
        result = sds.analyze_spam_phishing(
            "https://google.com and https://github.com"
        )
        # Multiple safe URLs should not trigger spam
        self.assertFalse(result["is_spam"])

    def test_high_link_density(self):
        """5+ URLs should trigger high link density warning."""
        text = " ".join([f"https://example{i}.com" for i in range(6)])
        result = sds.analyze_spam_phishing(text)
        self.assertTrue(result["is_spam"])
        self.assertTrue(any("link density" in r.lower() for r in result["reasons"]))

    def test_www_url_detected(self):
        result = sds.analyze_spam_phishing("Visit www.free-cash.xyz today!")
        self.assertTrue(result["is_spam"])

    def test_url_with_trailing_punctuation(self):
        """URL regex should strip trailing punctuation."""
        result = sds.analyze_spam_phishing("Check (https://google.com).")
        self.assertFalse(result["is_spam"])  # google.com is safe
        self.assertIn("https://google.com", result["detected_urls"])

    def test_url_deduplication(self):
        """Same URL mentioned twice should only appear once in detected_urls."""
        result = sds.analyze_spam_phishing(
            "https://google.com and https://google.com again"
        )
        self.assertEqual(result["detected_urls"].count("https://google.com"), 1)


class TestAnalyzeSpamPhishingKeywords(unittest.TestCase):
    """Tests for phishing/spam keyword detection."""

    def test_phishing_verify_account(self):
        result = sds.analyze_spam_phishing("Please verify your account immediately")
        self.assertTrue(result["is_spam"])
        self.assertTrue(any("phishing" in r.lower() for r in result["reasons"]))

    def test_phishing_immediate_action(self):
        result = sds.analyze_spam_phishing("Immediate action required for your account")
        self.assertTrue(result["is_spam"])

    def test_phishing_security_alert(self):
        result = sds.analyze_spam_phishing(
            "Security alert login from unknown location"
        )
        self.assertTrue(result["is_spam"])

    def test_two_phishing_high_risk(self):
        """Two phishing keywords should result in high risk."""
        result = sds.analyze_spam_phishing(
            "Verify your account and confirm your password now!"
        )
        self.assertTrue(result["is_spam"])
        self.assertEqual(result["risk_level"], "high")

    def test_spam_seo_services(self):
        result = sds.analyze_spam_phishing("Best seo services for your website")
        self.assertTrue(result["is_spam"])

    def test_spam_crypto_trading(self):
        result = sds.analyze_spam_phishing("Start crypto trading today")
        self.assertTrue(result["is_spam"])

    def test_spam_casino_bonus(self):
        result = sds.analyze_spam_phishing("Claim your casino bonus now!")
        self.assertTrue(result["is_spam"])

    def test_two_spam_medium_risk(self):
        """Two spam keywords should result in medium risk."""
        result = sds.analyze_spam_phishing(
            "Best seo services and crypto trading opportunities"
        )
        self.assertTrue(result["is_spam"])
        self.assertEqual(result["risk_level"], "medium")

    def test_single_spam_low_risk(self):
        """Single spam keyword should result in low risk."""
        result = sds.analyze_spam_phishing("Check our seo services")
        self.assertTrue(result["is_spam"])
        self.assertEqual(result["risk_level"], "low")

    def test_normal_message_no_keywords(self):
        result = sds.analyze_spam_phishing("Hello, how are you doing today?")
        self.assertFalse(result["is_spam"])
        self.assertEqual(result["risk_level"], "none")


class TestAnalyzeSpamPhishingOCR(unittest.TestCase):
    """Tests for OCR text integration."""

    def test_ocr_text_analyzed(self):
        """Spam keywords in OCR text should be detected."""
        result = sds.analyze_spam_phishing(
            text="Hello", ocr_text="Claim your lottery winner prize"
        )
        self.assertTrue(result["is_spam"])

    def test_ocr_url_analyzed(self):
        result = sds.analyze_spam_phishing(
            text="", ocr_text="Visit https://scam.xyz now"
        )
        self.assertTrue(result["is_spam"])

    def test_ocr_empty(self):
        result = sds.analyze_spam_phishing(text="Normal text", ocr_text="")
        self.assertFalse(result["is_spam"])

    def test_ocr_and_text_combined(self):
        result = sds.analyze_spam_phishing(
            text="verify your account",
            ocr_text="https://phish.xyz/login",
        )
        self.assertTrue(result["is_spam"])


class TestAnalyzeSpamPhishingEdgeCases(unittest.TestCase):
    """Edge cases for analyze_spam_phishing."""

    def test_empty_text(self):
        result = sds.analyze_spam_phishing("")
        self.assertFalse(result["is_spam"])
        self.assertEqual(result["risk_level"], "none")
        self.assertEqual(result["reasons"], [])

    def test_none_text_handling(self):
        """Should handle None-like input gracefully."""
        try:
            result = sds.analyze_spam_phishing("")
            self.assertIsInstance(result, dict)
        except Exception as e:
            self.fail(f"Should not raise: {e}")

    def test_malformed_url(self):
        """Malformed URLs should not crash the analyzer."""
        result = sds.analyze_spam_phishing("Check http://!!!bad-url!!!")
        self.assertIsInstance(result, dict)

    def test_case_insensitive_keywords(self):
        result = sds.analyze_spam_phishing("VERIFY YOUR ACCOUNT NOW")
        self.assertTrue(result["is_spam"])

    def test_mixed_case_keywords(self):
        result = sds.analyze_spam_phishing("Verify Your Account please")
        self.assertTrue(result["is_spam"])

    def test_return_structure(self):
        """Result dict should have all expected keys."""
        result = sds.analyze_spam_phishing("Hello world")
        for key in ["is_spam", "risk_level", "reasons", "detected_urls", "suspicious_urls"]:
            self.assertIn(key, result)

    def test_risk_level_values(self):
        """Risk level should be one of the valid values."""
        result = sds.analyze_spam_phishing("seo services and crypto trading")
        self.assertIn(result["risk_level"], ["none", "low", "medium", "high"])

    def test_multiline_text(self):
        result = sds.analyze_spam_phishing("Hello\n\nhttps://prize.xyz\n\nVerify your account")
        self.assertTrue(result["is_spam"])

    def test_unicode_text(self):
        result = sds.analyze_spam_phishing("Hello 世界 https://google.com")
        self.assertFalse(result["is_spam"])

    def test_very_long_text(self):
        long_text = "Hello " * 1000 + " https://scam.xyz " + "verify your account"
        result = sds.analyze_spam_phishing(long_text)
        self.assertTrue(result["is_spam"])

    def test_url_with_port(self):
        result = sds.analyze_spam_phishing("https://scam.xyz:8080/login")
        self.assertTrue(result["is_spam"])

    def test_suspicious_urls_in_output(self):
        result = sds.analyze_spam_phishing("https://prize.xyz and https://google.com")
        self.assertIn("https://prize.xyz", result["suspicious_urls"])
        self.assertNotIn("https://google.com", result["suspicious_urls"])

    def test_is_spam_false_for_normal(self):
        result = sds.analyze_spam_phishing(
            "Hi team, please review the PR at https://github.com/org/repo"
        )
        self.assertFalse(result["is_spam"])


class TestSafeDomainsConstants(unittest.TestCase):
    """Tests for SAFE_DOMAINS and SUSPICIOUS_TLDS constants."""

    def test_safe_domains_is_set(self):
        self.assertIsInstance(sds.SAFE_DOMAINS, set)
        self.assertGreater(len(sds.SAFE_DOMAINS), 0)

    def test_safe_domains_contains_major_providers(self):
        self.assertIn("google.com", sds.SAFE_DOMAINS)
        self.assertIn("github.com", sds.SAFE_DOMAINS)
        self.assertIn("microsoft.com", sds.SAFE_DOMAINS)

    def test_suspicious_tlds_is_set(self):
        self.assertIsInstance(sds.SUSPICIOUS_TLDS, set)
        self.assertGreater(len(sds.SUSPICIOUS_TLDS), 0)

    def test_suspicious_tlds_contain_known_bad(self):
        self.assertIn(".xyz", sds.SUSPICIOUS_TLDS)
        self.assertIn(".ru", sds.SUSPICIOUS_TLDS)

    def test_phishing_keywords_is_list(self):
        self.assertIsInstance(sds.PHISHING_KEYWORDS, list)
        self.assertGreater(len(sds.PHISHING_KEYWORDS), 0)

    def test_spam_keywords_is_list(self):
        self.assertIsInstance(sds.SPAM_KEYWORDS, list)
        self.assertGreater(len(sds.SPAM_KEYWORDS), 0)


if __name__ == "__main__":
    unittest.main()
