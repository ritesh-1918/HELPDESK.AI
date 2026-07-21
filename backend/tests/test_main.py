import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_ready():
    response = client.get("/ready")
    assert response.status_code in (200, 503)
    assert response.json()["status"] in ("ready", "not_ready")
