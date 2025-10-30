import os
from fastapi import FastAPI
from src.core.config import settings
from src.core.route import include_routers
from src.core.app_logging import get_app_logger
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

logger = get_app_logger()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://be718708da10.ngrok-free.app"
]

app = FastAPI(title=settings.APP_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

include_routers(app)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)

if os.path.exists("/.dockerenv"):
    # Inside Docker container
    BASE_DIR = "/app"
else:
    # Local environment → use parent of current file
    BASE_DIR = PARENT_DIR

MEDIA_DIR = os.path.join(BASE_DIR, "media")

os.makedirs(MEDIA_DIR, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "env": settings.APP_ENV}


# @app.on_event("startup")
# def print_all_routes():
#     print("\n📜 Registered FastAPI Routes:")
#     print("-" * 80)
#     for route in app.routes:
#         if hasattr(route, "methods"):
#             methods = ", ".join(route.methods)
#             print(f"{methods:15s} | {route.path:40s} | {route.endpoint.__name__}")
#     print("-" * 80 + "\n")