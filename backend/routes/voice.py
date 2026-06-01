"""
Voice-to-Ticket API Router

Provides endpoints for:
- POST /api/voice/transcribe  — Upload audio → get transcribed text
- POST /api/voice/create-ticket — Upload audio → transcribe → create ticket (full pipeline)
- GET  /api/voice/health       — Check if Whisper model is available

Issue #207: Voice-to-Ticket Feature
"""

import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/voice", tags=["voice"])

# Maximum upload size: 25 MB
MAX_UPLOAD_SIZE = 25 * 1024 * 1024


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
):
    """Transcribe an uploaded audio file into text.

    Accepts: webm, wav, mp3, ogg, m4a, flac
    Returns: transcribed text, detected language, confidence, duration
    """
    from backend.services.voice_service import transcribe_audio_async

    try:
        content = await audio.read()

        if not content:
            raise HTTPException(status_code=400, detail="No audio data received.")

        if len(content) > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file too large. Max size: {MAX_UPLOAD_SIZE // (1024 * 1024)} MB.",
            )

        result = await transcribe_audio_async(
            file_bytes=content,
            filename=audio.filename or "",
            language=language,
        )

        return result

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Voice transcription endpoint error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Voice transcription failed: {str(e)}"
        )


@router.post("/create-ticket")
async def create_ticket_from_voice(
    audio: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
):
    """Full voice-to-ticket pipeline: transcribe audio → classify → return ticket draft.

    This endpoint combines speech recognition with the existing ticket analysis
    pipeline, returning a ready-to-review ticket object.
    """
    from backend.services.voice_service import transcribe_audio_async

    try:
        content = await audio.read()

        if not content:
            raise HTTPException(status_code=400, detail="No audio data received.")

        if len(content) > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file too large. Max size: {MAX_UPLOAD_SIZE // (1024 * 1024)} MB.",
            )

        # Step 1: Transcribe audio
        transcription = await transcribe_audio_async(
            file_bytes=content,
            filename=audio.filename or "",
            language=language,
        )

        transcribed_text = transcription.get("transcribed_text", "")

        if not transcribed_text:
            return {
                "status": "no_speech_detected",
                "message": "No speech was detected in the audio. Please try again.",
                "transcription": transcription,
            }

        # Step 2: Return the transcribed text for the frontend to submit
        # through the normal ticket creation flow (preserves all existing
        # classification, duplicate detection, and AI analysis).
        return {
            "status": "success",
            "transcription": transcription,
            "transcribed_text": transcribed_text,
            "suggested_title": _extract_title(transcribed_text),
            "message": "Voice transcribed successfully. Review and submit as a ticket.",
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Voice-to-ticket endpoint error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Voice-to-ticket processing failed: {str(e)}"
        )


@router.get("/health")
async def voice_health():
    """Check if the voice transcription service is available."""
    try:
        from backend.services.voice_service import _whisper_model

        model_loaded = _whisper_model is not None
        return {
            "status": "ok",
            "model_loaded": model_loaded,
            "max_audio_size_mb": MAX_UPLOAD_SIZE // (1024 * 1024),
            "supported_formats": ["webm", "wav", "mp3", "ogg", "m4a", "flac"],
        }
    except ImportError:
        return {
            "status": "unavailable",
            "model_loaded": False,
            "message": "Whisper package not installed.",
        }
    except AttributeError:
        return {
            "status": "unavailable",
            "model_loaded": False,
            "message": "Whisper model not available.",
        }


def _extract_title(text: str, max_length: int = 80) -> str:
    """Generate a short title from transcribed text.

    Takes the first sentence or first N characters, whichever is shorter.
    """
    if not text:
        return "Voice Support Request"

    # Try to use the first sentence
    for delimiter in [". ", "! ", "? ", "\n"]:
        idx = text.find(delimiter)
        if 5 < idx <= max_length:
            return text[:idx].strip()

    # Fallback: truncate
    if len(text) <= max_length:
        return text.strip()
    return text[:max_length].rsplit(" ", 1)[0].strip() + "..."
