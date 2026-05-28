"""
Voice-to-Ticket Transcription Service — Issue #207

Uses OpenAI Whisper (local, no API key) to transcribe audio uploads.
Supports WAV, WebM, OGG, MP3, MP4, and M4A formats.
"""

import os
import logging
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

MAX_AUDIO_SECONDS = 120
ACCEPTED_MIMETYPES = {
    "audio/wav", "audio/wave", "audio/x-wav",
    "audio/webm", "audio/ogg", "audio/mpeg",
    "audio/mp4", "audio/m4a", "audio/x-m4a",
    "video/webm",  # Chrome records WebM with a video/* MIME
}
ACCEPTED_EXTENSIONS = {".wav", ".webm", ".ogg", ".mp3", ".mp4", ".m4a"}

try:
    import whisper as _whisper_module
    _HAS_WHISPER = True
except ImportError:
    _whisper_module = None
    _HAS_WHISPER = False


class VoiceService:
    """Lazy-loading Whisper transcription service."""

    def __init__(self) -> None:
        self._model = None
        self._model_name: str = os.environ.get("WHISPER_MODEL", "tiny")
        self._initialized: bool = False

    def _load(self) -> bool:
        if self._initialized:
            return True
        if not _HAS_WHISPER:
            logger.warning("[VoiceService] openai-whisper not installed")
            return False
        try:
            logger.info("[VoiceService] Loading Whisper model '%s'...", self._model_name)
            self._model = _whisper_module.load_model(self._model_name)
            self._initialized = True
            logger.info("[VoiceService] Whisper model loaded")
            return True
        except Exception as exc:
            logger.error("[VoiceService] Failed to load Whisper: %s", exc)
            return False

    def transcribe(self, audio_path: str) -> dict:
        """
        Transcribe audio at *audio_path* and return a result dict.

        Returns:
            {
                "transcribed_text": str,
                "detected_language": str,   # ISO-639-1 code, e.g. "en"
                "confidence": float,        # 0.0–1.0 estimated from avg log-prob
                "error": str | None,
            }
        """
        if not self._load():
            return {
                "transcribed_text": "",
                "detected_language": "unknown",
                "confidence": 0.0,
                "error": "Whisper model is not available. Install openai-whisper.",
            }

        try:
            result = self._model.transcribe(
                audio_path,
                fp16=False,  # CPU-safe
                verbose=False,
            )

            text = (result.get("text") or "").strip()
            language = result.get("language") or "unknown"

            # Whisper reports per-segment avg_logprob. Map to a rough confidence.
            segments = result.get("segments") or []
            if segments:
                avg_lp = sum(s.get("avg_logprob", -1.0) for s in segments) / len(segments)
                # avg_logprob is in (−∞, 0]. Clamp to [−1, 0] then invert.
                confidence = max(0.0, min(1.0, 1.0 + avg_lp))
            else:
                confidence = 0.0 if not text else 0.5

            return {
                "transcribed_text": text,
                "detected_language": language,
                "confidence": round(confidence, 3),
                "error": None,
            }

        except Exception as exc:
            logger.error("[VoiceService] Transcription failed: %s", exc)
            return {
                "transcribed_text": "",
                "detected_language": "unknown",
                "confidence": 0.0,
                "error": str(exc),
            }


def validate_audio_upload(filename: str, content_type: str, file_size_bytes: int) -> Optional[str]:
    """
    Return an error string if the upload is invalid, otherwise None.

    Checks:
    - File extension is accepted
    - MIME type is accepted (or at least the extension is)
    - File is not empty
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in ACCEPTED_EXTENSIONS:
        return (
            f"Unsupported file format '{suffix}'. "
            f"Accepted: {', '.join(sorted(ACCEPTED_EXTENSIONS))}"
        )

    if file_size_bytes == 0:
        return "Audio file is empty."

    return None


voice_service = VoiceService()
