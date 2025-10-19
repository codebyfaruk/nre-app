from fastapi import FastAPI
from fastapi import APIRouter

# Create a simple router
test_router = APIRouter()

@test_router.get("/ping")
async def ping():
    return {"message": "pong"}

def include_routers(app: FastAPI):
    app.include_router(test_router, prefix="/api")
