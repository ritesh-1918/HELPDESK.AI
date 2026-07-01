import inspect

import pytest

from backend.services.voice_service_utils import (
    AudioTooLargeError,
    DEFAULT_MAX_MB,
    SUPPORTED_FORMATS,
    UnsupportedFormatError,
    assert_valid_audio,
    estimate_bitrate_kbps,
    get_supported_formats,
    validate_audio_format,
    validate_audio_size,
)


@pytest.fixture(autouse=True)
def mock_ai_services():
    """Override the app-wide autouse fixture; these utility tests need no app imports."""
    yield


@pytest.mark.parametrize(
    "filename",
    [
        "recording.wav",
        "clip.WEBM",
        "voice-note.mp3",
        "nested/path/audio.ogg",
        "C:/uploads/call.M4A",
        "video-container.mp4",
    ],
)
def test_validate_audio_format_accepts_supported_extensions_case_insensitively(filename):
    assert validate_audio_format(filename) is True


@pytest.mark.parametrize(
    "filename",
    [
        "",
        "no-extension",
        "transcript.txt",
        "recording.wav.exe",
        ".hiddenfile",
    ],
)
def test_validate_audio_format_rejects_missing_or_unsupported_extensions(filename):
    assert validate_audio_format(filename) is False


def test_validate_audio_size_accepts_empty_and_exact_limit_payloads():
    max_mb = 1
    limit_bytes = max_mb * 1024 * 1024

    assert validate_audio_size(b"", max_mb=max_mb) is True
    assert validate_audio_size(bytearray(limit_bytes), max_mb=max_mb) is True


def test_validate_audio_size_rejects_payloads_over_limit():
    max_mb = 1
    over_limit = b"x" * (max_mb * 1024 * 1024 + 1)

    assert validate_audio_size(over_limit, max_mb=max_mb) is False


def test_assert_valid_audio_allows_supported_audio_under_limit():
    assert_valid_audio("call.webm", b"audio-bytes", max_mb=1)


def test_assert_valid_audio_raises_unsupported_format_with_extension_details():
    with pytest.raises(UnsupportedFormatError) as exc_info:
        assert_valid_audio("invoice.pdf", b"payload", max_mb=1)

    assert exc_info.value.extension == ".pdf"
    assert "Unsupported audio format" in str(exc_info.value)


def test_assert_valid_audio_checks_format_before_size():
    over_limit_pdf = b"x" * (2 * 1024 * 1024)

    with pytest.raises(UnsupportedFormatError):
        assert_valid_audio("invoice.pdf", over_limit_pdf, max_mb=1)


def test_assert_valid_audio_raises_audio_too_large_with_size_details():
    max_mb = 1
    payload = b"x" * (max_mb * 1024 * 1024 + 1)

    with pytest.raises(AudioTooLargeError) as exc_info:
        assert_valid_audio("call.wav", payload, max_mb=max_mb)

    assert exc_info.value.size_bytes == len(payload)
    assert exc_info.value.limit_bytes == max_mb * 1024 * 1024
    assert "Audio file too large" in str(exc_info.value)


def test_get_supported_formats_returns_sorted_defensive_copy():
    formats = get_supported_formats()
    formats.append(".mutated")

    assert formats[:-1] == sorted(SUPPORTED_FORMATS)
    assert ".mutated" not in get_supported_formats()


@pytest.mark.parametrize(
    ("payload", "duration_seconds", "expected"),
    [
        (b"x" * 320_000, 20.0, 128.0),
        (b"x" * 1_000, 3.0, 2.67),
        (b"audio", 0, 0.0),
        (b"audio", -5, 0.0),
    ],
    ids=[
        "standard_bitrate",
        "rounded_bitrate",
        "zero_duration",
        "negative_duration",
    ],
)
def test_estimate_bitrate_kbps_handles_valid_and_invalid_durations(
    payload,
    duration_seconds,
    expected,
):
    assert estimate_bitrate_kbps(payload, duration_seconds) == pytest.approx(expected)


def test_default_size_limit_matches_declared_default_constant():
    max_mb_default = inspect.signature(validate_audio_size).parameters["max_mb"].default

    assert max_mb_default == DEFAULT_MAX_MB
