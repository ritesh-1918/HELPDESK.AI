"""
Translation API Routes — Multi-Language Ticket Support
"""

import logging
import re
import uuid
from functools import lru_cache
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any
from backend.auth_cookie import get_current_user
from backend.limiter import limiter
from backend.services.translation_service import (
    detect_language,
    get_supported_languages,
    translate_text,
    translate_ticket,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/translation", tags=["translation"])

# BCP-47: 2-3 letter primary tag, optional subtags that are alpha OR numeric
# (covers "en", "en-US", "zh-Hant", "zh-419" — UN M.49 numeric region codes).
# Previous regex used [a-zA-Z]{2,8} for subtags, rejecting valid codes like zh-419.
_LANG_TAG_RE = re.compile(r"^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$")


# ─── Shared lang-tag validator (DRY) ─────────────────────────────────────────
# Previously duplicated as validate_lang_tag in both request model classes.

def _validate_lang_tag(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    if not _LANG_TAG_RE.match(v):
        raise ValueError(
            f"Invalid BCP-47 language tag: '{v}'. "
            "Expected format like 'en', 'en-US', 'zh-Hant', or 'zh-419'."
        )
    return v


# ─── Request schemas ──────────────────────────────────────────────────────────

class TranslateTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    target_lang: str = Field(default="en", max_length=10)
    source_lang: Optional[str] = Field(default=None, max_length=10)

    @field_validator("target_lang", "source_lang", mode="before")
    @classmethod
    def validate_lang_tag(cls, v: Optional[str]) -> Optional[str]:
        return _validate_lang_tag(v)


class MessageSchema(BaseModel):
    """Structured schema for ticket messages."""
    id: Optional[str] = None
    body: str = Field(..., min_length=1, max_length=10000)
    author: Optional[str] = None


class TranslateTicketRequest(BaseModel):
    # FIX 6: subject and description now have max_length to prevent unbounded
    # strings reaching the translation service.
    subject: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = Field(default=None, max_length=20000)
    messages: Optional[list[MessageSchema]] = None
    target_lang: str = Field(default="en", max_length=10)

    @field_validator("target_lang", mode="before")
    @classmethod
    def validate_lang_tag(cls, v: str) -> str:
        return _validate_lang_tag(v)  # type: ignore[return-value]

    @model_validator(mode="after")
    def require_translatable_content(self) -> "TranslateTicketRequest":
        """
        Reject all-empty bodies. Also strips stored values so a
        whitespace-only subject does not silently reach the service.
        FIX 9: previously .strip() was checked for truthiness but the
        original un-stripped value was kept on the model.
        """
        if self.subject is not None:
            self.subject = self.subject.strip() or None
        if self.description is not None:
            self.description = self.description.strip() or None

        if not any([self.subject, self.description, self.messages]):
            raise ValueError(
                "At least one of 'subject', 'description', or 'messages' must be provided."
            )
        return self


class DetectLanguageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


# ─── Response schemas ─────────────────────────────────────────────────────────

class TranslationData(BaseModel):
    translated: str
    source_lang: Optional[str] = None
    target_lang: Optional[str] = "en"
    cached: bool = False


class TranslateResponse(BaseModel):
    success: bool
    data: TranslationData


class TicketTranslationData(BaseModel):
    """
    FIX 2: Dedicated response model for /translate-ticket.
    Previously TranslateResponse (shape: translated/source_lang/target_lang/cached)
    was reused here, but translate_ticket() returns subject/description/messages —
    a completely different shape that always failed response_model validation.
    """
    subject: Optional[str] = None
    description: Optional[str] = None
    messages: Optional[list[dict[str, Any]]] = None
    target_lang: str


class TranslateTicketResponse(BaseModel):
    success: bool
    data: TicketTranslationData


class DetectData(BaseModel):
    language: Optional[str] = None
    language_name: str
    supported: bool


class DetectResponse(BaseModel):
    success: bool
    data: DetectData


class LanguagesResponse(BaseModel):
    success: bool
    data: dict[str, str]


# ─── Language cache ───────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _cached_supported_languages() -> dict[str, str]:
    """
    Cache supported languages for the process lifetime.
    FIX 4: Paired with invalidate_languages_cache() so callers (tests,
    admin endpoints) can clear the cache without restarting the process.
    """
    return get_supported_languages()


def invalidate_languages_cache() -> None:
    """Invalidate the supported-languages cache (e.g. after an admin update)."""
    _cached_supported_languages.cache_clear()


# ─── Request-ID helper ────────────────────────────────────────────────────────

def _request_id(request: Request) -> str:
    """
    FIX 10: Return X-Request-ID header if present, else generate a UUID.
    Propagated into every log line so requests can be traced across services.
    """
    return request.headers.get("x-request-id") or str(uuid.uuid4())


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/translate", response_model=TranslateResponse)
@limiter.limit("20/minute")
async def translate(request: Request, body: TranslateTextRequest, user: dict = Depends(get_current_user)):
    """Translate text to target language with auto-detection."""
    rid = _request_id(request)
    logger.info(
        "translate: text_len=%d, target=%s, source=%s",
        len(body.text), body.target_lang, body.source_lang,
    )
    try:
        result = translate_text(
            text=body.text,
            target_lang=body.target_lang,
            source_lang=body.source_lang,
        )
        return TranslateResponse(success=True, data=result)
    except Exception:
        logger.exception("Translation failed for text_len=%d", len(body.text))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Translation service temporarily unavailable. Please try again later.",
        )


@router.post("/translate-ticket")
@limiter.limit("20/minute")
async def translate_ticket_endpoint(request: Request, body: TranslateTicketRequest, user: dict = Depends(get_current_user)):
    """Translate entire ticket content to target language."""
    rid = _request_id(request)
    # FIX 8: Restore full log line (msg_count, has_subject, has_desc regressed in prior version).
    logger.info(
        "translate_ticket: target=%s, has_subject=%s, has_desc=%s, msg_count=%d",
        body.target_lang,
        body.subject is not None,
        body.description is not None,
        len(body.messages) if body.messages else 0,
    )
    try:
        ticket_data: dict[str, Any] = {}
        if body.subject:
            ticket_data["subject"] = body.subject
        if body.description:
            ticket_data["description"] = body.description
        if body.messages:
            ticket_data["messages"] = [m.model_dump() for m in body.messages]

        result = translate_ticket(ticket_data, target_lang=body.target_lang)
        return {"success": True, "data": result}
    except ValueError as exc:
        logger.warning("translate-ticket: request_id=%s validation error", rid, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Translation request contains invalid data.",
        )
    except Exception:
        logger.exception("translate-ticket: request_id=%s failed", rid)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ticket translation service temporarily unavailable. Please try again later.",
        )


@router.post("/detect", response_model=DetectResponse)
@limiter.limit("30/minute")
async def detect(request: Request, body: DetectLanguageRequest, user: dict = Depends(get_current_user)):
    """Detect the language of the given text."""
    logger.info("detect: text_len=%d", len(body.text))
    lang = detect_language(body.text)
    if not lang:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not detect language from the provided text.",
        )
    languages = _cached_supported_languages()
    return DetectResponse(
        success=True,
        data=DetectData(
            language=lang,
            language_name=languages.get(lang, "Unknown"),
            supported=lang in languages,
        ),
    )


@router.get("/languages", response_model=LanguagesResponse)
@limiter.limit("60/minute")
async def list_languages(request: Request, user: dict = Depends(get_current_user)):
    """List supported languages for translation."""
    rid = _request_id(request)
    logger.info("[%s] languages: listing supported languages", rid)
    return {"success": True, "data": _cached_supported_languages()}
