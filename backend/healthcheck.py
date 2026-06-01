#!/usr/bin/env python3
"""
Advanced Health Check Utility
Supports HTTP/HTTPS with retries, auth, custom headers, TLS verification,
JSON validation, response time tracking, and structured logging.
"""

import json
import logging
import os
import ssl
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urlparse


# ─── Structured Logging ───────────────────────────────────────────────────────

# FIX 1: Standard LogRecord attributes to exclude from structured payload.
# Previously the formatter looked for record.extra (a custom attribute that
# never exists on LogRecord), so extra keys passed via logger.info(..., extra={})
# were silently dropped. Now we iterate record.__dict__ and collect every key
# that is not a standard LogRecord field into the payload.
_LOGRECORD_RESERVED = frozenset({
    "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
    "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
    "created", "msecs", "relativeCreated", "thread", "threadName",
    "processName", "process", "message", "taskName",
})


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        # Ensure record.message is populated for the reserved-key check above.
        record.message = record.getMessage()
        payload = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.message,
        }
        # Merge any extra structured fields injected via logger(..., extra={...}).
        for key, value in record.__dict__.items():
            if key in _LOGRECORD_RESERVED:
                continue
            try:
                json.dumps(value)          # probe serializability
                payload[key] = value
            except (TypeError, ValueError):
                payload[key] = str(value)  # fall back to string for non-JSON types

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def _build_logger() -> logging.Logger:
    handler = logging.StreamHandler(sys.stderr)
    fmt = os.environ.get("HEALTHCHECK_LOG_FORMAT", "json").lower()
    handler.setFormatter(
        JsonFormatter() if fmt == "json" else logging.Formatter(
            "%(asctime)s [%(levelname)s] %(message)s"
        )
    )
    logger = logging.getLogger("healthcheck")
    logger.addHandler(handler)
    logger.setLevel(
        logging.DEBUG if os.environ.get("HEALTHCHECK_DEBUG") else logging.INFO
    )
    return logger


log = _build_logger()


# ─── Configuration ────────────────────────────────────────────────────────────

@dataclass
class Config:
    url: str = "http://127.0.0.1:7860/ready"
    timeout: float = 3.0
    retries: int = 3
    retry_delay: float = 1.0
    retry_backoff: float = 2.0
    method: str = "GET"
    expected_status: tuple[int, int] = (200, 299)
    expected_body_contains: Optional[str] = None
    expected_json_key: Optional[str] = None
    expected_json_value: Optional[str] = None
    bearer_token: Optional[str] = None
    basic_auth: Optional[str] = None
    extra_headers: dict[str, str] = field(default_factory=dict)
    tls_verify: bool = True
    tls_ca_bundle: Optional[str] = None
    response_time_warn_ms: float = 1000.0
    output_format: str = "json"

    @classmethod
    def from_env(cls) -> "Config":
        # FIX 2: Clamp numeric env values to safe minimums so negative inputs
        # (e.g. HEALTHCHECK_RETRIES=-1) cannot break the retry loop or cause
        # nonsensical behaviour. Previously any negative value was accepted as-is.
        def _float(key: str, default: float, min_val: float = 0.0) -> float:
            try:
                val = float(os.environ.get(key, default))
                return max(min_val, val)
            except (TypeError, ValueError):
                return default

        def _int(key: str, default: int, min_val: int = 0) -> int:
            try:
                val = int(os.environ.get(key, default))
                return max(min_val, val)
            except (TypeError, ValueError):
                return default

        def _headers(raw: Optional[str]) -> dict[str, str]:
            if not raw:
                return {}
            result: dict[str, str] = {}
            for part in raw.split(","):
                if ":" in part:
                    k, _, v = part.partition(":")
                    result[k.strip()] = v.strip()
            return result

        status_range_raw = os.environ.get("HEALTHCHECK_EXPECTED_STATUS", "200-299")
        try:
            lo, hi = (int(x) for x in status_range_raw.split("-"))
            status_range = (lo, hi)
        except (ValueError, AttributeError):
            status_range = (200, 299)

        return cls(
            url=os.environ.get("HEALTHCHECK_URL", cls.url),
            timeout=_float("HEALTHCHECK_TIMEOUT_SECONDS", cls.timeout, min_val=0.1),
            retries=_int("HEALTHCHECK_RETRIES", cls.retries, min_val=0),
            retry_delay=_float("HEALTHCHECK_RETRY_DELAY", cls.retry_delay, min_val=0.0),
            retry_backoff=_float("HEALTHCHECK_RETRY_BACKOFF", cls.retry_backoff, min_val=0.0),
            method=os.environ.get("HEALTHCHECK_METHOD", cls.method).upper(),
            expected_status=status_range,
            expected_body_contains=os.environ.get("HEALTHCHECK_BODY_CONTAINS"),
            expected_json_key=os.environ.get("HEALTHCHECK_JSON_KEY"),
            expected_json_value=os.environ.get("HEALTHCHECK_JSON_VALUE"),
            bearer_token=os.environ.get("HEALTHCHECK_BEARER_TOKEN"),
            basic_auth=os.environ.get("HEALTHCHECK_BASIC_AUTH"),
            extra_headers=_headers(os.environ.get("HEALTHCHECK_HEADERS")),
            tls_verify=os.environ.get("HEALTHCHECK_TLS_VERIFY", "true").lower() != "false",
            tls_ca_bundle=os.environ.get("HEALTHCHECK_CA_BUNDLE"),
            response_time_warn_ms=_float("HEALTHCHECK_WARN_MS", cls.response_time_warn_ms, min_val=0.0),
            output_format=os.environ.get("HEALTHCHECK_OUTPUT", cls.output_format).lower(),
        )


# ─── Result ───────────────────────────────────────────────────────────────────

@dataclass
class CheckResult:
    success: bool
    status_code: Optional[int] = None
    response_time_ms: Optional[float] = None
    attempt: int = 1
    total_attempts: int = 1
    failure_reason: Optional[str] = None
    body_snippet: Optional[str] = None
    url: str = ""

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items() if v is not None}

    def emit(self, fmt: str) -> None:
        if fmt == "json":
            print(json.dumps(self.to_dict()))
        else:
            status = "OK" if self.success else "FAIL"
            parts = [f"[{status}] {self.url}"]
            if self.status_code:
                parts.append(f"HTTP {self.status_code}")
            if self.response_time_ms is not None:
                parts.append(f"{self.response_time_ms:.1f}ms")
            if self.failure_reason:
                parts.append(f"reason={self.failure_reason}")
            print(" | ".join(parts))


# ─── Core Check ───────────────────────────────────────────────────────────────

def _build_request(cfg: Config) -> urllib.request.Request:
    req = urllib.request.Request(cfg.url, method=cfg.method)
    req.add_header("User-Agent", "advanced-healthcheck/2.0")
    req.add_header("Accept", "application/json, text/plain, */*")

    if cfg.bearer_token:
        req.add_header("Authorization", f"Bearer {cfg.bearer_token}")
    elif cfg.basic_auth:
        import base64
        encoded = base64.b64encode(cfg.basic_auth.encode()).decode()
        req.add_header("Authorization", f"Basic {encoded}")

    for key, val in cfg.extra_headers.items():
        req.add_header(key, val)

    return req


def _build_ssl_context(cfg: Config) -> Optional[ssl.SSLContext]:
    parsed = urlparse(cfg.url)
    if parsed.scheme != "https":
        return None
    ctx = ssl.create_default_context()
    if not cfg.tls_verify:
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
    elif cfg.tls_ca_bundle:
        ctx.load_verify_locations(cafile=cfg.tls_ca_bundle)
    return ctx


def _validate_body(body: str, cfg: Config) -> tuple[bool, Optional[str]]:
    """Returns (valid, failure_reason)."""
    if cfg.expected_body_contains and cfg.expected_body_contains not in body:
        return False, f"body missing '{cfg.expected_body_contains}'"

    if cfg.expected_json_key:
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            return False, "response is not valid JSON"
        actual = str(data.get(cfg.expected_json_key, ""))
        if cfg.expected_json_value and actual != cfg.expected_json_value:
            return False, (
                f"JSON key '{cfg.expected_json_key}' expected "
                f"'{cfg.expected_json_value}', got '{actual}'"
            )

    return True, None


def _single_attempt(cfg: Config, attempt: int) -> CheckResult:
    result = CheckResult(
        success=False, attempt=attempt,
        total_attempts=cfg.retries + 1, url=cfg.url,
    )
    req = _build_request(cfg)
    ssl_ctx = _build_ssl_context(cfg)

    t0 = time.perf_counter()
    try:
        opener_args = {"context": ssl_ctx} if ssl_ctx else {}
        with urllib.request.urlopen(req, timeout=cfg.timeout, **opener_args) as resp:
            elapsed_ms = (time.perf_counter() - t0) * 1000
            result.status_code = resp.status
            result.response_time_ms = round(elapsed_ms, 2)

            # FIX 4: Read the full response body instead of the first 4096 bytes.
            # Previously resp.read(4096) could truncate large payloads, causing
            # JSON parsing or substring-match failures on valid responses.
            full_body = resp.read().decode(errors="replace")
            result.body_snippet = full_body[:200] if full_body else None

            lo, hi = cfg.expected_status
            if not (lo <= resp.status <= hi):
                result.failure_reason = f"status {resp.status} not in {lo}-{hi}"
                return result

            valid, reason = _validate_body(full_body, cfg)
            if not valid:
                result.failure_reason = reason
                return result

            if elapsed_ms > cfg.response_time_warn_ms:
                log.warning(
                    "Slow response",
                    extra={"elapsed_ms": elapsed_ms,
                           "warn_threshold_ms": cfg.response_time_warn_ms},
                )

            result.success = True
            return result

    # FIX 3: HTTPError now mirrors the success path instead of unconditionally
    # failing. Some servers (e.g. health endpoints returning 204 or custom ranges)
    # return an HTTPError for codes that the caller considers acceptable.
    # We read the body, check expected_status, and run _validate_body before
    # deciding whether the result is a success or failure.
    except urllib.error.HTTPError as exc:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        result.status_code = exc.code
        result.response_time_ms = round(elapsed_ms, 2)
        try:
            full_body = exc.read().decode(errors="replace")
        except Exception:
            full_body = ""
        result.body_snippet = full_body[:200] if full_body else None

        lo, hi = cfg.expected_status
        if lo <= exc.code <= hi:
            valid, reason = _validate_body(full_body, cfg)
            if valid:
                result.success = True
                return result
            result.failure_reason = reason
        else:
            result.failure_reason = f"HTTP error {exc.code}: {exc.reason}"
        return result

    except TimeoutError:
        result.failure_reason = f"timed out after {cfg.timeout}s"
    except urllib.error.URLError as exc:
        result.failure_reason = f"URL error: {exc.reason}"
    except ssl.SSLError as exc:
        result.failure_reason = f"TLS error: {exc}"
    except OSError as exc:
        result.failure_reason = f"OS error: {exc}"

    result.response_time_ms = round((time.perf_counter() - t0) * 1000, 2)
    return result


# ─── Retry Loop ───────────────────────────────────────────────────────────────

def run_check(cfg: Config) -> CheckResult:
    delay = cfg.retry_delay
    last: Optional[CheckResult] = None

    for attempt in range(1, cfg.retries + 2):
        last = _single_attempt(cfg, attempt)
        log.debug(
            "Attempt complete",
            extra={"attempt": attempt, "success": last.success,
                   "status": last.status_code, "ms": last.response_time_ms},
        )
        if last.success:
            break
        if attempt <= cfg.retries:
            log.info(
                "Retrying",
                extra={"attempt": attempt, "delay_s": round(delay, 2),
                       "reason": last.failure_reason},
            )
            time.sleep(delay)
            delay *= cfg.retry_backoff

    assert last is not None
    return last


# ─── Entrypoint ───────────────────────────────────────────────────────────────

def main() -> int:
    cfg = Config.from_env()

    parsed = urlparse(cfg.url)
    if parsed.scheme not in {"http", "https"}:
        log.error("Invalid URL scheme", extra={"url": cfg.url})
        return 1

    result = run_check(cfg)
    result.emit(cfg.output_format)

    if result.success:
        log.info("Health check passed", extra=result.to_dict())
        return 0
    else:
        log.error("Health check failed", extra=result.to_dict())
        return 1


if __name__ == "__main__":
    sys.exit(main())