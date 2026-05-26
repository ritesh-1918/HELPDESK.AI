"""
Prometheus metrics for AI inference telemetry.

Exposes histograms and counters for DistilBERT classification latency,
total inference requests, and API token counts. Collected by Prometheus
via the FastAPI /metrics endpoint and visualized in Grafana.
"""

from prometheus_client import Counter, Histogram

# DistilBERT classification latency (seconds)
CLASSIFIER_LATENCY = Histogram(
    "ai_classifier_inference_latency_seconds",
    "Latency of DistilBERT classifier inference in seconds",
    labelnames=("model",),
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)

# Total classifier inference requests, by model and status (ok|error)
CLASSIFIER_REQUESTS = Counter(
    "ai_classifier_inference_requests_total",
    "Total number of classifier inference requests",
    labelnames=("model", "status"),
)

# Token counts processed by the classifier (input tokens)
CLASSIFIER_TOKENS = Counter(
    "ai_classifier_input_tokens_total",
    "Total number of input tokens processed by the classifier",
    labelnames=("model",),
)
