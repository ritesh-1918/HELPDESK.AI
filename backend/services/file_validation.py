"""
File metadata validation for asset uploads (issue #3893).

Uploaded files are constrained to a 5 MB size limit and a strict extension
allowlist (pdf, png, jpg, log) before anything is written to disk.

Run with:  python -m unittest backend.tests.test_file_validation -v
"""

import os

MAX_ASSET_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_ASSET_EXTENSIONS = {".pdf", ".png", ".jpg", ".log"}


class AssetValidationError(ValueError):
    """Raised when an uploaded asset fails metadata validation."""


def validate_asset_extension(filename: str | None) -> str:
    """
    Return the normalized extension if it is permitted, otherwise raise.

    The filename is also checked for path traversal tokens since it will be
    used to build a destination path on disk.
    """
    if not filename or not isinstance(filename, str):
        raise AssetValidationError("File must have a name")
    if "\x00" in filename or ".." in filename or filename.startswith(("/", "\\")):
        raise AssetValidationError("Invalid file name")
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        raise AssetValidationError("File must have an extension")
    if ext not in ALLOWED_ASSET_EXTENSIONS:
        allowed = ", ".join(sorted(e.lstrip(".") for e in ALLOWED_ASSET_EXTENSIONS))
        raise AssetValidationError(f"Unsupported file type '.{ext.lstrip('.')}'. Allowed: {allowed}")
    return ext


def validate_asset_size(content_length: int | None) -> None:
    """
    Reject payloads larger than MAX_ASSET_SIZE_BYTES (5 MB).
    """
    if content_length is None or not isinstance(content_length, int) or content_length < 0:
        raise AssetValidationError("Invalid file size")
    if content_length > MAX_ASSET_SIZE_BYTES:
        raise AssetValidationError("File exceeds the 5 MB size limit")


def validate_asset(filename: str | None, content_length: int | None) -> str:
    """Validate extension and size together; returns the allowed extension."""
    ext = validate_asset_extension(filename)
    validate_asset_size(content_length)
    return ext
