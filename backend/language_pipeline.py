"""
Multi-Language Auto-Translation Pipeline.

Provides:
  detect_language(text: str) -> str          – ISO-639-1 code (e.g. 'hi')
  translate_to_english(text, source_lang)    – Helsinki-NLP/opus-mt-{src}-en
  translate_from_english(text, target_lang)  – Helsinki-NLP/opus-mt-en-{tgt}
  detect_and_translate_ticket_text(text)     – detect + translate for AI pipeline

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

from functools import lru_cache

# In-memory LRU model cache to prevent Out-Of-Memory (OOM) kills on servers.
# It limits the cache to max 3 translation models (e.g. ~900MB total).


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


@lru_cache(maxsize=3)
def _load_model(model_name: str) -> tuple:
    """Lazy-load a Helsinki-NLP MarianMT model and cache it in memory."""

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
    fallback_model_name = "Helsinki-NLP/opus-mt-mul-en"
    try:
        return _run_translation(text, model_name)
    except Exception as exc:
        logger.warning(
            "translate_to_english failed (model=%s): %s – trying multilingual fallback",
            model_name, exc,
        )

    try:
        return _run_translation(text, fallback_model_name)
    except Exception as exc:
        logger.warning(
            "translate_to_english fallback failed (model=%s): %s – returning original text",
            fallback_model_name, exc,
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


def detect_and_translate_ticket_text(text: str) -> dict:
    """Detect language and translate non-English ticket text to English.

    Returns a context dict for the AI pipeline with ``translation_failed`` set
    when all translation attempts are exhausted without producing English text.
    """
    original_text = (text or "").strip()
    if not original_text:
        return {
            "text_for_analysis": text or "",
            "source_language": "en",
            "source_language_name": "English",
            "was_translated": False,
            "translation_attempted": False,
            "translation_failed": False,
            "original_text": "",
            "metadata": {},
        }

    detected_lang = detect_language(original_text)
    source_name = LANGUAGE_NAMES.get(detected_lang, detected_lang.upper())

    if detected_lang in ("en", "eng", "unknown"):
        return {
            "text_for_analysis": original_text,
            "source_language": "en" if detected_lang in ("en", "eng") else detected_lang,
            "source_language_name": (
                "English" if detected_lang in ("en", "eng") else source_name
            ),
            "was_translated": False,
            "translation_attempted": False,
            "translation_failed": False,
            "original_text": original_text,
            "metadata": {},
        }

    lang = str(detected_lang).lower().split("-")[0][:2]
    model_name = f"Helsinki-NLP/opus-mt-{lang}-en"
    fallback_model_name = "Helsinki-NLP/opus-mt-mul-en"
    translated_text = original_text
    failure_reason = "translation returned original text"

    for candidate_model in (model_name, fallback_model_name):
        try:
            translated_text = _run_translation(original_text, candidate_model)
            if translated_text and translated_text.strip() and translated_text.strip() != original_text:
                break
            failure_reason = f"{candidate_model} returned original or empty text"
        except Exception as e:
            failure_reason = str(e)
            logger.error(
                "Translation failed: %s | detected language: %s | model: %s",
                str(e),
                detected_lang,
                candidate_model,
            )

    if not translated_text or not translated_text.strip() or translated_text.strip() == original_text:
        logger.error(
            "Translation attempted but failed: %s | detected language: %s",
            failure_reason,
            detected_lang,
        )
        logger.warning(
            "detect_and_translate_ticket_text: translation returned empty/unchanged text "
            "(lang=%s, original_len=%d). Setting translation_failed=True.",
            detected_lang,
            len(original_text),
        )
        return {
            "text_for_analysis": original_text,
            "source_language": detected_lang,
            "source_language_name": source_name,
            "was_translated": False,
            "translation_attempted": True,
            "translation_failed": True,
            "original_text": original_text,
            "metadata": {},
        }

    return {
        "text_for_analysis": translated_text.strip(),
        "source_language": detected_lang,
        "source_language_name": source_name,
        "was_translated": True,
        "translation_attempted": True,
        "translation_failed": False,
        "original_text": original_text,
        "metadata": {},
    }
