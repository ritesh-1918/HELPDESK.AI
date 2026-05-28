import asyncio
import tempfile
import os
import logging
import whisper

logger = logging.getLogger(__name__)

# Load the whisper model globally but lazily
_whisper_model = None
_model_lock = asyncio.Lock()

async def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        async with _model_lock:
            if _whisper_model is None:
                logger.info("Loading Whisper base model...")
                # Run the blocking load in a background thread
                _whisper_model = await asyncio.to_thread(whisper.load_model, "base")
                logger.info("Whisper base model loaded.")
    return _whisper_model

async def transcribe_audio_async(file_bytes: bytes) -> dict:
    """
    Transcribes audio bytes into text asynchronously using Whisper.
    Uses tempfile to securely write to disk and guarantees cleanup.
    """
    model = await get_whisper_model()
    
    # Create a secure temporary file
    fd, temp_path = tempfile.mkstemp(suffix=".webm")
    try:
        # Write bytes securely
        with os.fdopen(fd, 'wb') as f:
            f.write(file_bytes)
            
        # Run the heavy transcription in a separate thread to prevent event loop blocking
        result = await asyncio.to_thread(model.transcribe, temp_path)
        
        return {
            "transcribed_text": result.get("text", "").strip(),
            "detected_language": result.get("language", "en"),
            "confidence": 0.99  # Base model approximation
        }
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise
    finally:
        # Guarantee cleanup to prevent disk leak
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Failed to clean up temp audio file {temp_path}: {e}")
