"""
Multi-Language Auto-Translation Pipeline.

Provides:
  detect_language(text: str) -> str          – ISO-639-1 code (e.g. 'hi')
  translate_to_english(text, source_lang)    – Helsinki-NLP/opus-mt-{src}-en
  translate_from_english(text, target_lang)  – Helsinki-NLP/opus-mt-en-{tgt}

Language detection uses `langdetect` (offline, fast).
Translation uses Helsinki-NLP MarianMT models loaded lazily via `transformers`.
Both functions degrade gracefully: on any error the original text is returned.
"""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

LANGUAGE_NAMES: dict[str, str] = {
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ar": "Arabic",
    "pt": "Portuguese",
    "ja": "Japanese",
    "zh": "Chinese",
    "ko": "Korean",
    "it": "Italian",
    "ru": "Russian",
    "en": "English",
}

# In-memory model cache: model_name -> (tokenizer, model)
_MODEL_CACHE: dict[str, tuple] = {}


def detect_language(text: str) -> str:
    """Detect the ISO-639-1 language code of *text*.

    Uses langdetect as the primary engine; falls back to 'en' when the
    package is absent, the text is too short, or detection throws.
    """
    text = (text or "").strip()
    if not text or len(text) < 5:
        return "en"

    try:
        from langdetect import detect as _detect
        code = _detect(text)
        # Normalise: langdetect may return 'zh-cn', 'pt-br', etc.
        return str(code).lower().split("-")[0][:2]
    except Exception as exc:
        logger.warning("langdetect unavailable or failed (%s) – defaulting to 'en'", exc)
        # Last-resort heuristic: high non-ASCII density → definitely not English
        ascii_ratio = sum(1 for c in text if ord(c) < 128) / len(text)
        return "en" if ascii_ratio > 0.80 else "unknown"


def _load_model(model_name: str) -> tuple:
    """Lazy-load a Helsinki-NLP MarianMT model and cache it in memory."""
    if model_name in _MODEL_CACHE:
        return _MODEL_CACHE[model_name]

    try:
        from transformers import MarianMTModel, MarianTokenizer
    except ImportError as exc:
        raise ImportError(
            "transformers is required for translation. "
            "Install it with: pip install transformers"
        ) from exc

    logger.info("Loading translation model '%s' (first call – will cache)…", model_name)
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)
    _MODEL_CACHE[model_name] = (tokenizer, model)
    logger.info("Model '%s' cached.", model_name)
    return tokenizer, model


def _run_translation(text: str, model_name: str) -> str:
    """Run a single translation using the named Marian model."""
    tokenizer, model = _load_model(model_name)
    inputs = tokenizer(
        [text],
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512,
    )
    translated_ids = model.generate(**inputs)
    return tokenizer.batch_decode(translated_ids, skip_special_tokens=True)[0]


def translate_to_english(text: str, source_lang: str) -> str:
    """Translate *text* from *source_lang* to English.

    Uses Helsinki-NLP/opus-mt-{source_lang}-en.
    Returns the original text unchanged if *source_lang* is 'en',
    or if the translation model is unavailable / fails.
    """
    text = (text or "").strip()
    if not text:
        return text

    lang = str(source_lang or "en").lower().split("-")[0][:2]
    if lang in ("en", ""):
        return text

    model_name = f"Helsinki-NLP/opus-mt-{lang}-en"
    try:
        return _run_translation(text, model_name)
    except Exception as exc:
        logger.warning(
            "translate_to_english failed (model=%s): %s – returning original text",
            model_name, exc,
        )
        return text


def translate_from_english(text: str, target_lang: str) -> str:
    """Back-translate *text* from English into *target_lang*.

    Uses Helsinki-NLP/opus-mt-en-{target_lang}.
    Returns the original text unchanged if *target_lang* is 'en',
    or if the translation model is unavailable / fails.
    """
    text = (text or "").strip()
    if not text:
        return text

    lang = str(target_lang or "en").lower().split("-")[0][:2]
    if lang in ("en", ""):
        return text

    model_name = f"Helsinki-NLP/opus-mt-en-{lang}"
    try:
        return _run_translation(text, model_name)
    except Exception as exc:
        logger.warning(
            "translate_from_english failed (model=%s): %s – returning original text",
            model_name, exc,
        )
        return text
