"""
Hybrid Similarity Calculator — Issue #2807
Combines three similarity dimensions for more accurate duplicate detection:
  1. Semantic  (Sentence-Transformer cosine)      weight=0.60
  2. Keyword   (TF-IDF cosine)                    weight=0.20
  3. Structural (error-codes, IPs, device names)  weight=0.20
"""

import re
import math
from typing import Optional
from collections import Counter


# ---------------------------------------------------------------------------
# Weights
# ---------------------------------------------------------------------------
SEMANTIC_WEIGHT   = 0.60
KEYWORD_WEIGHT    = 0.20
STRUCTURAL_WEIGHT = 0.20


# ---------------------------------------------------------------------------
# Structural pattern library
# ---------------------------------------------------------------------------
_STRUCTURAL_PATTERNS = [
    re.compile(r"\b[Ee]-?\d{2,5}\b"),                     # Error codes: E102, E-404
    re.compile(r"\b(?:error|err|code)\s*[-:#]?\s*\d+\b", re.IGNORECASE),
    re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}\b"),           # IPv4
    re.compile(r"\b[A-Za-z0-9\-]+\.[a-z]{2,}\b"),         # Hostnames / domains
    re.compile(r"\bticket[-_#]?\d+\b", re.IGNORECASE),    # Ticket references
    re.compile(r"\b[A-Z]{2,6}\d{3,}\b"),                  # Device/serial IDs: ABC1234
    re.compile(r"\bv\d+\.\d+(?:\.\d+)?\b", re.IGNORECASE),  # Version strings
]


def _extract_structural_tokens(text: str) -> set[str]:
    """Extract structured identifiers (error codes, IPs, hostnames, etc.)."""
    tokens: set[str] = set()
    normalized = text.lower()
    for pattern in _STRUCTURAL_PATTERNS:
        for m in pattern.finditer(normalized):
            # Normalize hyphens so E-102 == E102
            tokens.add(m.group().replace("-", ""))
    return tokens


def _jaccard_similarity(a: set, b: set) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


# ---------------------------------------------------------------------------
# TF-IDF keyword similarity (pure-Python, no sklearn dependency at call time)
# ---------------------------------------------------------------------------
def _tokenize(text: str) -> list[str]:
    return re.findall(r"\b[a-z]{2,}\b", text.lower())


def _tf(tokens: list[str]) -> dict[str, float]:
    count = Counter(tokens)
    total = len(tokens) or 1
    return {t: c / total for t, c in count.items()}


def _cosine(vec_a: dict, vec_b: dict) -> float:
    common = set(vec_a) & set(vec_b)
    if not common:
        return 0.0
    dot = sum(vec_a[t] * vec_b[t] for t in common)
    mag_a = math.sqrt(sum(v * v for v in vec_a.values()))
    mag_b = math.sqrt(sum(v * v for v in vec_b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def keyword_similarity(text_a: str, text_b: str) -> float:
    """Compute TF cosine similarity between two texts."""
    tf_a = _tf(_tokenize(text_a))
    tf_b = _tf(_tokenize(text_b))
    return round(_cosine(tf_a, tf_b), 4)


def structural_similarity(text_a: str, text_b: str) -> float:
    """Jaccard similarity of structural identifiers."""
    return round(_jaccard_similarity(
        _extract_structural_tokens(text_a),
        _extract_structural_tokens(text_b),
    ), 4)


# ---------------------------------------------------------------------------
# Main hybrid scorer
# ---------------------------------------------------------------------------
def compute_hybrid_similarity(
    semantic_score: float,
    text_a: str,
    text_b: str,
    *,
    semantic_weight: float = SEMANTIC_WEIGHT,
    keyword_weight: float = KEYWORD_WEIGHT,
    structural_weight: float = STRUCTURAL_WEIGHT,
) -> dict:
    """
    Compute weighted hybrid similarity.

    Args:
        semantic_score: Pre-computed cosine similarity from sentence-transformers.
        text_a, text_b:  Raw ticket texts.

    Returns:
        {
            "hybrid_score": float,
            "semantic_score": float,
            "keyword_score": float,
            "structural_score": float,
        }
    """
    kw_score   = keyword_similarity(text_a, text_b)
    str_score  = structural_similarity(text_a, text_b)
    hybrid     = (
        semantic_weight   * semantic_score +
        keyword_weight    * kw_score +
        structural_weight * str_score
    )
    return {
        "hybrid_score":     round(min(hybrid, 1.0), 4),
        "semantic_score":   round(semantic_score, 4),
        "keyword_score":    kw_score,
        "structural_score": str_score,
    }


# ---------------------------------------------------------------------------
# Threshold validation helper
# ---------------------------------------------------------------------------
THRESHOLD_MIN = 0.70
THRESHOLD_MAX = 0.95
THRESHOLD_DEFAULT = 0.85


def clamp_threshold(value: float) -> float:
    """Clamp a threshold to the allowed range [0.70, 0.95]."""
    return max(THRESHOLD_MIN, min(THRESHOLD_MAX, float(value)))


def apply_feedback_adjustment(
    current_threshold: float,
    feedback_type: str,   # "false_positive" | "missed_duplicate"
    step: float = 0.01,
) -> float:
    """
    Adjust threshold based on admin feedback.
    - false_positive  → increase threshold (stricter)
    - missed_duplicate → decrease threshold (looser)
    """
    if feedback_type == "false_positive":
        new_val = current_threshold + step
    elif feedback_type == "missed_duplicate":
        new_val = current_threshold - step
    else:
        new_val = current_threshold
    return clamp_threshold(new_val)
