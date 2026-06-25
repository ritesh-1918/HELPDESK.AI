"""
Tests for OCRService.process_document — validates input sanitisation, structure,
file extensions, content types, and empty document rejection.
"""

import sys
import base64
import io
from unittest.mock import patch, MagicMock

import pytest

# Mock easyocr before importing OCRService
sys.modules["easyocr"] = MagicMock()

from backend.services.ocr_service import (
    OCRService,
    MAX_BASE64_LENGTH,
)


# ── helpers ──────────────────────────────────────────────────────────────────

def _make_tiny_png_bytes() -> bytes:
    """Return a valid 1x1 white PNG."""
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (1, 1), "white").save(buf, format="PNG")
    return buf.getvalue()


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode()


# ── Tests ────────────────────────────────────────────────────────────────────

@pytest.mark.anyio
class TestOCRProcessDocument:
    """Tests for OCRService.process_document method."""

    # 1. Missing / None / Empty Inputs (ValueErrors)
    @pytest.mark.asyncio
    async def test_process_document_none_input_raises_value_error(self):
        svc = OCRService()
        with pytest.raises(ValueError, match="Document data cannot be None"):
            await svc.process_document(None)

    @pytest.mark.asyncio
    async def test_process_document_non_string_raises_value_error(self):
        svc = OCRService()
        with pytest.raises(ValueError, match="Document data must be a string"):
            await svc.process_document(12345)

    @pytest.mark.asyncio
    async def test_process_document_empty_input_raises_value_error(self):
        svc = OCRService()
        with pytest.raises(ValueError, match="Document data cannot be empty or whitespace-only"):
            await svc.process_document("")

    @pytest.mark.asyncio
    async def test_process_document_whitespace_input_raises_value_error(self):
        svc = OCRService()
        with pytest.raises(ValueError, match="Document data cannot be empty or whitespace-only"):
            await svc.process_document("   \n\t   ")

    # 2. Malformed Base64 structure (ValueErrors)
    @pytest.mark.asyncio
    async def test_process_document_invalid_base64_chars_raises_value_error(self):
        svc = OCRService()
        with pytest.raises(ValueError, match="Malformed base64 document data"):
            await svc.process_document("not_valid_base64_chars!!!")

    # 3. Size Limits (Rejection)
    @pytest.mark.asyncio
    async def test_process_document_payload_size_exceeded(self):
        svc = OCRService()
        huge_payload = "A" * (MAX_BASE64_LENGTH + 1)
        result = await svc.process_document(huge_payload)
        assert result["success"] is False
        assert "exceeds maximum limit" in result["error"]

    # 4. Format / Content-Type Validation
    @pytest.mark.asyncio
    async def test_process_document_unsupported_content_type(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64_data = _b64(tiny)
        result = await svc.process_document(b64_data, content_type="text/plain")
        assert result["success"] is False
        assert "Unsupported content type" in result["error"]

    @pytest.mark.asyncio
    async def test_process_document_unsupported_extension(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64_data = _b64(tiny)
        result = await svc.process_document(b64_data, filename="notes.txt")
        assert result["success"] is False
        assert "Unsupported file extension" in result["error"]

    # 5. Empty Documents (Rejection with clear message)
    @pytest.mark.asyncio
    async def test_process_document_empty_document_rejection(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64_data = _b64(tiny)
        # Mock extract_text to return empty text
        with patch.object(svc, "extract_text", return_value="   "):
            result = await svc.process_document(b64_data)
            assert result["success"] is False
            assert result["error"] == "Document contains no readable text"

    # 6. Success cases (structured output)
    @pytest.mark.asyncio
    async def test_process_document_success_image(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64_data = _b64(tiny)
        with patch.object(svc, "extract_text", return_value="Found text in image"):
            result = await svc.process_document(b64_data, filename="screenshot.png")
            assert result["success"] is True
            assert result["text"] == "Found text in image"
            assert result["error"] is None

    @pytest.mark.asyncio
    async def test_process_document_success_pdf(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64_data = _b64(tiny)
        with patch.object(svc, "extract_text", return_value="Parsed text from PDF"):
            result = await svc.process_document(b64_data, content_type="application/pdf")
            assert result["success"] is True
            assert result["text"] == "Parsed text from PDF"
            assert result["error"] is None
