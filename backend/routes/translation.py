"""
Translation API Routes — Multi-Language Ticket Support
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.translation_service import (
    translate_text,
    translate_ticket,
    detect_language,
    get_supported_languages,
)

router = APIRouter(prefix="/api/translation", tags=["translation"])


class TranslateTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    target_lang: str = Field(default="en", max_length=5)
    source_lang: Optional[str] = Field(default=None, max_length=5)


class TranslateTicketRequest(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    messages: Optional[list[dict]] = None
    target_lang: str = Field(default="en", max_length=5)


@router.post("/translate")
async def translate(request: TranslateTextRequest):
    """Translate text to target language with auto-detection."""
    try:
        result = translate_text(
            text=request.text,
            target_lang=request.target_lang,
            source_lang=request.source_lang,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/translate-ticket")
async def translate_ticket_endpoint(request: TranslateTicketRequest):
    """Translate entire ticket content to target language."""
    try:
        ticket_data = {}
        if request.subject:
            ticket_data["subject"] = request.subject
        if request.description:
            ticket_data["description"] = request.description
        if request.messages:
            ticket_data["messages"] = request.messages

        result = translate_ticket(ticket_data, target_lang=request.target_lang)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ticket translation failed: {str(e)}")


class DetectLanguageRequest(BaseModel):
    text: str = Field(..., min_length=1)


@router.post("/detect")
async def detect(request: DetectLanguageRequest):
    """Detect the language of the given text."""
    lang = detect_language(request.text)
    if not lang:
        raise HTTPException(status_code=400, detail="Could not detect language")
    languages = get_supported_languages()
    return {
        "success": True,
        "data": {
            "language": lang,
            "language_name": languages.get(lang, "Unknown"),
            "supported": lang in languages,
        },
    }


@router.get("/languages")
async def list_languages():
    """List supported languages for translation."""
    return {"success": True, "data": get_supported_languages()}
