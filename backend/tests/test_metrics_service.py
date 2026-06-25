"""
Unit tests for backend/services/metrics_service.py
Covers Prometheus metrics instrumentation for AI classifier inference telemetry.
"""
import unittest
from unittest.mock import patch

import backend.services.metrics_service as ms

class TestMetricsService(unittest.TestCase):
    """Test suite for metrics_service.py Prometheus metrics."""

    def test_latency_histogram_properties(self):
        """Histogram properties should be correct."""
        self.assertTrue(ms.CLASSIFIER_LATENCY._name.startswith("ai_classifier_inference_latency"))
        self.assertIn("Latency", ms.CLASSIFIER_LATENCY._documentation)
        self.assertIn("model", ms.CLASSIFIER_LATENCY._labelnames)
        
        # Check that buckets are set (prometheus_client handles upper bounds / +Inf)
        self.assertIn(0.01, ms.CLASSIFIER_LATENCY._upper_bounds)
        self.assertIn(10.0, ms.CLASSIFIER_LATENCY._upper_bounds)

    def test_requests_counter_properties(self):
        """Counter properties should be correct."""
        self.assertTrue(ms.CLASSIFIER_REQUESTS._name.startswith("ai_classifier_inference_requests"))
        self.assertIn("model", ms.CLASSIFIER_REQUESTS._labelnames)
        self.assertIn("status", ms.CLASSIFIER_REQUESTS._labelnames)

    def test_tokens_counter_properties(self):
        """Token counter properties should be correct."""
        self.assertTrue(ms.CLASSIFIER_TOKENS._name.startswith("ai_classifier_input_tokens"))
        self.assertIn("model", ms.CLASSIFIER_TOKENS._labelnames)

    def test_model_predictions_total_properties(self):
        """Model predictions counter properties should be correct."""
        self.assertTrue(ms.MODEL_PREDICTIONS_TOTAL._name.startswith("model_predictions"))
        self.assertIn("status", ms.MODEL_PREDICTIONS_TOTAL._labelnames)

    def test_model_prediction_latency_properties(self):
        """Model prediction latency properties should be correct."""
        self.assertEqual(ms.MODEL_PREDICTION_LATENCY._name, "model_prediction_latency_seconds")
        self.assertEqual(ms.MODEL_PREDICTION_LATENCY._labelnames, ())

    @patch("backend.services.metrics_service.CLASSIFIER_LATENCY")
    def test_latency_observe(self, mock_hist):
        """Observe should record latency."""
        ms.CLASSIFIER_LATENCY.labels(model="distilbert").observe(0.05)
        mock_hist.labels.assert_called_with(model="distilbert")
        mock_hist.labels.return_value.observe.assert_called_with(0.05)

    @patch("backend.services.metrics_service.CLASSIFIER_REQUESTS")
    def test_requests_inc(self, mock_ctr):
        """Counter should increment."""
        ms.CLASSIFIER_REQUESTS.labels(model="distilbert", status="ok").inc()
        mock_ctr.labels.assert_called_with(model="distilbert", status="ok")
        mock_ctr.labels.return_value.inc.assert_called_once()

    @patch("backend.services.metrics_service.CLASSIFIER_TOKENS")
    def test_tokens_inc(self, mock_tok):
        """Tokens should increment."""
        ms.CLASSIFIER_TOKENS.labels(model="distilbert").inc(128)
        mock_tok.labels.assert_called_with(model="distilbert")
        mock_tok.labels.return_value.inc.assert_called_with(128)

    @patch("backend.services.metrics_service.MODEL_PREDICTIONS_TOTAL")
    def test_model_predictions_total_inc(self, mock_ctr):
        """Model predictions total should increment."""
        ms.MODEL_PREDICTIONS_TOTAL.labels(status="success").inc()
        mock_ctr.labels.assert_called_with(status="success")
        mock_ctr.labels.return_value.inc.assert_called_once()

    @patch("backend.services.metrics_service.MODEL_PREDICTION_LATENCY")
    def test_model_prediction_latency_observe(self, mock_hist):
        """Model prediction latency should be recorded."""
        ms.MODEL_PREDICTION_LATENCY.observe(1.5)
        mock_hist.observe.assert_called_with(1.5)

if __name__ == "__main__":
    unittest.main()
