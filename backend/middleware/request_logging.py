#!/usr/bin/env python3
"""
Applies changes for GitHub issue #3390 (missing structured request/response
logging middleware). Run from the ROOT of your HELPDESK.AI repo:

    python3 apply_request_logging_middleware.py

It creates:
  - backend/middleware/request_logging.py

And edits:
  - main.py   (wires up RequestLoggingMiddleware + the existing, previously
               unwired RequestIDMiddleware from backend/middleware/request_id.py)
"""

import sys
from pathlib import Path

ROOT = Path(".").resolve()


def replace_once(path: Path, old: str, new: str, label: str) -> bool:
    if not path.exists():
        print(f"[SKIP] {label}: file not found at {path}")
        return False
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count == 0:
        print(f"[FAIL] {label}: anchor text not found in {path}. No changes made for this edit.")
        return False
    if count > 1:
        print(f"[WARN] {label}: anchor text found {count} times in {path}; replacing the FIRST occurrence only.")
        text = text.replace(old, new, 1)
    else:
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")
    print(f"[OK]   {label}: applied to {path}")
    return True


def write_new_file(path: Path, content: str, label: str) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        print(f"[SKIP] {label}: {path} already exists, not overwriting.")
        return False
    path.write_text(content, encoding="utf-8")
    print(f"[OK]   {label}: created {path}")
    return True


REQUEST_LOGGING_MIDDLEWARE_CONTENT = '''"""
Structured Request/Response Logging Middleware (Issue #3390).

Logs every request/response cycle as a single structured JSON log line via
backend.logger's JSONFormatter, replacing the scattered print() statements
used throughout individual handlers for this purpose.

Usage in main.py - ordering matters (see add_request_logging_middleware()
docstring below):

    from backend.middleware.request_logging import add_request_logging_middleware
    from backend.middleware.request_id import add_request_id_middleware
    add_request_logging_middleware(app)
    add_request_id_middleware(app)
"""

import logging
import time

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from backend.middleware.request_id import get_request_id

logger = logging.getLogger("backend.request")


def _client_ip(request: Request) -> str:
    """
    Prefer a proxy-forwarded IP if present (common behind nginx/load
    balancers/CDNs), falling back to the direct connection IP.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Emits one structured JSON log entry per request, containing the metadata
    called for in Issue #3390: HTTP method, path, status code, latency,
    client IP, and a correlation/request ID.

    Deliberately does NOT log headers, query params, or body content, since
    those routinely carry credentials/PII (Authorization headers, tokens,
    cookies, form data, API keys) - omitting them entirely is safer than
    maintaining a masking list that could miss something.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        request_id = get_request_id(request)
        client_ip = _client_ip(request)

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.exception(
                "Unhandled exception during request",
                extra={"context": {
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "client_ip": client_ip,
                    "latency_ms": duration_ms,
                    "status_code": 500,
                }},
            )
            raise

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            log_level,
            "request handled",
            extra={"context": {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "latency_ms": duration_ms,
                "client_ip": client_ip,
            }},
        )
        response.headers["X-Response-Time-Ms"] = str(duration_ms)
        return response


def add_request_logging_middleware(app: FastAPI) -> None:
    """
    Attach RequestLoggingMiddleware to the FastAPI app.

    IMPORTANT ordering: call this BEFORE add_request_id_middleware(app).
    Starlette wraps middleware so the LAST one added ends up OUTERMOST
    (runs first on the way in, last on the way out) - RequestIDMiddleware
    needs to run first so request.state.request_id is already set by the
    time this middleware reads it via get_request_id().
    """
    app.add_middleware(RequestLoggingMiddleware)
'''


def main():
    ok_count = 0
    total = 0

    # -------------------------------------------------------------
    # New file: the middleware itself
    # -------------------------------------------------------------
    total += 1
    ok_count += write_new_file(
        ROOT / "backend" / "middleware" / "request_logging.py",
        REQUEST_LOGGING_MIDDLEWARE_CONTENT,
        label="create backend/middleware/request_logging.py",
    )

    # -------------------------------------------------------------
    # main.py: wire up both RequestLoggingMiddleware AND the existing,
    # previously-unwired RequestIDMiddleware.
    # -------------------------------------------------------------
    main_py = ROOT / "main.py"

    total += 1
    ok_count += replace_once(
        main_py,
        old="""app.add_middleware(PayloadLimitMiddleware)
app.add_middleware(CSRFTokenMiddleware)
app.include_router(metrics_router.router)""",
        new="""app.add_middleware(PayloadLimitMiddleware)
app.add_middleware(CSRFTokenMiddleware)

# Issue #3390: centralized structured request/response logging, replacing
# scattered print() statements. Ordering matters here - RequestIDMiddleware
# must be added AFTER (so it becomes the outer layer and sets
# request.state.request_id before RequestLoggingMiddleware reads it).
# RequestIDMiddleware already existed in backend/middleware/request_id.py
# but was never actually wired into the app.
from backend.middleware.request_logging import add_request_logging_middleware
from backend.middleware.request_id import add_request_id_middleware
add_request_logging_middleware(app)
add_request_id_middleware(app)

app.include_router(metrics_router.router)""",
        label="main.py: wire up request logging + request ID middleware",
    )

    print()
    print(f"Applied {ok_count}/{total} changes successfully.")
    if ok_count != total:
        print("Some changes FAILED - see [FAIL]/[SKIP] lines above.")
        sys.exit(1)
    else:
        print("All changes applied. Run `git status` and `git diff` to review before committing.")


if __name__ == "__main__":
    main()