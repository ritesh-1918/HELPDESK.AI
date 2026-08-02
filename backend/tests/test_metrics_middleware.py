"""
Unit tests for backend/middleware/metrics.py.

Covers the _is_authorized helper and the /metrics endpoint authorisation
behaviour. The prometheus_client import is the only one that is hard
to mock; we exercise it via subprocess or skip the Instrumentator
path if the import fails.
"""

import os
import sys
import unittest
from unittest import mock

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.middleware import metrics as mw_metrics
from backend.middleware.metrics import _is_authorized


def _make_request(token=None, client_ip="127.0.0.1", forwarded_for=None):
    request = mock.MagicMock()
    request.headers = {}
    if token is not None:
        request.headers["Authorization"] = f"Bearer {token}"
    if forwarded_for is not None:
        request.headers["X-Forwarded-For"] = forwarded_for
    request.client.host = client_ip
    return request


class TestIsAuthorized(unittest.TestCase):
    def setUp(self):
        # Reset module-level token/IP set between tests.
        self._original_token = mw_metrics._METRICS_TOKEN
        self._original_ips = mw_metrics._ALLOWED_IPS
        # Default: no token, only loopback allowed
        mw_metrics._METRICS_TOKEN = ""
        mw_metrics._ALLOWED_IPS = {"127.0.0.1", "::1"}

    def tearDown(self):
        mw_metrics._METRICS_TOKEN = self._original_token
        mw_metrics._ALLOWED_IPS = self._original_ips

    def test_loopback_allowed(self):
        req = _make_request(client_ip="127.0.0.1")
        self.assertTrue(_is_authorized(req))

    def test_non_loopback_denied(self):
        req = _make_request(client_ip="10.0.0.5")
        self.assertFalse(_is_authorized(req))

    def test_token_match(self):
        mw_metrics._METRICS_TOKEN = "secret"
        req = _make_request(token="secret", client_ip="10.0.0.5")
        self.assertTrue(_is_authorized(req))

    def test_token_mismatch(self):
        mw_metrics._METRICS_TOKEN = "secret"
        req = _make_request(token="wrong", client_ip="10.0.0.5")
        self.assertFalse(_is_authorized(req))

    def test_no_token_no_match_falls_back_to_ip(self):
        mw_metrics._METRICS_TOKEN = "secret"
        req = _make_request(token=None, client_ip="127.0.0.1")
        # No bearer, falls back to IP allowlist
        self.assertTrue(_is_authorized(req))

    def test_x_forwarded_for_used(self):
        # X-Forwarded-For takes priority over client_ip
        req = _make_request(client_ip="10.0.0.5", forwarded_for="127.0.0.1")
        self.assertTrue(_is_authorized(req))

    def test_x_forwarded_for_first_value(self):
        req = _make_request(client_ip="10.0.0.5", forwarded_for="127.0.0.1, 10.0.0.1")
        # First value in X-Forwarded-For is used
        self.assertTrue(_is_authorized(req))

    def test_x_forwarded_for_denied(self):
        req = _make_request(client_ip="127.0.0.1", forwarded_for="10.0.0.5")
        # X-Forwarded-For takes priority, denied
        self.assertFalse(_is_authorized(req))

    def test_no_client(self):
        req = mock.MagicMock()
        req.headers = {}
        req.client = None
        # Should not crash; empty IP -> denied
        self.assertFalse(_is_authorized(req))


class TestSetupMetricsGracefulDegradation(unittest.TestCase):
    """When prometheus_fastapi_instrumentator is not importable, setup_metrics should log and return without crashing."""

    def test_setup_metrics_without_prometheus(self):
        import builtins
        original_import = builtins.__import__

        def mock_import(name, *args, **kwargs):
            if name in ("prometheus_fastapi_instrumentator", "prometheus_client"):
                raise ImportError(f"mocked missing {name}")
            return original_import(name, *args, **kwargs)

        with mock.patch.object(builtins, "__import__", side_effect=mock_import):
            # Reload metrics module so _PROMETHEUS_AVAILABLE becomes False
            import importlib
            importlib.reload(mw_metrics)
            try:
                app = mock.MagicMock()
                mw_metrics.setup_metrics(app)
                # No exception raised, no instrumentation added
            finally:
                # Reload to restore state for other tests
                importlib.reload(mw_metrics)


if __name__ == "__main__":
    unittest.main()
