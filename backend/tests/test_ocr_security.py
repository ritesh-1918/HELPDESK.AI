import base64
import pytest
from fastapi import HTTPException
from PIL import Image

from backend.services.ocr_service import OCRService, MAX_FILE_SIZE_BYTES

def test_oversized_image():
    service = OCRService()
    # Create a base64 string larger than MAX_FILE_SIZE_BYTES
    large_base64 = "A" * int(MAX_FILE_SIZE_BYTES * 1.5)
    with pytest.raises(HTTPException) as excinfo:
        service.extract_text(large_base64)
    assert excinfo.value.status_code == 413

def test_invalid_mime_type():
    service = OCRService()
    # Not an image
    text_data = b"Hello, this is not an image"
    text_base64 = base64.b64encode(text_data).decode("utf-8")
    
    with pytest.raises(HTTPException) as excinfo:
        service.extract_text(text_base64)
    assert excinfo.value.status_code == 400

def test_decompression_bomb():
    service = OCRService()
    valid_base64 = base64.b64encode(b"dummy data").decode("utf-8")
    
    # We will temporarily mock Image.open to raise the error
    original_open = Image.open
    def mock_open(*args, **kwargs):
        raise Image.DecompressionBombError("Decompression bomb detected")
    Image.open = mock_open
    
    try:
        with pytest.raises(HTTPException) as excinfo:
            service.extract_text(valid_base64)
        assert excinfo.value.status_code == 413
        assert "Decompression bomb detected" in excinfo.value.detail
    finally:
        Image.open = original_open
