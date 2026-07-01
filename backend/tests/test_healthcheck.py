"""
Unit tests for healthcheck endpoint.
Issue: #1143
"""

import os
import sys
import unittest
from unittest.mock import Mock, patch, MagicMock
import json
import ssl
import urllib.error

sys.modules["dotenv"] = Mock()
sys.modules["dotenv"].load_dotenv = Mock()

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.healthcheck import (
    Config,
    CheckResult,
    JsonFormatter,
    _build_logger,
    _build_request,
    _build_ssl_context,
    _validate_body,
    _single_attempt,
    run_check,
    main,
    log,
)


class TestJsonFormatter(unittest.TestCase):
    """Test JsonFormatter class."""

    def test_format_basic(self):
        formatter = JsonFormatter()
        record = Mock()
        record.levelname = "INFO"
        record.getMessage.return_value = "Test message"
        record.__dict__ = {
            "name": "test", "msg": "Test message", "args": (),
            "levelname": "INFO", "levelno": 20, "pathname": "", "filename": "",
            "module": "", "exc_info": None, "exc_text": None, "stack_info": None,
            "lineno": 1, "funcName": "", "created": 0, "msecs": 0,
            "relativeCreated": 0, "thread": 0, "threadName": "",
            "processName": "", "process": 0, "message": "Test message", "taskName": None,
            "extra_field": "extra_value"
        }
        result = formatter.format(record)
        data = json.loads(result)
        self.assertEqual(data["level"], "INFO")
        self.assertEqual(data["message"], "Test message")
        self.assertEqual(data["extra_field"], "extra_value")

    def test_format_with_exception(self):
        formatter = JsonFormatter()
        record = Mock()
        record.levelname = "ERROR"
        record.getMessage.return_value = "Error occurred"
        record.__dict__ = {
            "name": "test", "msg": "Error occurred", "args": (),
            "levelname": "ERROR", "levelno": 40, "pathname": "", "filename": "",
            "module": "", "exc_info": (ValueError, ValueError("test"), None),
            "exc_text": None, "stack_info": None,
            "lineno": 1, "funcName": "", "created": 0, "msecs": 0,
            "relativeCreated": 0, "thread": 0, "threadName": "",
            "processName": "", "process": 0, "message": "Error occurred", "taskName": None,
        }
        result = formatter.format(record)
        data = json.loads(result)
        self.assertEqual(data["level"], "ERROR")
        self.assertIn("exception", data)


class TestConfig(unittest.TestCase):
    """Test Config dataclass."""

    def test_default_values(self):
        cfg = Config()
        self.assertEqual(cfg.url, "http://127.0.0.1:7860/ready")
        self.assertEqual(cfg.timeout, 3.0)
        self.assertEqual(cfg.retries, 3)
        self.assertEqual(cfg.retry_delay, 1.0)
        self.assertEqual(cfg.retry_backoff, 2.0)
        self.assertEqual(cfg.method, "GET")
        self.assertEqual(cfg.expected_status, (200, 299))
        self.assertIsNone(cfg.expected_body_contains)
        self.assertIsNone(cfg.expected_json_key)
        self.assertTrue(cfg.tls_verify)
        self.assertEqual(cfg.output_format, "json")

    @patch.dict(os.environ, {
        "HEALTHCHECK_URL": "https://example.com/health",
        "HEALTHCHECK_TIMEOUT_SECONDS": "5",
        "HEALTHCHECK_RETRIES": "2",
        "HEALTHCHECK_RETRY_DELAY": "0.5",
        "HEALTHCHECK_RETRY_BACKOFF": "1.5",
        "HEALTHCHECK_METHOD": "POST",
        "HEALTHCHECK_EXPECTED_STATUS": "200-204",
        "HEALTHCHECK_BODY_CONTAINS": "ok",
        "HEALTHCHECK_JSON_KEY": "status",
        "HEALTHCHECK_JSON_VALUE": "healthy",
        "HEALTHCHECK_BEARER_TOKEN": "token123",
        "HEALTHCHECK_BASIC_AUTH": "user:pass",
        "HEALTHCHECK_HEADERS": "X-Custom: value, X-Test: test",
        "HEALTHCHECK_TLS_VERIFY": "false",
        "HEALTHCHECK_CA_BUNDLE": "/path/to/ca.crt",
        "HEALTHCHECK_WARN_MS": "500",
        "HEALTHCHECK_OUTPUT": "text",
    }, clear=True)
    def test_from_env(self):
        cfg = Config.from_env()
        self.assertEqual(cfg.url, "https://example.com/health")
        self.assertEqual(cfg.timeout, 5.0)
        self.assertEqual(cfg.retries, 2)
        self.assertEqual(cfg.retry_delay, 0.5)
        self.assertEqual(cfg.retry_backoff, 1.5)
        self.assertEqual(cfg.method, "POST")
        self.assertEqual(cfg.expected_status, (200, 204))
        self.assertEqual(cfg.expected_body_contains, "ok")
        self.assertEqual(cfg.expected_json_key, "status")
        self.assertEqual(cfg.expected_json_value, "healthy")
        self.assertEqual(cfg.bearer_token, "token123")
        self.assertEqual(cfg.basic_auth, "user:pass")
        self.assertEqual(cfg.extra_headers, {"X-Custom": "value", "X-Test": "test"})
        self.assertFalse(cfg.tls_verify)
        self.assertEqual(cfg.tls_ca_bundle, "/path/to/ca.crt")
        self.assertEqual(cfg.response_time_warn_ms, 500.0)
        self.assertEqual(cfg.output_format, "text")

    @patch.dict(os.environ, {
        "HEALTHCHECK_TIMEOUT_SECONDS": "-1",
        "HEALTHCHECK_RETRIES": "-5",
    }, clear=True)
    def test_from_env_clamps_negative_values(self):
        cfg = Config.from_env()
        self.assertEqual(cfg.timeout, 0.1)
        self.assertEqual(cfg.retries, 0)

    @patch.dict(os.environ, {
        "HEALTHCHECK_EXPECTED_STATUS": "invalid",
    }, clear=True)
    def test_from_env_invalid_status_range(self):
        cfg = Config.from_env()
        self.assertEqual(cfg.expected_status, (200, 299))


class TestCheckResult(unittest.TestCase):
    """Test CheckResult dataclass."""

    def test_to_dict(self):
        result = CheckResult(success=True, status_code=200, response_time_ms=100.5)
        d = result.to_dict()
        self.assertTrue(d["success"])
        self.assertEqual(d["status_code"], 200)
        self.assertEqual(d["response_time_ms"], 100.5)
        self.assertNotIn("failure_reason", d)

    def test_emit_json(self):
        result = CheckResult(success=True, status_code=200, url="http://test.com")
        with patch("builtins.print") as mock_print:
            result.emit("json")
            output = json.loads(mock_print.call_args[0][0])
            self.assertTrue(output["success"])

    def test_emit_text_success(self):
        result = CheckResult(success=True, status_code=200, response_time_ms=50.0, url="http://test.com")
        with patch("builtins.print") as mock_print:
            result.emit("text")
            self.assertIn("OK", mock_print.call_args[0][0])

    def test_emit_text_failure(self):
        result = CheckResult(success=False, failure_reason="timeout", url="http://test.com")
        with patch("builtins.print") as mock_print:
            result.emit("text")
            self.assertIn("FAIL", mock_print.call_args[0][0])
            self.assertIn("timeout", mock_print.call_args[0][0])


class TestBuildRequest(unittest.TestCase):
    """Test _build_request function."""

    def test_basic_request(self):
        cfg = Config(url="http://example.com", method="GET")
        req = _build_request(cfg)
        self.assertEqual(req.full_url, "http://example.com")
        self.assertEqual(req.method, "GET")
        self.assertEqual(req.get_header("User-agent"), "advanced-healthcheck/2.0")

    def test_bearer_token(self):
        cfg = Config(bearer_token="mytoken")
        req = _build_request(cfg)
        self.assertEqual(req.get_header("Authorization"), "Bearer mytoken")

    def test_basic_auth(self):
        cfg = Config(basic_auth="user:pass")
        req = _build_request(cfg)
        auth_header = req.get_header("Authorization")
        self.assertTrue(auth_header.startswith("Basic "))

    def test_extra_headers(self):
        cfg = Config(extra_headers={"X-Custom": "value"})
        req = _build_request(cfg)
        self.assertEqual(req.get_header("X-custom"), "value")


class TestBuildSSLContext(unittest.TestCase):
    """Test _build_ssl_context function."""

    def test_http_returns_none(self):
        cfg = Config(url="http://example.com")
        ctx = _build_ssl_context(cfg)
        self.assertIsNone(ctx)

    def test_https_with_verify(self):
        cfg = Config(url="https://example.com", tls_verify=True)
        ctx = _build_ssl_context(cfg)
        self.assertIsNotNone(ctx)
        self.assertTrue(ctx.check_hostname)

    def test_https_without_verify(self):
        cfg = Config(url="https://example.com", tls_verify=False)
        ctx = _build_ssl_context(cfg)
        self.assertIsNotNone(ctx)
        self.assertEqual(ctx.verify_mode, ssl.CERT_NONE)

    def test_https_with_ca_bundle(self):
        # This would need a real CA bundle file to test fully
        cfg = Config(url="https://example.com", tls_ca_bundle="/nonexistent")
        # Should not raise even with invalid path (handled at runtime)
        ctx = _build_ssl_context(cfg)
        self.assertIsNotNone(ctx)


class TestValidateBody(unittest.TestCase):
    """Test _validate_body function."""

    def test_no_constraints(self):
        cfg = Config()
        valid, reason = _validate_body("any content", cfg)
        self.assertTrue(valid)
        self.assertIsNone(reason)

    def test_body_contains_match(self):
        cfg = Config(expected_body_contains="success")
        valid, reason = _validate_body("operation success", cfg)
        self.assertTrue(valid)

    def test_body_contains_missing(self):
        cfg = Config(expected_body_contains="success")
        valid, reason = _validate_body("operation failed", cfg)
        self.assertFalse(valid)
        self.assertIn("missing", reason)

    def test_json_key_match(self):
        cfg = Config(expected_json_key="status", expected_json_value="ok")
        valid, reason = _validate_body('{"status": "ok"}', cfg)
        self.assertTrue(valid)

    def test_json_key_mismatch(self):
        cfg = Config(expected_json_key="status", expected_json_value="ok")
        valid, reason = _validate_body('{"status": "error"}', cfg)
        self.assertFalse(valid)
        self.assertIn("expected", reason)

    def test_json_invalid(self):
        cfg = Config(expected_json_key="status")
        valid, reason = _validate_body("not json", cfg)
        self.assertFalse(valid)
        self.assertIn("not valid JSON", reason)

    def test_json_key_only_no_value_check(self):
        cfg = Config(expected_json_key="status")
        valid, reason = _validate_body('{"status": "anything"}', cfg)
        self.assertTrue(valid)


class TestSingleAttempt(unittest.TestCase):
    """Test _single_attempt function."""

    @patch("urllib.request.urlopen")
    def test_successful_request(self, mock_urlopen):
        mock_resp = Mock()
        mock_resp.status = 200
        mock_resp.read.return_value = b'{"status": "ok"}'
        mock_urlopen.return_value.__enter__ = Mock(return_value=mock_resp)
        mock_urlopen.return_value.__exit__ = Mock(return_value=False)
        
        cfg = Config(url="http://test.com")
        result = _single_attempt(cfg, 1)
        self.assertTrue(result.success)
        self.assertEqual(result.status_code, 200)

    @patch("urllib.request.urlopen")
    def test_status_out_of_range(self, mock_urlopen):
        mock_resp = Mock()
        mock_resp.status = 500
        mock_resp.read.return_value = b"error"
        mock_urlopen.return_value.__enter__ = Mock(return_value=mock_resp)
        mock_urlopen.return_value.__exit__ = Mock(return_value=False)
        
        cfg = Config(url="http://test.com")
        result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertEqual(result.status_code, 500)
        self.assertIn("not in", result.failure_reason)

    @patch("urllib.request.urlopen")
    def test_body_validation_failure(self, mock_urlopen):
        mock_resp = Mock()
        mock_resp.status = 200
        mock_resp.read.return_value = b"wrong content"
        mock_urlopen.return_value.__enter__ = Mock(return_value=mock_resp)
        mock_urlopen.return_value.__exit__ = Mock(return_value=False)
        
        cfg = Config(url="http://test.com", expected_body_contains="expected")
        result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertIn("missing", result.failure_reason)

    @patch("urllib.request.urlopen")
    def test_slow_response_warning(self, mock_urlopen):
        mock_resp = Mock()
        mock_resp.status = 200
        mock_resp.read.return_value = b"ok"
        mock_urlopen.return_value.__enter__ = Mock(return_value=mock_resp)
        mock_urlopen.return_value.__exit__ = Mock(return_value=False)
        
        cfg = Config(url="http://test.com", response_time_warn_ms=0.001)
        with patch("backend.healthcheck.log.warning") as mock_warn:
            result = _single_attempt(cfg, 1)
            self.assertTrue(result.success)
            mock_warn.assert_called_once()

    @patch("urllib.request.urlopen")
    def test_http_error_acceptable_status(self, mock_urlopen):
        mock_urlopen.side_effect = urllib.error.HTTPError(
            "http://test.com", 404, "Not Found", {}, None
        )
        
        cfg = Config(url="http://test.com", expected_status=(400, 499))
        result = _single_attempt(cfg, 1)
        # 404 is in 400-499 range, but body validation will fail due to empty body
        self.assertFalse(result.success)

    @patch("urllib.request.urlopen")
    def test_timeout_error(self, mock_urlopen):
        mock_urlopen.side_effect = TimeoutError()
        
        cfg = Config(url="http://test.com", timeout=0.001)
        result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertIn("timed out", result.failure_reason)

    @patch("urllib.request.urlopen")
    def test_url_error(self, mock_urlopen):
        mock_urlopen.side_effect = urllib.error.URLError("Connection refused")
        
        cfg = Config(url="http://test.com")
        result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertIn("URL error", result.failure_reason)


class TestRunCheck(unittest.TestCase):
    """Test run_check function."""

    @patch("backend.healthcheck._single_attempt")
    def test_success_on_first_attempt(self, mock_single):
        mock_single.return_value = CheckResult(success=True, status_code=200, attempt=1)
        
        cfg = Config(retries=0)
        result = run_check(cfg)
        self.assertTrue(result.success)
        self.assertEqual(result.attempt, 1)

    @patch("backend.healthcheck._single_attempt")
    @patch("time.sleep")
    def test_retry_then_success(self, mock_sleep, mock_single):
        mock_single.side_effect = [
            CheckResult(success=False, attempt=1),
            CheckResult(success=True, status_code=200, attempt=2),
        ]
        
        cfg = Config(retries=1, retry_delay=0.1)
        result = run_check(cfg)
        self.assertTrue(result.success)
        self.assertEqual(result.attempt, 2)
        mock_sleep.assert_called_once()

    @patch("backend.healthcheck._single_attempt")
    @patch("time.sleep")
    def test_all_retries_fail(self, mock_sleep, mock_single):
        mock_single.return_value = CheckResult(success=False, attempt=1, total_attempts=3)
        
        cfg = Config(retries=2, retry_delay=0.1)
        result = run_check(cfg)
        self.assertFalse(result.success)
        self.assertEqual(mock_sleep.call_count, 2)


class TestMain(unittest.TestCase):
    """Test main function."""

    @patch.dict(os.environ, {}, clear=True)
    @patch("backend.healthcheck.run_check")
    @patch("builtins.print")
    def test_successful_check(self, mock_print, mock_run):
        mock_run.return_value = CheckResult(success=True, status_code=200)
        result = main()
        self.assertEqual(result, 0)

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "ftp://invalid"}, clear=True)
    def test_invalid_scheme(self):
        result = main()
        self.assertEqual(result, 1)

    @patch.dict(os.environ, {}, clear=True)
    @patch("backend.healthcheck.run_check")
    def test_failed_check(self, mock_run):
        mock_run.return_value = CheckResult(success=False)
        result = main()
        self.assertEqual(result, 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
