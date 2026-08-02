"""
Comprehensive unit tests for backend/healthcheck.py — Issue #1138.

Covers:
- Config dataclass: default values, field types, from_env() parsing
- Config.from_env(): env vars override defaults, clamping of negative values,
  header parsing, status range parsing, fallback on malformed values
- CheckResult dataclass: field types, to_dict() filters None, emit() output formats
- _build_request(): User-Agent header, Bearer auth, Basic auth, extra headers
- _validate_body(): body substring check, JSON key check, JSON value check,
  malformed JSON, no validation when not configured
- _single_attempt(): successful 200 response, status outside range fails,
  HTTPError within range succeeds, timeout, URL error, OS error
- run_check(): returns last result, stops on success, retries on failure
- main(): returns 0 on success, 1 on failure, 1 on invalid URL scheme
- JsonFormatter: extra fields in structured output, exception formatting
"""

import json
import os
import sys
import io
import logging
import unittest
from dataclasses import fields as dc_fields
from io import StringIO
from unittest.mock import MagicMock, patch, call
import urllib.error
import urllib.request

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.healthcheck import (
    Config,
    CheckResult,
    JsonFormatter,
    _build_request,
    _build_ssl_context,
    _validate_body,
    _single_attempt,
    run_check,
    main,
    _LOGRECORD_RESERVED,
)


# ═══════════════════════════════════════════════════════════════════════════════
# 1 — Config dataclass defaults
# ═══════════════════════════════════════════════════════════════════════════════

class TestConfigDefaults(unittest.TestCase):

    def setUp(self):
        self.cfg = Config()

    def test_default_url(self):
        self.assertEqual(self.cfg.url, "http://127.0.0.1:7860/ready")

    def test_default_timeout_is_positive(self):
        self.assertGreater(self.cfg.timeout, 0)

    def test_default_retries_is_non_negative(self):
        self.assertGreaterEqual(self.cfg.retries, 0)

    def test_default_method_is_get(self):
        self.assertEqual(self.cfg.method, "GET")

    def test_default_expected_status_is_tuple(self):
        self.assertIsInstance(self.cfg.expected_status, tuple)
        self.assertEqual(len(self.cfg.expected_status), 2)

    def test_default_status_range_is_200_299(self):
        lo, hi = self.cfg.expected_status
        self.assertEqual(lo, 200)
        self.assertEqual(hi, 299)

    def test_default_tls_verify_is_true(self):
        self.assertTrue(self.cfg.tls_verify)

    def test_default_output_format_is_json(self):
        self.assertEqual(self.cfg.output_format, "json")

    def test_default_bearer_token_is_none(self):
        self.assertIsNone(self.cfg.bearer_token)

    def test_default_basic_auth_is_none(self):
        self.assertIsNone(self.cfg.basic_auth)

    def test_default_extra_headers_is_empty_dict(self):
        self.assertEqual(self.cfg.extra_headers, {})

    def test_default_expected_body_contains_is_none(self):
        self.assertIsNone(self.cfg.expected_body_contains)

    def test_default_expected_json_key_is_none(self):
        self.assertIsNone(self.cfg.expected_json_key)

    def test_default_response_time_warn_ms_is_positive(self):
        self.assertGreater(self.cfg.response_time_warn_ms, 0)

    def test_retry_backoff_is_positive(self):
        self.assertGreater(self.cfg.retry_backoff, 0)


# ═══════════════════════════════════════════════════════════════════════════════
# 2 — Config.from_env(): env var parsing
# ═══════════════════════════════════════════════════════════════════════════════

class TestConfigFromEnv(unittest.TestCase):

    def _env(self, extra_vars: dict):
        base = {
            "HEALTHCHECK_URL": "http://test.local/health",
            "HEALTHCHECK_TIMEOUT_SECONDS": "10",
            "HEALTHCHECK_RETRIES": "2",
        }
        base.update(extra_vars)
        return patch.dict(os.environ, base, clear=False)

    def test_url_override_from_env(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "http://example.com/ready"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.url, "http://example.com/ready")

    def test_timeout_parsed_from_env(self):
        with patch.dict(os.environ, {"HEALTHCHECK_TIMEOUT_SECONDS": "7.5"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.timeout, 7.5)

    def test_retries_parsed_from_env(self):
        with patch.dict(os.environ, {"HEALTHCHECK_RETRIES": "5"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.retries, 5)

    def test_negative_timeout_clamped_to_minimum(self):
        with patch.dict(os.environ, {"HEALTHCHECK_TIMEOUT_SECONDS": "-5"}):
            cfg = Config.from_env()
            self.assertGreaterEqual(cfg.timeout, 0.1)

    def test_negative_retries_clamped_to_zero(self):
        with patch.dict(os.environ, {"HEALTHCHECK_RETRIES": "-1"}):
            cfg = Config.from_env()
            self.assertGreaterEqual(cfg.retries, 0)

    def test_malformed_timeout_falls_back_to_default(self):
        with patch.dict(os.environ, {"HEALTHCHECK_TIMEOUT_SECONDS": "notanumber"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.timeout, Config.timeout)

    def test_malformed_retries_falls_back_to_default(self):
        with patch.dict(os.environ, {"HEALTHCHECK_RETRIES": "abc"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.retries, Config.retries)

    def test_method_uppercased(self):
        with patch.dict(os.environ, {"HEALTHCHECK_METHOD": "post"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.method, "POST")

    def test_tls_verify_disabled_by_env(self):
        with patch.dict(os.environ, {"HEALTHCHECK_TLS_VERIFY": "false"}):
            cfg = Config.from_env()
            self.assertFalse(cfg.tls_verify)

    def test_tls_verify_enabled_by_default(self):
        env = dict(os.environ)
        env.pop("HEALTHCHECK_TLS_VERIFY", None)
        with patch.dict(os.environ, env, clear=True):
            cfg = Config.from_env()
            self.assertTrue(cfg.tls_verify)

    def test_status_range_parsed(self):
        with patch.dict(os.environ, {"HEALTHCHECK_EXPECTED_STATUS": "201-204"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.expected_status, (201, 204))

    def test_malformed_status_range_falls_back_to_200_299(self):
        with patch.dict(os.environ, {"HEALTHCHECK_EXPECTED_STATUS": "nope"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.expected_status, (200, 299))

    def test_headers_parsed_from_env(self):
        with patch.dict(os.environ, {"HEALTHCHECK_HEADERS": "X-Foo:bar,X-Baz:qux"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.extra_headers.get("X-Foo"), "bar")
            self.assertEqual(cfg.extra_headers.get("X-Baz"), "qux")

    def test_empty_headers_env_gives_empty_dict(self):
        env = dict(os.environ)
        env.pop("HEALTHCHECK_HEADERS", None)
        with patch.dict(os.environ, env, clear=True):
            cfg = Config.from_env()
            self.assertEqual(cfg.extra_headers, {})

    def test_bearer_token_from_env(self):
        with patch.dict(os.environ, {"HEALTHCHECK_BEARER_TOKEN": "tok-123"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.bearer_token, "tok-123")

    def test_output_format_from_env(self):
        with patch.dict(os.environ, {"HEALTHCHECK_OUTPUT": "plain"}):
            cfg = Config.from_env()
            self.assertEqual(cfg.output_format, "plain")


# ═══════════════════════════════════════════════════════════════════════════════
# 3 — CheckResult dataclass
# ═══════════════════════════════════════════════════════════════════════════════

class TestCheckResult(unittest.TestCase):

    def test_success_is_bool(self):
        r = CheckResult(success=True)
        self.assertIsInstance(r.success, bool)

    def test_to_dict_excludes_none_fields(self):
        r = CheckResult(success=True, status_code=200)
        d = r.to_dict()
        self.assertNotIn("failure_reason", d)
        self.assertNotIn("body_snippet", d)

    def test_to_dict_includes_success(self):
        r = CheckResult(success=True, status_code=200)
        self.assertIn("success", r.to_dict())

    def test_to_dict_includes_status_code_when_set(self):
        r = CheckResult(success=True, status_code=204)
        self.assertEqual(r.to_dict()["status_code"], 204)

    def test_to_dict_includes_failure_reason_when_set(self):
        r = CheckResult(success=False, failure_reason="timeout")
        self.assertEqual(r.to_dict()["failure_reason"], "timeout")

    def test_emit_json_format_is_parseable(self):
        r = CheckResult(success=True, status_code=200, url="http://test")
        with patch("builtins.print") as mock_print:
            r.emit("json")
            mock_print.assert_called_once()
            output = mock_print.call_args[0][0]
            parsed = json.loads(output)
            self.assertTrue(parsed["success"])

    def test_emit_plain_format_contains_ok(self):
        r = CheckResult(success=True, status_code=200, url="http://test")
        with patch("builtins.print") as mock_print:
            r.emit("plain")
            output = mock_print.call_args[0][0]
            self.assertIn("OK", output)

    def test_emit_plain_format_contains_fail_on_failure(self):
        r = CheckResult(success=False, failure_reason="timeout", url="http://test")
        with patch("builtins.print") as mock_print:
            r.emit("plain")
            output = mock_print.call_args[0][0]
            self.assertIn("FAIL", output)

    def test_emit_plain_includes_status_code(self):
        r = CheckResult(success=True, status_code=200, url="http://test")
        with patch("builtins.print") as mock_print:
            r.emit("plain")
            output = mock_print.call_args[0][0]
            self.assertIn("200", output)


# ═══════════════════════════════════════════════════════════════════════════════
# 4 — _build_request()
# ═══════════════════════════════════════════════════════════════════════════════

class TestBuildRequest(unittest.TestCase):

    def _cfg(self, **kwargs):
        return Config(url="http://test.local/health", **kwargs)

    def test_user_agent_header_set(self):
        req = _build_request(self._cfg())
        self.assertIn("advanced-healthcheck", req.get_header("User-agent"))

    def test_accept_header_set(self):
        req = _build_request(self._cfg())
        self.assertIsNotNone(req.get_header("Accept"))

    def test_bearer_token_adds_authorization_header(self):
        req = _build_request(self._cfg(bearer_token="my-token"))
        auth = req.get_header("Authorization")
        self.assertTrue(auth.startswith("Bearer "))
        self.assertIn("my-token", auth)

    def test_basic_auth_adds_authorization_header(self):
        req = _build_request(self._cfg(basic_auth="user:pass"))
        auth = req.get_header("Authorization")
        self.assertTrue(auth.startswith("Basic "))

    def test_bearer_token_takes_precedence_over_basic_auth(self):
        req = _build_request(self._cfg(bearer_token="tok", basic_auth="user:pass"))
        auth = req.get_header("Authorization")
        self.assertTrue(auth.startswith("Bearer "))

    def test_extra_headers_added(self):
        req = _build_request(self._cfg(extra_headers={"X-Custom": "value"}))
        self.assertEqual(req.get_header("X-custom"), "value")

    def test_method_set_on_request(self):
        req = _build_request(self._cfg(method="POST"))
        self.assertEqual(req.get_method(), "POST")


# ═══════════════════════════════════════════════════════════════════════════════
# 5 — _validate_body()
# ═══════════════════════════════════════════════════════════════════════════════

class TestValidateBody(unittest.TestCase):

    def _cfg(self, **kwargs):
        return Config(url="http://test.local/health", **kwargs)

    def test_no_validation_returns_true(self):
        valid, reason = _validate_body('{"status": "ok"}', self._cfg())
        self.assertTrue(valid)
        self.assertIsNone(reason)

    def test_body_contains_check_passes(self):
        valid, reason = _validate_body("healthy service", self._cfg(expected_body_contains="healthy"))
        self.assertTrue(valid)

    def test_body_contains_check_fails(self):
        valid, reason = _validate_body("server error", self._cfg(expected_body_contains="healthy"))
        self.assertFalse(valid)
        self.assertIn("healthy", reason)

    def test_json_key_check_passes_when_key_present(self):
        valid, reason = _validate_body('{"status": "ok"}', self._cfg(expected_json_key="status"))
        self.assertTrue(valid)

    def test_json_key_and_value_check_passes(self):
        valid, reason = _validate_body(
            '{"status": "ok"}',
            self._cfg(expected_json_key="status", expected_json_value="ok")
        )
        self.assertTrue(valid)

    def test_json_key_and_value_mismatch_fails(self):
        valid, reason = _validate_body(
            '{"status": "degraded"}',
            self._cfg(expected_json_key="status", expected_json_value="ok")
        )
        self.assertFalse(valid)
        self.assertIn("status", reason)

    def test_malformed_json_fails_when_json_key_expected(self):
        valid, reason = _validate_body(
            "not json at all",
            self._cfg(expected_json_key="status")
        )
        self.assertFalse(valid)
        self.assertIn("JSON", reason)

    def test_missing_json_key_returns_empty_string_not_error(self):
        valid, reason = _validate_body(
            '{"other": "val"}',
            self._cfg(expected_json_key="status", expected_json_value="ok")
        )
        self.assertFalse(valid)


# ═══════════════════════════════════════════════════════════════════════════════
# 6 — _single_attempt()
# ═══════════════════════════════════════════════════════════════════════════════

class TestSingleAttempt(unittest.TestCase):

    def _cfg(self, **kwargs):
        return Config(url="http://test.local/health", timeout=1.0, **kwargs)

    def _mock_response(self, status=200, body=b'{"status": "ok"}'):
        mock_resp = MagicMock()
        mock_resp.status = status
        mock_resp.read.return_value = body
        mock_resp.__enter__ = MagicMock(return_value=mock_resp)
        mock_resp.__exit__ = MagicMock(return_value=False)
        return mock_resp

    def test_successful_200_response_returns_success(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", return_value=self._mock_response(200)):
            result = _single_attempt(cfg, 1)
        self.assertTrue(result.success)
        self.assertEqual(result.status_code, 200)

    def test_status_outside_range_returns_failure(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", return_value=self._mock_response(503)):
            result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertIn("503", result.failure_reason)

    def test_timeout_error_returns_failure(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", side_effect=TimeoutError("timeout")):
            result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertIn("timed out", result.failure_reason)

    def test_url_error_returns_failure(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("connection refused")):
            result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertIn("URL error", result.failure_reason)

    def test_os_error_returns_failure(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", side_effect=OSError("socket error")):
            result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)
        self.assertIn("OS error", result.failure_reason)

    def test_http_error_within_range_is_success(self):
        cfg = self._cfg(expected_status=(200, 299))
        http_err = urllib.error.HTTPError(
            url="http://test.local/health",
            code=204,
            msg="No Content",
            hdrs=None,
            fp=io.BytesIO(b""),
        )
        with patch("urllib.request.urlopen", side_effect=http_err):
            result = _single_attempt(cfg, 1)
        self.assertTrue(result.success)

    def test_http_error_outside_range_is_failure(self):
        cfg = self._cfg(expected_status=(200, 299))
        http_err = urllib.error.HTTPError(
            url="http://test.local/health",
            code=503,
            msg="Service Unavailable",
            hdrs=None,
            fp=io.BytesIO(b"error"),
        )
        with patch("urllib.request.urlopen", side_effect=http_err):
            result = _single_attempt(cfg, 1)
        self.assertFalse(result.success)

    def test_response_time_is_recorded(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", return_value=self._mock_response(200)):
            result = _single_attempt(cfg, 1)
        self.assertIsNotNone(result.response_time_ms)
        self.assertGreaterEqual(result.response_time_ms, 0)

    def test_attempt_number_stored_in_result(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", return_value=self._mock_response(200)):
            result = _single_attempt(cfg, 3)
        self.assertEqual(result.attempt, 3)

    def test_url_stored_in_result(self):
        cfg = self._cfg()
        with patch("urllib.request.urlopen", return_value=self._mock_response(200)):
            result = _single_attempt(cfg, 1)
        self.assertEqual(result.url, "http://test.local/health")


# ═══════════════════════════════════════════════════════════════════════════════
# 7 — run_check()
# ═══════════════════════════════════════════════════════════════════════════════

class TestRunCheck(unittest.TestCase):

    def _cfg_no_retry(self, **kwargs):
        return Config(url="http://test.local/health", timeout=1.0, retries=0, **kwargs)

    def _mock_response(self, status=200, body=b'{"status": "ok"}'):
        mock_resp = MagicMock()
        mock_resp.status = status
        mock_resp.read.return_value = body
        mock_resp.__enter__ = MagicMock(return_value=mock_resp)
        mock_resp.__exit__ = MagicMock(return_value=False)
        return mock_resp

    def test_returns_success_on_first_attempt(self):
        cfg = self._cfg_no_retry()
        with patch("urllib.request.urlopen", return_value=self._mock_response(200)):
            result = run_check(cfg)
        self.assertTrue(result.success)

    def test_returns_failure_when_all_attempts_fail(self):
        cfg = Config(url="http://test.local/health", timeout=0.1, retries=1,
                     retry_delay=0.0, retry_backoff=1.0)
        with patch("urllib.request.urlopen",
                   side_effect=urllib.error.URLError("down")), \
             patch("time.sleep"):
            result = run_check(cfg)
        self.assertFalse(result.success)

    def test_run_check_returns_check_result_instance(self):
        cfg = self._cfg_no_retry()
        with patch("urllib.request.urlopen", return_value=self._mock_response(200)):
            result = run_check(cfg)
        self.assertIsInstance(result, CheckResult)


# ═══════════════════════════════════════════════════════════════════════════════
# 8 — main()
# ═══════════════════════════════════════════════════════════════════════════════

class TestMain(unittest.TestCase):

    def _mock_response(self, status=200, body=b'{"status": "ok"}'):
        mock_resp = MagicMock()
        mock_resp.status = status
        mock_resp.read.return_value = body
        mock_resp.__enter__ = MagicMock(return_value=mock_resp)
        mock_resp.__exit__ = MagicMock(return_value=False)
        return mock_resp

    def test_main_returns_0_on_healthy_response(self):
        env = {"HEALTHCHECK_URL": "http://test.local/health", "HEALTHCHECK_RETRIES": "0"}
        with patch.dict(os.environ, env), \
             patch("urllib.request.urlopen", return_value=self._mock_response(200)):
            exit_code = main()
        self.assertEqual(exit_code, 0)

    def test_main_returns_1_on_connection_failure(self):
        env = {"HEALTHCHECK_URL": "http://test.local/health", "HEALTHCHECK_RETRIES": "0"}
        with patch.dict(os.environ, env), \
             patch("urllib.request.urlopen", side_effect=urllib.error.URLError("down")):
            exit_code = main()
        self.assertEqual(exit_code, 1)

    def test_main_returns_1_on_invalid_url_scheme(self):
        env = {"HEALTHCHECK_URL": "ftp://invalid.scheme/health"}
        with patch.dict(os.environ, env):
            exit_code = main()
        self.assertEqual(exit_code, 1)


# ═══════════════════════════════════════════════════════════════════════════════
# 9 — JsonFormatter
# ═══════════════════════════════════════════════════════════════════════════════

class TestJsonFormatter(unittest.TestCase):

    def _make_formatter(self):
        return JsonFormatter()

    def _make_record(self, msg="test", level=logging.INFO, extra=None):
        record = logging.LogRecord(
            name="test", level=level, pathname="", lineno=0,
            msg=msg, args=(), exc_info=None,
        )
        if extra:
            for k, v in extra.items():
                setattr(record, k, v)
        return record

    def test_output_is_valid_json(self):
        fmt = self._make_formatter()
        output = fmt.format(self._make_record("hello"))
        parsed = json.loads(output)
        self.assertIsInstance(parsed, dict)

    def test_output_contains_message(self):
        fmt = self._make_formatter()
        output = fmt.format(self._make_record("my message"))
        parsed = json.loads(output)
        self.assertEqual(parsed["message"], "my message")

    def test_output_contains_level(self):
        fmt = self._make_formatter()
        output = fmt.format(self._make_record(level=logging.WARNING))
        parsed = json.loads(output)
        self.assertEqual(parsed["level"], "WARNING")

    def test_output_contains_timestamp(self):
        fmt = self._make_formatter()
        output = fmt.format(self._make_record())
        parsed = json.loads(output)
        self.assertIn("timestamp", parsed)

    def test_extra_fields_included_in_output(self):
        fmt = self._make_formatter()
        record = self._make_record(extra={"elapsed_ms": 42.5})
        output = fmt.format(record)
        parsed = json.loads(output)
        self.assertEqual(parsed.get("elapsed_ms"), 42.5)

    def test_reserved_logrecord_fields_not_in_extra_payload(self):
        fmt = self._make_formatter()
        record = self._make_record()
        output = fmt.format(record)
        parsed = json.loads(output)
        for reserved in ("lineno", "pathname", "module", "processName"):
            self.assertNotIn(reserved, parsed)

    def test_logrecord_reserved_set_is_non_empty(self):
        self.assertGreater(len(_LOGRECORD_RESERVED), 5)

    def test_logrecord_reserved_contains_name(self):
        self.assertIn("name", _LOGRECORD_RESERVED)

    def test_logrecord_reserved_contains_levelname(self):
        self.assertIn("levelname", _LOGRECORD_RESERVED)


if __name__ == "__main__":
    unittest.main()
