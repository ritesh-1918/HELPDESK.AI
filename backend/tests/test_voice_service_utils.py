"""
Unit tests for backend/services/voice_service_utils.py

Covers:
- validate_audio_format: supported/unsupported extensions, case-insensitivity,
  edge cases (no extension, empty string, path with directories)
- validate_audio_size: within/at/over limit, default and custom max_mb
- assert_valid_audio: format-first ordering, UnsupportedFormatError,
  AudioTooLargeError, valid inputs pass silently
- get_supported_formats: sorted list, expected contents, immutability of source
- estimate_bitrate_kbps: known values, zero/negative duration guard, empty bytes
- Exception classes: attribute presence, message content

These tests are intentionally stdlib-only (no external dependencies) because
voice_service_utils.py itself is stdlib-only.

Run with:
    pytest backend/tests/test_voice_service_utils.py -v
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.voice_service_utils import (
    validate_audio_format,
    validate_audio_size,
    assert_valid_audio,
    get_supported_formats,
    estimate_bitrate_kbps,
    AudioValidationError,
    UnsupportedFormatError,
    AudioTooLargeError,
    SUPPORTED_FORMATS,
    DEFAULT_MAX_MB,
    MAX_AUDIO_SECONDS,
)


# ---------------------------------------------------------------------------
# validate_audio_format
# ---------------------------------------------------------------------------

class TestValidateAudioFormat:
    """Tests for validate_audio_format()."""

    @pytest.mark.parametrize("filename", [
        "recording.wav",
        "audio.mp3",
        "voice.ogg",
        "clip.webm",
        "video.mp4",
        "podcast.m4a",
    ])
    def test_returns_true_for_supported_formats(self, filename):
        assert validate_audio_format(filename) is True

    @pytest.mark.parametrize("filename", [
        "report.pdf",
        "image.jpg",
        "document.docx",
        "script.py",
        "archive.zip",
        "text.txt",
    ])
    def test_returns_false_for_unsupported_formats(self, filename):
        assert validate_audio_format(filename) is False

    @pytest.mark.parametrize("filename", [
        "RECORDING.WAV",
        "AUDIO.MP3",
        "Voice.OGG",
        "Clip.WebM",
        "Podcast.M4A",
    ])
    def test_case_insensitive(self, filename):
        assert validate_audio_format(filename) is True

    def test_file_with_directory_path(self):
        assert validate_audio_format("/tmp/uploads/user_recording.wav") is True

    def test_file_without_extension(self):
        assert validate_audio_format("no_extension") is False

    def test_empty_string(self):
        assert validate_audio_format("") is False

    def test_hidden_file_no_audio_ext(self):
        assert validate_audio_format(".gitignore") is False

    def test_multiple_dots_uses_last_extension(self):
        assert validate_audio_format("my.audio.file.mp3") is True
        assert validate_audio_format("my.audio.file.pdf") is False


# ---------------------------------------------------------------------------
# validate_audio_size
# ---------------------------------------------------------------------------

class TestValidateAudioSize:
    """Tests for validate_audio_size()."""

    def test_small_file_passes(self):
        tiny = b"audio" * 100
        assert validate_audio_size(tiny, max_mb=1) is True

    def test_exactly_at_limit_passes(self):
        limit_bytes = DEFAULT_MAX_MB * 1024 * 1024
        data = b"x" * limit_bytes
        assert validate_audio_size(data) is True

    def test_one_byte_over_limit_fails(self):
        limit_bytes = DEFAULT_MAX_MB * 1024 * 1024
        data = b"x" * (limit_bytes + 1)
        assert validate_audio_size(data) is False

    def test_custom_max_mb(self):
        data_5mb = b"x" * (5 * 1024 * 1024)
        assert validate_audio_size(data_5mb, max_mb=10) is True
        assert validate_audio_size(data_5mb, max_mb=4) is False

    def test_empty_bytes_always_passes(self):
        assert validate_audio_size(b"", max_mb=1) is True

    def test_bytearray_accepted(self):
        data = bytearray(b"x" * 100)
        assert validate_audio_size(data, max_mb=1) is True

    def test_default_max_mb_is_25(self):
        just_under = b"x" * (25 * 1024 * 1024 - 1)
        just_over = b"x" * (25 * 1024 * 1024 + 1)
        assert validate_audio_size(just_under) is True
        assert validate_audio_size(just_over) is False


# ---------------------------------------------------------------------------
# assert_valid_audio
# ---------------------------------------------------------------------------

class TestAssertValidAudio:
    """Tests for assert_valid_audio()."""

    def test_valid_file_does_not_raise(self):
        assert_valid_audio("recording.wav", b"fake audio data")

    def test_unsupported_format_raises(self):
        with pytest.raises(UnsupportedFormatError):
            assert_valid_audio("document.pdf", b"data")

    def test_file_too_large_raises(self):
        large = b"x" * (26 * 1024 * 1024)
        with pytest.raises(AudioTooLargeError):
            assert_valid_audio("recording.mp3", large, max_mb=25)

    def test_format_checked_before_size(self):
        """UnsupportedFormatError should be raised even when file is also too large."""
        huge_invalid = b"x" * (30 * 1024 * 1024)
        with pytest.raises(UnsupportedFormatError):
            assert_valid_audio("document.pdf", huge_invalid, max_mb=25)

    def test_custom_max_mb(self):
        data_3mb = b"x" * (3 * 1024 * 1024)
        assert_valid_audio("audio.wav", data_3mb, max_mb=5)   # passes
        with pytest.raises(AudioTooLargeError):
            assert_valid_audio("audio.wav", data_3mb, max_mb=2)

    def test_returns_none_on_success(self):
        result = assert_valid_audio("clip.webm", b"some data")
        assert result is None

    def test_case_insensitive_format_check(self):
        assert_valid_audio("RECORDING.WAV", b"data")  # should not raise


# ---------------------------------------------------------------------------
# get_supported_formats
# ---------------------------------------------------------------------------

class TestGetSupportedFormats:
    """Tests for get_supported_formats()."""

    def test_returns_list(self):
        result = get_supported_formats()
        assert isinstance(result, list)

    def test_list_is_sorted(self):
        result = get_supported_formats()
        assert result == sorted(result)

    def test_contains_expected_formats(self):
        result = get_supported_formats()
        for ext in ['.m4a', '.mp3', '.mp4', '.ogg', '.wav', '.webm']:
            assert ext in result, f"Expected {ext} in supported formats"

    def test_all_start_with_dot(self):
        for ext in get_supported_formats():
            assert ext.startswith('.'), f"Extension {ext!r} should start with '.'"

    def test_length_matches_constant(self):
        assert len(get_supported_formats()) == len(SUPPORTED_FORMATS)

    def test_modifying_result_does_not_affect_original(self):
        result = get_supported_formats()
        result.append('.fake')
        assert '.fake' not in SUPPORTED_FORMATS


# ---------------------------------------------------------------------------
# estimate_bitrate_kbps
# ---------------------------------------------------------------------------

class TestEstimateBitrateKbps:
    """Tests for estimate_bitrate_kbps()."""

    def test_known_value(self):
        # 320_000 bytes × 8 bits = 2_560_000 bits / 20 s = 128_000 bps = 128.0 kbps
        result = estimate_bitrate_kbps(b"x" * 320_000, 20.0)
        assert result == 128.0

    def test_zero_duration_returns_zero(self):
        assert estimate_bitrate_kbps(b"audio data", 0.0) == 0.0

    def test_negative_duration_returns_zero(self):
        assert estimate_bitrate_kbps(b"audio data", -5.0) == 0.0

    def test_empty_bytes_returns_zero(self):
        assert estimate_bitrate_kbps(b"", 10.0) == 0.0

    def test_result_is_float(self):
        result = estimate_bitrate_kbps(b"x" * 1000, 1.0)
        assert isinstance(result, float)

    def test_bytearray_accepted(self):
        data = bytearray(b"x" * 320_000)
        assert estimate_bitrate_kbps(data, 20.0) == 128.0

    def test_proportional_to_file_size(self):
        """Doubling file size should double bitrate."""
        b1 = estimate_bitrate_kbps(b"x" * 100_000, 10.0)
        b2 = estimate_bitrate_kbps(b"x" * 200_000, 10.0)
        assert abs(b2 - 2 * b1) < 0.01


# ---------------------------------------------------------------------------
# Exception class attributes
# ---------------------------------------------------------------------------

class TestExceptionClasses:
    """Tests for AudioValidationError, UnsupportedFormatError, AudioTooLargeError."""

    def test_unsupported_format_error_is_audio_validation_error(self):
        err = UnsupportedFormatError('.xyz')
        assert isinstance(err, AudioValidationError)

    def test_audio_too_large_error_is_audio_validation_error(self):
        err = AudioTooLargeError(size_bytes=100, limit_bytes=50)
        assert isinstance(err, AudioValidationError)

    def test_unsupported_format_error_stores_extension(self):
        err = UnsupportedFormatError('.xyz')
        assert err.extension == '.xyz'

    def test_unsupported_format_error_message_contains_extension(self):
        err = UnsupportedFormatError('.xyz')
        assert '.xyz' in str(err)

    def test_audio_too_large_error_stores_sizes(self):
        err = AudioTooLargeError(size_bytes=26_214_400, limit_bytes=25 * 1024 * 1024)
        assert err.size_bytes == 26_214_400
        assert err.limit_bytes == 25 * 1024 * 1024

    def test_audio_too_large_error_message_contains_sizes(self):
        err = AudioTooLargeError(size_bytes=26 * 1024 * 1024, limit_bytes=25 * 1024 * 1024)
        msg = str(err)
        assert 'MB' in msg


# ---------------------------------------------------------------------------
# Constants sanity checks
# ---------------------------------------------------------------------------

class TestConstants:
    def test_max_audio_seconds_positive(self):
        assert MAX_AUDIO_SECONDS > 0

    def test_default_max_mb_positive(self):
        assert DEFAULT_MAX_MB > 0

    def test_supported_formats_non_empty(self):
        assert len(SUPPORTED_FORMATS) > 0

    def test_supported_formats_frozenset(self):
        assert isinstance(SUPPORTED_FORMATS, frozenset)
