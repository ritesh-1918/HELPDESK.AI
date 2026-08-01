"""
OCR Service — Local, CPU-only text extraction using EasyOCR.
No API key required. Runs entirely on the local machine.

Also exposes ``resolve_safe_attachment_path`` used by the ticket attachment
download route. Filenames arrive from user-controlled requests, so every
lookup is sanitized against directory-traversal attempts before the file is
served (see issue #3948).
"""

import base64
import io
import os
from pathlib import Path

# Lazy import: easyocr is only imported once first use (heavy initialization ~3-5s)
_reader = None


def resolve_safe_attachment_path(filename: str, uploads_dir: str) -> Path:
    """
    Resolve a user-supplied attachment filename to a path strictly inside
    ``uploads_dir``, rejecting directory-traversal attempts.

    Guards applied:
      1. Reject empty names.
      2. Reject NULL bytes (``%00`` decoded to ``\\x00``) and traversal tokens
         (``..``), and leading slashes that would force an absolute path.
      3. Collapse to ``os.path.basename`` so nested separators cannot escape.
      4. Verify via ``os.path.commonpath`` that the resolved path still lives
         under ``uploads_dir`` (defense in depth against symlink/alias tricks).

    Raises:
        ValueError: when the filename is invalid or escapes the uploads dir.
        FileNotFoundError: when no such file exists on disk.
    """
    if not filename or not isinstance(filename, str):
        raise ValueError("filename must be a non-empty string")
    if "\x00" in filename or ".." in filename or filename.startswith("/"):
        raise ValueError("filename contains invalid path tokens")

    base_dir = Path(uploads_dir).resolve()
    safe_name = os.path.basename(filename)
    if not safe_name or safe_name in (".", ".."):
        raise ValueError("filename resolves to an invalid path token")

    target = (base_dir / safe_name).resolve()
    try:
        common = os.path.commonpath([str(base_dir), str(target)])
    except ValueError:
        raise ValueError("filename escapes the uploads directory")
    if common != str(base_dir):
        raise ValueError("filename escapes the uploads directory")
    if not target.is_file():
        raise FileNotFoundError("attachment not found on disk")
    return target


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
