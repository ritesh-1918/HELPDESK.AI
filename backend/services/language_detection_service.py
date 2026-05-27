"""
Language Detection Service
Uses HuggingFace's papluca/xlm-roberta-base-language-detection model via Inference API.
Falls back to a fast heuristic-based detector when the API is unavailable.
"""

import os
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Map of language codes to human-readable names
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "ar": "Arabic",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "pt": "Portuguese",
    "ru": "Russian",
    "it": "Italian",
    "nl": "Dutch",
    "tr": "Turkish",
    "vi": "Vietnamese",
    "th": "Thai",
}

# Unicode ranges for script-based heuristic detection
SCRIPT_RANGES = {
    "hi": [(0x0900, 0x097F)],   # Devanagari (Hindi, Marathi)
    "te": [(0x0C00, 0x0C7F)],   # Telugu
    "ta": [(0x0B80, 0x0BFF)],   # Tamil
    "kn": [(0x0C80, 0x0CFF)],   # Kannada
    "ml": [(0x0D00, 0x0D7F)],   # Malayalam
    "bn": [(0x0980, 0x09FF)],   # Bengali
    "ar": [(0x0600, 0x06FF), (0x0750, 0x077F)],  # Arabic
    "zh": [(0x4E00, 0x9FFF), (0x3400, 0x4DBF)],  # CJK Unified Ideographs
    "ja": [(0x3040, 0x309F), (0x30A0, 0x30FF)],  # Hiragana + Katakana
    "ko": [(0xAC00, 0xD7AF), (0x1100, 0x11FF)],  # Hangul
    "th": [(0x0E00, 0x0E7F)],   # Thai
    "ru": [(0x0400, 0x04FF)],   # Cyrillic
}


class LanguageDetectionService:
    """
    Detects the language of input text using HuggingFace Inference API.
    Falls back to script-based heuristic when API is unavailable.
    """

    def __init__(self):
        self._api_token = os.environ.get("HF_API_TOKEN") or os.environ.get("HUGGINGFACE_API_TOKEN")
        self._api_url = "https://api-inference.huggingface.co/models/papluca/xlm-roberta-base-language-detection"
        self._available = False
        self._use_api = False

    def load(self):
        """Initialize — check if API token is available."""
        if self._api_token:
            self._use_api = True
            logger.info("[LanguageDetection] HuggingFace API configured.")
        else:
            logger.info("[LanguageDetection] No HF API token; using heuristic fallback.")
        self._available = True

    def is_available(self) -> bool:
        return self._available

    def detect_language(self, text: str) -> dict:
        """
        Detect language of the given text.
        Returns: {"language_code": str, "language_name": str, "confidence": float, "method": str}
        """
        if not text or not text.strip():
            return {
                "language_code": "en",
                "language_name": "English",
                "confidence": 1.0,
                "method": "default"
            }

        text = text.strip()

        # Try HuggingFace API first
        if self._use_api and self._api_token:
            try:
                result = self._detect_via_api(text)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"[LanguageDetection] API failed, falling back to heuristic: {e}")

        # Fallback to heuristic
        return self._detect_via_heuristic(text)

    def _detect_via_api(self, text: str) -> Optional[dict]:
        """Call HuggingFace Inference API for language detection."""
        import requests

        # Truncate text to avoid payload limits
        truncated = text[:512]

        headers = {"Authorization": f"Bearer {self._api_token}"}
        payload = {"inputs": truncated}

        response = requests.post(self._api_url, headers=headers, json=payload, timeout=10)

        if response.status_code != 200:
            logger.warning(f"[LanguageDetection] HF API returned {response.status_code}: {response.text[:200]}")
            return None

        data = response.json()

        # The model returns a list of predictions
        if isinstance(data, list) and len(data) > 0:
            predictions = data[0] if isinstance(data[0], list) else data
            if predictions:
                top = predictions[0]
                label = top.get("label", "en").lower()
                score = top.get("score", 0.0)

                # Map model labels to our codes (model uses ISO 639-1)
                lang_code = label[:2] if len(label) > 2 else label

                return {
                    "language_code": lang_code,
                    "language_name": LANGUAGE_NAMES.get(lang_code, lang_code.upper()),
                    "confidence": round(float(score), 4),
                    "method": "huggingface"
                }

        return None

    def _detect_via_heuristic(self, text: str) -> dict:
        """
        Script-based heuristic language detection.
        Analyzes Unicode character ranges to determine the dominant script.
        """
        script_counts = {}
        total_relevant = 0

        for char in text:
            code = ord(char)
            for lang_code, ranges in SCRIPT_RANGES.items():
                for start, end in ranges:
                    if start <= code <= end:
                        script_counts[lang_code] = script_counts.get(lang_code, 0) + 1
                        total_relevant += 1
                        break

        # If non-Latin script found, return the dominant one
        if script_counts and total_relevant > 0:
            dominant = max(script_counts, key=script_counts.get)
            ratio = script_counts[dominant] / max(total_relevant, 1)

            # Special disambiguation for scripts shared between languages
            if dominant == "hi":
                # Devanagari is shared between Hindi and Marathi
                # Simple heuristic: check for Marathi-specific patterns
                marathi_indicators = ["ळ", "ॐ", "ज्ञ"]
                if any(ind in text for ind in marathi_indicators):
                    dominant = "mr"

            return {
                "language_code": dominant,
                "language_name": LANGUAGE_NAMES.get(dominant, dominant.upper()),
                "confidence": round(min(ratio, 0.95), 4),
                "method": "heuristic"
            }

        # Default: assume English for Latin script text
        return {
            "language_code": "en",
            "language_name": "English",
            "confidence": 0.85,
            "method": "heuristic"
        }


# Singleton instance
language_detection_service = LanguageDetectionService()
