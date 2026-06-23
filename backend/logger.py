"""
Structured JSON logging for the FastAPI backend (issue #2944).

This module exposes a single public entry point, ``get_logger(name)``, that
returns a configured ``structlog`` logger emitting one JSON object per record.

Key properties (see ``backend/tests/test_logger.py``):

* **Configurable level.** The effective log level is read once from
  ``Settings.LOG_LEVEL`` (env var ``LOG_LEVEL``), accepting the stdlib level
  names case-insensitively or an integer (``"10"``, ``"DEBUG"``, ``"debug"``
  are all equivalent). Defaults to ``INFO``.
* **Structured JSON output.** Every record is rendered as a single JSON line
  carrying ``event``, ``level``, ``logger``, ``timestamp`` and the call's
  keyword arguments — suitable for ingestion by log aggregators.
* **Idempotent configuration.** ``configure_logging`` guards against the
  double-configure / handler-stacking bug the previous implementation had:
  repeated imports or calls no longer attach duplicate handlers or reset the
  level inconsistently.
"""
from __future__ import annotations

import logging
import sys
from typing import Optional, Union

import structlog

# Default fallback if settings cannot be resolved (e.g. very early bootstrap).
_DEFAULT_LEVEL = logging.INFO


def _coerce_level(value: Union[str, int, None]) -> int:
    """Normalise a level spec into a stdlib numeric level.

    Accepts upper/lower/stdlib names ("debug", "WARNING", ...) and integer
    strings ("10"). Falls back to INFO on anything unrecognised so a typo in
    configuration never silences production logs unexpectedly.
    """
    if value is None:
        return _DEFAULT_LEVEL
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return _DEFAULT_LEVEL
        # Integer-as-string ("10", "20").
        if text.isdigit():
            return int(text)
        # Named level ("info", "WARNING", "Error").
        named = logging.getLevelName(text.upper())
        if isinstance(named, int):
            return named
    return _DEFAULT_LEVEL


def _resolve_level() -> int:
    """Resolve the effective level from settings, tolerating import failures."""
    try:
        from backend.config import settings
        return _coerce_level(settings.LOG_LEVEL)
    except Exception:
        # During very early bootstrap or in test isolation, settings may not
        # be importable. Fall back to the env var directly, then to default.
        import os
        return _coerce_level(os.getenv("LOG_LEVEL"))


def configure_logging(level: Optional[Union[str, int]] = None) -> None:
    """Configure structlog + stdlib logging once, idempotently.

    Safe to call any number of times: on the first call it wires up the JSON
    processors and a stdout ``StreamHandler``; subsequent calls only adjust the
    effective level (no duplicate handlers, no reset of structlog state).
    """
    resolved = _coerce_level(level) if level is not None else _resolve_level()

    # structlog is configured exactly once per process.
    if not structlog.is_configured():
        structlog.configure(
            processors=[
                structlog.stdlib.add_log_level,
                structlog.stdlib.add_logger_name,
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.JSONRenderer(),
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )

    # Stdlib routing — always (re)apply the level, never stack handlers.
    root = logging.getLogger()
    root.setLevel(resolved)
    if not any(
        getattr(h, "_helpdesk_structlog_handler", False) for h in root.handlers
    ):
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(resolved)
        handler.setFormatter(logging.Formatter("%(message)s"))
        # Mark our own handler so re-configuration does not duplicate it.
        handler._helpdesk_structlog_handler = True  # type: ignore[attr-defined]
        root.addHandler(handler)


def get_logger(name: Optional[str] = None):
    """Return a configured structlog logger bound to ``name``.

    Guarantees logging is configured (idempotently) before the logger is
    handed back, so callers can ``from backend.logger import get_logger`` and
    start logging without a separate bootstrap step.
    """
    configure_logging()
    return structlog.get_logger(name)
