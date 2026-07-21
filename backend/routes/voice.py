"""
Voice-to-Ticket API Router

Provides endpoints for:
- POST /api/voice/transcribe    — Upload audio → get transcribed text
- POST /api/voice/create-ticket — Upload audio → transcribe → return ticket draft
- GET  /api/voice/health        — Check if Whisper model is available

Issue #207: Voice-to-Ticket Feature
"""

import logging
import re
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, Field
from backend.auth_cookie import get_current_user
from backend.services.rate_limit_config import limiter

from backend.services.voice_service import (
    get_voice_service_health,
    transcribe_audio_async,
)



logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/voice", tags=["voice"])

# Maximum upload size: 25 MB
MAX_UPLOAD_SIZE = 25 * 1024 * 1024
MAX_UPLOAD_SIZE_MB = MAX_UPLOAD_SIZE // (1024 * 1024)
SUPPORTED_FORMATS = ["webm", "wav", "mp3", "ogg", "m4a", "flac"]

# FIX 6: BCP-47 language tag pattern reused from translation router.
_LANG_TAG_RE = re.compile(r"^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$")

# BCP-47 language tag pattern (e.g. "en", "zh", "fr-CA", "zh-Hans")
_BCP47_PATTERN = re.compile(
    r"^[a-zA-Z]{2,3}"           # ISO 639-1/2 primary language
    r"(?:-[a-zA-Z]{2,3})?"      # optional ISO 3166 region
    r"(?:-[a-zA-Z]{4})?"        # optional ISO 15924 script
    r"$"
)

class TranscribeResponse(BaseModel):
    transcribed_text: str
    detected_language: str = "en"
    confidence: float = Field(ge=0.0, le=1.0)
    duration_seconds: Optional[float] = None


class CreateTicketResponse(BaseModel):
    status: str
    message: str
    transcription: dict
    transcribed_text: Optional[str] = None
    suggested_title: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    message: Optional[str] = None


@router.post("/transcribe")
@limiter.limit("10/minute")
async def transcribe_audio(
    request: Request,
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
    user: dict = Depends(get_current_user),
) -> TranscribeResponse:
    """Transcribe an uploaded audio file into text.

    Accepts: webm, wav, mp3, ogg, m4a, flac
    Returns: transcribed text, detected language, confidence, duration
    """
    rid = _request_id(request)
    lang = _validate_language(language)
    logger.info(
        "transcribe: request_id=%s filename=%s language=%s",
        rid, audio.filename, lang,
    )

    content = await audio.read()
    _read_and_validate_audio(content, audio.filename or "")

    try:
        result = await transcribe_audio_async(
            file_bytes=content,
            filename=audio.filename or "",
            language=lang,
        )
        return result

    except ValueError as exc:
        logger.warning("transcribe: request_id=%s validation error", rid, exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request. Please check your input.")
    except RuntimeError as exc:
        logger.error("transcribe: request_id=%s runtime error", rid, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transcription service error. Please try again later.",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("transcribe: request_id=%s unexpected error", rid)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Voice transcription failed. Please try again later.",
        )


@router.post("/create-ticket")
@limiter.limit("10/minute")
async def create_ticket_from_voice(
    request: Request,
    audio: UploadFile = File(...),
    # FIX 9: max_length guards on user_id and company — previously unbounded.
    user_id: Optional[str] = Form(None, max_length=128),
    company: Optional[str] = Form(None, max_length=256),
    language: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
) -> CreateTicketResponse:
    """Full voice-to-ticket pipeline: transcribe audio → return ticket draft.

    Combines speech recognition with the existing ticket analysis pipeline,
    returning a ready-to-review ticket object.
    """
    rid = _request_id(request)
    lang = _validate_language(language)
    logger.info(
        "create-ticket: request_id=%s filename=%s language=%s user_id=%s company=%s",
        rid, audio.filename, lang, user_id, company,
    )

    content = await audio.read()
    _read_and_validate_audio(content, audio.filename or "")

    try:
        # Step 1: Transcribe
        transcription = await transcribe_audio_async(
            file_bytes=content,
            filename=audio.filename or "",
            language=lang,
        )

        transcribed_text = transcription.get("transcribed_text", "")

        if not transcribed_text:
            return CreateTicketResponse(
                status="no_speech_detected",
                message="No speech was detected in the audio. Please try again.",
                transcription=transcription,
            )

        # Step 2: Return draft for frontend to submit through the normal
        # ticket creation flow (preserves classification, dedup, AI analysis).
        return CreateTicketResponse(
            status="success",
            transcription=transcription,
            transcribed_text=transcribed_text,
            suggested_title=_extract_title(transcribed_text),
            message="Voice transcribed successfully. Review and submit as a ticket.",
        )

    except ValueError as exc:
        logger.warning("create-ticket: request_id=%s validation error", rid, exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request. Please check your input.")
    except RuntimeError as exc:
        logger.error("create-ticket: request_id=%s runtime error", rid, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transcription service error. Please try again later.",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("create-ticket: request_id=%s unexpected error", rid)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Voice-to-ticket processing failed. Please try again later.",
        )


@router.get("/health", response_model=HealthResponse)
async def voice_health(user: dict = Depends(get_current_user)) -> HealthResponse:
    """Check if the voice transcription service is available."""
    try:
        # FIX 8: Call a public get_voice_service_health() function instead of
        # importing private _whisper_model directly. This decouples the router
        # from internal service implementation details.
        health = get_voice_service_health()
        return HealthResponse(
            status="ok" if health.get("model_loaded") else "unavailable",
            model_loaded=health.get("model_loaded", False),
        )
    except ImportError:
        return HealthResponse(
            status="unavailable",
            model_loaded=False,
            message="Whisper package not installed.",
        )
    except Exception:
        logger.exception("voice_health: unexpected error")
        return HealthResponse(
            status="unavailable",
            model_loaded=False,
            message="Whisper model not available.",
        )


# ─── Internal helpers ─────────────────────────────────────────────────────────

def _request_id(request: Request) -> str:
    return request.headers.get("x-request-id") or str(uuid.uuid4())


def _validate_language(language: Optional[str]) -> Optional[str]:
    if language is None or language == "":
        return None
    if not _LANG_TAG_RE.match(language):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid BCP-47 language tag: '{language}'. "
                "Expected format like 'en', 'en-US', 'zh-Hant', or 'zh-419'."
            ),
        )
    return language


def _read_and_validate_audio(content: bytes, filename: str) -> None:
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty audio file received.",
        )
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio file too large. Maximum allowed is {MAX_UPLOAD_SIZE_MB} MB.",
        )
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if not ext or ext not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format. Allowed: {', '.join(SUPPORTED_FORMATS)}.",
        )


def _extract_title(text: str, max_length: int = 80) -> str:
    """Generate a short title from transcribed text.

    Takes the first sentence (if between 6 and max_length chars) or
    truncates at the last word boundary within max_length.
    """
    if not text:
        return "Voice Support Request"

    # Use the first sentence if it falls within a readable length range.
    # Lower bound (idx > 5) avoids single-word non-sentences like "Ok. ..."
    for delimiter in (". ", "! ", "? ", "\n"):
        idx = text.find(delimiter)
        if 5 < idx <= max_length:
            return text[:idx].strip()

    if len(text) <= max_length:
        return text.strip()

    return text[:max_length].rsplit(" ", 1)[0].strip() + "..."
