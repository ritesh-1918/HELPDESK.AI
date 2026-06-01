"""
OCR Service — Local, CPU-only text extraction using EasyOCR.
No API key required. Runs entirely on the local machine.
"""

import asyncio
import base64
import io

from PIL import Image

MAX_BASE64_LENGTH = 10 * 1024 * 1024
MAX_DECODED_BYTES = 8 * 1024 * 1024
MAX_IMAGE_DIMENSION = 4096
MAX_CONCURRENT_OCR = 2
OCR_TIMEOUT = 60

# Lazy import: easyocr is only imported once first use (heavy initialization ~3-5s)
_reader = None


def _get_reader():
    """Lazy-initialize EasyOCR reader in CPU-only mode."""
    global _reader
    if _reader is None:
        import easyocr
        print("[OCRService] Initializing EasyOCR (CPU mode)... this may take a moment on first load.")
        _reader = easyocr.Reader(["en"], gpu=False)
        print("[OCRService] Ready.")
    return _reader


class OCRService:
    def __init__(self):
        self._semaphore = asyncio.Semaphore(MAX_CONCURRENT_OCR)

    def _run_ocr(self, image_bytes: bytes) -> list[str]:
        reader = _get_reader()
        return reader.readtext(image_bytes, detail=0, paragraph=True)

    async def extract_text(self, image_base64: str) -> str:
        """
        Extract all text from a base64-encoded image using EasyOCR.

        Returns:
            A single cleaned string of extracted text, or "" on failure.
        """
        if not image_base64 or not image_base64.strip():
            return ""

        image_base64 = image_base64.strip()

        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        missing_padding = len(image_base64) % 4
        if missing_padding:
            image_base64 += "=" * (4 - missing_padding)

        if not all(c in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" for c in image_base64):
            print(f"[OCRService] Invalid base64 characters detected.")
            return ""

        if len(image_base64) > MAX_BASE64_LENGTH:
            print(f"[OCRService] Rejected: base64 length {len(image_base64)} exceeds limit {MAX_BASE64_LENGTH}")
            return ""

        try:
            image_bytes = base64.b64decode(image_base64)

            if len(image_bytes) > MAX_DECODED_BYTES:
                print(f"[OCRService] Rejected: decoded size {len(image_bytes)} exceeds limit {MAX_DECODED_BYTES}")
                return ""

            try:
                img = Image.open(io.BytesIO(image_bytes))
                img.verify()
                img = Image.open(io.BytesIO(image_bytes))
                width, height = img.size
                if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
                    print(f"[OCRService] Rejected: image dimensions {width}x{height} exceed limit {MAX_IMAGE_DIMENSION}")
                    return ""
            except Exception as e:
                print(f"[OCRService] Rejected: invalid image - {e}")
                return ""

            loop = asyncio.get_event_loop()
            async with self._semaphore:
                try:
                    results = await asyncio.wait_for(
                        loop.run_in_executor(None, self._run_ocr, image_bytes),
                        timeout=OCR_TIMEOUT
                    )
                    extracted = " ".join(results).strip()
                    print(f"[OCRService] Extracted {len(extracted)} chars from image.")
                    return extracted
                except asyncio.TimeoutError:
                    print(f"[OCRService] OCR timed out after {OCR_TIMEOUT}s")
                    return ""
        except Exception as e:
            print(f"[OCRService] Error during OCR: {e}")
            return ""
