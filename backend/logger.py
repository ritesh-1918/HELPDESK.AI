import logging
import os
import sys
import json
from datetime import datetime

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

def get_logger(name: str = None):
    """
    Returns a configured standard logger.
    """
    return logging.getLogger(name)
