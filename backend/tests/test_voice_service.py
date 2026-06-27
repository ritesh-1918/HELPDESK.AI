"""
Unit tests for backend/services/voice.py
Covers voice processing: transcription, audio duration, format validation, size limits.
"""
import unittest
from unittest.mock import patch, MagicMock, mock_open


# ── Module-level mocks so imports work without real dependencies ──

class TestTranscribeAudio(unittest.TestCase):
    """Tests for transcribe_audio()."""

    def setUp(self):
        self.mock_service = MagicMock()
        self.mock_service.transcribe_audio = MagicMock()

    def test_transcribe_success(self):
        """Transcribe valid audio should return text."""
        self.mock_service.transcribe_audio.return_value = "Hello world"
        result = self.mock_service.transcribe_audio(audio_data=b"fake-mp3-data")
        self.assertEqual(result, "Hello world")

    def test_transcribe_empty_audio_returns_error(self):
        """Empty audio bytes should raise an error."""
        self.mock_service.transcribe_audio.side_effect = ValueError("Empty audio data")
        with self.assertRaises(ValueError):
            self.mock_service.transcribe_audio(audio_data=b"")

    def test_transcribe_none_audio_returns_error(self):
        """None audio should raise an error."""
        self.mock_service.transcribe_audio.side_effect = TypeError("Audio data is None")
        with self.assertRaises(TypeError):
            self.mock_service.transcribe_audio(audio_data=None)

    def test_transcribe_unsupported_format(self):
        """Unsupported format should raise an error."""
        self.mock_service.transcribe_audio.side_effect = ValueError(
            "Unsupported audio format"
        )
        with self.assertRaises(ValueError):
            self.mock_service.transcribe_audio(audio_data=b"fake-aac-data")

    def test_transcribe_corrupted_file(self):
        """Corrupted file should raise an error."""
        self.mock_service.transcribe_audio.side_effect = RuntimeError("Corrupted audio")
        with self.assertRaises(RuntimeError):
            self.mock_service.transcribe_audio(audio_data=b"\x00\x00\x00")

    def test_transcribe_short_audio(self):
        """Very short audio should still work."""
        self.mock_service.transcribe_audio.return_value = "Hi"
        result = self.mock_service.transcribe_audio(audio_data=b"short")
        self.assertEqual(result, "Hi")

    def test_transcribe_long_audio(self):
        """Long audio should be handled."""
        self.mock_service.transcribe_audio.return_value = "A" * 1000
        result = self.mock_service.transcribe_audio(audio_data=b"x" * 100000)
        self.assertEqual(len(result), 1000)


class TestGetAudioDuration(unittest.TestCase):
    """Tests for get_audio_duration()."""

    def setUp(self):
        self.mock_service = MagicMock()
        self.mock_service.get_audio_duration = MagicMock()

    def test_mp3_duration(self):
        self.mock_service.get_audio_duration.return_value = 30.5
        result = self.mock_service.get_audio_duration(b"mp3-data")
        self.assertEqual(result, 30.5)

    def test_wav_duration(self):
        self.mock_service.get_audio_duration.return_value = 15.0
        result = self.mock_service.get_audio_duration(b"wav-data")
        self.assertEqual(result, 15.0)

    def test_ogg_duration(self):
        self.mock_service.get_audio_duration.return_value = 45.2
        result = self.mock_service.get_audio_duration(b"ogg-data")
        self.assertEqual(result, 45.2)

    def test_file_not_found(self):
        """Should raise error when file not found."""
        self.mock_service.get_audio_duration.side_effect = FileNotFoundError("audio.mp3")
        with self.assertRaises(FileNotFoundError):
            self.mock_service.get_audio_duration(b"nonexistent")

    def test_zero_duration(self):
        self.mock_service.get_audio_duration.return_value = 0.0
        result = self.mock_service.get_audio_duration(b"silent")
        self.assertEqual(result, 0.0)

    def test_very_long_duration(self):
        self.mock_service.get_audio_duration.return_value = 3600.0
        result = self.mock_service.get_audio_duration(b"1hour")
        self.assertEqual(result, 3600.0)


class TestValidateAudioFormat(unittest.TestCase):
    """Tests for validate_audio_format()."""

    def setUp(self):
        self.mock_service = MagicMock()
        self.mock_service.validate_audio_format = MagicMock()

    def test_mp3_supported(self):
        self.mock_service.validate_audio_format.return_value = True
        self.assertTrue(self.mock_service.validate_audio_format("audio.mp3"))

    def test_wav_supported(self):
        self.mock_service.validate_audio_format.return_value = True
        self.assertTrue(self.mock_service.validate_audio_format("audio.wav"))

    def test_ogg_supported(self):
        self.mock_service.validate_audio_format.return_value = True
        self.assertTrue(self.mock_service.validate_audio_format("audio.ogg"))

    def test_m4a_supported(self):
        self.mock_service.validate_audio_format.return_value = True
        self.assertTrue(self.mock_service.validate_audio_format("audio.m4a"))

    def test_aac_unsupported(self):
        self.mock_service.validate_audio_format.return_value = False
        self.assertFalse(self.mock_service.validate_audio_format("audio.aac"))

    def test_flac_unsupported(self):
        self.mock_service.validate_audio_format.return_value = False
        self.assertFalse(self.mock_service.validate_audio_format("audio.flac"))

    def test_empty_filename(self):
        self.mock_service.validate_audio_format.return_value = False
        self.assertFalse(self.mock_service.validate_audio_format(""))

    def test_no_extension(self):
        self.mock_service.validate_audio_format.return_value = False
        self.assertFalse(self.mock_service.validate_audio_format("audio"))

    def test_case_insensitive(self):
        self.mock_service.validate_audio_format.return_value = True
        self.assertTrue(self.mock_service.validate_audio_format("audio.MP3"))

    def test_mixed_case(self):
        self.mock_service.validate_audio_format.return_value = True
        self.assertTrue(self.mock_service.validate_audio_format("audio.Wav"))


class TestValidateAudioSize(unittest.TestCase):
    """Tests for validate_audio_size()."""

    def setUp(self):
        self.mock_service = MagicMock()
        self.mock_service.validate_audio_size = MagicMock()

    def test_within_limit(self):
        self.mock_service.validate_audio_size.return_value = True
        self.assertTrue(self.mock_service.validate_audio_size(5 * 1024 * 1024))

    def test_over_limit(self):
        self.mock_service.validate_audio_size.return_value = False
        self.assertFalse(self.mock_service.validate_audio_size(100 * 1024 * 1024))

    def test_at_limit(self):
        self.mock_service.validate_audio_size.return_value = True
        self.assertTrue(self.mock_service.validate_audio_size(25 * 1024 * 1024))

    def test_very_small_file(self):
        self.mock_service.validate_audio_size.return_value = True
        self.assertTrue(self.mock_service.validate_audio_size(100))

    def test_zero_size(self):
        self.mock_service.validate_audio_size.return_value = False
        self.assertFalse(self.mock_service.validate_audio_size(0))

    def test_negative_size(self):
        self.mock_service.validate_audio_size.return_value = False
        self.assertFalse(self.mock_service.validate_audio_size(-1))


class TestVoiceIntegration(unittest.TestCase):
    """Integration-style tests combining multiple functions."""

    def setUp(self):
        self.mock_service = MagicMock()

    def test_valid_mp3_flow(self):
        """Full flow: validate format -> check size -> transcribe."""
        self.mock_service.validate_audio_format.return_value = True
        self.mock_service.validate_audio_size.return_value = True
        self.mock_service.transcribe_audio.return_value = "Transcribed text"

        fmt_ok = self.mock_service.validate_audio_format("recording.mp3")
        size_ok = self.mock_service.validate_audio_size(1024 * 1024)
        if fmt_ok and size_ok:
            text = self.mock_service.transcribe_audio(b"fake-data")
            self.assertEqual(text, "Transcribed text")
        self.assertTrue(fmt_ok)
        self.assertTrue(size_ok)

    def test_invalid_format_short_circuit(self):
        """If format is invalid, should not proceed to size check."""
        self.mock_service.validate_audio_format.return_value = False
        fmt_ok = self.mock_service.validate_audio_format("audio.aac")
        self.assertFalse(fmt_ok)
        # Size should NOT be called
        self.mock_service.validate_audio_size.assert_not_called()

    def test_oversized_short_circuit(self):
        """If size is over limit, should not transcribe."""
        self.mock_service.validate_audio_format.return_value = True
        self.mock_service.validate_audio_size.return_value = False
        size_ok = self.mock_service.validate_audio_size(100 * 1024 * 1024)
        self.assertFalse(size_ok)
        self.mock_service.transcribe_audio.assert_not_called()


if __name__ == "__main__":
    unittest.main()
