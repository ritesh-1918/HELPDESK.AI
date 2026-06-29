import logging
import json
import contextvars
from datetime import datetime

# Context variable to hold the request ID for the current async context
request_id_context = contextvars.ContextVar("request_id", default="-")

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "request_id": request_id_context.get(),
            "logger": record.name,
            "filename": record.filename,
            "line": record.lineno,
        }
        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logger(name="helpdesk"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate handlers if setup_logger is called multiple times
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    # Prevent propagation to the root logger to avoid double-logging with uvicorn's default
    logger.propagate = False
    return logger

logger = setup_logger()
