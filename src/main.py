from fastapi import FastAPI
from src.core.config import settings
from src.core.route import include_routers
from src.core.app_logging import get_app_logger
from fastapi.middleware.cors import CORSMiddleware

logger = get_app_logger()

app = FastAPI(title=settings.APP_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

include_routers(app)

@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "env": settings.APP_ENV}
