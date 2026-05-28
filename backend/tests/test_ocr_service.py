import pytest
from unittest.mock import patch, MagicMock


class TestOCRService:
    @pytest.fixture
    def service(self):
        from backend.services.ocr_service import OCRService
        return OCRService()

    def test_extract_text_returns_empty_for_empty_input(self, service):
        assert service.extract_text("") == ""

    def test_extract_text_strips_data_uri_prefix(self, service):
        with patch("backend.services.ocr_service._get_reader") as mock_reader:
            mock_instance = MagicMock()
            mock_reader.return_value = mock_instance
            mock_instance.readtext.return_value = ["hello world"]

            result = service.extract_text("data:image/png;base64,aGVsbG8=")
            assert result == "hello world"

    def test_extract_text_handles_base64_padding(self, service):
        with patch("backend.services.ocr_service._get_reader") as mock_reader:
            mock_instance = MagicMock()
            mock_reader.return_value = mock_instance
            mock_instance.readtext.return_value = ["extracted text"]

            result = service.extract_text("aGVsbG8")
            assert result == "extracted text"

    def test_extract_text_returns_empty_on_decode_error(self, service):
        result = service.extract_text("not-valid-base64!!!")
        assert result == ""

    def test_extract_text_returns_empty_on_reader_error(self, service):
        with patch("backend.services.ocr_service._get_reader") as mock_reader:
            mock_instance = MagicMock()
            mock_reader.return_value = mock_instance
            mock_instance.readtext.side_effect = Exception("OCR failed")

            result = service.extract_text("aGVsbG8=")
            assert result == ""

    def test_extract_text_joins_multiple_results(self, service):
        with patch("backend.services.ocr_service._get_reader") as mock_reader:
            mock_instance = MagicMock()
            mock_reader.return_value = mock_instance
            mock_instance.readtext.return_value = ["line1", "line2", "line3"]

            result = service.extract_text("aGVsbG8=")
            assert result == "line1 line2 line3"
