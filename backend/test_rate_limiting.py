import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.dirname(__file__))
from fastapi.testclient import TestClient

from backend.main import app

def test_rate_limiting_analyze_ticket():
    client = TestClient(app)
    
    payload = {
        "text": "Password reset request for user account.",
        "image_base64": "",
        "confidence_threshold": 0.20
    }
    
    # Make up to 10 requests which should succeed or return valid response
    responses = []
    for _ in range(12):
        res = client.post("/ai/analyze_ticket", json=payload)
        responses.append(res.status_code)
    
    # At least one request after threshold must return 429 Too Many Requests
    assert 429 in responses, f"Expected 429 status in responses: {responses}"
