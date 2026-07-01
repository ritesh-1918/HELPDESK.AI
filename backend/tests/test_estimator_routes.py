"""
Unit tests for backend/routes/estimator.py
Covers POST /estimate and GET /sla-targets endpoints with validation and error handling.
"""
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI


def create_test_app():
    """Create a FastAPI test app with the estimator router mounted."""
    app = FastAPI()
    from backend.services.rate_limit_config import limiter
    from slowapi.errors import RateLimitExceeded
    from slowapi import _rate_limit_exceeded_handler
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    from backend.routes.estimator import router
    app.include_router(router)
    return app



# ── POST /api/estimator/estimate ───────────────────────────────

class TestEstimateEndpoint(unittest.TestCase):
    """Tests for POST /api/estimator/estimate."""

    def setUp(self):
        self.app = create_test_app()
        self.client = TestClient(self.app)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_low_priority(self, mock_summary, mock_estimate):
        """Low priority should estimate a longer SLA."""
        mock_estimate.return_value = {
            "estimated_hours": 24.0,
            "breach_risk": "low",
            "confidence": 0.9,
        }
        mock_summary.return_value = "Estimated 24.0h response time (low risk)"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "low",
            "team_workload": 5,
            "team_size": 3,
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["estimation"]["estimated_hours"], 24.0)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_medium_priority(self, mock_summary, mock_estimate):
        mock_estimate.return_value = {
            "estimated_hours": 8.0,
            "breach_risk": "medium",
            "confidence": 0.85,
        }
        mock_summary.return_value = "Estimated 8.0h response time (medium risk)"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 3,
            "team_size": 2,
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_high_priority(self, mock_summary, mock_estimate):
        mock_estimate.return_value = {
            "estimated_hours": 4.0,
            "breach_risk": "high",
            "confidence": 0.8,
        }
        mock_summary.return_value = "Estimated 4.0h response time (high risk)"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "high",
            "team_workload": 10,
            "team_size": 1,
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_critical_priority(self, mock_summary, mock_estimate):
        mock_estimate.return_value = {
            "estimated_hours": 1.0,
            "breach_risk": "critical",
            "confidence": 0.95,
        }
        mock_summary.return_value = "Estimated 1.0h response time (critical risk)"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "critical",
            "team_workload": 2,
            "team_size": 5,
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_default_priority(self, mock_summary, mock_estimate):
        """Default priority should be 'medium'."""
        mock_estimate.return_value = {"estimated_hours": 8.0}
        mock_summary.return_value = "ok"
        resp = self.client.post("/api/estimator/estimate", json={
            "team_workload": 0,
            "team_size": 1,
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_with_category(self, mock_summary, mock_estimate):
        mock_estimate.return_value = {"estimated_hours": 6.0}
        mock_summary.return_value = "ok"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "high",
            "team_workload": 5,
            "team_size": 3,
            "category": "network",
        })
        self.assertEqual(resp.status_code, 200)
        # Verify category was passed
        call_kwargs = mock_estimate.call_args[1]
        self.assertEqual(call_kwargs["category"], "network")

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_with_historical_avg(self, mock_summary, mock_estimate):
        mock_estimate.return_value = {"estimated_hours": 3.5}
        mock_summary.return_value = "ok"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 3,
            "team_size": 2,
            "historical_avg_hours": 4.0,
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_zero_workload(self, mock_summary, mock_estimate):
        """Zero team workload should be valid."""
        mock_estimate.return_value = {"estimated_hours": 2.0}
        mock_summary.return_value = "ok"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "low",
            "team_workload": 0,
            "team_size": 2,
        })
        self.assertEqual(resp.status_code, 200)

    @patch("backend.routes.estimator.estimate_response_time")
    @patch("backend.routes.estimator.generate_estimation_summary")
    def test_estimate_high_workload(self, mock_summary, mock_estimate):
        mock_estimate.return_value = {"estimated_hours": 72.0}
        mock_summary.return_value = "ok"
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "low",
            "team_workload": 100,
            "team_size": 1,
        })
        self.assertEqual(resp.status_code, 200)

    def test_estimate_missing_team_size_defaults(self):
        """Missing team_size should default to 1."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 5,
        })
        # Should not 422 because team_size defaults to 1
        self.assertNotEqual(resp.status_code, 422)

    def test_estimate_invalid_priority(self):
        """Invalid priority value should return 422."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "urgent",
            "team_workload": 5,
            "team_size": 2,
        })
        self.assertEqual(resp.status_code, 422)

    def test_estimate_empty_priority(self):
        """Empty priority should return 422."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "",
            "team_workload": 5,
            "team_size": 2,
        })
        self.assertEqual(resp.status_code, 422)

    def test_estimate_negative_workload(self):
        """Negative workload should return 422."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": -1,
            "team_size": 2,
        })
        self.assertEqual(resp.status_code, 422)

    def test_estimate_zero_team_size(self):
        """Zero team_size should return 422."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 5,
            "team_size": 0,
        })
        self.assertEqual(resp.status_code, 422)

    def test_estimate_negative_team_size(self):
        """Negative team_size should return 422."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 5,
            "team_size": -1,
        })
        self.assertEqual(resp.status_code, 422)

    def test_estimate_negative_historical_avg(self):
        """Negative historical_avg_hours should return 422 (gt=0)."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 5,
            "team_size": 2,
            "historical_avg_hours": -1.0,
        })
        self.assertEqual(resp.status_code, 422)

    def test_estimate_zero_historical_avg(self):
        """Zero historical_avg_hours should return 422 (gt=0)."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 5,
            "team_size": 2,
            "historical_avg_hours": 0,
        })
        self.assertEqual(resp.status_code, 422)

    @patch("backend.routes.estimator.estimate_response_time")
    def test_estimate_service_exception(self, mock_estimate):
        """Service exception should return 500."""
        mock_estimate.side_effect = RuntimeError("Model not loaded")
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 5,
            "team_size": 2,
        })
        self.assertEqual(resp.status_code, 500)
        self.assertIn("Estimation failed", resp.json()["detail"])

    def test_estimate_missing_required_fields(self):
        """Missing team_workload should return 422."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_size": 2,
        })
        self.assertEqual(resp.status_code, 422)

    def test_estimate_extra_fields_ignored(self):
        """Extra unknown fields should be ignored."""
        resp = self.client.post("/api/estimator/estimate", json={
            "priority": "medium",
            "team_workload": 5,
            "team_size": 2,
            "unknown_field": "should be ignored",
        })
        self.assertNotEqual(resp.status_code, 422)


# ── GET /api/estimator/sla-targets ─────────────────────────────

class TestSlaTargetsEndpoint(unittest.TestCase):
    """Tests for GET /api/estimator/sla-targets."""

    def setUp(self):
        self.app = create_test_app()
        self.client = TestClient(self.app)

    @patch("backend.services.response_time_estimator.SLA_TARGETS", {
        "critical": 1.0,
        "high": 4.0,
        "medium": 8.0,
        "low": 24.0,
    })
    def test_sla_targets_returns_all_priorities(self):
        """Should return SLA targets for all priority levels."""
        resp = self.client.get("/api/estimator/sla-targets")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        targets = data["data"]
        self.assertIn("critical", targets)
        self.assertIn("high", targets)
        self.assertIn("medium", targets)
        self.assertIn("low", targets)

    @patch("backend.services.response_time_estimator.SLA_TARGETS", {
        "critical": 1.0, "high": 4.0, "medium": 8.0, "low": 24.0,
    })
    def test_sla_targets_correct_values(self):
        resp = self.client.get("/api/estimator/sla-targets")
        data = resp.json()
        self.assertEqual(data["data"]["critical"], 1.0)
        self.assertEqual(data["data"]["high"], 4.0)
        self.assertEqual(data["data"]["medium"], 8.0)
        self.assertEqual(data["data"]["low"], 24.0)

    @patch("backend.services.response_time_estimator.SLA_TARGETS", {})
    def test_sla_targets_empty(self):
        """Should handle empty SLA targets."""
        resp = self.client.get("/api/estimator/sla-targets")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"], {})


if __name__ == "__main__":
    unittest.main()
