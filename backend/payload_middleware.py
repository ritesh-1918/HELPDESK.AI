import json
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

MAX_REQUEST_BODY_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_JSON_DEPTH = 20


def _check_depth(obj, depth=0):
    if depth > MAX_JSON_DEPTH:
        raise ValueError(f"JSON nesting exceeds maximum depth of {MAX_JSON_DEPTH}")
    if isinstance(obj, dict):
        for v in obj.values():
            _check_depth(v, depth + 1)
    elif isinstance(obj, list):
        for item in obj:
            _check_depth(item, depth + 1)


class PayloadLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_REQUEST_BODY_BYTES:
            return JSONResponse(
                status_code=413,
                content={"detail": f"Request body exceeds maximum size of {MAX_REQUEST_BODY_BYTES} bytes"},
            )

        if request.method in ("POST", "PUT", "PATCH"):
            body = await request.body()
            if len(body) > MAX_REQUEST_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"detail": f"Request body exceeds maximum size of {MAX_REQUEST_BODY_BYTES} bytes"},
                )

            if body:
                content_type = request.headers.get("content-type", "")
                if "application/json" in content_type:
                    try:
                        data = json.loads(body)
                        _check_depth(data)
                    except ValueError as e:
                        return JSONResponse(
                            status_code=400,
                            content={"detail": str(e)},
                        )
                    except json.JSONDecodeError as e:
                        return JSONResponse(
                            status_code=400,
                            content={"detail": f"Invalid JSON: {e}"},
                        )

        response = await call_next(request)
        return response
