"""
Spam Heuristic Filter — Domain whitelisting and spam classification for helpdesk tickets.

Reads whitelisted domains from environment variable:
  SPAM_WHITELISTED_DOMAINS — comma-separated list of trusted corporate domains (default: "")
  SPAM_SUSPICIOUS_TLDS   — comma-separated list of suspicious TLDs (default: .xyz,.top,.gq,.ml,.cf,.click,.download,.review,.work,.date,.men,.loan,.win,.bid,.trade,.webcam,.science,.party,.racing,.accountant)
  SPAM_SCORE_THRESHOLD   — float threshold above which content is flagged as spam (default: 0.7)
"""

import os
import re
import logging
from typing import Set, List, Tuple, Optional
from dataclasses import dataclass, field
from urllib.parse import urlparse

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[SpamService] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


@dataclass
class SpamConfig:
    whitelisted_domains: Set[str] = field(default_factory=set)
    suspicious_tlds: Set[str] = field(default_factory=set)
    score_threshold: float = 0.7

    @classmethod
    def from_env(cls) -> "SpamConfig":
        raw_domains = os.getenv("SPAM_WHITELISTED_DOMAINS", "")
        whitelisted = {d.strip().lower() for d in raw_domains.split(",") if d.strip()} if raw_domains else set()

        raw_tlds = os.getenv(
            "SPAM_SUSPICIOUS_TLDS",
            ".xyz,.top,.gq,.ml,.cf,.click,.download,.review,.work,.date,.men,.loan,.win,.bid,.trade,.webcam,.science,.party,.racing,.accountant"
        )
        suspicious = {t.strip().lower() for t in raw_tlds.split(",") if t.strip()}

        threshold = float(os.getenv("SPAM_SCORE_THRESHOLD", "0.7"))

        return cls(
            whitelisted_domains=whitelisted,
            suspicious_tlds=suspicious,
            score_threshold=threshold,
        )


URL_PATTERN = re.compile(r"https?://[^\s]+", re.IGNORECASE)
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")


class SpamService:
    def __init__(self, config: Optional[SpamConfig] = None):
        self.config = config or SpamConfig.from_env()

    def is_domain_whitelisted(self, domain: str) -> bool:
        normalized = domain.strip().lower()
        if normalized in self.config.whitelisted_domains:
            return True
        for wl_domain in self.config.whitelisted_domains:
            if normalized.endswith(f".{wl_domain}"):
                return True
        return False

    def extract_domains(self, text: str) -> List[str]:
        urls = URL_PATTERN.findall(text)
        domains = set()
        for url in urls:
            try:
                parsed = urlparse(url)
                hostname = parsed.hostname
                if hostname:
                    domains.add(hostname.lower())
            except Exception:
                continue
        return list(domains)

    def extract_emails(self, text: str) -> List[str]:
        return list(set(EMAIL_PATTERN.findall(text)))

    def _suspicious_tld_score(self, text: str) -> float:
        domains = self.extract_domains(text)
        emails = self.extract_emails(text)
        total = 0.0

        for domain in domains:
            if self.is_domain_whitelisted(domain):
                continue
            for tld in self.config.suspicious_tlds:
                if domain.endswith(tld) or "." + domain.split(".")[-1] == tld:
                    total += 0.4
                    break

        for email in emails:
            domain_part = email.split("@")[1].lower() if "@" in email else ""
            if self.is_domain_whitelisted(domain_part):
                continue
            for tld in self.config.suspicious_tlds:
                if domain_part.endswith(tld):
                    total += 0.3
                    break

        return min(total, 1.0)

    def _excess_link_score(self, text: str) -> float:
        urls = URL_PATTERN.findall(text)
        if not urls:
            return 0.0
        whitelisted_urls = 0
        suspicious_urls = 0
        for url in urls:
            try:
                parsed = urlparse(url)
                hostname = parsed.hostname or ""
                if self.is_domain_whitelisted(hostname):
                    whitelisted_urls += 1
                else:
                    suspicious_urls += 1
            except Exception:
                suspicious_urls += 1

        total_urls = whitelisted_urls + suspicious_urls
        if total_urls == 0:
            return 0.0
        suspicious_ratio = suspicious_urls / total_urls
        return min(suspicious_ratio, 1.0)

    def _repetitive_content_score(self, text: str) -> float:
        words = text.lower().split()
        if len(words) < 5:
            return 0.0
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.3:
            return 0.8
        if unique_ratio < 0.5:
            return 0.4
        return 0.0

    def classify(self, text: str) -> dict:
        tld_score = self._suspicious_tld_score(text)
        link_score = self._excess_link_score(text)
        repetitive_score = self._repetitive_content_score(text)

        weighted_score = (
            tld_score * 0.5 +
            link_score * 0.3 +
            repetitive_score * 0.2
        )

        is_spam = weighted_score >= self.config.score_threshold
        domains = self.extract_domains(text)
        blocked_domains = [d for d in domains if not self.is_domain_whitelisted(d)]

        result = {
            "is_spam": is_spam,
            "spam_score": round(weighted_score, 4),
            "signals": {
                "suspicious_tld_score": round(tld_score, 4),
                "excess_link_score": round(link_score, 4),
                "repetitive_content_score": round(repetitive_score, 4),
            },
            "domains_found": domains,
            "blocked_domains": blocked_domains,
            "whitelisted_domains": [d for d in domains if self.is_domain_whitelisted(d)],
        }
        return result

    def add_whitelisted_domain(self, domain: str) -> None:
        normalized = domain.strip().lower()
        if normalized:
            self.config.whitelisted_domains.add(normalized)
            logger.info(f"Added domain to whitelist: {normalized}")

    def remove_whitelisted_domain(self, domain: str) -> bool:
        normalized = domain.strip().lower()
        if normalized in self.config.whitelisted_domains:
            self.config.whitelisted_domains.discard(normalized)
            logger.info(f"Removed domain from whitelist: {normalized}")
            return True
        return False


_instance: Optional[SpamService] = None


def load():
    global _instance
    if _instance is None:
        config = SpamConfig.from_env()
        _instance = SpamService(config)
        wl_count = len(config.whitelisted_domains)
        logger.info(
            f"SpamService loaded (whitelisted_domains={wl_count}, "
            f"suspicious_tlds={len(config.suspicious_tlds)}, "
            f"threshold={config.score_threshold})"
        )
    return _instance


def get_instance() -> Optional[SpamService]:
    return _instance
