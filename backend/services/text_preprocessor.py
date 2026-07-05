"""
Text Preprocessor — Multilingual normalization for the AI classifier pipeline.

Detects code-mixed (Hinglish) input and normalizes common Romanized Hindi
tokens into English equivalents so that the DistilBERT tokenizer produces
fewer [UNK] tokens and classification accuracy improves.

This module is designed to sit in front of any classifier service's predict()
method as a lightweight pre-processing step.

Reference: Defect D-005 — Classifier V3 failing on mixed-language tickets.
"""

import re
import unicodedata

# ── Romanized Hindi → English token map ─────────────────────────────
# Covers the most frequent Hinglish tokens seen in IT support tickets.
# Keys are lowercase Romanized Hindi; values are English replacements.

HINGLISH_TOKEN_MAP = {
    # Pronouns & common words
    "mera": "my",
    "meri": "my",
    "mere": "my",
    "tera": "your",
    "teri": "your",
    "tere": "your",
    "uska": "his",
    "uski": "her",
    "humara": "our",
    "tumhara": "your",
    "mujhe": "me",
    "tujhe": "you",
    "hum": "we",
    "tum": "you",
    "wo": "that",
    "woh": "that",
    "yeh": "this",
    "ye": "this",
    "kya": "what",
    "kab": "when",
    "kahan": "where",
    "kaun": "who",
    "kyun": "why",
    "kaise": "how",
    "kitna": "how much",

    # Verbs / helpers
    "hai": "is",
    "hain": "are",
    "tha": "was",
    "thi": "was",
    "the": "were",
    "hoga": "will be",
    "hogi": "will be",
    "ho": "is",
    "kar": "do",
    "karo": "do",
    "karna": "to do",
    "kiya": "did",
    "raha": "ongoing",
    "rahi": "ongoing",
    "rahe": "ongoing",
    "nahi": "not",
    "nahin": "not",
    "mat": "don't",
    "chahiye": "need",
    "sakta": "can",
    "sakti": "can",
    "sakte": "can",
    "dena": "give",
    "lena": "take",
    "batao": "tell",
    "batana": "tell",
    "dekhna": "see",
    "dekho": "see",
    "aana": "come",
    "jaana": "go",
    "chalna": "work",
    "lagta": "seems",
    "lagti": "seems",

    # IT support specific
    "kaam": "work",
    "kaam nahi kar raha": "not working",
    "band": "off",
    "chalu": "on",
    "theek": "fix",
    "sahi": "correct",
    "galat": "wrong",
    "problem": "problem",
    "dikkat": "problem",
    "pareshani": "problem",
    "mushkil": "difficulty",
    "madad": "help",
    "suljhao": "resolve",
    "error": "error",
    "screen": "screen",
    "password": "password",
    "internet": "internet",
    "slow": "slow",
    "dhima": "slow",
    "dheema": "slow",
    "fast": "fast",
    "tez": "fast",
    "install": "install",
    "update": "update",
    "restart": "restart",
    "laptop": "laptop",
    "computer": "computer",
    "phone": "phone",
    "mobile": "mobile",
    "printer": "printer",
    "wifi": "wifi",
    "network": "network",
    "file": "file",
    "folder": "folder",
    "delete": "delete",
    "hatao": "remove",
    "bhejo": "send",
    "dikhao": "show",
    "kholo": "open",
    "band karo": "close",
    "login": "login",
    "logout": "logout",

    # Connectors and fillers
    "aur": "and",
    "ya": "or",
    "lekin": "but",
    "magar": "but",
    "par": "but",
    "se": "from",
    "ko": "to",
    "me": "in",
    "pe": "on",
    "ke": "of",
    "ka": "of",
    "ki": "of",
    "bhi": "also",
    "sirf": "only",
    "bas": "just",
    "abhi": "now",
    "pehle": "before",
    "baad": "after",
    "baar": "times",
    "bahut": "very",
    "bohot": "very",
    "zyada": "more",
    "thoda": "little",
    "sab": "all",
    "kuch": "some",
    "koi": "any",
    "please": "please",
    "plz": "please",
    "pls": "please",

    # Responses / states
    "haan": "yes",
    "ji": "yes",
    "na": "no",
    "accha": "okay",
    "achha": "okay",
    "theek hai": "okay",
    "shukriya": "thanks",
    "dhanyavaad": "thanks",
}

# ── Devanagari Unicode range detection ──────────────────────────────
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")

# ── Common Hinglish sentence patterns ──────────────────────────────
# These regex patterns detect typical Romanized Hindi sentence structures.
_HINGLISH_PATTERNS = [
    re.compile(r"\b(mera|meri|mere|tera|teri|humara)\b", re.IGNORECASE),
    re.compile(r"\b(hai|hain|tha|thi|nahi|nahin)\b", re.IGNORECASE),
    re.compile(r"\b(kya|kaise|kyun|kahan|kaun)\b", re.IGNORECASE),
    re.compile(r"\b(karo|karna|batao|dekho|chahiye)\b", re.IGNORECASE),
    re.compile(r"\b(dikkat|pareshani|madad|theek|galat)\b", re.IGNORECASE),
    re.compile(r"\b(raha|rahi|rahe|sakta|sakti|sakte)\b", re.IGNORECASE),
]

# Minimum number of pattern matches to consider text as Hinglish
_HINGLISH_THRESHOLD = 2


def detect_code_mixed(text: str) -> bool:
    """Detect if text contains mixed-language patterns.

    Returns True if the text contains:
    - Devanagari script characters mixed with Latin, OR
    - At least _HINGLISH_THRESHOLD Romanized Hindi patterns

    Args:
        text: Input text to analyze.

    Returns:
        True if code-mixed language is detected.
    """
    if not text or not text.strip():
        return False

    # Check 1: Devanagari script present alongside Latin characters
    has_devanagari = bool(_DEVANAGARI_RE.search(text))
    has_latin = bool(re.search(r"[a-zA-Z]", text))
    if has_devanagari and has_latin:
        return True

    # Check 2: Romanized Hindi pattern matching
    matches = sum(1 for pattern in _HINGLISH_PATTERNS if pattern.search(text))
    return matches >= _HINGLISH_THRESHOLD


def normalize_hinglish(text: str) -> str:
    """Normalize Romanized Hindi tokens to their English equivalents.

    Performs word-level replacement using the HINGLISH_TOKEN_MAP.
    Multi-word phrases are checked first, then individual words.

    Args:
        text: Input text potentially containing Hinglish tokens.

    Returns:
        Text with Hinglish tokens replaced by English equivalents.
    """
    if not text or not text.strip():
        return text or ""

    result = text

    # Phase 1: Replace multi-word phrases (longest match first)
    multi_word_phrases = sorted(
        [(k, v) for k, v in HINGLISH_TOKEN_MAP.items() if " " in k],
        key=lambda x: len(x[0]),
        reverse=True,
    )
    for hindi_phrase, english in multi_word_phrases:
        pattern = re.compile(re.escape(hindi_phrase), re.IGNORECASE)
        result = pattern.sub(english, result)

    # Phase 2: Replace single-word tokens
    words = result.split()
    normalized_words = []
    for word in words:
        # Strip punctuation for lookup, preserve it in output
        stripped = word.strip(".,!?;:'\"()-")
        prefix = word[: len(word) - len(word.lstrip(".,!?;:'\"()-"))]
        suffix = word[len(word.rstrip(".,!?;:'\"()-")) :]

        lookup = stripped.lower()
        if lookup in HINGLISH_TOKEN_MAP and " " not in lookup:
            normalized_words.append(prefix + HINGLISH_TOKEN_MAP[lookup] + suffix)
        else:
            normalized_words.append(word)

    return " ".join(normalized_words)


def strip_devanagari(text: str) -> str:
    """Remove Devanagari characters from text, keeping Latin and common symbols.

    Useful as a fallback when Devanagari tokens cannot be transliterated.

    Args:
        text: Input text potentially containing Devanagari script.

    Returns:
        Text with Devanagari characters removed and whitespace normalized.
    """
    if not text:
        return ""
    cleaned = _DEVANAGARI_RE.sub(" ", text)
    return re.sub(r"\s+", " ", cleaned).strip()


def preprocess_for_classifier(text: str) -> str:
    """Main entry point for text pre-processing before classifier inference.

    Pipeline:
    1. If text is empty or whitespace, return as-is.
    2. Detect if text contains code-mixed (Hinglish) patterns.
    3. If code-mixed: normalize Hinglish tokens and strip residual Devanagari.
    4. Normalize whitespace and return clean text.

    Args:
        text: Raw ticket text from user input.

    Returns:
        Preprocessed text suitable for the DistilBERT tokenizer.
    """
    if not text or not text.strip():
        return text or ""

    cleaned = text.strip()

    if detect_code_mixed(cleaned):
        cleaned = normalize_hinglish(cleaned)
        cleaned = strip_devanagari(cleaned)

    # Final whitespace normalization
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned
