from fastapi import FastAPI, APIRouter
from src.accounts.routes.user_route import router as users_router
from src.accounts.routes.address_route import router as addresses_router
from src.accounts.routes.auth_route import router as auth_router

def include_routers(app: FastAPI):
    api_router = APIRouter(prefix="/api")
    api_router.include_router(users_router, prefix="/users")
    api_router.include_router(addresses_router, prefix="/address")
    api_router.include_router(auth_router, prefix="/auth")


    app.include_router(api_router)