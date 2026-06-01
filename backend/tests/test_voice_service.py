"""
Comprehensive unit tests for voice service utilities and transcription (Issue #207).

Tests voice_service_utils.py (new validation module) and
backend.services.voice_service (transcribe_audio_async).

Coverage:
    validate_audio_format:
        - accepted extensions (wav, webm, mp3, ogg, mp4, m4a)
        - upper-case extension is accepted (case-insensitive)
        - rejected extensions (pdf, txt, exe, no extension)

    validate_audio_size:
        - exactly at limit → True
        - one byte over limit → False
        - empty bytes → True (0 bytes is within any limit)
        - custom max_mb parameter respected

    assert_valid_audio:
        - valid filename + small payload → no exception
        - bad extension → UnsupportedFormatError
        - good extension + oversized → AudioTooLargeError
        - error messages are human-readable

    SUPPORTED_FORMATS / MAX_AUDIO_SECONDS / DEFAULT_MAX_MB constants:
        - expected values and types

    get_supported_formats:
        - returns a list with expected extensions

    estimate_bitrate_kbps:
        - known size + duration → correct kbps value
        - duration=0 returns 0.0 (no ZeroDivisionError)

    transcribe_audio_async (mocked Whisper):
        - returns dict with transcribed_text, detected_language, confidence
        - temp file is cleaned up after transcription
        - exception in model.transcribe is re-raised
"""

import sys
import os
import asyncio
import unittest
import tempfile
from unittest.mock import MagicMock, AsyncMock, patch, call

# ─── Must mock whisper BEFORE importing voice_service ───────────────────────
sys.modules['whisper'] = MagicMock()

os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mockkey'

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# ─── Imports under test ──────────────────────────────────────────────────────
from backend.services.voice_service_utils import (
    validate_audio_format,
    validate_audio_size,
    assert_valid_audio,
    get_supported_formats,
    estimate_bitrate_kbps,
    SUPPORTED_FORMATS,
    MAX_AUDIO_SECONDS,
    DEFAULT_MAX_MB,
    AudioValidationError,
    UnsupportedFormatError,
    AudioTooLargeError,
)
from backend.services.voice_service import transcribe_audio_async


# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

class TestConstants(unittest.TestCase):

    def test_max_audio_seconds_is_120(self):
        self.assertEqual(MAX_AUDIO_SECONDS, 120)

    def test_default_max_mb_is_25(self):
        self.assertEqual(DEFAULT_MAX_MB, 25)

    def test_supported_formats_is_frozenset(self):
        self.assertIsInstance(SUPPORTED_FORMATS, frozenset)

    def test_supported_formats_contains_expected_types(self):
        expected = {'.wav', '.webm', '.mp3', '.ogg', '.mp4', '.m4a'}
        self.assertEqual(SUPPORTED_FORMATS, expected)


# ─────────────────────────────────────────────────────────────────────────────
# validate_audio_format
# ─────────────────────────────────────────────────────────────────────────────

class TestValidateAudioFormat(unittest.TestCase):

    def test_wav_accepted(self):
        self.assertTrue(validate_audio_format('recording.wav'))

    def test_webm_accepted(self):
        self.assertTrue(validate_audio_format('clip.webm'))

    def test_mp3_accepted(self):
        self.assertTrue(validate_audio_format('audio.mp3'))

    def test_ogg_accepted(self):
        self.assertTrue(validate_audio_format('audio.ogg'))

    def test_mp4_accepted(self):
        self.assertTrue(validate_audio_format('video.mp4'))

    def test_m4a_accepted(self):
        self.assertTrue(validate_audio_format('voice.m4a'))

    def test_upper_case_extension_accepted(self):
        """Extension check must be case-insensitive."""
        self.assertTrue(validate_audio_format('RECORDING.WAV'))
        self.assertTrue(validate_audio_format('clip.WebM'))

    def test_pdf_rejected(self):
        self.assertFalse(validate_audio_format('report.pdf'))

    def test_txt_rejected(self):
        self.assertFalse(validate_audio_format('notes.txt'))

    def test_exe_rejected(self):
        self.assertFalse(validate_audio_format('malware.exe'))

    def test_no_extension_rejected(self):
        self.assertFalse(validate_audio_format('audiofile'))

    def test_path_with_directories_uses_extension_only(self):
        """Full path strings should still work — only suffix is checked."""
        self.assertTrue(validate_audio_format('/tmp/uploads/mic_capture.mp3'))
        self.assertFalse(validate_audio_format('/tmp/uploads/spreadsheet.xlsx'))


# ─────────────────────────────────────────────────────────────────────────────
# validate_audio_size
# ─────────────────────────────────────────────────────────────────────────────

class TestValidateAudioSize(unittest.TestCase):

    def test_empty_bytes_accepted(self):
        self.assertTrue(validate_audio_size(b'', max_mb=1))

    def test_small_payload_accepted(self):
        self.assertTrue(validate_audio_size(b'hello world', max_mb=25))

    def test_exactly_at_limit_accepted(self):
        limit = 5 * 1024 * 1024  # 5 MB
        self.assertTrue(validate_audio_size(b'x' * limit, max_mb=5))

    def test_one_byte_over_limit_rejected(self):
        limit = 5 * 1024 * 1024
        self.assertFalse(validate_audio_size(b'x' * (limit + 1), max_mb=5))

    def test_custom_max_mb_respected(self):
        payload = b'x' * (2 * 1024 * 1024)  # 2 MB
        self.assertTrue(validate_audio_size(payload, max_mb=3))
        self.assertFalse(validate_audio_size(payload, max_mb=1))

    def test_default_max_mb_used_when_omitted(self):
        small = b'x' * 1024
        self.assertTrue(validate_audio_size(small))


# ─────────────────────────────────────────────────────────────────────────────
# assert_valid_audio
# ─────────────────────────────────────────────────────────────────────────────

class TestAssertValidAudio(unittest.TestCase):

    def test_valid_file_no_exception(self):
        """No exception for valid extension and size-within-limit."""
        assert_valid_audio('voice.webm', b'audio_data' * 100)

    def test_bad_extension_raises_unsupported_format_error(self):
        with self.assertRaises(UnsupportedFormatError):
            assert_valid_audio('document.pdf', b'data')

    def test_unsupported_format_error_is_audio_validation_error(self):
        """UnsupportedFormatError is a subtype of AudioValidationError."""
        with self.assertRaises(AudioValidationError):
            assert_valid_audio('hack.exe', b'data')

    def test_oversized_raises_audio_too_large_error(self):
        oversized = b'x' * (26 * 1024 * 1024)  # 26 MB > default 25 MB
        with self.assertRaises(AudioTooLargeError):
            assert_valid_audio('recording.wav', oversized)

    def test_audio_too_large_error_is_audio_validation_error(self):
        oversized = b'x' * (26 * 1024 * 1024)
        with self.assertRaises(AudioValidationError):
            assert_valid_audio('recording.wav', oversized)

    def test_error_messages_are_human_readable(self):
        """Exceptions must carry informative .args[0] strings."""
        try:
            assert_valid_audio('file.pdf', b'data')
        except UnsupportedFormatError as e:
            self.assertIn('.pdf', str(e))
            self.assertIn('Unsupported', str(e))

    def test_format_checked_before_size(self):
        """Bad extension → format error even when payload is also oversized."""
        oversized = b'x' * (30 * 1024 * 1024)
        with self.assertRaises(UnsupportedFormatError):
            assert_valid_audio('file.pdf', oversized)


# ─────────────────────────────────────────────────────────────────────────────
# get_supported_formats
# ─────────────────────────────────────────────────────────────────────────────

class TestGetSupportedFormats(unittest.TestCase):

    def test_returns_list(self):
        self.assertIsInstance(get_supported_formats(), list)

    def test_contains_all_known_formats(self):
        fmts = get_supported_formats()
        for ext in ['.wav', '.webm', '.mp3', '.ogg', '.mp4', '.m4a']:
            self.assertIn(ext, fmts)

    def test_is_sorted(self):
        fmts = get_supported_formats()
        self.assertEqual(fmts, sorted(fmts))


# ─────────────────────────────────────────────────────────────────────────────
# estimate_bitrate_kbps
# ─────────────────────────────────────────────────────────────────────────────

class TestEstimateBitrateKbps(unittest.TestCase):

    def test_known_values(self):
        """320 KB file over 20 s = 128 kbps."""
        result = estimate_bitrate_kbps(b'x' * 320_000, 20.0)
        self.assertAlmostEqual(result, 128.0, places=1)

    def test_zero_duration_returns_zero(self):
        """No ZeroDivisionError when duration is 0."""
        result = estimate_bitrate_kbps(b'audio', 0)
        self.assertEqual(result, 0.0)

    def test_negative_duration_returns_zero(self):
        result = estimate_bitrate_kbps(b'audio', -5.0)
        self.assertEqual(result, 0.0)


# ─────────────────────────────────────────────────────────────────────────────
# transcribe_audio_async (mocked Whisper)
# ─────────────────────────────────────────────────────────────────────────────

class TestTranscribeAudioAsync(unittest.IsolatedAsyncioTestCase):

    async def test_returns_expected_dict_structure(self):
        """transcribe_audio_async must return transcribed_text, detected_language, confidence."""
        mock_model = MagicMock()
        mock_model.transcribe.return_value = {
            'text': '  Hello, this is a test.  ',
            'language': 'en',
        }

        with patch('backend.services.voice_service.get_whisper_model',
                   new=AsyncMock(return_value=mock_model)), \
             patch('asyncio.to_thread', side_effect=lambda fn, *a, **kw: asyncio.coroutine(lambda: fn(*a, **kw))()):
            # Use a minimal patch approach: side-effect runs the blocking call synchronously
            pass

        # Simpler approach: directly patch asyncio.to_thread
        async def fake_to_thread(fn, *args, **kwargs):
            return fn(*args, **kwargs)

        with patch('backend.services.voice_service.get_whisper_model',
                   new=AsyncMock(return_value=mock_model)), \
             patch('asyncio.to_thread', side_effect=fake_to_thread):
            result = await transcribe_audio_async(b'fake_audio_bytes')

        self.assertIn('transcribed_text', result)
        self.assertIn('detected_language', result)
        self.assertIn('confidence', result)
        self.assertEqual(result['transcribed_text'], 'Hello, this is a test.')
        self.assertEqual(result['detected_language'], 'en')

    async def test_temp_file_cleaned_up_on_success(self):
        """Temp file is removed after successful transcription."""
        mock_model = MagicMock()
        mock_model.transcribe.return_value = {'text': 'ok', 'language': 'en'}

        created_paths = []

        original_mkstemp = tempfile.mkstemp

        def fake_mkstemp(suffix=''):
            fd, path = original_mkstemp(suffix=suffix)
            created_paths.append(path)
            return fd, path

        async def fake_to_thread(fn, *args, **kwargs):
            return fn(*args, **kwargs)

        with patch('backend.services.voice_service.get_whisper_model',
                   new=AsyncMock(return_value=mock_model)), \
             patch('asyncio.to_thread', side_effect=fake_to_thread), \
             patch('tempfile.mkstemp', side_effect=fake_mkstemp):
            await transcribe_audio_async(b'audio')

        for path in created_paths:
            self.assertFalse(os.path.exists(path), f"Temp file was NOT cleaned up: {path}")

    async def test_exception_in_transcribe_is_reraised(self):
        """An error from model.transcribe must propagate up to the caller."""
        mock_model = MagicMock()
        mock_model.transcribe.side_effect = RuntimeError('whisper internal error')

        async def fake_to_thread(fn, *args, **kwargs):
            return fn(*args, **kwargs)

        with patch('backend.services.voice_service.get_whisper_model',
                   new=AsyncMock(return_value=mock_model)), \
             patch('asyncio.to_thread', side_effect=fake_to_thread):
            with self.assertRaises(RuntimeError):
                await transcribe_audio_async(b'audio')


if __name__ == '__main__':
    unittest.main()
