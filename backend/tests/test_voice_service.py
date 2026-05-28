"""Unit tests for backend/services/voice_service.py — Issue #207"""

import os
import struct
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from backend.services.voice_service import (
    VoiceService,
    validate_audio_upload,
    ACCEPTED_EXTENSIONS,
)


# ---------------------------------------------------------------------------
# Minimal WAV fixture — 0.1 s of silence at 16 kHz mono 16-bit PCM
# ---------------------------------------------------------------------------

def _make_wav_bytes(duration_frames: int = 1600, sample_rate: int = 16000) -> bytes:
    """Return a valid WAV file as bytes (silence)."""
    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = duration_frames * block_align
    pcm_data = b'\x00' * data_size

    header = struct.pack(
        '<4sI4s4sIHHIIHH4sI',
        b'RIFF',
        36 + data_size,
        b'WAVE',
        b'fmt ',
        16,           # PCM chunk size
        1,            # AudioFormat PCM
        num_channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b'data',
        data_size,
    )
    return header + pcm_data


def _wav_fixture() -> str:
    """Write a WAV file to a temp path and return the path."""
    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    tmp.write(_make_wav_bytes())
    tmp.close()
    return tmp.name


# ---------------------------------------------------------------------------
# validate_audio_upload
# ---------------------------------------------------------------------------

class TestValidateAudioUpload(unittest.TestCase):

    def test_accepted_wav(self):
        self.assertIsNone(validate_audio_upload('recording.wav', 'audio/wav', 1024))

    def test_accepted_webm(self):
        self.assertIsNone(validate_audio_upload('recording.webm', 'audio/webm', 2048))

    def test_accepted_mp3(self):
        self.assertIsNone(validate_audio_upload('clip.mp3', 'audio/mpeg', 512))

    def test_accepted_ogg(self):
        self.assertIsNone(validate_audio_upload('voice.ogg', 'audio/ogg', 800))

    def test_rejected_txt(self):
        err = validate_audio_upload('notes.txt', 'text/plain', 100)
        self.assertIsNotNone(err)
        self.assertIn('.txt', err)

    def test_rejected_empty_file(self):
        err = validate_audio_upload('recording.wav', 'audio/wav', 0)
        self.assertIsNotNone(err)
        self.assertIn('empty', err.lower())

    def test_rejected_unknown_extension(self):
        err = validate_audio_upload('audio.xyz', 'audio/xyz', 500)
        self.assertIsNotNone(err)

    def test_all_accepted_extensions_pass(self):
        for ext in ACCEPTED_EXTENSIONS:
            with self.subTest(ext=ext):
                result = validate_audio_upload(f'file{ext}', 'audio/wav', 100)
                self.assertIsNone(result)


# ---------------------------------------------------------------------------
# VoiceService — unit tests with mocked Whisper
# ---------------------------------------------------------------------------

class TestVoiceService(unittest.TestCase):

    def _make_service(self) -> VoiceService:
        svc = VoiceService()
        return svc

    def test_transcribe_returns_error_when_no_whisper(self):
        svc = self._make_service()
        with patch('backend.services.voice_service._HAS_WHISPER', False):
            svc._initialized = False
            svc._model = None
            result = svc.transcribe('/nonexistent/path.wav')
        self.assertIn('error', result)
        self.assertIsNotNone(result['error'])
        self.assertEqual(result['transcribed_text'], '')

    def test_transcribe_returns_text_on_success(self):
        mock_model = MagicMock()
        mock_model.transcribe.return_value = {
            'text': 'My laptop screen is broken',
            'language': 'en',
            'segments': [{'avg_logprob': -0.2}],
        }

        svc = self._make_service()
        svc._model = mock_model
        svc._initialized = True

        wav_path = _wav_fixture()
        try:
            result = svc.transcribe(wav_path)
        finally:
            os.unlink(wav_path)

        self.assertEqual(result['transcribed_text'], 'My laptop screen is broken')
        self.assertEqual(result['detected_language'], 'en')
        self.assertGreater(result['confidence'], 0.0)
        self.assertIsNone(result['error'])

    def test_confidence_clamped_to_0_1(self):
        mock_model = MagicMock()
        mock_model.transcribe.return_value = {
            'text': 'test',
            'language': 'en',
            'segments': [{'avg_logprob': -10.0}],  # very negative → confidence near 0
        }
        svc = self._make_service()
        svc._model = mock_model
        svc._initialized = True

        wav_path = _wav_fixture()
        try:
            result = svc.transcribe(wav_path)
        finally:
            os.unlink(wav_path)

        self.assertGreaterEqual(result['confidence'], 0.0)
        self.assertLessEqual(result['confidence'], 1.0)

    def test_confidence_fallback_when_no_segments(self):
        mock_model = MagicMock()
        mock_model.transcribe.return_value = {
            'text': 'hello',
            'language': 'en',
            'segments': [],
        }
        svc = self._make_service()
        svc._model = mock_model
        svc._initialized = True

        wav_path = _wav_fixture()
        try:
            result = svc.transcribe(wav_path)
        finally:
            os.unlink(wav_path)

        # Non-empty text with no segments → 0.5
        self.assertEqual(result['confidence'], 0.5)

    def test_transcribe_wraps_exception(self):
        mock_model = MagicMock()
        mock_model.transcribe.side_effect = RuntimeError('CUDA out of memory')

        svc = self._make_service()
        svc._model = mock_model
        svc._initialized = True

        wav_path = _wav_fixture()
        try:
            result = svc.transcribe(wav_path)
        finally:
            os.unlink(wav_path)

        self.assertEqual(result['transcribed_text'], '')
        self.assertIn('CUDA out of memory', result['error'])

    def test_load_fails_gracefully_without_package(self):
        svc = self._make_service()
        with patch('backend.services.voice_service._HAS_WHISPER', False):
            svc._initialized = False
            loaded = svc._load()
        self.assertFalse(loaded)
        self.assertFalse(svc._initialized)

    def test_load_skips_if_already_initialized(self):
        svc = self._make_service()
        svc._initialized = True
        # _load should short-circuit without touching _whisper_module
        with patch('backend.services.voice_service._whisper_module') as mock_pkg:
            result = svc._load()
        mock_pkg.load_model.assert_not_called()
        self.assertTrue(result)

    def test_empty_transcript_when_whisper_returns_blank(self):
        mock_model = MagicMock()
        mock_model.transcribe.return_value = {
            'text': '   ',
            'language': 'unknown',
            'segments': [],
        }
        svc = self._make_service()
        svc._model = mock_model
        svc._initialized = True

        wav_path = _wav_fixture()
        try:
            result = svc.transcribe(wav_path)
        finally:
            os.unlink(wav_path)

        self.assertEqual(result['transcribed_text'], '')
        self.assertEqual(result['confidence'], 0.0)


# ---------------------------------------------------------------------------
# Wav fixture sanity
# ---------------------------------------------------------------------------

class TestWavFixture(unittest.TestCase):

    def test_fixture_is_valid_wav(self):
        wav = _make_wav_bytes()
        self.assertTrue(wav.startswith(b'RIFF'))
        self.assertIn(b'WAVE', wav[:12])
        self.assertIn(b'fmt ', wav)
        self.assertIn(b'data', wav)

    def test_fixture_file_exists_and_nonzero(self):
        path = _wav_fixture()
        try:
            self.assertTrue(os.path.exists(path))
            self.assertGreater(os.path.getsize(path), 0)
        finally:
            os.unlink(path)


if __name__ == '__main__':
    unittest.main()
