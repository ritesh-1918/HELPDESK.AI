import logging
import sys
from pythonjsonlogger import jsonlogger

def get_json_logger(name: str = None) -> logging.Logger:
    """
    Returns a logger configured to output structured JSON logs.
    Ideal for CloudWatch, Datadog, or other centralized logging systems.
    """
    logger = logging.getLogger(name)
    
    # Only add handler if not already present to avoid duplicate logs
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        log_handler = logging.StreamHandler(sys.stdout)
        
        # Configure JSON formatter with standard fields
        formatter = jsonlogger.JsonFormatter(
            fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
            datefmt='%Y-%m-%dT%H:%M:%S%z'
        )
        
        log_handler.setFormatter(formatter)
        logger.addHandler(log_handler)
        
    return logger
