import os
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

# Mock environmental settings before importing app
with patch.dict(os.environ, {
    "METRICS_TOKEN": "test-super-secret-token",
    "METRICS_ALLOWED_IPS": "127.0.0.1,192.168.1.1"
}):
    # Import the FastAPI app
    import backend.main as main
    client = TestClient(main.app)

class TestMetricsEndpointSecurity(unittest.TestCase):
    """Verifies that the /metrics endpoint has correct security checks."""

    def test_metrics_no_auth(self):
        """Request without Authorization header should be rejected."""
        response = client.get("/metrics")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Forbidden", response.json().get("detail", ""))

    def test_metrics_invalid_token(self):
        """Request with incorrect Authorization header should be rejected."""
        response = client.get("/metrics", headers={"Authorization": "Bearer wrong-token"})
        self.assertEqual(response.status_code, 403)
        self.assertIn("Forbidden", response.json().get("detail", ""))

    def test_metrics_correct_token(self):
        """Request with valid token and client IP 127.0.0.1 should succeed."""
        # TestClient defaults client host to 127.0.0.1
        response = client.get(
            "/metrics", 
            headers={"Authorization": "Bearer test-super-secret-token"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/plain", response.headers.get("content-type", ""))
        self.assertIn("http_requests_total", response.text)

    @patch("fastapi.Request.client")
    def test_metrics_invalid_ip(self, mock_client):
        """Request from unauthorized client IP should be rejected."""
        # Mock client IP address to one not in METRICS_ALLOWED_IPS
        mock_client.host = "10.0.0.5"
        
        response = client.get(
            "/metrics",
            headers={"Authorization": "Bearer test-super-secret-token"}
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("Forbidden: IP 10.0.0.5 not allowed", response.json().get("detail", ""))

if __name__ == "__main__":
    unittest.main()
