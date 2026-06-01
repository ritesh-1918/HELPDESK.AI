"""
Unit tests for metrics_service.py
"""

import pytest
from prometheus_client import Histogram, Counter


class TestMetricsService:
    def test_classifier_latency_histogram_exists(self):
        from backend.services.metrics_service import CLASSIFIER_LATENCY

        assert isinstance(CLASSIFIER_LATENCY, Histogram)
        assert CLASSIFIER_LATENCY._documentation == "Latency of DistilBERT classifier inference in seconds"

    def test_classifier_latency_labels(self):
        from backend.services.metrics_service import CLASSIFIER_LATENCY

        assert "model" in CLASSIFIER_LATENCY._labelnames

    def test_classifier_latency_buckets(self):
        from backend.services.metrics_service import CLASSIFIER_LATENCY

        expected = [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
        assert CLASSIFIER_LATENCY._upper_bounds[:-1] == expected

    def test_classifier_requests_counter_exists(self):
        from backend.services.metrics_service import CLASSIFIER_REQUESTS

        assert isinstance(CLASSIFIER_REQUESTS, Counter)
        assert CLASSIFIER_REQUESTS._documentation == "Total number of classifier inference requests"

    def test_classifier_requests_labels(self):
        from backend.services.metrics_service import CLASSIFIER_REQUESTS

        assert "model" in CLASSIFIER_REQUESTS._labelnames
        assert "status" in CLASSIFIER_REQUESTS._labelnames

    def test_classifier_tokens_counter_exists(self):
        from backend.services.metrics_service import CLASSIFIER_TOKENS

        assert isinstance(CLASSIFIER_TOKENS, Counter)
        assert CLASSIFIER_TOKENS._documentation == "Total number of input tokens processed by the classifier"

    def test_classifier_tokens_labels(self):
        from backend.services.metrics_service import CLASSIFIER_TOKENS

        assert "model" in CLASSIFIER_TOKENS._labelnames

    def test_latency_observe(self):
        from backend.services.metrics_service import CLASSIFIER_LATENCY

        CLASSIFIER_LATENCY.labels(model="distilbert").observe(0.05)
        CLASSIFIER_LATENCY.labels(model="distilbert").observe(0.1)

    def test_requests_counter_increment(self):
        from backend.services.metrics_service import CLASSIFIER_REQUESTS

        CLASSIFIER_REQUESTS.labels(model="distilbert", status="ok").inc()
        CLASSIFIER_REQUESTS.labels(model="distilbert", status="ok").inc()
        CLASSIFIER_REQUESTS.labels(model="distilbert", status="error").inc()

    def test_tokens_counter_increment(self):
        from backend.services.metrics_service import CLASSIFIER_TOKENS

        CLASSIFIER_TOKENS.labels(model="distilbert").inc(100)
        CLASSIFIER_TOKENS.labels(model="distilbert").inc(50)