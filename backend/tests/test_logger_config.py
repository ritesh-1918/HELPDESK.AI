import logging
import os
import unittest
from unittest.mock import patch

import structlog

from backend import logger as logger_config


class LoggerConfigTests(unittest.TestCase):
    def tearDown(self):
        if hasattr(structlog, "reset_defaults"):
            structlog.reset_defaults()

    def test_resolves_log_level_from_helpdesk_env(self):
        self.assertEqual(
            logger_config._resolve_log_level({"HELPDESK_LOG_LEVEL": "debug"}),
            logging.DEBUG,
        )

    def test_resolves_log_level_from_generic_env_and_aliases(self):
        self.assertEqual(
            logger_config._resolve_log_level({"LOG_LEVEL": "warn"}),
            logging.WARNING,
        )
        self.assertEqual(
            logger_config._resolve_log_level({"LOG_LEVEL": "50"}),
            logging.CRITICAL,
        )

    def test_invalid_log_level_falls_back_to_info(self):
        self.assertEqual(
            logger_config._resolve_log_level({"HELPDESK_LOG_LEVEL": "verbose"}),
            logging.INFO,
        )

    def test_resolves_json_and_text_log_formats(self):
        self.assertEqual(logger_config._resolve_log_format({}), "json")
        self.assertEqual(
            logger_config._resolve_log_format({"HELPDESK_LOG_FORMAT": "structured"}),
            "json",
        )
        self.assertEqual(
            logger_config._resolve_log_format({"LOG_FORMAT": "console"}),
            "text",
        )

    def test_build_processors_uses_json_renderer_by_default(self):
        processors = logger_config._build_processors("json")
        self.assertIsInstance(processors[-1], structlog.processors.JSONRenderer)
        self.assertIn(structlog.stdlib.filter_by_level, processors)

    def test_build_processors_uses_key_value_renderer_for_text(self):
        processors = logger_config._build_processors("text")
        self.assertIsInstance(processors[-1], structlog.processors.KeyValueRenderer)

    def test_configure_logging_applies_env_level_and_stream_handler(self):
        root_logger = logging.getLogger()
        original_level = root_logger.level
        original_handlers = list(root_logger.handlers)

        try:
            for handler in original_handlers:
                root_logger.removeHandler(handler)

            with patch.dict(
                os.environ,
                {
                    "HELPDESK_LOG_LEVEL": "debug",
                    "HELPDESK_LOG_FORMAT": "console",
                },
                clear=False,
            ):
                logger_config.configure_logging(force=True)

            self.assertEqual(root_logger.level, logging.DEBUG)
            self.assertEqual(len(root_logger.handlers), 1)
            self.assertEqual(root_logger.handlers[0].level, logging.DEBUG)
            self.assertEqual(root_logger.handlers[0].formatter._fmt, "%(message)s")
        finally:
            for handler in list(root_logger.handlers):
                root_logger.removeHandler(handler)
            for handler in original_handlers:
                root_logger.addHandler(handler)
            root_logger.setLevel(original_level)


if __name__ == "__main__":
    unittest.main()
