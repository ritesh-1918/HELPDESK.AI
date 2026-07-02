"""
Rule-Based Classification Engine
Provides deterministic, high-precision classifications for well-defined ticket
patterns using regex rules and weighted keyword matching.
Serves as the last model in the ensemble to add domain-expert signals.
"""

import re
import logging
import numpy as np

# Label list — kept in sync with tfidf_model.DEFAULT_LABELS to avoid circular imports
DEFAULT_LABELS = [
    "Access | Password Reset", "Access | Login Failure", "Access | Access Request",
    "Access | Permission Issue", "Access | MFA Problem", "Access | Account Expired",
    "Access | Role Change", "Access | Account Unlock",
    "Software | Software Install", "Software | Data Loss", "Software | Application Crash",
    "Software | Update Problem", "Software | Compatibility", "Software | Configuration",
    "Software | License Issue", "Software | Performance",
    "Hardware | Overheating", "Hardware | Hardware Failure", "Hardware | Keyboard/Mouse",
    "Hardware | Laptop Issue", "Hardware | Battery Issue", "Hardware | Blue Screen",
    "Hardware | Monitor Problem", "Hardware | Printer Error",
    "Network | DNS Problem", "Network | Internet Slow", "Network | Remote Access",
    "Network | VPN Connection", "Network | WiFi Issue", "Network | Firewall Block",
    "Network | Proxy Error", "Network | Network Drive",
]

logger = logging.getLogger(__name__)

# Each rule: (pattern, label, confidence_boost)
# Higher confidence_boost = stronger signal
RULES = [
    # ─── Access ───────────────────────────────────────────────────
    (r"\b(forgot|reset|change)\s+(my\s+)?password\b", "Access | Password Reset", 0.95),
    (r"\bpassword\s+(expired|reset|forgot|lost)\b", "Access | Password Reset", 0.92),
    (r"\b(can[' ]?t|unable to|fail(ed)?)\s+(to\s+)?(sign\s+in|log\s+in|login)\b", "Access | Login Failure", 0.93),
    (r"\baccount\s+(locked|suspended|disabled)\b", "Access | Account Unlock", 0.94),
    (r"\b(2fa|mfa|multi.?factor|authenticator|otp|one.?time.?pass)\b", "Access | MFA Problem", 0.92),
    (r"\b(access\s+denied|unauthorized|permission\s+denied|not\s+authorized|forbidden)\b", "Access | Permission Issue", 0.93),
    (r"\baccount\s+(expired|expir)\b", "Access | Account Expired", 0.91),
    (r"\b(request|need|grant|require)\s+access\b", "Access | Access Request", 0.87),
    (r"\b(role\s+change|role\s+update|change\s+(my\s+)?role|new\s+role)\b", "Access | Role Change", 0.89),

    # ─── Software ─────────────────────────────────────────────────
    (r"\b(blue\s+screen|bsod|kernel\s+panic)\b", "Hardware | Blue Screen", 0.98),
    (r"\b(application|app|software)\s+(crash(ed|ing)?|not\s+responding|freeze)\b", "Software | Application Crash", 0.94),
    (r"\b(install|installation|set\s*up)\s+(software|application|program)\b", "Software | Software Install", 0.91),
    (r"\b(update|upgrade|patch)\s+(fail(ed)?|error|problem|issue)\b", "Software | Update Problem", 0.90),
    (r"\b(license|activation|product\s+key)\s+(expir|invalid|error|fail)\b", "Software | License Issue", 0.93),
    (r"\b(data\s+loss|lost\s+data|missing\s+files?|corrupt(ed)?\s+(file|data))\b", "Software | Data Loss", 0.95),
    (r"\b(performance|slow|lag|freeze|high\s+cpu|memory\s+leak)\b", "Software | Performance", 0.85),
    (r"\b(config(uration)?|settings?)\s+(error|issue|problem|wrong|incorrect)\b", "Software | Configuration", 0.88),
    (r"\bcompatib(le|ility)\s+(issue|problem|error)\b", "Software | Compatibility", 0.89),

    # ─── Hardware ─────────────────────────────────────────────────
    (r"\b(overheat(ing)?|running\s+hot|fan\s+noise|cooling\s+problem)\b", "Hardware | Overheating", 0.95),
    (r"\b(hardware\s+fail|device\s+fail|component\s+fail|broken\s+hardware)\b", "Hardware | Hardware Failure", 0.93),
    (r"\b(keyboard|mouse|trackpad|touchpad)\s+(not\s+working|broken|fail|issue)\b", "Hardware | Keyboard/Mouse", 0.92),
    (r"\b(monitor|display|screen)\s+(blank|black|flickering|not\s+working)\b", "Hardware | Monitor Problem", 0.92),
    (r"\b(printer|scanner|print\s+queue)\s+(error|fail|jam|not\s+working)\b", "Hardware | Printer Error", 0.92),
    (r"\b(battery|charging)\s+(drain|not\s+charging|issue|fail|dead)\b", "Hardware | Battery Issue", 0.91),
    (r"\b(laptop|notebook)\s+(issue|problem|fail|broken)\b", "Hardware | Laptop Issue", 0.87),

    # ─── Network ──────────────────────────────────────────────────
    (r"\b(dns|domain\s+name\s+resolution|cannot\s+resolve)\b", "Network | DNS Problem", 0.94),
    (r"\b(internet\s+slow|slow\s+internet|bandwidth|speed\s+issue|high\s+latency)\b", "Network | Internet Slow", 0.92),
    (r"\b(vpn|virtual\s+private\s+network|tunnel|vpn\s+connect)\b", "Network | VPN Connection", 0.94),
    (r"\b(wifi|wi-fi|wireless)\s+(issue|problem|disconnecting|not\s+connect)\b", "Network | WiFi Issue", 0.92),
    (r"\b(firewall|port\s+blocked|traffic\s+blocked)\b", "Network | Firewall Block", 0.93),
    (r"\b(remote\s+desktop|rdp|teamviewer|anydesk|remote\s+access)\b", "Network | Remote Access", 0.92),
    (r"\b(proxy|proxy\s+server)\s+(error|fail|issue)\b", "Network | Proxy Error", 0.91),
    (r"\b(network\s+drive|mapped\s+drive|shared\s+drive|nas)\b", "Network | Network Drive", 0.90),
]


class RuleBasedEngine:
    """
    Deterministic rule engine that scans ticket text with regex patterns and
    returns a soft probability vector for ensemble combination.

    Design: matched rules add confidence mass to their target label.
    Unmatched labels receive a tiny base probability to avoid zero-mass issues.
    """

    def __init__(self):
        self.rules = RULES
        self.labels = list(DEFAULT_LABELS)
        logger.info(f"[Rules] Engine initialized with {len(self.rules)} rules.")

    def predict_proba(self, text: str) -> np.ndarray:
        """
        Return a probability array in DEFAULT_LABELS order.
        Multiple matching rules accumulate weight additively.
        """
        lower = text.lower()
        scores = np.ones(len(self.labels)) * 0.001  # base mass

        matched_any = False
        for pattern, label, boost in self.rules:
            if re.search(pattern, lower, re.IGNORECASE):
                if label in self.labels:
                    idx = self.labels.index(label)
                    scores[idx] += boost
                    matched_any = True

        # If no rules matched, return a uniform distribution
        if not matched_any:
            return np.ones(len(self.labels)) / len(self.labels)

        # Normalize to probabilities
        total = scores.sum()
        return scores / total

    def predict(self, text: str) -> dict:
        """Return top label, confidence score and full probability vector."""
        proba = self.predict_proba(text)
        best_idx = int(np.argmax(proba))
        return {
            "label": self.labels[best_idx],
            "confidence": float(proba[best_idx]),
            "probabilities": proba,
        }

    def get_matched_rules(self, text: str) -> list[str]:
        """Return list of matched rule patterns for explainability."""
        lower = text.lower()
        matched = []
        for pattern, label, _ in self.rules:
            if re.search(pattern, lower, re.IGNORECASE):
                matched.append(f"{label} (pattern: '{pattern}')")
        return matched


# Singleton
rule_engine = RuleBasedEngine()
