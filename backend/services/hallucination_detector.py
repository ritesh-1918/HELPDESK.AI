"""
Hallucination Detection & Legal Confidence Scoring Framework.

Analyzes AI-generated text for potential hallucination signals and
computes a confidence score suitable for legal/domain-specific contexts.
"""

import re
from typing import Optional

HIGH_CONFIDENCE_MARKERS = [
    "clearly", "definitely", "certainly", "undoubtedly", "without a doubt",
    "always", "never", "every", "all", "must", "guaranteed",
]

LOW_CONFIDENCE_MARKERS = [
    "i think", "i believe", "maybe", "perhaps", "possibly", "might",
    "could be", "may be", "it seems", "appears", "apparently",
    "likely", "probably", "i'm not sure", "i am not sure",
    "it is possible", "it might", "not entirely sure",
    "as far as i know", "to the best of my knowledge",
    "i would assume", "i guess", "not necessarily",
]

VAGUE_TERMS = [
    "things", "stuff", "something", "somewhere", "someone",
    "certain", "various", "multiple", "numerous",
    "some", "many", "a lot", "several", "various",
    "do something", "take action", "appropriate action",
]

LEGAL_DOMAIN_TERMS = [
    "section", "article", "clause", "statute", "regulation",
    "compliance", "liability", "obligation", "provision",
    "jurisdiction", "plaintiff", "defendant", "petitioner",
    "respondent", "affidavit", "deposition", "subpoena",
    "indemnify", "arbitration", "mediation", "litigation",
    "tort", "contract", "breach", "damages", "injunction",
    "warranty", "disclaimer", "force majeure",
]

CITATION_PATTERNS = [
    r"(?:see|cf\.|accord|citing)\s",
    r"\d+\s+(?:U\.?S\.?C\.?|C\.?F\.?R\.?)\s+\d+",
    r"\d+\s+(?:P\.?3?d|F\.?(?:Supp\.?)?2?d)\s+\d+",
    r"\(\d{4}\)",  # Year in parentheses
    r"(?:Section|Article|Clause|§|Art\.?)\s+\d+(?:\.\d+)*",
    r"(?:https?://|www\.)\S+",
]


class HallucinationDetector:
    """Analyze AI text for hallucination signals and compute confidence scores."""

    @classmethod
    def analyze(cls, text: str, domain: Optional[str] = None) -> dict:
        if not text:
            return {
                "hallucination_risk": 1.0,
                "confidence_score": 0.0,
                "signals": [],
                "domain_relevance": 0.0,
            }

        signals = []
        text_lower = text.lower()

        vagueness = cls._compute_vagueness(text_lower)
        if vagueness > 0.3:
            signals.append({
                "type": "vagueness",
                "severity": round(vagueness, 4),
                "detail": "Response contains vague or generic language"
            })

        specificity_penalty = cls._compute_specificity_penalty(text)
        if specificity_penalty > 0.3:
            signals.append({
                "type": "over_specificity",
                "severity": round(specificity_penalty, 4),
                "detail": "Response makes unusually specific claims without evidence"
            })

        citation_score = cls._compute_citation_score(text)
        if citation_score < 0.3 and len(text) > 100:
            signals.append({
                "type": "missing_citations",
                "severity": round(1.0 - citation_score, 4),
                "detail": "Response lacks citations or references for key claims"
            })

        confidence_mismatch = cls._compute_confidence_mismatch(text_lower)
        if abs(confidence_mismatch) > 0.3:
            signal_type = "overconfidence" if confidence_mismatch > 0 else "underconfidence"
            signals.append({
                "type": signal_type,
                "severity": round(abs(confidence_mismatch), 4),
                "detail": f"Response shows {'overconfidence' if confidence_mismatch > 0 else 'underconfidence'} relative to available evidence"
            })

        contradiction_risk = cls._compute_contradiction_risk(text_lower)
        if contradiction_risk > 0.3:
            signals.append({
                "type": "self_contradiction",
                "severity": round(contradiction_risk, 4),
                "detail": "Response contains potentially contradictory statements"
            })

        domain_relevance = cls._compute_domain_relevance(text_lower)
        if domain and domain.lower() == "legal":
            if domain_relevance < 0.2:
                signals.append({
                    "type": "domain_mismatch",
                    "severity": round(1.0 - domain_relevance, 4),
                    "detail": "Response lacks domain-specific legal terminology"
                })

        hallucination_risk = cls._compute_hallucination_risk(signals)
        confidence_score = round(1.0 - hallucination_risk, 4)

        return {
            "hallucination_risk": round(hallucination_risk, 4),
            "confidence_score": confidence_score,
            "signals": signals,
            "domain_relevance": round(domain_relevance, 4),
            "details": {
                "vagueness": round(vagueness, 4),
                "specificity_penalty": round(specificity_penalty, 4),
                "citation_score": round(citation_score, 4),
                "confidence_mismatch": round(confidence_mismatch, 4),
                "contradiction_risk": round(contradiction_risk, 4),
            }
        }

    @classmethod
    def _compute_vagueness(cls, text_lower: str) -> float:
        words = text_lower.split()
        if not words:
            return 0.0
        vague_count = sum(1 for term in VAGUE_TERMS if term in text_lower)
        return min(1.0, vague_count / max(1, len(words)) * 10)

    @classmethod
    def _compute_specificity_penalty(cls, text: str) -> float:
        number_patterns = re.findall(r'\b\d+(?:\.\d+)?%?\b', text)
        exact_numbers = [n for n in number_patterns if len(n) > 3]
        if not exact_numbers:
            return 0.0
        penalty = min(1.0, len(exact_numbers) * 0.15)
        return penalty

    @classmethod
    def _compute_citation_score(cls, text: str) -> float:
        total_citations = 0
        for pattern in CITATION_PATTERNS:
            total_citations += len(re.findall(pattern, text, re.IGNORECASE))
        if total_citations > 0:
            return min(1.0, total_citations * 0.25)
        sentences = len(re.split(r'[.!?]+', text))
        if sentences <= 2:
            return 0.5
        return 0.0

    @classmethod
    def _compute_confidence_mismatch(cls, text_lower: str) -> float:
        high_count = sum(1 for m in HIGH_CONFIDENCE_MARKERS if m in text_lower)
        low_count = sum(1 for m in LOW_CONFIDENCE_MARKERS if m in text_lower)
        total = high_count + low_count
        if total == 0:
            return 0.0
        return round((high_count - low_count) / total, 4)

    @classmethod
    def _compute_contradiction_risk(cls, text_lower: str) -> float:
        contradiction_pairs = [
            (r'\b(?:always|every|all|never)\b', r'\b(?:sometimes|maybe|perhaps|occasionally)\b'),
            (r'\b(?:must|required|necessary)\b', r'\b(?:optional|unnecessary|not required)\b'),
            (r'\b(?:guaranteed|certain|definite)\b', r'\b(?:uncertain|unclear|possibly)\b'),
        ]
        risk = 0.0
        for pos_pat, neg_pat in contradiction_pairs:
            has_pos = len(re.findall(pos_pat, text_lower)) > 0
            has_neg = len(re.findall(neg_pat, text_lower)) > 0
            if has_pos and has_neg:
                risk += 0.25
        return min(1.0, risk)

    @classmethod
    def _compute_domain_relevance(cls, text_lower: str) -> float:
        if not text_lower.strip():
            return 0.0
        domain_match_count = sum(1 for term in LEGAL_DOMAIN_TERMS if term in text_lower)
        return min(1.0, domain_match_count * 0.15)

    @classmethod
    def _compute_hallucination_risk(cls, signals: list) -> float:
        if not signals:
            return 0.0
        weighted = sum(s["severity"] for s in signals if s["type"] in ("overconfidence", "over_specificity", "self_contradiction"))
        unweighted = sum(s["severity"] for s in signals if s["type"] not in ("overconfidence", "over_specificity", "self_contradiction"))
        total = weighted * 1.5 + unweighted
        avg = total / max(1, len(signals))
        return min(1.0, avg)
