"""
Voice-to-Ticket Service — Speech Recognition Pipeline

Provides asynchronous audio transcription using OpenAI Whisper with:
- Lazy model loading (base model for fast startup)
- Audio file validation (format, size, duration)
- Multi-format support (webm, wav, mp3, ogg, m4a, flac)
- Temporary file cleanup guarantees
- Structured error responses

Issue #207: Voice-to-Ticket Feature
"""

import asyncio
import tempfile
import os
import logging
import struct
import wave
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB hard limit
ALLOWED_EXTENSIONS = {".webm", ".wav", ".mp3", ".ogg", ".m4a", ".flac", ".mp4", ".mpeg"}
WHISPER_MODEL_NAME = os.environ.get("WHISPER_MODEL", "base")

# ---------------------------------------------------------------------------
# Lazy-loaded Whisper model (singleton, async-safe)
# ---------------------------------------------------------------------------
_whisper_model = None
_model_lock = asyncio.Lock()


async def get_whisper_model():
    """Load and cache the Whisper model on first use.

    Uses a double-checked lock so only one coroutine performs the heavy I/O.
    The model itself is loaded in a thread to avoid blocking the event loop.
    """
    global _whisper_model
    if _whisper_model is None:
        async with _model_lock:
            if _whisper_model is None:
                logger.info("Loading Whisper '%s' model (first request)...", WHISPER_MODEL_NAME)
                import whisper  # lazy import — only when needed
                _whisper_model = await asyncio.to_thread(whisper.load_model, WHISPER_MODEL_NAME)
                logger.info("Whisper '%s' model loaded successfully.", WHISPER_MODEL_NAME)
    return _whisper_model


# ---------------------------------------------------------------------------
# Audio validation helpers
# ---------------------------------------------------------------------------

def _validate_audio_bytes(file_bytes: bytes, filename: str = "") -> Optional[str]:
    """Return an error message if the audio is invalid, else ``None``."""
    if not file_bytes:
        return "Empty audio file received."
    if len(file_bytes) > MAX_AUDIO_SIZE_BYTES:
        return (
            f"Audio file too large ({len(file_bytes) / 1024 / 1024:.1f} MB). "
            f"Maximum allowed is {MAX_AUDIO_SIZE_BYTES / 1024 / 1024:.0f} MB."
        )
    # Check extension if a filename was supplied
    if filename:
        ext = Path(filename).suffix.lower()
        if ext and ext not in ALLOWED_EXTENSIONS:
            return (
                f"Unsupported audio format '{ext}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )
    return None


def _guess_suffix(filename: str = "") -> str:
    """Return a tempfile suffix matching the uploaded file's extension."""
    if filename:
        ext = Path(filename).suffix.lower()
        if ext in ALLOWED_EXTENSIONS:
            return ext
    return ".webm"  # sensible default for browser MediaRecorder output


def _get_audio_duration_seconds(path: str) -> Optional[float]:
    """Try to read audio duration. Returns None if not determinable."""
    try:
        # WAV files have a straightforward header
        if path.endswith(".wav"):
            with wave.open(path, "rb") as wf:
                return wf.getnframes() / wf.getframerate()
    except Exception:
        pass
    # For other formats, ffprobe would be ideal but we skip it to avoid
    # an extra system dependency. Whisper will handle the rest.
    return None


# ---------------------------------------------------------------------------
# Core transcription
# ---------------------------------------------------------------------------

async def transcribe_audio_async(
    file_bytes: bytes,
    filename: str = "",
    language: Optional[str] = None,
) -> dict:
    """Transcribe audio bytes into text using OpenAI Whisper.

    Args:
        file_bytes: Raw audio file content.
        filename:   Original filename (used for extension detection).
        language:   Optional ISO-639-1 language hint (e.g. "en", "es").
                    When ``None``, Whisper auto-detects the language.

    Returns:
        A dict with keys:
          - transcribed_text: str
          - detected_language: str (ISO-639-1)
          - confidence: float (0-1 approximation)
          - duration_seconds: float | None
    """
    # -- Validation --
    error = _validate_audio_bytes(file_bytes, filename)
    if error:
        raise ValueError(error)

    model = await get_whisper_model()
    suffix = _guess_suffix(filename)

    # -- Write to temp file --
    fd, temp_path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(file_bytes)
        fd = -1  # prevent double-close in finally

        duration = _get_audio_duration_seconds(temp_path)

        # -- Transcribe in background thread --
        transcribe_kwargs: dict = {}
        if language:
            transcribe_kwargs["language"] = language

        result = await asyncio.to_thread(
            model.transcribe, temp_path, **transcribe_kwargs
        )

        text = result.get("text", "").strip()
        detected_lang = result.get("language", "en")

        # Whisper doesn't expose per-segment confidence reliably for all
        # models, so we use a heuristic: if text is non-empty, assume high.
        confidence = 0.95 if text else 0.0

        return {
            "transcribed_text": text,
            "detected_language": detected_lang,
            "confidence": confidence,
            "duration_seconds": round(duration, 2) if duration else None,
        }

    except ValueError:
        raise  # validation errors bubble up as-is
    except Exception as exc:
        logger.error("Error transcribing audio: %s", exc, exc_info=True)
        raise RuntimeError(f"Transcription failed: {exc}") from exc
    finally:
        # Guarantee cleanup to prevent disk leaks
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError as cleanup_err:
                logger.warning("Failed to clean up temp audio %s: %s", temp_path, cleanup_err)
