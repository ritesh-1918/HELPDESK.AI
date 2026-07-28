"""
Test suite for backend/healthcheck.py (Issue #1143 - v2).

Covers:
- Config defaults more exhaustively
- _build_ssl_context() for HTTP vs HTTPS
- run_check() with retry backoff
- emit() JSON structure validation
- LOGRECORD_RESERVED set completeness
"""

import json
import logging
import os
import sys
import ssl
import io
import time
import unittest
from dataclasses import dataclass, field
from typing import Optional
from unittest.mock import MagicMock, patch, call

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.healthcheck import (
    Config,
    CheckResult,
    JsonFormatter,
    _build_ssl_context,
    _build_request,
    _validate_body,
    run_check,
    _LOGRECORD_RESERVED,
)


# ---------------------------------------------------------------------------
# Config defaults tests
# ---------------------------------------------------------------------------

class TestConfigDefaults:
    def test_default_url(self):
        cfg = Config()
        assert cfg.url == "http://127.0.0.1:7860/ready"

    def test_default_timeout(self):
        cfg = Config()
        assert cfg.timeout == 3.0

    def test_default_retries(self):
        cfg = Config()
        assert cfg.retries == 3

    def test_default_retry_delay(self):
        cfg = Config()
        assert cfg.retry_delay == 1.0

    def test_default_retry_backoff(self):
        cfg = Config()
        assert cfg.retry_backoff == 2.0

    def test_default_method(self):
        cfg = Config()
        assert cfg.method == "GET"

    def test_default_expected_status(self):
        cfg = Config()
        assert cfg.expected_status == (200, 299)

    def test_default_tls_verify(self):
        cfg = Config()
        assert cfg.tls_verify is True

    def test_default_response_time_warn_ms(self):
        cfg = Config()
        assert cfg.response_time_warn_ms == 1000.0

    def test_default_output_format(self):
        cfg = Config()
        assert cfg.output_format == "json"

    def test_default_extra_headers_is_empty_dict(self):
        cfg = Config()
        assert cfg.extra_headers == {}

    def test_default_bearer_token_is_none(self):
        cfg = Config()
        assert cfg.bearer_token is None

    def test_default_basic_auth_is_none(self):
        cfg = Config()
        assert cfg.basic_auth is None

    def test_default_expected_body_contains_is_none(self):
        cfg = Config()
        assert cfg.expected_body_contains is None

    def test_default_tls_ca_bundle_is_none(self):
        cfg = Config()
        assert cfg.tls_ca_bundle is None

    def test_from_env_overrides_url(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "http://example.com/health"}):
            cfg = Config.from_env()
        assert cfg.url == "http://example.com/health"

    def test_from_env_clamps_negative_retries(self):
        with patch.dict(os.environ, {"HEALTHCHECK_RETRIES": "-5"}):
            cfg = Config.from_env()
        assert cfg.retries == 0

    def test_from_env_clamps_negative_timeout(self):
        with patch.dict(os.environ, {"HEALTHCHECK_TIMEOUT_SECONDS": "-1.0"}):
            cfg = Config.from_env()
        assert cfg.timeout >= 0.1

    def test_from_env_parses_status_range(self):
        with patch.dict(os.environ, {"HEALTHCHECK_EXPECTED_STATUS": "200-204"}):
            cfg = Config.from_env()
        assert cfg.expected_status == (200, 204)

    def test_from_env_invalid_status_range_falls_back(self):
        with patch.dict(os.environ, {"HEALTHCHECK_EXPECTED_STATUS": "bad-value"}):
            cfg = Config.from_env()
        assert cfg.expected_status == (200, 299)

    def test_from_env_parses_extra_headers(self):
        with patch.dict(os.environ, {"HEALTHCHECK_HEADERS": "X-Foo:bar,X-Baz:qux"}):
            cfg = Config.from_env()
        assert cfg.extra_headers.get("X-Foo") == "bar"
        assert cfg.extra_headers.get("X-Baz") == "qux"

    def test_from_env_bearer_token(self):
        with patch.dict(os.environ, {"HEALTHCHECK_BEARER_TOKEN": "my-token"}):
            cfg = Config.from_env()
        assert cfg.bearer_token == "my-token"

    def test_from_env_basic_auth(self):
        with patch.dict(os.environ, {"HEALTHCHECK_BASIC_AUTH": "user:pass"}):
            cfg = Config.from_env()
        assert cfg.basic_auth == "user:pass"


# ---------------------------------------------------------------------------
# _build_ssl_context() tests
# ---------------------------------------------------------------------------

class TestBuildSslContext:
    def test_returns_none_for_http(self):
        cfg = Config(url="http://example.com/health")
        ctx = _build_ssl_context(cfg)
        assert ctx is None

    def test_returns_ssl_context_for_https(self):
        cfg = Config(url="https://example.com/health")
        ctx = _build_ssl_context(cfg)
        assert ctx is not None
        assert isinstance(ctx, ssl.SSLContext)

    def test_tls_verify_false_disables_hostname_check(self):
        cfg = Config(url="https://example.com/health", tls_verify=False)
        ctx = _build_ssl_context(cfg)
        assert ctx is not None
        assert ctx.check_hostname is False
        assert ctx.verify_mode == ssl.CERT_NONE

    def test_tls_verify_true_default_context(self):
        cfg = Config(url="https://example.com/health", tls_verify=True)
        ctx = _build_ssl_context(cfg)
        assert ctx is not None
        # Default should have verification enabled
        assert ctx.verify_mode != ssl.CERT_NONE

    def test_http_url_returns_none_regardless_of_tls_verify(self):
        cfg = Config(url="http://example.com/health", tls_verify=False)
        ctx = _build_ssl_context(cfg)
        assert ctx is None


# ---------------------------------------------------------------------------
# CheckResult.emit() JSON structure tests
# ---------------------------------------------------------------------------

class TestCheckResultEmit:
    def _capture_emit(self, result: "CheckResult", fmt: str) -> str:
        import io
        from contextlib import redirect_stdout
        buf = io.StringIO()
        with redirect_stdout(buf):
            result.emit(fmt)
        return buf.getvalue().strip()

    def test_emit_json_contains_success_key(self):
        result = CheckResult(success=True, url="http://example.com", attempt=1, total_attempts=1)
        output = self._capture_emit(result, "json")
        data = json.loads(output)
        assert "success" in data

    def test_emit_json_contains_url(self):
        result = CheckResult(success=True, url="http://example.com", attempt=1, total_attempts=1)
        output = self._capture_emit(result, "json")
        data = json.loads(output)
        assert data["url"] == "http://example.com"

    def test_emit_json_success_true(self):
        result = CheckResult(success=True, url="http://test.com", attempt=1, total_attempts=1, status_code=200)
        output = self._capture_emit(result, "json")
        data = json.loads(output)
        assert data["success"] is True

    def test_emit_json_includes_status_code(self):
        result = CheckResult(success=True, url="http://test.com", attempt=1, total_attempts=1, status_code=200)
        output = self._capture_emit(result, "json")
        data = json.loads(output)
        assert data["status_code"] == 200

    def test_emit_json_omits_none_fields(self):
        result = CheckResult(success=False, url="http://test.com", attempt=1, total_attempts=1)
        output = self._capture_emit(result, "json")
        data = json.loads(output)
        # None fields should be omitted per to_dict implementation
        assert "status_code" not in data

    def test_emit_text_ok_prefix(self):
        result = CheckResult(success=True, url="http://test.com", attempt=1, total_attempts=1)
        output = self._capture_emit(result, "text")
        assert "[OK]" in output

    def test_emit_text_fail_prefix(self):
        result = CheckResult(success=False, url="http://test.com", attempt=1, total_attempts=1)
        output = self._capture_emit(result, "text")
        assert "[FAIL]" in output

    def test_emit_json_is_valid_json(self):
        result = CheckResult(success=True, url="http://test.com", attempt=1, total_attempts=1, status_code=200, response_time_ms=45.3)
        output = self._capture_emit(result, "json")
        # Should not raise
        data = json.loads(output)
        assert isinstance(data, dict)

    def test_emit_json_includes_attempt(self):
        result = CheckResult(success=False, url="http://test.com", attempt=2, total_attempts=3)
        output = self._capture_emit(result, "json")
        data = json.loads(output)
        assert data["attempt"] == 2

    def test_emit_json_failure_reason(self):
        result = CheckResult(success=False, url="http://test.com", attempt=1, total_attempts=1,
                             failure_reason="timeout")
        output = self._capture_emit(result, "json")
        data = json.loads(output)
        assert data["failure_reason"] == "timeout"


# ---------------------------------------------------------------------------
# _validate_body() tests
# ---------------------------------------------------------------------------

class TestValidateBody:
    def test_empty_config_always_valid(self):
        cfg = Config()
        valid, reason = _validate_body('{"status":"ok"}', cfg)
        assert valid is True
        assert reason is None

    def test_body_contains_pass(self):
        cfg = Config(expected_body_contains="healthy")
        valid, reason = _validate_body('{"status":"healthy"}', cfg)
        assert valid is True

    def test_body_contains_fail(self):
        cfg = Config(expected_body_contains="healthy")
        valid, reason = _validate_body('{"status":"degraded"}', cfg)
        assert valid is False
        assert "healthy" in reason

    def test_json_key_present_and_matching(self):
        cfg = Config(expected_json_key="status", expected_json_value="ok")
        valid, reason = _validate_body('{"status":"ok"}', cfg)
        assert valid is True

    def test_json_key_value_mismatch(self):
        cfg = Config(expected_json_key="status", expected_json_value="ok")
        valid, reason = _validate_body('{"status":"fail"}', cfg)
        assert valid is False

    def test_json_invalid_returns_false(self):
        cfg = Config(expected_json_key="status")
        valid, reason = _validate_body("not-json", cfg)
        assert valid is False


# ---------------------------------------------------------------------------
# run_check() with retry backoff tests
# ---------------------------------------------------------------------------

class TestRunCheck:
    def test_run_check_returns_check_result(self):
        cfg = Config(url="http://example.com/health", retries=0)
        with patch("backend.healthcheck._single_attempt") as mock_attempt:
            mock_attempt.return_value = CheckResult(
                success=True, url=cfg.url, attempt=1, total_attempts=1, status_code=200
            )
            result = run_check(cfg)
        assert isinstance(result, CheckResult)

    def test_run_check_stops_on_success(self):
        cfg = Config(url="http://example.com/health", retries=3)
        with patch("backend.healthcheck._single_attempt") as mock_attempt:
            mock_attempt.return_value = CheckResult(
                success=True, url=cfg.url, attempt=1, total_attempts=1
            )
            run_check(cfg)
        assert mock_attempt.call_count == 1

    def test_run_check_retries_on_failure(self):
        cfg = Config(url="http://example.com/health", retries=2, retry_delay=0)
        call_count = {"n": 0}

        def attempt_side_effect(c, attempt):
            call_count["n"] += 1
            return CheckResult(success=False, url=c.url, attempt=attempt, total_attempts=3, failure_reason="error")

        with patch("backend.healthcheck._single_attempt", side_effect=attempt_side_effect):
            with patch("time.sleep"):
                result = run_check(cfg)

        assert call_count["n"] == 3
        assert result.success is False

    def test_run_check_retry_backoff_called(self):
        cfg = Config(url="http://example.com/health", retries=2, retry_delay=1.0, retry_backoff=2.0)
        sleep_calls = []

        def attempt_fn(c, attempt):
            return CheckResult(success=False, url=c.url, attempt=attempt, total_attempts=3, failure_reason="err")

        with patch("backend.healthcheck._single_attempt", side_effect=attempt_fn):
            with patch("time.sleep", side_effect=lambda s: sleep_calls.append(s)):
                run_check(cfg)

        # Backoff: first sleep=1.0, second sleep=2.0
        assert len(sleep_calls) == 2
        assert sleep_calls[0] == 1.0
        assert sleep_calls[1] == 2.0

    def test_run_check_succeeds_on_second_attempt(self):
        cfg = Config(url="http://example.com/health", retries=3, retry_delay=0)
        call_count = {"n": 0}

        def attempt_fn(c, attempt):
            call_count["n"] += 1
            return CheckResult(
                success=(attempt == 2), url=c.url, attempt=attempt, total_attempts=4,
                failure_reason=None if attempt == 2 else "error"
            )

        with patch("backend.healthcheck._single_attempt", side_effect=attempt_fn):
            with patch("time.sleep"):
                result = run_check(cfg)

        assert result.success is True
        assert call_count["n"] == 2


# ---------------------------------------------------------------------------
# _LOGRECORD_RESERVED tests
# ---------------------------------------------------------------------------

class TestLogRecordReserved:
    def test_is_frozenset(self):
        assert isinstance(_LOGRECORD_RESERVED, frozenset)

    def test_contains_name(self):
        assert "name" in _LOGRECORD_RESERVED

    def test_contains_msg(self):
        assert "msg" in _LOGRECORD_RESERVED

    def test_contains_levelname(self):
        assert "levelname" in _LOGRECORD_RESERVED

    def test_contains_levelno(self):
        assert "levelno" in _LOGRECORD_RESERVED

    def test_contains_pathname(self):
        assert "pathname" in _LOGRECORD_RESERVED

    def test_contains_filename(self):
        assert "filename" in _LOGRECORD_RESERVED

    def test_contains_lineno(self):
        assert "lineno" in _LOGRECORD_RESERVED

    def test_contains_created(self):
        assert "created" in _LOGRECORD_RESERVED

    def test_contains_thread(self):
        assert "thread" in _LOGRECORD_RESERVED

    def test_contains_process(self):
        assert "process" in _LOGRECORD_RESERVED

    def test_contains_message(self):
        assert "message" in _LOGRECORD_RESERVED

    def test_does_not_contain_custom_fields(self):
        assert "my_custom_field" not in _LOGRECORD_RESERVED

    def test_minimum_size(self):
        assert len(_LOGRECORD_RESERVED) >= 10


# ---------------------------------------------------------------------------
# JsonFormatter tests
# ---------------------------------------------------------------------------

class TestJsonFormatter:
    def _make_record(self, msg="test message", level=logging.INFO, extra=None):
        record = logging.LogRecord(
            name="test", level=level, pathname="test.py",
            lineno=1, msg=msg, args=(), exc_info=None
        )
        if extra:
            for k, v in extra.items():
                setattr(record, k, v)
        return record

    def test_output_is_valid_json(self):
        formatter = JsonFormatter()
        record = self._make_record("hello world")
        output = formatter.format(record)
        data = json.loads(output)
        assert isinstance(data, dict)

    def test_output_contains_message(self):
        formatter = JsonFormatter()
        record = self._make_record("my test message")
        output = formatter.format(record)
        data = json.loads(output)
        assert data["message"] == "my test message"

    def test_output_contains_level(self):
        formatter = JsonFormatter()
        record = self._make_record("msg", level=logging.WARNING)
        output = formatter.format(record)
        data = json.loads(output)
        assert data["level"] == "WARNING"

    def test_output_contains_timestamp(self):
        formatter = JsonFormatter()
        record = self._make_record()
        output = formatter.format(record)
        data = json.loads(output)
        assert "timestamp" in data

    def test_extra_fields_included(self):
        formatter = JsonFormatter()
        record = self._make_record(extra={"request_id": "abc123"})
        output = formatter.format(record)
        data = json.loads(output)
        assert data.get("request_id") == "abc123"

    def test_reserved_fields_not_leaked(self):
        formatter = JsonFormatter()
        record = self._make_record()
        output = formatter.format(record)
        data = json.loads(output)
        # pathname, module, etc. should not appear as top-level payload
        assert "pathname" not in data
        assert "module" not in data
