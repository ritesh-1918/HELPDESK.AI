"""
OCR Service — Local, CPU-only text extraction using EasyOCR.
No API key required. Runs entirely on the local machine.
"""

import base64
import io
import math
import re

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


class OCRQualityReport:
    """Quality metrics for extracted OCR text."""

    def __init__(self, text: str, raw_results: list):
        self.text = text
        self.char_count = len(text)
        self.word_count = len(text.split()) if text.strip() else 0
        self.alpha_ratio = self._alpha_ratio(text)
        self.avg_word_length = self._avg_word_length(text)
        self.garbled_score = self._garbled_score(text)
        self.avg_confidence = self._avg_confidence(raw_results)
        self.readability_score = self._compute_readability()

    def _alpha_ratio(self, text: str) -> float:
        if not text:
            return 0.0
        alpha = sum(1 for c in text if c.isalpha() or c.isspace())
        return round(alpha / len(text), 4)

    def _avg_word_length(self, text: str) -> float:
        words = [w for w in text.split() if w]
        if not words:
            return 0.0
        return round(sum(len(w) for w in words) / len(words), 2)

    def _garbled_score(self, text: str) -> float:
        """Estimate how garbled the text is (0 = clean, 1 = completely garbled).
        Based on frequency of non-alphanumeric sequences and unusual character runs."""
        if not text.strip():
            return 1.0
        non_alpha_ratio = 1.0 - self.alpha_ratio
        runs = re.findall(r'[^a-zA-Z0-9\s]{2,}', text)
        run_penalty = min(1.0, sum(len(r) for r in runs) / max(1, len(text)))
        return round(min(1.0, non_alpha_ratio * 0.5 + run_penalty * 0.5), 4)

    def _avg_confidence(self, raw_results: list) -> float:
        if not raw_results:
            return 0.0
        confidences = [r[2] for r in raw_results if len(r) >= 3]
        if not confidences:
            return 0.0
        return round(sum(confidences) / len(confidences), 4)

    def _compute_readability(self) -> float:
        """Composite readability score 0-1 (1 = best quality)."""
        if not self.text.strip():
            return 0.0
        scores = []
        if self.word_count > 0:
            scores.append(min(1.0, self.word_count / 50))
        scores.append(self.alpha_ratio)
        scores.append(1.0 - self.garbled_score)
        scores.append(self.avg_confidence)
        scores.append(min(1.0, self.avg_word_length / 8))
        return round(sum(scores) / len(scores), 4)

    def to_dict(self) -> dict:
        return {
            "text": self.text,
            "char_count": self.char_count,
            "word_count": self.word_count,
            "alpha_ratio": self.alpha_ratio,
            "avg_word_length": self.avg_word_length,
            "garbled_score": self.garbled_score,
            "avg_confidence": self.avg_confidence,
            "readability_score": self.readability_score,
        }


class OCRService:
    def extract_text(self, image_base64: str) -> str:
        """
        Extract all text from a base64-encoded image using EasyOCR.

        Returns:
            A single cleaned string of extracted text, or "" on failure.
        """
        _, text = self._extract(image_base64, detail=False)
        return text

    def assess_quality(self, image_base64: str) -> dict:
        """
        Extract text and return a full quality assessment report.
        """
        raw_results, text = self._extract(image_base64, detail=True)
        report = OCRQualityReport(text, raw_results)
        return report.to_dict()

    def _extract(self, image_base64: str, detail: bool = True):
        """Shared extraction logic. Returns (raw_results, text_string)."""
        if not image_base64:
            return [], ""

        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]

            missing_padding = len(image_base64) % 4
            if missing_padding:
                image_base64 += "=" * (4 - missing_padding)

            image_bytes = base64.b64decode(image_base64)
            reader = _get_reader()
            results = reader.readtext(image_bytes, detail=detail, paragraph=True)
            if detail:
                text = " ".join(r[1] for r in results).strip()
            else:
                text = " ".join(results).strip()
            print(f"[OCRService] Extracted {len(text)} chars from image.")
            return results, text
        except Exception as e:
            print(f"[OCRService] Error during OCR: {e}")
            return [], ""
