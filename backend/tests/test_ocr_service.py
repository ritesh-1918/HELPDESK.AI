"""
Tests for OCRService — validates input sanitisation, size guards,
concurrency limits, and timeout behaviour.
"""

import asyncio
import base64
import io
import sys
from unittest.mock import patch, MagicMock, AsyncMock

import pytest

# Mock easyocr before importing OCRService
sys.modules["easyocr"] = MagicMock()

from backend.services.ocr_service import (
    OCRService,
    MAX_BASE64_LENGTH,
    MAX_DECODED_BYTES,
    MAX_IMAGE_DIMENSION,
    MAX_PIXELS,
    OCR_TIMEOUT_SECONDS,
    MAX_CONCURRENT_OCR,
)


# ── helpers ──────────────────────────────────────────────────────────────────

def _make_tiny_png_bytes() -> bytes:
    """Return a valid 1×1 white PNG."""
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (1, 1), "white").save(buf, format="PNG")
    return buf.getvalue()


def _make_png_bytes(width: int = 10, height: int = 10) -> bytes:
    """Return a valid PNG of the given dimensions."""
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (width, height), "white").save(buf, format="PNG")
    return buf.getvalue()


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode()


# ── Input validation ─────────────────────────────────────────────────────────

@pytest.mark.anyio
class TestOCRServiceInputValidation:
    """Basic input sanitisation."""

    @pytest.mark.asyncio
    async def test_empty_string_returns_empty(self):
        svc = OCRService()
        assert await svc.extract_text("") == ""

    @pytest.mark.asyncio
    async def test_whitespace_only_returns_empty(self):
        svc = OCRService()
        assert await svc.extract_text("   ") == ""

    @pytest.mark.asyncio
    async def test_none_input_returns_empty(self):
        svc = OCRService()
        assert await svc.extract_text(None) == ""

    @pytest.mark.asyncio
    async def test_invalid_base64_chars_returns_empty(self):
        svc = OCRService()
        assert await svc.extract_text("not valid base64!!!") == ""

    @pytest.mark.asyncio
    async def test_strips_data_uri_prefix(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64 = _b64(tiny)

        with patch.object(svc, "_run_ocr", return_value=["hello"]):
            result = await svc.extract_text(f"data:image/png;base64,{b64}")
            assert result == "hello"

    @pytest.mark.asyncio
    async def test_accepts_pdf_content_type(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64 = _b64(tiny)
        # PDF is now supported — routes to PDF extraction; since the blob
        # is not a real PDF, the extraction fails gracefully and returns "".
        result = await svc.extract_text(f"data:application/pdf;base64,{b64}")
        assert result == ""

    @pytest.mark.asyncio
    async def test_handles_missing_padding(self):
        svc = OCRService()
        # Create a real valid image, encode it, then remove 1 padding char
        import io as _io
        from PIL import Image as _Image
        buf = _io.BytesIO()
        _Image.new("RGB", (2, 2), "white").save(buf, format="PNG")
        b64_full = base64.b64encode(buf.getvalue()).decode()
        # Remove last char (simulating missing padding)
        b64_short = b64_full[:-1]

        with patch.object(svc, "_run_ocr", return_value=["ok"]):
            result = await svc.extract_text(b64_short)
            assert result == "ok"


# ── Size guards ──────────────────────────────────────────────────────────────

class TestOCRServiceSizeGuards:
    """Reject payloads that exceed size / dimension limits."""

    @pytest.mark.asyncio
    async def test_rejects_base64_over_max_length(self):
        svc = OCRService()
        # Create a string that exceeds MAX_BASE64_LENGTH
        huge = "A" * (MAX_BASE64_LENGTH + 1)
        assert await svc.extract_text(huge) == ""

    @pytest.mark.asyncio
    async def test_rejects_decoded_bytes_over_max(self):
        svc = OCRService()
        # Craft base64 that decodes to > MAX_DECODED_BYTES
        raw = b"\x00" * (MAX_DECODED_BYTES + 1)
        b64 = _b64(raw)
        assert await svc.extract_text(b64) == ""

    @pytest.mark.asyncio
    async def test_rejects_image_dimension_exceed(self):
        svc = OCRService()
        # Create an image larger than MAX_IMAGE_DIMENSION
        big_png = _make_png_bytes(MAX_IMAGE_DIMENSION + 1, 100)
        b64 = _b64(big_png)
        assert await svc.extract_text(b64) == ""

    @pytest.mark.asyncio
    async def test_rejects_pixel_count_exceed(self):
        svc = OCRService()
        # 5000×5000 = 25MP > MAX_PIXELS (~16.7MP)
        big_png = _make_png_bytes(5000, 5000)
        b64 = _b64(big_png)
        assert await svc.extract_text(b64) == ""

    @pytest.mark.asyncio
    async def test_accepts_valid_image_within_limits(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64 = _b64(tiny)
        with patch.object(svc, "_run_ocr", return_value=["text"]):
            result = await svc.extract_text(b64)
            assert result == "text"

    @pytest.mark.asyncio
    async def test_rejects_corrupted_image_bytes(self):
        svc = OCRService()
        # Valid base64 but not a valid image
        garbage = _b64(b"this is not an image at all")
        assert await svc.extract_text(garbage) == ""


# ── Concurrency & timeout ───────────────────────────────────────────────────

class TestOCRServiceConcurrency:
    """Verify semaphore and timeout behaviour."""

    @pytest.mark.asyncio
    async def test_timeout_kills_long_ocr(self):
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64 = _b64(tiny)

        async def _slow_ocr(_bytes):
            await asyncio.sleep(OCR_TIMEOUT_SECONDS + 5)
            return ["never reached"]

        with patch.object(svc, "_run_ocr", side_effect=_slow_ocr):
            result = await svc.extract_text(b64)
            assert result == ""

    @pytest.mark.asyncio
    async def test_concurrency_limit(self):
        """Only MAX_CONCURRENT_OCR tasks should run at the same time."""
        svc = OCRService()
        tiny = _make_tiny_png_bytes()
        b64 = _b64(tiny)
        running = {"count": 0, "max": 0}

        def _track_ocr(_bytes):
            running["count"] += 1
            running["max"] = max(running["max"], running["count"])
            import time; time.sleep(0.1)
            running["count"] -= 1
            return ["ok"]

        with patch.object(svc, "_run_ocr", side_effect=_track_ocr):
            tasks = [svc.extract_text(b64) for _ in range(6)]
            results = await asyncio.gather(*tasks)
            assert all(r == "ok" for r in results)
            assert running["max"] <= MAX_CONCURRENT_OCR
