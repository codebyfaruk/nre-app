from fastapi import FastAPI
from src.core.config import settings
from src.core.route import include_routers
from src.core.app_logging import get_app_logger

logger = get_app_logger()

app = FastAPI(title=settings.APP_NAME)
include_routers(app)

@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "env": settings.APP_ENV}
