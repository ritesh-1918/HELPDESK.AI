import re
import urllib.parse

# Whitelist of trusted domains
SAFE_DOMAINS = {
    "google.com", "github.com", "microsoft.com", "apple.com", 
    "supabase.com", "helpdesk.ai", "gssoc.org.in", "vercel.app", 
    "wikipedia.org", "yahoo.com", "outlook.com", "gmail.com",
    "facebook.com", "linkedin.com", "twitter.com", "x.com"
}

# Suspicious top-level domains (TLDs)
SUSPICIOUS_TLDS = {
    ".xyz", ".ru", ".su", ".zip", ".mov", ".click", ".link", 
    ".top", ".info", ".cc", ".biz", ".icu", ".club", ".work", ".gq", ".cf", ".ml"
}

# Phishing indicators / social engineering keywords
PHISHING_KEYWORDS = [
    "verify your account", "immediate action required", "confirm your password", 
    "security alert login", "suspend your account", "billing update required", 
    "bank login", "login attempt from", "unauthorized login", "security verification", 
    "urgent action", "confirm your identity", "reset your security", "compromised"
]

# Spam indicators / marketing bot keywords
SPAM_KEYWORDS = [
    "seo services", "crypto trading", "casino bonus", "lottery winner", 
    "cash prize", "viagra", "buy cheap", "guaranteed profit", "double your money", 
    "make money fast", "free investment", "gift card", "work from home", "bitcoin profit"
]

# URL Extraction Regex
URL_REGEX = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')

def is_domain_safe(domain: str) -> bool:
    """Check if the domain or its parent domain is in the safe list."""
    domain = domain.lower()
    if domain in SAFE_DOMAINS:
        return True
    
    # Check subdomains (e.g. sub.google.com -> google.com)
    for safe in SAFE_DOMAINS:
        if domain.endswith("." + safe):
            return True
    return False

def analyze_spam_phishing(text: str, ocr_text: str = "") -> dict:
    """
    Analyze text and OCR text for spam and phishing elements.
    Returns analysis results including spam flag, risk level, reasons, and URLs.
    """
    combined_text = f"{text}\n{ocr_text}"
    lower_text = combined_text.lower()
    
    reasons = []
    detected_urls = []
    suspicious_urls = []
    
    # 1. URL Scanning
    urls = URL_REGEX.findall(combined_text)
    for url in urls:
        # Strip trailing punctuation commonly matched by regex
        clean_url = url.rstrip('.,;:-?!()[]{}')
        if clean_url not in detected_urls:
            detected_urls.append(clean_url)
            
        # Parse host
        try:
            parsed = urllib.parse.urlparse(clean_url if "://" in clean_url else "http://" + clean_url)
            host = parsed.netloc.split(':')[0] # strip port
            
            # Check TLD
            has_suspicious_tld = any(host.endswith(tld) for tld in SUSPICIOUS_TLDS)
            if has_suspicious_tld:
                suspicious_urls.append(clean_url)
                reasons.append(f"Suspicious TLD in link: {clean_url}")
                continue
                
            # Check if domain is untrusted AND has suspicious path keywords
            if not is_domain_safe(host):
                path_lower = parsed.path.lower()
                query_lower = parsed.query.lower()
                suspicious_path_keywords = ["login", "signin", "verify", "secure", "update", "account", "billing"]
                
                if any(kw in path_lower or kw in query_lower or kw in host for kw in suspicious_path_keywords):
                    suspicious_urls.append(clean_url)
                    reasons.append(f"Untrusted URL containing security/account keywords: {clean_url}")
        except Exception:
            pass

    # 2. Phishing Keyword Scanning
    matched_phishing = [kw for kw in PHISHING_KEYWORDS if kw in lower_text]
    if matched_phishing:
        reasons.append(f"Detected phishing keyword patterns: {', '.join(matched_phishing[:3])}")
        
    # 3. Spam Keyword Scanning
    matched_spam = [kw for kw in SPAM_KEYWORDS if kw in lower_text]
    if matched_spam:
        reasons.append(f"Detected spam/marketing keyword patterns: {', '.join(matched_spam[:3])}")
        
    # 4. Multi-Link bot check
    if len(detected_urls) >= 5:
        reasons.append(f"High link density ({len(detected_urls)} URLs detected)")
        
    # 5. Risk Assessment
    risk_level = "none"
    is_spam = False
    
    if len(suspicious_urls) > 0 or len(matched_phishing) >= 2:
        risk_level = "high"
        is_spam = True
    elif len(matched_phishing) == 1 or len(matched_spam) >= 2 or len(detected_urls) >= 3:
        risk_level = "medium"
        is_spam = True
    elif len(matched_spam) == 1 or len(detected_urls) > 0:
        risk_level = "low"
        is_spam = True
        
    return {
        "is_spam": is_spam,
        "risk_level": risk_level,
        "reasons": reasons,
        "detected_urls": detected_urls,
        "suspicious_urls": suspicious_urls
    }
