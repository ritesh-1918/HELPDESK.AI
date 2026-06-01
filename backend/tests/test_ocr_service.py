import pytest
import sys
from unittest.mock import patch, MagicMock

sys.modules['easyocr'] = MagicMock()

from backend.services.ocr_service import OCRService


class TestOCRServiceInputValidation:
    """Tests for input validation in ocr_service"""

    def test_extract_text_empty_string_returns_empty(self):
        """Test that empty string returns empty without processing"""
        svc = OCRService()
        result = svc.extract_text("")
        assert result == ""

    def test_extract_text_whitespace_only_returns_empty(self):
        """Test that whitespace-only input returns empty"""
        svc = OCRService()
        result = svc.extract_text("   ")
        assert result == ""

    def test_extract_text_none_input_returns_empty(self):
        """Test that None input returns empty"""
        svc = OCRService()
        result = svc.extract_text(None)
        assert result == ""

    def test_extract_text_invalid_base64_returns_empty(self):
        """Test that invalid base64 characters return empty"""
        svc = OCRService()
        result = svc.extract_text("not valid base64!!!")
        assert result == ""

    def test_extract_text_valid_base64_processes(self):
        """Test that valid base64 data is processed"""
        svc = OCRService()

        with patch('base64.b64decode', return_value=b'fake_image_data') as mock_decode:
            with patch('backend.services.ocr_service._get_reader') as mock_get_reader:
                mock_reader = MagicMock()
                mock_reader.readtext.return_value = ["extracted text"]
                mock_get_reader.return_value = mock_reader

                result = svc.extract_text("dGVzdCBkYXRh")
                assert result == "extracted text"
                mock_decode.assert_called_once_with("dGVzdCBkYXRh")

    def test_extract_text_strips_data_uri_prefix(self):
        """Test that data URI prefix (e.g. data:image/png;base64,) is stripped before decoding"""
        svc = OCRService()

        with patch('base64.b64decode', return_value=b'fake_image_data') as mock_decode:
            with patch('backend.services.ocr_service._get_reader') as mock_get_reader:
                mock_reader = MagicMock()
                mock_reader.readtext.return_value = ["extracted text from data uri"]
                mock_get_reader.return_value = mock_reader

                result = svc.extract_text("data:image/png;base64,dGVzdCBkYXRh")
                assert result == "extracted text from data uri"
                # Check that the prefix was stripped and only clean base64 string was decoded
                mock_decode.assert_called_once_with("dGVzdCBkYXRh")

    def test_extract_text_handles_missing_padding(self):
        """Test that base64 strings with missing padding have padding added properly"""
        svc = OCRService()

        with patch('base64.b64decode', return_value=b'padded_data') as mock_decode:
            with patch('backend.services.ocr_service._get_reader') as mock_get_reader:
                mock_reader = MagicMock()
                mock_reader.readtext.return_value = ["extracted padded text"]
                mock_get_reader.return_value = mock_reader

                # "dGVzdCBkYXRhY" is length 13, missing padding (13 % 4 = 1, so needs 3 '=' characters)
                result = svc.extract_text("dGVzdCBkYXRhY")
                assert result == "extracted padded text"
                mock_decode.assert_called_once_with("dGVzdCBkYXRhY===")

    def test_extract_text_handles_exception_gracefully(self):
        """Test that OCRService handles any internal exceptions gracefully and returns empty string"""
        svc = OCRService()

        with patch('base64.b64decode', side_effect=Exception("B64 decode failure")):
            result = svc.extract_text("dGVzdCBkYXRh")
            assert result == ""