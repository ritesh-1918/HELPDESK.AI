"""
Prometheus metrics middleware for FastAPI.

Exposes /metrics endpoint (secured by token or IP allowlist) and instruments
all HTTP routes with standard request latency, count, and in-flight histograms.

Usage in main.py:
    from backend.middleware.metrics import setup_metrics
    setup_metrics(app)
"""

import os
import time
from typing import Optional

from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import PlainTextResponse

try:
    from prometheus_fastapi_instrumentator import Instrumentator
    from prometheus_client import (
        Counter,
        Histogram,
        Gauge,
        generate_latest,
        CONTENT_TYPE_LATEST,
        CollectorRegistry,
        REGISTRY,
    )
    _PROMETHEUS_AVAILABLE = True
except ImportError:
    _PROMETHEUS_AVAILABLE = False

# ---------------------------------------------------------------------------
# Custom application-level metrics
# ---------------------------------------------------------------------------

if _PROMETHEUS_AVAILABLE:
    AI_ANALYZE_REQUESTS = Counter(
        "helpdesk_ai_analyze_total",
        "Total number of AI ticket analysis requests",
        ["model_version", "status"],
    )

    AI_ANALYZE_LATENCY = Histogram(
        "helpdesk_ai_analyze_duration_seconds",
        "Latency of AI ticket analysis endpoint in seconds",
        ["model_version"],
        buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
    )

    ACTIVE_TICKETS_GAUGE = Gauge(
        "helpdesk_active_tickets_total",
        "Current number of open/active tickets in the system",
    )

    DUPLICATE_DETECTIONS = Counter(
        "helpdesk_duplicate_detections_total",
        "Number of tickets flagged as duplicates",
    )

    OCR_PROCESSING = Counter(
        "helpdesk_ocr_processing_total",
        "Number of OCR processing calls",
        ["status"],
    )

# ---------------------------------------------------------------------------
# Allowed metrics consumers (IP range or token)
# ---------------------------------------------------------------------------

_METRICS_TOKEN = os.environ.get("METRICS_SECRET_TOKEN", "")
_ALLOWED_IPS_RAW = os.environ.get("METRICS_ALLOWED_IPS", "127.0.0.1,::1")
_ALLOWED_IPS: set[str] = {ip.strip() for ip in _ALLOWED_IPS_RAW.split(",")}


def _is_authorized(request: Request) -> bool:
    """
    Return True if the request is allowed to access /metrics.
    Checks Bearer token header first, then falls back to IP allowlist.
    """
    if _METRICS_TOKEN:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer ") and auth_header[7:] == _METRICS_TOKEN:
            return True

    client_ip = request.client.host if request.client else ""
    forwarded_for = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    effective_ip = forwarded_for or client_ip

    return effective_ip in _ALLOWED_IPS


# ---------------------------------------------------------------------------
# Setup function
# ---------------------------------------------------------------------------

def setup_metrics(app: FastAPI) -> None:
    """
    Attach Prometheus instrumentation middleware and register the /metrics route.
    Safe to call even when prometheus_fastapi_instrumentator is not installed —
    it degrades gracefully and logs a warning.
    """
    if not _PROMETHEUS_AVAILABLE:
        import logging
        logging.getLogger(__name__).warning(
            "prometheus_fastapi_instrumentator not installed. "
            "Install with: pip install prometheus-fastapi-instrumentator"
        )
        return

    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        should_respect_env_var=False,
        excluded_handlers=["/metrics", "/health", "/"],
        body_handlers=[],
    ).instrument(app)

    @app.get("/metrics", include_in_schema=False, response_class=PlainTextResponse)
    async def metrics_endpoint(request: Request) -> Response:
        if not _is_authorized(request):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access to /metrics denied. Provide a valid Bearer token or connect from an allowed IP.",
            )
        data = generate_latest(REGISTRY)
        return Response(content=data, media_type=CONTENT_TYPE_LATEST)
