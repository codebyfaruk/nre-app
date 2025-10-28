from fastapi import FastAPI
from src.core.config import settings
from src.core.route import include_routers
from src.core.app_logging import get_app_logger
from fastapi.middleware.cors import CORSMiddleware

logger = get_app_logger()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:5173",
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