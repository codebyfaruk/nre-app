from fastapi import FastAPI
from fastapi import APIRouter
from src.accounts.routes.user import router as accounts_router

# Create a simple router
test_router = APIRouter()

def include_routers(app: FastAPI):
    app.include_router(accounts_router, prefix="/api")
