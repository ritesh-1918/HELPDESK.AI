"""
Request ID Middleware — generates or propagates a unique request ID
for every incoming request and echoes it in the X-Request-ID
response header. The ID is also stored on request.state for use in
logging and error handlers.

Usage in main.py:
    from backend.middleware.request_id import add_request_id_middleware
    add_request_id_middleware(app)
"""

import logging
import uuid

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

REQUEST_ID_HEADER = "X-Request-ID"


def _new_request_id() -> str:
    """Return a fresh UUID4 hex string (32 chars, no dashes)."""
    return uuid.uuid4().hex


def get_request_id(request: Request) -> str:
    """Return the request ID stored on request.state, or a new one."""
    rid = getattr(request.state, "request_id", None)
    if not rid:
        rid = _new_request_id()
        request.state.request_id = rid
    return rid


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assign a request ID to every request and echo it in the response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Honour an inbound X-Request-ID header if the upstream (e.g. a
        # load balancer or the front-end) already set one.
        inbound = request.headers.get(REQUEST_ID_HEADER, "").strip()
        request_id = inbound or _new_request_id()
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response


def add_request_id_middleware(app: FastAPI) -> None:
    """
    Attach the RequestIDMiddleware to the FastAPI app.

    Call this BEFORE adding routes so the middleware wraps every
    request, but AFTER any CORS / security middleware that should
    run first.
    """
    app.add_middleware(RequestIDMiddleware)
