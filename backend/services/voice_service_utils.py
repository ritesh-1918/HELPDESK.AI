"""
voice_service_utils.py
======================

Standalone validation helpers for the voice-to-ticket pipeline (Issue #207).

This module provides format and size validation as pure utility functions so
they can be used both by the main voice_service.py endpoint handler and by
external callers (e.g., frontend upload guards, CLI tools) without loading
the heavy Whisper model.

Intentionally kept dependency-free (stdlib only) so it can be imported in
any environment, including CI runners without torch/whisper installed.

Classes:
    AudioValidationError    — base exception for validation failures
    UnsupportedFormatError  — raised when file extension is not supported
    AudioTooLargeError      — raised when file exceeds the size limit

Constants:
    MAX_AUDIO_SECONDS   — maximum allowed recording length (seconds)
    SUPPORTED_FORMATS   — set of accepted file extensions (lower-cased, dot-prefixed)
    DEFAULT_MAX_MB      — default maximum file size in megabytes

Functions:
    validate_audio_format(filename)          — True if extension is supported
    validate_audio_size(file_bytes, max_mb)  — True if within size limit
    assert_valid_audio(filename, file_bytes) — combined guard; raises on violation
    get_supported_formats()                  — returns sorted list of extensions
    estimate_bitrate_kbps(file_bytes, duration_seconds) — helper for diagnostics
"""

import pathlib
from typing import Union

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_AUDIO_SECONDS: int = 120
"""Maximum allowed audio recording length in seconds."""

DEFAULT_MAX_MB: int = 25
"""Default maximum upload size in megabytes."""

SUPPORTED_FORMATS: frozenset = frozenset({
    '.wav', '.webm', '.mp3', '.ogg', '.mp4', '.m4a'
})
"""Accepted file extensions for audio upload (lower-cased, dot-prefixed)."""


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class AudioValidationError(Exception):
    """Base class for all audio validation failures."""


class UnsupportedFormatError(AudioValidationError):
    """
    Raised when the submitted file's extension is not in SUPPORTED_FORMATS.

    Attributes:
        extension (str): The rejected file extension.
    """
    def __init__(self, extension: str) -> None:
        self.extension = extension
        super().__init__(
            f"Unsupported audio format: '{extension}'. "
            f"Accepted formats: {', '.join(sorted(SUPPORTED_FORMATS))}"
        )


class AudioTooLargeError(AudioValidationError):
    """
    Raised when the submitted audio file exceeds the allowed size limit.

    Attributes:
        size_bytes (int):  Actual file size in bytes.
        limit_bytes (int): Allowed limit in bytes.
    """
    def __init__(self, size_bytes: int, limit_bytes: int) -> None:
        self.size_bytes = size_bytes
        self.limit_bytes = limit_bytes
        actual_mb = size_bytes / (1024 * 1024)
        limit_mb = limit_bytes / (1024 * 1024)
        super().__init__(
            f"Audio file too large: {actual_mb:.2f} MB (limit: {limit_mb:.0f} MB)."
        )


# ---------------------------------------------------------------------------
# Validation functions
# ---------------------------------------------------------------------------

def validate_audio_format(filename: str) -> bool:
    """
    Return True if the file extension is a supported audio format.

    The check is case-insensitive; e.g. '.WAV' and '.wav' both pass.

    Args:
        filename: Original filename or path string (only the extension is used).

    Returns:
        True if the extension is in SUPPORTED_FORMATS, False otherwise.

    Examples:
        >>> validate_audio_format("recording.webm")
        True
        >>> validate_audio_format("document.pdf")
        False
    """
    ext = pathlib.Path(filename).suffix.lower()
    return ext in SUPPORTED_FORMATS


def validate_audio_size(file_bytes: Union[bytes, bytearray], max_mb: int = DEFAULT_MAX_MB) -> bool:
    """
    Return True if the file size is within the allowed limit.

    Args:
        file_bytes: Raw bytes of the audio file.
        max_mb:     Maximum allowed size in megabytes (default: DEFAULT_MAX_MB).

    Returns:
        True if len(file_bytes) <= max_mb * 1024 * 1024, False otherwise.

    Examples:
        >>> validate_audio_size(b"small", max_mb=1)
        True
        >>> validate_audio_size(b"x" * (26 * 1024 * 1024), max_mb=25)
        False
    """
    return len(file_bytes) <= max_mb * 1024 * 1024


def assert_valid_audio(filename: str, file_bytes: Union[bytes, bytearray],
                        max_mb: int = DEFAULT_MAX_MB) -> None:
    """
    Combined validation guard — raises a descriptive exception on the first violation.

    Checks format first, then size. Callers can catch AudioValidationError to
    return a structured 4xx response to the client.

    Args:
        filename:   Original filename used for format detection.
        file_bytes: Raw bytes of the audio file.
        max_mb:     Maximum allowed size in megabytes.

    Raises:
        UnsupportedFormatError: Extension is not in SUPPORTED_FORMATS.
        AudioTooLargeError:     File exceeds max_mb limit.

    Examples:
        >>> assert_valid_audio("recording.wav", b"some_audio_data")  # no exception
        >>> assert_valid_audio("report.pdf", b"data")
        Traceback (most recent call last):
            ...
        UnsupportedFormatError: Unsupported audio format: '.pdf'. ...
    """
    if not validate_audio_format(filename):
        ext = pathlib.Path(filename).suffix.lower()
        raise UnsupportedFormatError(ext)

    limit_bytes = max_mb * 1024 * 1024
    if len(file_bytes) > limit_bytes:
        raise AudioTooLargeError(len(file_bytes), limit_bytes)


def get_supported_formats() -> list:
    """
    Return a sorted list of supported audio file extensions.

    Returns:
        List[str]: e.g. ['.m4a', '.mp3', '.mp4', '.ogg', '.wav', '.webm']
    """
    return sorted(SUPPORTED_FORMATS)


def estimate_bitrate_kbps(file_bytes: Union[bytes, bytearray], duration_seconds: float) -> float:
    """
    Estimate audio bitrate in kbps from file size and known duration.

    Useful for diagnostic logging when Whisper returns the audio duration.

    Args:
        file_bytes:       Raw bytes of the audio file.
        duration_seconds: Known duration of the audio in seconds.

    Returns:
        Estimated bitrate in kilobits per second, or 0.0 if duration is <= 0.

    Examples:
        >>> estimate_bitrate_kbps(b"x" * 320_000, 20.0)
        128.0
    """
    if duration_seconds <= 0:
        return 0.0
    bits = len(file_bytes) * 8
    return round(bits / duration_seconds / 1000, 2)
