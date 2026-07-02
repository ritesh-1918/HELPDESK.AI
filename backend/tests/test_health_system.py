"""Tests for /health/system monitoring endpoint."""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_system_returns_metrics():
    r = client.get("/health/system")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "platform" in data
    assert data["cpu_count"] is None or data["cpu_count"] >= 1


def test_health_system_memory_fields_when_psutil_available():
    r = client.get("/health/system")
    data = r.json()
    try:
        import psutil  # noqa: F401
    except ImportError:
        return
    assert data["memory_total_bytes"] is not None
    assert data["memory_available_bytes"] is not None
    assert data["memory_used_percent"] is not None
