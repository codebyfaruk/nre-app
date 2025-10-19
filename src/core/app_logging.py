import logging
from logging.handlers import RotatingFileHandler
import sys

LOG_FILE = "logs/app.log"

def get_app_logger():
    # Rotating file handler
    handler = RotatingFileHandler(LOG_FILE, maxBytes=5*1024*1024, backupCount=3)
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(message)s")
    handler.setFormatter(formatter)

    logger = logging.getLogger("app")  # Named logger for app
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)

    # Also log to stdout
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    return logger
