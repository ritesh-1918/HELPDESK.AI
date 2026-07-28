import re
from typing import List
from backend.services.ner_service import NERService

class TagSuggestionService:
    def __init__(self, ner_service: NERService = None):
        # Fallback to local import helper or global singleton mapping if loaded in main.py
        self.ner_service = ner_service

        # Common IT keywords mapping to tags
        self.keyword_map = {
            r"\bvpn\b": "vpn",
            r"\bnetwork\b": "network",
            r"\bprinter\b|\bprint\b|\bprinting\b": "printer",
            r"\bsecurity\b|\bmalware\b|\bvirus\b|\bphishing\b|\bhack\b": "security",
            r"\bauth\b|\bauthentication\b|\bsign[- ]?in\b": "authentication",
            r"\bpassword\b|\bpwd\b": "password-reset",
            r"\blogin\b|\bsign[- ]?on\b": "login-issue",
            r"\bemail\b|\boutlook\b|\bmailbox\b": "email",
            r"\bwi[- ]?fi\b|\bwifi\b|\bwireless\b": "wifi",
            r"\binternet\b|\bconnection\b|\bconnect\b": "connectivity",
            r"\bdns\b": "dns",
            r"\bdatabase\b|\bsql\b|\bpostgres\b|\bmysql\b|\boracle\b|\bdb\b": "database",
            r"\bserver\b|\bsrv\b|\bhost\b": "server",
            r"\bbilling\b|\bpayment\b|\binvoice\b|\bcredit card\b": "billing",
            r"\bhardware\b|\bmonitor\b|\bkeyboard\b|\bmouse\b|\blaptop\b|\bdesktop\b": "hardware",
            r"\bsoftware\b|\bapp\b|\bapplication\b": "software",
            r"\bmfa\b|\b2fa\b|\btotp\b": "mfa",
            r"\bteams\b|\bslack\b|\bchat\b": "collaboration",
            r"\baws\b|\bazure\b|\bgcp\b|\bcloud\b": "cloud",
            r"\bpermission\b|\bpermissions\b|\baccess\b|\bprivilege\b": "access-control",
            r"\baccount\b|\bprofile\b": "account-management",
            r"\bslow\b|\blatency\b|\blag\b|\bperformance\b": "performance",
            r"\berror\b|\bfail\b|\bfailure\b": "error",
            r"\btimeout\b": "timeout",
            r"\bcrash\b|\bfreeze\b": "crash",
            r"\bupdate\b|\bupgrade\b": "update",
            r"\binstall\b|\bsetup\b": "installation",
            r"\blicense\b|\blicensing\b": "licensing",
            r"\bfirewall\b|\bport\b|\brouter\b|\bswitch\b": "firewall"
        }

    def suggest_tags(self, title: str, description: str, comments: List[str] = None) -> List[str]:
        """
        Suggests top 3 tags based on ticket title, description, and comments.
        Inference is extremely fast (<100ms) and relies on entity extraction
        and predefined keyword mapping.
        """
        combined_text = f"{title or ''} {description or ''}"
        if comments:
            combined_text += " " + " ".join(comments)
        
        combined_text_lower = combined_text.lower()
        candidates = {}

        # 1. Run NER if available and loaded to find specific entities
        if self.ner_service:
            try:
                entities = self.ner_service.extract_entities(combined_text)
                for entity in entities:
                    ent_text = entity.get("text", "").strip().lower()
                    ent_text = re.sub(r'[^a-z0-9\-]', '-', ent_text) # sanitize
                    ent_text = re.sub(r'-+', '-', ent_text).strip('-')
                    if ent_text and len(ent_text) > 1:
                        # Give high weight to ML-extracted entities
                        candidates[ent_text] = candidates.get(ent_text, 0) + 3.0
            except Exception as e:
                print(f"[TagSuggestionService] NER extraction failed: {e}")

        # 2. Key Term Matching using regex maps
        for pattern, tag in self.keyword_map.items():
            matches = re.findall(pattern, combined_text_lower)
            if matches:
                # Add score based on number of matches (capped at 3 to prevent skewing)
                candidates[tag] = candidates.get(tag, 0) + min(len(matches), 3) * 1.5

        # 3. Handle Category & Subcategory matching (if words exist in title/desc)
        for term in ["vpn", "printer", "network", "security", "database", "billing", "email", "wifi"]:
            if term in combined_text_lower:
                candidates[term] = candidates.get(term, 0) + 2.0

        # Filter out empty or too short candidate tags
        valid_candidates = {tag: score for tag, score in candidates.items() if tag and len(tag) >= 2}

        # Sort candidates by score descending
        sorted_candidates = sorted(valid_candidates.items(), key=lambda x: x[1], reverse=True)

        # Retrieve top 3 tags
        top_tags = [tag for tag, _ in sorted_candidates[:3]]

        # Ensure we always return at least some tags if ticket contains other technical terms
        # but if we have none, we don't force it (just return whatever we found up to 3)
        return top_tags
