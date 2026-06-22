import logging
import os
import sys
from typing import Mapping, Optional, Sequence

import structlog


DEFAULT_LOG_FORMAT = "json"
DEFAULT_LOG_LEVEL = logging.INFO
LOG_FORMAT_ENV_KEYS = ("HELPDESK_LOG_FORMAT", "LOG_FORMAT")
LOG_LEVEL_ENV_KEYS = ("HELPDESK_LOG_LEVEL", "LOG_LEVEL")
JSON_LOG_FORMATS = {"json", "structured"}
TEXT_LOG_FORMATS = {"console", "text", "plain", "human"}


def _first_env_value(env: Mapping[str, str], keys: Sequence[str]) -> Optional[str]:
    for key in keys:
        value = env.get(key)
        if value and value.strip():
            return value.strip()
    return None


def _resolve_log_level(env: Optional[Mapping[str, str]] = None) -> int:
    env = os.environ if env is None else env
    raw_level = (_first_env_value(env, LOG_LEVEL_ENV_KEYS) or "INFO").upper()
    raw_level = {"WARN": "WARNING", "FATAL": "CRITICAL"}.get(raw_level, raw_level)

    if raw_level.isdigit():
        return int(raw_level)

    level = logging.getLevelName(raw_level)
    return level if isinstance(level, int) else DEFAULT_LOG_LEVEL


def _resolve_log_format(env: Optional[Mapping[str, str]] = None) -> str:
    env = os.environ if env is None else env
    raw_format = (_first_env_value(env, LOG_FORMAT_ENV_KEYS) or DEFAULT_LOG_FORMAT).lower()

    if raw_format in JSON_LOG_FORMATS:
        return "json"
    if raw_format in TEXT_LOG_FORMATS:
        return "text"
    return DEFAULT_LOG_FORMAT


def _build_processors(log_format: str):
    processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if log_format == "text":
        processors.append(
            structlog.processors.KeyValueRenderer(
                key_order=["timestamp", "level", "logger", "event"]
            )
        )
    else:
        processors.append(structlog.processors.JSONRenderer())

    return processors


def configure_logging(force: bool = False) -> None:
    log_level = _resolve_log_level()
    log_format = _resolve_log_format()

    if force and hasattr(structlog, "reset_defaults"):
        structlog.reset_defaults()

    if force or not structlog.is_configured():
        structlog.configure(
            processors=_build_processors(log_format),
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    if not root_logger.handlers:
        root_logger.addHandler(logging.StreamHandler(sys.stdout))

    for handler in root_logger.handlers:
        handler.setLevel(log_level)
        handler.setFormatter(logging.Formatter("%(message)s"))


def get_logger(name: Optional[str] = None):
    """
    Returns a configured structlog logger.
    """
    configure_logging()
    return structlog.get_logger(name)
