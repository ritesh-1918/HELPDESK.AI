"""
Structured JSON logging configuration for CloudWatch/Datadog ingestion.

Usage:
    from backend.logging_config import setup_logging
    setup_logging()
"""

import json
import logging
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Outputs each log record as a single JSON line."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "lineno": record.lineno,
        }
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry, default=str)


def setup_logging(level: int = logging.INFO) -> None:
    """Configure root logger with a JSON stream handler."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    root = logging.getLogger()
    root.setLevel(level)
    # Remove any pre-existing handlers to avoid duplicate output
    root.handlers.clear()
    root.addHandler(handler)
