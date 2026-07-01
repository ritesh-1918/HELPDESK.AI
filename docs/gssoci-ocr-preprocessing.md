# GSSoC OCR Engine Preprocessing Reference Guide

This guide covers image preprocessing techniques — **binarization** and **rotation correction** — applied before running OCR on HELPDESK.AI tickets to maximize text recognition accuracy.

---

## 1. Overview

Raw ticket images (photos of documents, screenshots, handwritten notes) frequently suffer from:
- Poor contrast and uneven lighting
- Skewed or rotated text (photographed at an angle)
- Noisy backgrounds

Preprocessing normalizes these inputs, dramatically improving OCR accuracy.

---

## 2. Binarization

**Binarization** converts a grayscale image to pure black-and-white (1-bit). This removes background noise and simplifies the image for OCR engines.

### 2.1 Otsu's Method (Recommended Default)

Otsu's algorithm automatically finds the optimal threshold by maximizing inter-class variance.

```python
import cv2
import numpy as np

def binarize_otsu(image: np.ndarray) -> np.ndarray:
    """Binarize image using Otsu's automatic thresholding.
    
    Args:
        image: BGR image from cv2.imread or frame capture.
    
    Returns:
        Binary (black-and-white) image as numpy array.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return binary
```

**When to use:** Images with bimodal histograms (clear foreground/background separation). Works well for scanned documents.

### 2.2 Adaptive Thresholding

Adaptive thresholding computes thresholds per local region, handling uneven lighting.

```python
def binarize_adaptive(image: np.ndarray, block_size: int = 11, c: int = 2) -> np.ndarray:
    """Binarize image using adaptive Gaussian thresholding.
    
    Args:
        image: BGR image.
        block_size: Size of pixel neighborhood (must be odd, e.g. 11).
        c: Constant subtracted from weighted mean.
    
    Returns:
        Binary image.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        block_size, c
    )
    return binary
```

**When to use:** Photos with uneven lighting, shadows, or varying contrast across the image.

### 2.3 Choosing a Method

| Condition | Recommended Method |
|---|---|
| Scanned documents, receipts | Otsu's method |
| Photos with uneven lighting | Adaptive thresholding |
| High-noise backgrounds | CLAHE + adaptive thresholding |
| Speed-critical pipeline | Otsu's (single-pass) |

---

## 3. Rotation Correction (Deskewing)

**Rotation correction** straightens images where text is tilted, which is critical for OCR engines that process lines sequentially.

### 3.1 Hough Line Detection

Detect text lines and compute the predominant angle, then rotate to correct.

```python
import cv2
import numpy as np
import math

def correct_rotation(image: np.ndarray, max_angle: float = 45.0) -> np.ndarray:
    """Correct image rotation using Hough line detection.
    
    Args:
        image: Binary or grayscale image.
        max_angle: Maximum acceptable skew angle in degrees.
    
    Returns:
        Deskewed image of the same shape and type.
    """
    # Convert to grayscale if needed
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Detect edges
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)

    # Find Hough lines (probabilistic)
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=100,
        minLineLength=100,
        maxLineGap=10
    )

    if lines is None or len(lines) == 0:
        return image  # No lines found, return original

    # Compute average angle of all detected lines
    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
        angles.append(angle)

    median_angle = np.median(angles)

    # Clamp to max_angle to avoid extreme corrections
    if abs(median_angle) > max_angle:
        median_angle = max_angle if median_angle > 0 else -max_angle

    # Rotate the image
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(center, median_angle, scale=1.0)
    rotated = cv2.warpAffine(
        image, matrix, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )
    return rotated
```

### 3.2 Moment-Based Deskewing (Faster Alternative)

For text-dominant images, computing the covariance matrix of white pixels gives the principal orientation.

```python
def deskew_moment(image: np.ndarray) -> np.ndarray:
    """Deskew using image moments (fast, no line detection).
    
    Best for: documents where text fills most of the image.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Binarize if not already
    if gray.dtype != np.uint8:
        gray = gray.astype(np.uint8)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find non-zero (white) pixel coordinates
    coords = cv2.findNonZero(binary)
    if coords is None or len(coords) < 10:
        return image

    # Compute covariance matrix and eigenvectors
    cov = np.cov(coords[:, 0, :].T)
    eigenvalues, eigenvectors = np.linalg.eig(cov)

    # Sort by eigenvalue (descending)
    sorted_indices = np.argsort(eigenvalues)[::-1]
    largest_vector = eigenvectors[:, sorted_indices[0]]

    # Angle of the largest eigenvector
    angle = math.degrees(math.atan2(largest_vector[1], largest_vector[0]))

    # Rotate
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, scale=1.0)
    rotated = cv2.warpAffine(
        image, matrix, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )
    return rotated
```

---

## 4. Full Preprocessing Pipeline

Combine binarization and rotation correction into a single, reusable pipeline:

```python
def preprocess_for_ocr(image: np.ndarray, method: str = "otsu") -> np.ndarray:
    """Full OCR preprocessing pipeline.
    
    Steps:
        1. Denoise (Gaussian blur)
        2. Deskew (rotation correction)
        3. Binarize (thresholding)
    
    Args:
        image: Input BGR image (e.g., from cv2.imread).
        method: Binarization method — "otsu" or "adaptive".
    
    Returns:
        Preprocessed binary image ready for OCR.
    """
    # Denoise to reduce noise artifacts
    denoised = cv2.GaussianBlur(image, (3, 3), 0)

    # Deskew first (binarization is more effective on straightened text)
    deskewed = correct_rotation(denoised)

    # Binarize
    if method == "adaptive":
        binary = binarize_adaptive(deskewed)
    else:
        binary = binarize_otsu(deskewed)

    # Optional: morphological ops to clean small artifacts
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

    return cleaned
```

**Usage:**

```python
import cv2

image = cv2.imread("ticket_image.jpg")
preprocessed = preprocess_for_ocr(image, method="otsu")

# Pass to Tesseract OCR
# import pytesseract
# text = pytesseract.image_to_string(preprocessed)
```

---

## 5. Integration with HELPDESK.AI

In the HELPDESK.AI pipeline, `preprocess_for_ocr()` should be called in the **AI API service** (`/api/ai/analyze_ticket`) before the DistilBERT classification step, specifically when the incoming ticket contains an image attachment.

```python
# In api/ai/analyze_ticket.py (pseudocode)
if ticket.has_image_attachment():
    processed_image = preprocess_for_ocr(ticket.image)
    extracted_text = pytesseract.image_to_string(processed_image)
    ticket.text = extracted_text + "\n" + ticket.text

# Continue with classification pipeline...
```

---

## 6. Common Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Wrong threshold value for Otsu | Over- or under-binarized image | Use `cv2.THRESH_BINARY + cv2.THRESH_OTSU` (auto) |
| Rotation over-corrected | Text now tilted the other way | Clamp angle to ±max_angle (default 45°) |
| Applying binarization before deskewing | Text becomes harder to detect for Hough | Always deskew first, then binarize |
| Block size too small in adaptive threshold | Excessive noise in output | Use block_size ≥ 11 for typical document images |
| Ignoring image DPI | Poor OCR on screenshots | Resize to 300 DPI equivalent before processing |

---

## 7. Further Reading

- OpenCV Docs: [Image Thresholding](https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html)
- OpenCV Docs: [Hough Line Transform](https://docs.opencv.org/4.x/d6/d10/tutorial_py_hough_lines.html)
- Smith, R. (2007). *A Survey of Document Image Analysis Systems*. CSRI.
- Tesseract OCR: [Improved OCR through Preprocessing](https://github.com/tesseract-ocr/tesseract/wiki/ImproveQuality)