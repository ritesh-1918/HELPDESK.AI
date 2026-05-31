import pytest
import io


class TestValidateAudioFormat:
    def test_returns_true_for_wav(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("recording.wav") is True

    def test_returns_true_for_mp3(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("audio.mp3") is True

    def test_returns_true_for_webm(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("voice.webm") is True

    def test_returns_true_for_ogg(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("sound.ogg") is True

    def test_returns_true_for_mp4(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("video.mp4") is True

    def test_returns_true_for_m4a(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("audio.m4a") is True

    def test_returns_false_for_pdf(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("document.pdf") is False

    def test_returns_false_for_txt(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("notes.txt") is False

    def test_is_case_insensitive(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("RECORDING.WAV") is True
        assert validate_audio_format("Audio.MP3") is True

    def test_handles_path_with_directories(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("/path/to/some/recording.wav") is True
        assert validate_audio_format("/path/to/document.pdf") is False

    def test_returns_false_for_no_extension(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("file_without_extension") is False

    def test_returns_false_for_empty_string(self):
        from services.voice_service_utils import validate_audio_format
        assert validate_audio_format("") is False


class TestValidateAudioSize:
    def test_returns_true_for_small_file(self):
        from services.voice_service_utils import validate_audio_size
        assert validate_audio_size(b"small", max_mb=1) is True

    def test_returns_true_for_exact_limit(self):
        from services.voice_service_utils import validate_audio_size
        exact_size = 25 * 1024 * 1024
        assert validate_audio_size(b"x" * exact_size, max_mb=25) is True

    def test_returns_false_for_over_limit(self):
        from services.voice_service_utils import validate_audio_size
        assert validate_audio_size(b"x" * (26 * 1024 * 1024), max_mb=25) is False

    def test_uses_default_max_mb(self):
        from services.voice_service_utils import validate_audio_size, DEFAULT_MAX_MB
        within_default = b"x" * (DEFAULT_MAX_MB * 1024 * 1024 - 1)
        assert validate_audio_size(within_default) is True

    def test_handles_bytearray(self):
        from services.voice_service_utils import validate_audio_size
        data = bytearray(b"test audio data")
        assert validate_audio_size(data, max_mb=1) is True

    def test_custom_max_mb(self):
        from services.voice_service_utils import validate_audio_size
        data = b"x" * (5 * 1024 * 1024)
        assert validate_audio_size(data, max_mb=10) is True
        assert validate_audio_size(data, max_mb=1) is False


class TestAssertValidAudio:
    def test_passes_for_valid_wav_small(self):
        from services.voice_service_utils import assert_valid_audio
        assert_valid_audio("audio.wav", b"some_audio_data")

    def test_raises_for_unsupported_format(self):
        from services.voice_service_utils import assert_valid_audio, UnsupportedFormatError
        with pytest.raises(UnsupportedFormatError):
            assert_valid_audio("document.pdf", b"data")

    def test_raises_for_large_file(self):
        from services.voice_service_utils import assert_valid_audio, AudioTooLargeError
        with pytest.raises(AudioTooLargeError):
            assert_valid_audio("audio.mp3", b"x" * (30 * 1024 * 1024), max_mb=25)

    def test_format_checked_before_size(self):
        from services.voice_service_utils import assert_valid_audio, UnsupportedFormatError
        with pytest.raises(UnsupportedFormatError):
            assert_valid_audio("bad.pdf", b"x" * (100 * 1024 * 1024))


class TestGetSupportedFormats:
    def test_returns_sorted_list(self):
        from services.voice_service_utils import get_supported_formats
        formats = get_supported_formats()
        assert isinstance(formats, list)
        assert formats == sorted(formats)

    def test_includes_common_formats(self):
        from services.voice_service_utils import get_supported_formats
        formats = get_supported_formats()
        for ext in (".wav", ".mp3", ".webm", ".ogg"):
            assert ext in formats


class TestEstimateBitrate:
    def test_returns_zero_for_zero_duration(self):
        from services.voice_service_utils import estimate_bitrate_kbps
        assert estimate_bitrate_kbps(b"some data", 0) == 0.0

    def test_returns_zero_for_negative_duration(self):
        from services.voice_service_utils import estimate_bitrate_kbps
        assert estimate_bitrate_kbps(b"data", -1) == 0.0

    def test_returns_expected_bitrate(self):
        from services.voice_service_utils import estimate_bitrate_kbps
        result = estimate_bitrate_kbps(b"x" * 320_000, 20.0)
        assert result == 128.0

    def test_returns_float(self):
        from services.voice_service_utils import estimate_bitrate_kbps
        result = estimate_bitrate_kbps(b"x" * 160_000, 10.0)
        assert isinstance(result, float)


class TestErrorClasses:
    def test_unsupported_format_error_message(self):
        from services.voice_service_utils import UnsupportedFormatError
        err = UnsupportedFormatError(".pdf")
        assert ".pdf" in str(err)
        assert "Unsupported" in str(err)

    def test_unsupported_format_error_extension_attribute(self):
        from services.voice_service_utils import UnsupportedFormatError
        err = UnsupportedFormatError(".pdf")
        assert err.extension == ".pdf"

    def test_audio_too_large_error_message(self):
        from services.voice_service_utils import AudioTooLargeError
        err = AudioTooLargeError(50 * 1024 * 1024, 25 * 1024 * 1024)
        assert "MB" in str(err)
        assert "too large" in str(err).lower()

    def test_audio_too_large_error_attributes(self):
        from services.voice_service_utils import AudioTooLargeError
        err = AudioTooLargeError(50 * 1024 * 1024, 25 * 1024 * 1024)
        assert err.size_bytes == 50 * 1024 * 1024
        assert err.limit_bytes == 25 * 1024 * 1024

    def test_both_errors_inherit_from_audio_validation_error(self):
        from services.voice_service_utils import (
            AudioValidationError, UnsupportedFormatError, AudioTooLargeError
        )
        assert issubclass(UnsupportedFormatError, AudioValidationError)
        assert issubclass(AudioTooLargeError, AudioValidationError)
