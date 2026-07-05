"""
Tests for backend/logger.py — configurable log level + structured JSON output.

Covers issue #2944: "Introduce configurable log levels and structured JSON
formatting in the FastAPI backend logger to improve trace reliability."
"""
import io
import json
import logging
import sys
from contextlib import redirect_stderr

import pytest


def _import_fresh():
    """Import logger with clean state so each test re-configures from scratch."""
    for mod in list(sys.modules):
        if mod in ("backend.logger", "backend.config"):
            del sys.modules[mod]
    import structlog
    structlog.reset_defaults()
    # Remove handlers that previous runs attached to the root logger.
    root = logging.getLogger()
    for h in list(root.handlers):
        root.removeHandler(h)
    return __import__("backend.logger", fromlist=["get_logger"])


def _emit(level, event="hello", **kw):
    """
    Re-import logger fresh, attach a capturing handler to the root logger,
    emit one record, and return the list of captured formatted lines.

    backend/logger.py routes records through stdlib logging (structlog's
    LoggerFactory), so we capture at the logging layer rather than sys.stdout.
    """
    log_module = _import_fresh()
    buf = io.StringIO()
    handler = logging.StreamHandler(buf)
    handler.setLevel(logging.DEBUG)
    # structlog's JSONRenderer produces the final JSON string; keep the
    # formatter transparent so we can parse it.
    handler.setFormatter(logging.Formatter("%(message)s"))
    root = logging.getLogger()
    root.addHandler(handler)
    try:
        logger = log_module.get_logger("test")
        getattr(logger, level)(event, **kw)
    finally:
        root.removeHandler(handler)
    return [l for l in buf.getvalue().splitlines() if l.strip()]


def _set_env(monkeypatch, **kw):
    monkeypatch.setenv("SUPABASE_URL", "https://placeholder.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "placeholder_key")
    for k, v in kw.items():
        monkeypatch.setenv(k, v)


# --------------------------------------------------------------------------- #
# 1. Structured JSON output
# --------------------------------------------------------------------------- #
def test_output_is_valid_json(monkeypatch):
    _set_env(monkeypatch)
    lines = _emit("info", key="value")
    assert lines, "expected at least one log line"
    payload = json.loads(lines[-1])
    assert payload["event"] == "hello"
    assert payload["level"] == "info"
    assert payload["key"] == "value"
    assert "timestamp" in payload


def test_output_is_valid_json_on_error(monkeypatch):
    _set_env(monkeypatch)
    lines = _emit("error", event="boom")
    payload = json.loads(lines[-1])
    assert payload["level"] == "error"
    assert payload["event"] == "boom"


# --------------------------------------------------------------------------- #
# 2. Configurable log level (the core ask of #2944)
# --------------------------------------------------------------------------- #
def test_log_level_debug_emits_debug(monkeypatch):
    _set_env(monkeypatch, LOG_LEVEL="DEBUG")
    lines = _emit("debug", event="dbg")
    assert any(json.loads(l)["level"] == "debug" for l in lines), lines


def test_log_level_info_suppresses_debug(monkeypatch):
    _set_env(monkeypatch, LOG_LEVEL="INFO")
    lines = _emit("debug", event="should_not_appear")
    matching = [l for l in lines if '"should_not_appear"' in l]
    assert matching == [], matching


def test_log_level_warning_suppresses_info(monkeypatch):
    _set_env(monkeypatch, LOG_LEVEL="WARNING")
    lines = _emit("info", event="should_not_appear")
    assert all('"should_not_appear"' not in l for l in lines), lines


# --------------------------------------------------------------------------- #
# 3. Idempotency / no double-configure
# --------------------------------------------------------------------------- #
def test_get_logger_is_idempotent(monkeypatch):
    _set_env(monkeypatch)
    log_module = _import_fresh()
    log_module.get_logger("a")
    log_module.get_logger("b")
    log_module.get_logger("c")  # must not raise


def test_get_logger_emits_exactly_one_line(monkeypatch):
    _set_env(monkeypatch, LOG_LEVEL="INFO")
    log_module = _import_fresh()
    buf = io.StringIO()
    handler = logging.StreamHandler(buf)
    handler.setLevel(logging.DEBUG)
    handler.setFormatter(logging.Formatter("%(message)s"))
    root = logging.getLogger()
    root.addHandler(handler)
    try:
        logger = log_module.get_logger("test")
        logger.info("once")
    finally:
        root.removeHandler(handler)
    lines = [l for l in buf.getvalue().splitlines() if '"once"' in l]
    assert len(lines) == 1, lines


# --------------------------------------------------------------------------- #
# 4. Level normalisation: lower/upper/numeric forms
# --------------------------------------------------------------------------- #
@pytest.mark.parametrize("level", ["DEBUG", "debug", "10"])
def test_log_level_normalisation(monkeypatch, level):
    _set_env(monkeypatch, LOG_LEVEL=level)
    lines = _emit("debug", event="dbg")
    assert any('"dbg"' in l for l in lines), (level, lines)
