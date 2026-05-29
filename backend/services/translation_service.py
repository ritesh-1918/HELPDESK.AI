"""
Translation Service — Multi-Language Ticket Support with Auto-Translation Pipeline
Uses langdetect for language detection and HuggingFace Helsinki-NLP models for translation.
"""

import logging
from typing import Optional
from functools import lru_cache

logger = logging.getLogger(__name__)

# Language code mapping for Helsinki-NLP models
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
) -> dict:
    """
    Translate text to target language.

    Returns dict with:
        - translated: translated text
        - source_lang: detected or provided source language
        - target_lang: target language
        - cached: whether result was from cache
    """
    if not text or not text.strip():
        return {"translated": "", "source_lang": source_lang, "target_lang": target_lang, "cached": False}

    # Truncate very long text
    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH] + "..."

    # Auto-detect language if not provided
    if not source_lang:
        source_lang = detect_language(text)
        if not source_lang:
            return {"translated": text, "source_lang": "unknown", "target_lang": target_lang, "cached": False}

    # Same language — no translation needed
    if source_lang == target_lang:
        return {"translated": text, "source_lang": source_lang, "target_lang": target_lang, "cached": False}

    # Check cache
    cache_key = f"{source_lang}:{target_lang}:{hash(text)}"
    if cache_key in _translation_cache:
        return {
            "translated": _translation_cache[cache_key],
            "source_lang": source_lang,
            "target_lang": target_lang,
            "cached": True,
        }

    # Load model and translate
    result = _load_translation_model(source_lang, target_lang)
    if not result:
        return {"translated": text, "source_lang": source_lang, "target_lang": target_lang, "cached": False}

    model, tokenizer = result
    try:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        translated = model.generate(**inputs)
        translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)

        # Cache result
        if len(_translation_cache) < MAX_CACHE_SIZE:
            _translation_cache[cache_key] = translated_text

        return {
            "translated": translated_text,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "cached": False,
        }
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return {"translated": text, "source_lang": source_lang, "target_lang": target_lang, "cached": False}


def translate_ticket(ticket_data: dict, target_lang: str = "en") -> dict:
    """
    Translate ticket content (subject, description, messages) to target language.

    Args:
        ticket_data: dict with 'subject', 'description', and optional 'messages'
        target_lang: target language code

    Returns:
        dict with translated fields and metadata
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
            result["original_language"] = subject_result["source_lang"]

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
                "language": msg_result["source_lang"],
            })
        result["translations"]["messages"] = translated_messages

    return result


def clear_cache():
    """Clear the translation cache."""
    _translation_cache.clear()
    _model_cache.clear()
