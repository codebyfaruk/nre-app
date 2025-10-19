from celery import Celery
from src.core.config import settings
from src.core.bg_logging import get_bg_logger

logger = get_bg_logger()

celery = Celery(
    "electronics",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

@celery.task(name="electronics.test_task")
def test_task(x, y):
    logger.info(f"Executing test_task with {x} + {y}")
    return x + y
