"""
OCR Service — Local, CPU-only text extraction using EasyOCR.
No API key required. Runs entirely on the local machine.
"""

import base64
import io

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
            
            # Add back missing padding
            missing_padding = len(image_base64) % 4
            if missing_padding:
                image_base64 += "=" * (4 - missing_padding)

            image_bytes = base64.b64decode(image_base64)
            reader = _get_reader()
            results = reader.readtext(image_bytes, detail=0, paragraph=True)
            extracted = " ".join(results).strip()
            print(f"[OCRService] Extracted {len(extracted)} chars from image.")
            return extracted
        except Exception as e:
            print(f"[OCRService] Error during OCR: {e}")
            return ""
