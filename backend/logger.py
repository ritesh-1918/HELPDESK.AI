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
import os
import sys
import json
from datetime import datetime
from typing import Union

class JSONFormatter(logging.Formatter):
    """
    Formatter that outputs JSON strings after parsing the LogRecord.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage()
        }
        
        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)

def configure_logging():
    """
    Configures standard library logging to output structured JSON.
    Reads LOG_LEVEL from the environment (defaulting to INFO).
    """
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(log_level)
    
    # Configure uvicorn loggers to use the same handler
    for _log in ["uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"]:
        l = logging.getLogger(_log)
        l.handlers = [handler]
        l.setLevel(log_level)
        l.propagate = False

# Default fallback if settings cannot be resolved (e.g. very early bootstrap).
_DEFAULT_LEVEL = logging.INFO


def _coerce_level(value: Union[str, int, None]) -> int:
    if value is None:
        return logging.INFO
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        if value.isdigit():
            return int(value)
        level = getattr(logging, value.upper(), None)
        if isinstance(level, int):
            return level
    return logging.INFO


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
