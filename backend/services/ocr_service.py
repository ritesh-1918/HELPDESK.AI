"""
OCR Service — Local, CPU-only text extraction using EasyOCR.
No API key required. Runs entirely on the local machine.

Security: Includes size limits to prevent DoS via oversized images.
"""

import base64
import io
from typing import Optional

# Lazy import: easyocr is only imported once first use (heavy initialization ~3-5s)
_reader = None

# Security limits to prevent DoS
MAX_BASE64_LENGTH = 10 * 1024 * 1024  # 10 MB base64 (~7.5 MB decoded)
MAX_DECODED_BYTES = 7.5 * 1024 * 1024  # 7.5 MB raw bytes
MAX_IMAGE_DIMENSION = 4096  # 4K resolution max


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
    def extract_text(self, image_base64: str) -> str:
        """
        Extract all text from a base64-encoded image using EasyOCR.

        Returns:
            A single cleaned string of extracted text, or "" on failure.
        """
        if not image_base64:
            return ""

        try:
            # Strip data URI prefix if present (e.g., "data:image/png;base64,...")
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            
            # Security: Check base64 length before decoding
            if len(image_base64) > MAX_BASE64_LENGTH:
                print(f"[OCRService] Rejected: base64 too large ({len(image_base64)} chars, max {MAX_BASE64_LENGTH})")
                return ""

            # Add back missing padding
            missing_padding = len(image_base64) % 4
            if missing_padding:
                image_base64 += "=" * (4 - missing_padding)

            image_bytes = base64.b64decode(image_base64)
            
            # Security: Check decoded size
            if len(image_bytes) > MAX_DECODED_BYTES:
                print(f"[OCRService] Rejected: decoded image too large ({len(image_bytes)} bytes, max {MAX_DECODED_BYTES})")
                return ""
            
            # Security: Validate image dimensions before OCR
            try:
                from PIL import Image
                img = Image.open(io.BytesIO(image_bytes))
                width, height = img.size
                if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
                    print(f"[OCRService] Rejected: image dimensions too large ({width}x{height}, max {MAX_IMAGE_DIMENSION})")
                    return ""
            except ImportError:
                pass  # Pillow not available, skip dimension check
            except Exception as e:
                print(f"[OCRService] Warning: Could not validate image dimensions: {e}")
            
            reader = _get_reader()
            results = reader.readtext(image_bytes, detail=0, paragraph=True)
            extracted = " ".join(results).strip()
            print(f"[OCRService] Extracted {len(extracted)} chars from image.")
            return extracted
        except Exception as e:
            print(f"[OCRService] Error during OCR: {e}")
            return ""
