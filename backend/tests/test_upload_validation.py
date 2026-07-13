"""Tests for secure file upload validation."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from io import BytesIO


def test_file_too_large():
    """Files over 10MB should be rejected with 413."""
    from backend.routers.upload import validate_upload
    import asyncio
    from fastapi import UploadFile
    from io import BytesIO

    big_content = b"x" * (10 * 1024 * 1024 + 1)
    mock_file = MagicMock(spec=UploadFile)
    mock_file.read = MagicMock(return_value=big_content)

    async def run():
        mock_file.read = lambda n: big_content
        with pytest.raises(Exception) as exc:
            await validate_upload(mock_file)
        assert "413" in str(exc.value.status_code) or exc.value.status_code == 413

    asyncio.get_event_loop().run_until_complete(run())


def test_allowed_mime_types():
    """Only allowed MIME types should pass validation."""
    from backend.routers.upload import ALLOWED_MIME_TYPES
    assert "image/jpeg" in ALLOWED_MIME_TYPES
    assert "image/png" in ALLOWED_MIME_TYPES
    assert "application/pdf" in ALLOWED_MIME_TYPES
    assert "text/html" not in ALLOWED_MIME_TYPES
    assert "application/x-php" not in ALLOWED_MIME_TYPES
    assert "text/javascript" not in ALLOWED_MIME_TYPES


def test_max_file_size_config():
    """MAX_FILE_SIZE_MB should be 10."""
    from backend.routers.upload import MAX_FILE_SIZE_MB
    assert MAX_FILE_SIZE_MB == 10