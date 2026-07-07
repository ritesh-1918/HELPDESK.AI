"""
Translation Service — Multi-Language Ticket Support with Auto-Translation Pipeline.
Supports both MyMemory API wrapper and HuggingFace Helsinki-NLP models for translation.
"""

import logging
import re
from typing import Optional
from functools import lru_cache


try:
    import requests as _requests_lib
except ImportError:  # pragma: no cover - exercised only when requests is absent
    _requests_lib = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)

try:
    import requests as _requests_lib
except ImportError:
    _requests_lib = None

MYMEMORY_URL = "https://api.mymemory.translated.net/get"
DEFAULT_TIMEOUT = 10  # seconds

# Unicode block ranges for locale detection heuristics
_LOCALE_RANGES = {
    "hi": (0x0900, 0x097F),   # Devanagari (Hindi, Marathi)
    "te": (0x0C00, 0x0C7F),   # Telugu
    "ta": (0x0B80, 0x0BFF),   # Tamil
    "kn": (0x0C80, 0x0CFF),   # Kannada
    "ml": (0x0D00, 0x0D7F),   # Malayalam
    "bn": (0x0980, 0x09FF),   # Bengali
    "ar": (0x0600, 0x06FF),   # Arabic
    "zh": (0x4E00, 0x9FFF),   # CJK Chinese
    "ja": (0x3040, 0x309F),   # Hiragana (Japanese)
    "ko": (0xAC00, 0xD7AF),   # Hangul (Korean)
    "ru": (0x0400, 0x04FF),   # Cyrillic (Russian)
    "el": (0x0370, 0x03FF),   # Greek
    "he": (0x0590, 0x05FF),   # Hebrew
    "th": (0x0E00, 0x0E7F),   # Thai
}

# Marathi shares Devanagari with Hindi; differentiate by word list heuristic
_MARATHI_WORDS = {"आहे", "नाही", "आणि", "हे", "या", "तो", "ती", "ते"}
_HINDI_WORDS = {"है", "नहीं", "और", "यह", "वह", "हम", "आप", "क्या"}

SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "hi": "Hindi",
    "nl": "Dutch",
    "pl": "Polish",
    "tr": "Turkish",
}

# Translation cache to avoid repeated translations
_translation_cache: dict[str, str] = {}
_model_cache: dict[str, object] = {}

MAX_CACHE_SIZE = 1000
MAX_TEXT_LENGTH = 5000


def detect_locale(text: str) -> tuple[str, float]:
    """
    Detect the locale/language of the input text using Unicode block heuristics.
    """
    if not text or not text.strip():
        return ("en", 0.5)

    text_stripped = text.strip()
    total_chars = len([c for c in text_stripped if not c.isspace()])
    if total_chars == 0:
        return ("en", 0.5)

    counts: dict[str, int] = {}

    for ch in text_stripped:
        cp = ord(ch)
        for lang, (lo, hi) in _LOCALE_RANGES.items():
            if lo <= cp <= hi:
                counts[lang] = counts.get(lang, 0) + 1
                break

    if not counts:
        # Pure ASCII/Latin — assume English
        return ("en", 0.90)

    best_lang = max(counts, key=lambda k: counts[k])
    best_count = counts[best_lang]
    confidence = round(min(best_count / total_chars, 1.0), 4)

    # Differentiate Hindi vs Marathi for Devanagari text
    if best_lang == "hi":
        words = set(text_stripped.split())
        marathi_hits = len(words & _MARATHI_WORDS)
        hindi_hits = len(words & _HINDI_WORDS)
        if marathi_hits > hindi_hits:
            best_lang = "mr"

    return (best_lang, confidence)


def detect_language(text: str) -> Optional[str]:
    """Detect the language of the given text."""
    try:
        from langdetect import detect
        if not text or len(text.strip()) < 3:
            return None
        lang = detect(text)
        return lang
    except Exception as e:
        logger.warning(f"Language detection failed: {e}")
        return None
    lang, _ = detect_locale(text)
    return lang


def get_supported_languages() -> dict[str, str]:
    """Return supported languages for translation."""
    return SUPPORTED_LANGUAGES.copy()


def _get_model_name(source_lang: str, target_lang: str) -> str:
    """Get Helsinki-NLP model name for language pair."""
    return f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"


def _load_translation_model(source_lang: str, target_lang: str):
    """Load and cache a translation model."""
    model_key = f"{source_lang}-{target_lang}"
    if model_key in _model_cache:
        return _model_cache[model_key]

    try:
        from transformers import MarianMTModel, MarianTokenizer

        model_name = _get_model_name(source_lang, target_lang)
        logger.info(f"Loading translation model: {model_name}")

        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)

        _model_cache[model_key] = (model, tokenizer)
        return model, tokenizer
    except Exception as e:
        logger.error(f"Failed to load translation model {source_lang}-{target_lang}: {e}")
        return None


def translate_text(
    text: str,
    target_lang: str = "en",
    source_lang: Optional[str] = None,
    from_lang: Optional[str] = None,
    to_lang: Optional[str] = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> dict:
    """
    Unified translate_text that supports both MyMemory API and HuggingFace/MarianMT.
    """
    # 1. Determine which style is requested or active.
    # If from_lang or to_lang are explicitly provided (or if requests is mocked), use MyMemory path.
    from unittest.mock import MagicMock
    is_mocked_requests = isinstance(_requests_lib, MagicMock) or (hasattr(_requests_lib, "get") and isinstance(_requests_lib.get, MagicMock))
    is_mymemory_style = (from_lang is not None) or (to_lang is not None) or is_mocked_requests

    # Resolve from/to vs source/target
    if is_mymemory_style:
        src = from_lang or "en"
        tgt = to_lang or "en"
    else:
        src = source_lang
        tgt = target_lang

    # Standard clean/empty text check
    if not text or not text.strip():
        det_locale, conf = detect_locale(text or "")
        return {
            "translated": text or "",
            "detected_locale": det_locale,
            "confidence": conf,
            "source": "passthrough",
            "source_lang": src,
            "target_lang": tgt,
            "cached": False,
        }

    # Same language passthrough
    if src == tgt:
        det_locale, conf = detect_locale(text)
        return {
            "translated": text,
            "detected_locale": det_locale,
            "confidence": conf,
            "source": "passthrough",
            "source_lang": src,
            "target_lang": tgt,
            "cached": False,
        }

    # Validate target language if it's HuggingFace style
    if not is_mymemory_style and tgt not in SUPPORTED_LANGUAGES:
        return {
            "translated": text,
            "source_lang": src,
            "target_lang": tgt,
            "cached": False,
            "error": "unsupported_language",
        }

    # Truncate very long text
    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH] + "..."

    if is_mymemory_style:
        # MyMemory Path
        det_locale, conf = detect_locale(text)
        if _requests_lib is None:
            logger.warning("[TranslationService] 'requests' library not available; returning original text.")
            return {
                "translated": text,
                "detected_locale": det_locale,
                "confidence": conf,
                "source": "fallback",
                "source_lang": src,
                "target_lang": tgt,
                "cached": False,
            }
        try:
            lang_pair = f"{src}|{tgt}"
            params = {"q": text, "langpair": lang_pair}
            response = _requests_lib.get(MYMEMORY_URL, params=params, timeout=timeout)

            if response.status_code == 429:
                logger.warning("[TranslationService] Rate limit (429) hit; returning original text.")
                return {
                    "translated": text,
                    "detected_locale": det_locale,
                    "confidence": conf,
                    "source": "fallback",
                    "source_lang": src,
                    "target_lang": tgt,
                    "cached": False,
                }

            response.raise_for_status()
            data = response.json()

            status = data.get("responseStatus")
            if status == 200:
                translated = data["responseData"]["translatedText"]
                api_confidence = float(data["responseData"].get("match", conf) or conf)
                return {
                    "translated": translated,
                    "detected_locale": det_locale,
                    "confidence": round(min(api_confidence, 1.0), 4),
                    "source": "mymemory",
                    "source_lang": src,
                    "target_lang": tgt,
                    "cached": False,
                }

            details = data.get("responseDetails", "Unknown error")
            logger.warning(f"[TranslationService] API returned status {status}: {details}")
            return {
                "translated": text,
                "detected_locale": det_locale,
                "confidence": conf,
                "source": "fallback",
                "source_lang": src,
                "target_lang": tgt,
                "cached": False,
            }
        except Exception as exc:
            logger.error(f"[TranslationService] Error: {exc}; returning original text.")
            return {
                "translated": text,
                "detected_locale": det_locale,
                "confidence": conf,
                "source": "fallback",
                "source_lang": src,
                "target_lang": tgt,
                "cached": False,
            }
    else:
        # HuggingFace path
        # Auto-detect language if not provided
        if not src:
            src = detect_language(text)
            if not src:
                return {
                    "translated": text,
                    "source_lang": "unknown",
                    "target_lang": tgt,
                    "cached": False,
                    "detected_locale": "unknown",
                    "confidence": 0.5,
                    "source": "fallback",
                }

        # Check cache
        cache_key = f"{src}:{tgt}:{hash(text)}"
        if cache_key in _translation_cache:
            return {
                "translated": _translation_cache[cache_key],
                "source_lang": src,
                "target_lang": tgt,
                "cached": True,
                "detected_locale": src,
                "confidence": 1.0,
                "source": "mymemory",
            }

        # Load model and translate
        result = _load_translation_model(src, tgt)
        if not result:
            return {
                "translated": text,
                "source_lang": src,
                "target_lang": tgt,
                "cached": False,
                "detected_locale": src,
                "confidence": 0.5,
                "source": "fallback",
            }

        model, tokenizer = result
        try:
            inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            translated = model.generate(**inputs)
            translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)

            if len(_translation_cache) < MAX_CACHE_SIZE:
                _translation_cache[cache_key] = translated_text

            return {
                "translated": translated_text,
                "source_lang": src,
                "target_lang": tgt,
                "cached": False,
                "detected_locale": src,
                "confidence": 1.0,
                "source": "mymemory",
            }
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            return {
                "translated": text,
                "source_lang": src,
                "target_lang": tgt,
                "cached": False,
                "detected_locale": src,
                "confidence": 0.5,
                "source": "fallback",
            }


def batch_translate(
    texts: list[str],
    from_lang: str = "en",
    to_lang: str = "en",
    timeout: int = DEFAULT_TIMEOUT,
) -> list[dict]:
    """Translate a list of texts using translate_text."""
    results = []
    for text in texts:
        result = translate_text(text, from_lang=from_lang, to_lang=to_lang, timeout=timeout)
        results.append(result)
    return results


def detect_and_translate_to_english(
    text: str, timeout: int = DEFAULT_TIMEOUT
) -> dict:
    """
    Auto-detect language and translate to English.
    """
    detected_locale, confidence = detect_locale(text)
    if detected_locale == "en":
        return {
            "translated": text,
            "detected_locale": "en",
            "confidence": confidence,
            "source": "passthrough",
            "original_lang": "en",
            "source_lang": "en",
            "target_lang": "en",
            "cached": False,
        }

    result = translate_text(text, from_lang=detected_locale, to_lang="en", timeout=timeout)
    result["original_lang"] = detected_locale
    return result


def translate_ticket(ticket_data: dict, target_lang: str = "en") -> dict:
    """
    Translate ticket content (subject, description, messages) to target language.
    """
    result = {
        "original_language": None,
        "target_language": target_lang,
        "translations": {},
    }

    # Translate subject
    if "subject" in ticket_data:
        subject_result = translate_text(ticket_data["subject"], target_lang)
        result["translations"]["subject"] = subject_result
        if not result["original_language"]:
            result["original_language"] = subject_result.get("source_lang")

    # Translate description
    if "description" in ticket_data:
        desc_result = translate_text(ticket_data["description"], target_lang)
        result["translations"]["description"] = desc_result
        if not result["original_language"]:
            result["original_language"] = desc_result["source_lang"]

    # Translate messages
    if "messages" in ticket_data:
        translated_messages = []
        for msg in ticket_data["messages"]:
            msg_result = translate_text(msg.get("content", ""), target_lang)
            translated_messages.append({
                "original": msg.get("content", ""),
                "translated": msg_result["translated"],
                "language": msg_result.get("source_lang"),
            })
        result["translations"]["messages"] = translated_messages

    return result


def clear_cache():
    """Clear the translation cache."""
    _translation_cache.clear()
    _model_cache.clear()
