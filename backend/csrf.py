import secrets
import logging
from typing import Optional
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"
CSRF_COOKIE_MAX_AGE = 60 * 60 * 24

SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}


def generate_csrf_token() -> str:
    return secrets.token_hex(32)


class CSRFTokenMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        if request.method in SAFE_METHODS:
            return await call_next(request)

        csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME)
        csrf_header = request.headers.get(CSRF_HEADER_NAME)

        if not csrf_cookie or not csrf_header:
            logger.warning(
                "CSRF validation failed: missing %s (method=%s path=%s)",
                "cookie" if not csrf_cookie else "header",
                request.method,
                request.url.path,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF validation failed: missing or invalid token",
            )

        if not secrets.compare_digest(csrf_cookie, csrf_header):
            logger.warning(
                "CSRF validation failed: token mismatch (method=%s path=%s)",
                request.method,
                request.url.path,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF validation failed: token mismatch",
            )

        return await call_next(request)


def set_csrf_cookie(response: Response) -> str:
    token = generate_csrf_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=token,
        max_age=CSRF_COOKIE_MAX_AGE,
        secure=True,
        samesite="strict",
        path="/",
    )
    return token
