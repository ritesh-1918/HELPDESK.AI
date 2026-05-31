import sys
import os
import unittest

os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mockkey'

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.metrics_service import (
    CLASSIFIER_LATENCY,
    CLASSIFIER_REQUESTS,
    CLASSIFIER_TOKENS,
)


class TestMetricsExistence(unittest.TestCase):

    def test_classifier_latency_is_histogram(self):
        from prometheus_client import Histogram
        self.assertIsInstance(CLASSIFIER_LATENCY, Histogram)

    def test_classifier_requests_is_counter(self):
        from prometheus_client import Counter
        self.assertIsInstance(CLASSIFIER_REQUESTS, Counter)

    def test_classifier_tokens_is_counter(self):
        from prometheus_client import Counter
        self.assertIsInstance(CLASSIFIER_TOKENS, Counter)

    def test_classifier_latency_name(self):
        self.assertEqual(CLASSIFIER_LATENCY._name, "ai_classifier_inference_latency_seconds")

    def test_classifier_requests_name(self):
        self.assertEqual(CLASSIFIER_REQUESTS._name, "ai_classifier_inference_requests_total")

    def test_classifier_tokens_name(self):
        self.assertEqual(CLASSIFIER_TOKENS._name, "ai_classifier_input_tokens_total")

    def test_classifier_latency_has_model_label(self):
        self.assertIn("model", CLASSIFIER_LATENCY._labelnames)

    def test_classifier_requests_has_model_and_status_labels(self):
        self.assertIn("model", CLASSIFIER_REQUESTS._labelnames)
        self.assertIn("status", CLASSIFIER_REQUESTS._labelnames)

    def test_classifier_latency_has_reasonable_buckets(self):
        buckets = list(CLASSIFIER_LATENCY._buckets)
        self.assertIn(0.01, buckets)
        self.assertIn(0.1, buckets)
        self.assertIn(1.0, buckets)
        self.assertIn(10.0, buckets)


class TestMetricsUsage(unittest.TestCase):

    def test_latency_observe(self):
        CLASSIFIER_LATENCY.labels(model="distilbert").observe(0.05)

    def test_requests_increment_ok(self):
        CLASSIFIER_REQUESTS.labels(model="distilbert", status="ok").inc()

    def test_requests_increment_error(self):
        CLASSIFIER_REQUESTS.labels(model="distilbert", status="error").inc()

    def test_tokens_increment(self):
        CLASSIFIER_TOKENS.labels(model="distilbert").inc(42)


if __name__ == '__main__':
    unittest.main()
