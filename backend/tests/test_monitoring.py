import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
os.environ["ALLOW_DEGRADED_STARTUP"] = "1"

from fastapi.testclient import TestClient
from backend.routes.monitoring import router

client = TestClient(router)


def test_metrics_endpoint():
    resp = client.get("/metrics")
    assert resp.status_code == 200
    assert "text/plain" in resp.headers["content-type"]


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_readiness_endpoint():
    resp = client.get("/ready")
    assert resp.status_code in (200, 503)
    data = resp.json()
    assert "status" in data
    assert "checks" in data


def test_instrumentation_metrics_increment():
    resp = client.get("/health")
    assert resp.status_code == 200
    resp = client.get("/metrics")
    assert resp.status_code == 200
    body = resp.text
    assert 'fastapi_requests_total{method="GET",endpoint="/health"}' in body
    assert 'fastapi_responses_total{status="2xx"}' in body
