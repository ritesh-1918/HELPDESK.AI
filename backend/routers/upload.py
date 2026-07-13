"""
upload.py — Secure file attachment handler for HELPDESK.AI
- Enforces 10MB size limit
- Magic-byte MIME detection (not extension-based)
- Allowlist of safe MIME types
- Explicit Content-Type set on Supabase Storage upload
"""

import uuid
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from backend.auth_cookie import get_current_user
from backend.dependencies import get_supabase_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/attachments", tags=["attachments"])

# ── Config ────────────────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/zip",
}

SUPABASE_BUCKET = "ticket-attachments"


def detect_mime(contents: bytes) -> str:
    """Detect MIME type from file magic bytes (not extension)."""
    try:
        import magic
        return magic.from_buffer(contents[:2048], mime=True)
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="File validation unavailable: python-magic not installed."
        )


async def validate_upload(file: UploadFile) -> tuple[bytes, str]:
    """
    Validates file size and MIME type.
    Returns (contents, detected_mime) or raises HTTPException.
    """
    # Read up to MAX + 1 byte to detect oversized files
    contents = await file.read(MAX_FILE_SIZE_BYTES + 1)

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {MAX_FILE_SIZE_MB} MB limit."
        )

    detected_mime = detect_mime(contents)

    if detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"File type not allowed. Accepted: images, PDF, plain text, ZIP."
        )

    return contents, detected_mime


@router.post("/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    ticket_id: str = None,
    user: dict = Depends(get_current_user),
):
    """
    Securely upload a file attachment to Supabase Storage.
    - Enforces 10MB size limit
    - Magic-byte MIME detection
    - Sets explicit Content-Type on upload
    """
    contents, detected_mime = await validate_upload(file)

    supabase = get_supabase_admin()
    if not supabase:
        raise HTTPException(status_code=503, detail="Storage service unavailable.")

    # Generate safe storage path — never use original filename
    ext_map = {
        "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif",
        "image/webp": "webp", "application/pdf": "pdf",
        "text/plain": "txt", "application/zip": "zip",
    }
    ext = ext_map.get(detected_mime, "bin")
    safe_filename = f"{uuid.uuid4()}.{ext}"
    storage_path = f"{ticket_id or 'general'}/{safe_filename}"

    try:
        response = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=storage_path,
            file=contents,
            file_options={
                "content-type": detected_mime,  # Explicit — prevents CDN serving as text/html
                "upsert": False,
            }
        )
    except Exception as e:
        logger.error(f"Supabase storage upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed.")

    # Get public URL
    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)

    return {
        "url": public_url,
        "path": storage_path,
        "mime_type": detected_mime,
        "size_bytes": len(contents),
    }