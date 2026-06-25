"""
Unit tests for the retry logic in backend/services/classifier_service.py.

This test file stubs out all heavy ML dependencies (torch, transformers,
prometheus_client) at the sys.modules level so it runs quickly without
requiring a GPU or a full ML environment.

Run from the repository root with:
    python -m pytest backend/tests/test_retry_logic.py -v
"""

import sys
import time
import types
import unittest
from unittest.mock import MagicMock, call, patch

# ---------------------------------------------------------------------------
# Stub heavy dependencies BEFORE importing classifier_service
# ---------------------------------------------------------------------------

def _make_stub_module(name):
    mod = types.ModuleType(name)
    sys.modules[name] = mod
    return mod


# torch
_torch = _make_stub_module("torch")
_torch.device = lambda *a, **kw: "cpu"
_torch.cuda = MagicMock()
_torch.cuda.is_available = MagicMock(return_value=False)
_torch.no_grad = MagicMock(return_value=MagicMock(__enter__=lambda s, *a: s, __exit__=lambda s, *a: None))
_torch_nn = _make_stub_module("torch.nn")
_torch_nn_functional = _make_stub_module("torch.nn.functional")
_torch_nn_functional.softmax = MagicMock()

# transformers
_transformers = _make_stub_module("transformers")
_transformers.DistilBertTokenizerFast = MagicMock()
_transformers.DistilBertForSequenceClassification = MagicMock()

# prometheus_client — provide real Counter/Histogram stubs that don't need a
# running metrics server, so metric assertions in the tests remain meaningful.
_prom = _make_stub_module("prometheus_client")

class _FakeMetric:
    def __init__(self, *a, **kw):
        self._calls = []

    def labels(self, **kw):
        self._calls.append(kw)
        return self

    def inc(self, amount=1):
        pass

    def observe(self, value):
        pass

_prom.Counter = _FakeMetric
_prom.Histogram = _FakeMetric

# Now safe to import
from backend.services.classifier_service import (  # noqa: E402
    _backoff_delay,
    _is_retryable,
    _retry_call,
    _BASE_DELAY_S,
    _MAX_RETRIES,
)


# ---------------------------------------------------------------------------
# _is_retryable
# ---------------------------------------------------------------------------

class TestIsRetryable(unittest.TestCase):
    def test_connection_error_is_retryable(self):
        self.assertTrue(_is_retryable(ConnectionError("refused")))

    def test_timeout_error_is_retryable(self):
        self.assertTrue(_is_retryable(TimeoutError("timed out")))

    def test_os_error_is_retryable(self):
        self.assertTrue(_is_retryable(OSError("IO failure")))

    def test_file_not_found_is_retryable(self):
        # FileNotFoundError is a subclass of OSError — transient I/O, retryable.
        self.assertTrue(_is_retryable(FileNotFoundError("missing")))

    def test_value_error_is_not_retryable(self):
        self.assertFalse(_is_retryable(ValueError("bad input")))

    def test_runtime_error_is_not_retryable(self):
        self.assertFalse(_is_retryable(RuntimeError("model exploded")))

    def test_key_error_is_not_retryable(self):
        self.assertFalse(_is_retryable(KeyError("missing key")))


# ---------------------------------------------------------------------------
# _backoff_delay
# ---------------------------------------------------------------------------

class TestBackoffDelay(unittest.TestCase):
    def test_attempt_1_returns_200ms(self):
        self.assertAlmostEqual(_backoff_delay(1), 0.2, places=9)

    def test_attempt_2_returns_400ms(self):
        self.assertAlmostEqual(_backoff_delay(2), 0.4, places=9)

    def test_attempt_3_returns_800ms(self):
        self.assertAlmostEqual(_backoff_delay(3), 0.8, places=9)

    def test_formula_is_base_times_power_of_two(self):
        for attempt in range(1, 6):
            expected = _BASE_DELAY_S * (2 ** attempt)
            self.assertAlmostEqual(_backoff_delay(attempt), expected, places=9)


# ---------------------------------------------------------------------------
# _retry_call — success path
# ---------------------------------------------------------------------------

class TestRetryCallSuccess(unittest.TestCase):
    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_succeeds_on_first_attempt_with_no_sleep(self, mock_sleep):
        fn = MagicMock(return_value={"category": "Network"})
        result = _retry_call(fn, provider="classifier")
        self.assertEqual(result, {"category": "Network"})
        fn.assert_called_once()
        mock_sleep.assert_not_called()

    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_succeeds_after_two_transient_failures(self, mock_sleep):
        fn = MagicMock(
            side_effect=[
                ConnectionError("refused"),
                ConnectionError("refused"),
                {"category": "Software"},
            ]
        )
        result = _retry_call(fn, provider="classifier")
        self.assertEqual(result, {"category": "Software"})
        self.assertEqual(fn.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2)


# ---------------------------------------------------------------------------
# _retry_call — retry exhaustion
# ---------------------------------------------------------------------------

class TestRetryCallExhaustion(unittest.TestCase):
    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_raises_after_max_retries_on_connection_error(self, mock_sleep):
        fn = MagicMock(side_effect=ConnectionError("always fails"))
        with self.assertRaises(ConnectionError):
            _retry_call(fn, provider="classifier")
        # 1 initial call + _MAX_RETRIES retry calls
        self.assertEqual(fn.call_count, 1 + _MAX_RETRIES)
        self.assertEqual(mock_sleep.call_count, _MAX_RETRIES)

    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_raises_after_max_retries_on_timeout_error(self, mock_sleep):
        fn = MagicMock(side_effect=TimeoutError("always times out"))
        with self.assertRaises(TimeoutError):
            _retry_call(fn, provider="classifier")
        self.assertEqual(fn.call_count, 1 + _MAX_RETRIES)

    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_custom_max_retries_limits_attempts(self, mock_sleep):
        fn = MagicMock(side_effect=ConnectionError("fail"))
        with self.assertRaises(ConnectionError):
            _retry_call(fn, provider="test", max_retries=1)
        # 1 initial + 1 retry = 2 total calls, 1 sleep
        self.assertEqual(fn.call_count, 2)
        self.assertEqual(mock_sleep.call_count, 1)


# ---------------------------------------------------------------------------
# _retry_call — non-retryable errors (fail immediately)
# ---------------------------------------------------------------------------

class TestRetryCallNonRetryable(unittest.TestCase):
    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_value_error_is_not_retried(self, mock_sleep):
        fn = MagicMock(side_effect=ValueError("bad input"))
        with self.assertRaises(ValueError):
            _retry_call(fn, provider="classifier")
        fn.assert_called_once()
        mock_sleep.assert_not_called()

    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_runtime_error_is_not_retried(self, mock_sleep):
        fn = MagicMock(side_effect=RuntimeError("unexpected"))
        with self.assertRaises(RuntimeError):
            _retry_call(fn, provider="classifier")
        fn.assert_called_once()
        mock_sleep.assert_not_called()


# ---------------------------------------------------------------------------
# _retry_call — correct backoff sleep durations
# ---------------------------------------------------------------------------

class TestRetryCallBackoffTiming(unittest.TestCase):
    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_sleep_called_with_correct_exponential_delays(self, mock_sleep):
        fn = MagicMock(
            side_effect=[
                ConnectionError(),
                ConnectionError(),
                ConnectionError(),
                {"ok": True},
            ]
        )
        _retry_call(fn, provider="classifier")
        expected_calls = [
            call(_backoff_delay(1)),
            call(_backoff_delay(2)),
            call(_backoff_delay(3)),
        ]
        mock_sleep.assert_has_calls(expected_calls)
        self.assertEqual(mock_sleep.call_count, 3)

    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    def test_delay_doubles_each_attempt(self, mock_sleep):
        fn = MagicMock(
            side_effect=[
                ConnectionError(),
                ConnectionError(),
                {"ok": True},
            ]
        )
        _retry_call(fn, provider="classifier")
        delays = [c.args[0] for c in mock_sleep.call_args_list]
        # Each successive delay should be double the previous
        self.assertAlmostEqual(delays[1], delays[0] * 2, places=9)


# ---------------------------------------------------------------------------
# _retry_call — Prometheus metrics emission
# ---------------------------------------------------------------------------

class TestRetryCallMetrics(unittest.TestCase):
    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    @patch("backend.services.classifier_service.CLASSIFIER_RETRY_TOTAL")
    def test_retrying_and_success_metrics_emitted(self, mock_counter, _mock_sleep):
        mock_labels = MagicMock()
        mock_counter.labels.return_value = mock_labels

        fn = MagicMock(side_effect=[ConnectionError("once"), {"result": "ok"}])
        _retry_call(fn, provider="gemini")

        retrying_call = call(provider="gemini", status="retrying")
        success_call = call(provider="gemini", status="success")
        all_calls = mock_counter.labels.call_args_list

        self.assertIn(retrying_call, all_calls)
        self.assertIn(success_call, all_calls)

    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    @patch("backend.services.classifier_service.CLASSIFIER_RETRY_TOTAL")
    def test_failure_metric_emitted_after_exhaustion(self, mock_counter, _mock_sleep):
        mock_labels = MagicMock()
        mock_counter.labels.return_value = mock_labels

        fn = MagicMock(side_effect=ConnectionError("always"))
        with self.assertRaises(ConnectionError):
            _retry_call(fn, provider="gemini")

        failure_call = call(provider="gemini", status="failure")
        self.assertIn(failure_call, mock_counter.labels.call_args_list)

    @patch("backend.services.classifier_service.time.sleep", return_value=None)
    @patch("backend.services.classifier_service.CLASSIFIER_RETRY_TOTAL")
    def test_no_metrics_emitted_on_first_attempt_success(
        self, mock_counter, _mock_sleep
    ):
        fn = MagicMock(return_value={"ok": True})
        _retry_call(fn, provider="classifier")
        mock_counter.labels.assert_not_called()


if __name__ == "__main__":
    unittest.main()
