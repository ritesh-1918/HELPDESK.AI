import unittest
from backend.services.spam_detector_service import analyze_spam_phishing, is_domain_safe

class TestSpamDetector(unittest.TestCase):
    def test_benign_text(self):
        text = "Hello, I am having trouble logging into my email account. Can you please help me reset it?"
        res = analyze_spam_phishing(text)
        self.assertFalse(res["is_spam"])
        self.assertEqual(res["risk_level"], "none")

    def test_domain_safety(self):
        self.assertTrue(is_domain_safe("google.com"))
        self.assertTrue(is_domain_safe("sub.google.com"))
        self.assertTrue(is_domain_safe("github.com"))
        self.assertFalse(is_domain_safe("phish-login-update.ru"))
        self.assertFalse(is_domain_safe("google-security.xyz"))

    def test_phishing_by_url(self):
        text = "Immediate action required: please update your profile here: http://phish-secure-login.xyz/verify"
        res = analyze_spam_phishing(text)
        self.assertTrue(res["is_spam"])
        self.assertEqual(res["risk_level"], "high")
        self.assertTrue(any("verify" in r.lower() or "tld" in r.lower() for r in res["reasons"]))
        self.assertEqual(len(res["suspicious_urls"]), 1)

    def test_spam_by_keywords(self):
        text = "Get rich quick with our brand new crypto trading scheme! Double your money within 24 hours guaranteed!"
        res = analyze_spam_phishing(text)
        self.assertTrue(res["is_spam"])
        self.assertEqual(res["risk_level"], "medium") # medium because of 2+ matched spam keywords
        self.assertTrue(any("spam" in r.lower() or "marketing" in r.lower() for r in res["reasons"]))

    def test_ocr_phishing_scan(self):
        # Benign text but suspicious URL in OCR text
        text = "Please see the attached document for invoice details."
        ocr = "To verify your account credentials click: http://untrusted-bank-update.info/login"
        res = analyze_spam_phishing(text, ocr)
        self.assertTrue(res["is_spam"])
        self.assertEqual(res["risk_level"], "high")
        self.assertEqual(len(res["suspicious_urls"]), 1)

if __name__ == "__main__":
    unittest.main()
