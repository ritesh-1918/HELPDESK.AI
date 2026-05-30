import time
import os
from fastapi import APIRouter, Request
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

router = APIRouter()

http_requests_total = Counter(
    "fastapi_requests_total",
    "Total HTTP requests",
    ["method", "endpoint"],
)

http_response_duration = Histogram(
    "fastapi_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)

http_responses_total = Counter(
    "fastapi_responses_total",
    "Total HTTP responses by status code",
    ["status"],
)

ai_inference_duration = Histogram(
    "fastapi_ai_inference_duration_seconds",
    "AI inference duration in seconds",
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0),
)

ws_connections_active = Gauge(
    "fastapi_ws_connections_active",
    "Number of active WebSocket connections",
)

classifier_confidence = Histogram(
    "fastapi_classifier_confidence",
    "Classifier confidence score distribution",
    buckets=(0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0),
)

spam_detections = Counter(
    "fastapi_spam_detections_total",
    "Total spam/phishing detections",
)

duplicate_detections = Counter(
    "fastapi_duplicate_detections_total",
    "Total duplicate ticket detections",
)


@router.middleware("http")
async def monitor_requests(request: Request, call_next):
    method = request.method
    endpoint = request.url.path
    http_requests_total.labels(method=method, endpoint=endpoint).inc()

    start = time.monotonic()
    response = await call_next(request)
    elapsed = time.monotonic() - start

    http_response_duration.labels(method=method, endpoint=endpoint).observe(elapsed)
    http_responses_total.labels(status=str(response.status_code)[0] + "xx").inc()
    return response


@router.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/ready")
async def readiness():
    checks = {"api": True}
    required = os.environ.get("REQUIRE_SUPABASE", "false").lower() == "true"
    if required:
        try:
            from supabase import create_client
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            checks["supabase"] = bool(url and key)
        except Exception:
            checks["supabase"] = False

    all_ok = all(checks.values())
    status_code = 200 if all_ok else 503
    return Response(
        content=str({"status": "ready" if all_ok else "not_ready", "checks": checks}),
        status_code=status_code,
        media_type="application/json",
    )
