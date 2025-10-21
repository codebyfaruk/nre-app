from fastapi import FastAPI, APIRouter
from src.accounts.routes.user import router as user_router
from src.accounts.routes.auth import router as auth_router
from src.accounts.routes.customer import router as customer_router
from src.shop.routes import router as shop_router

def include_routers(app: FastAPI):
    api_router = APIRouter(prefix="/api")
    api_router.include_router(user_router, prefix="/users", tags=["Users"])
    api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
    api_router.include_router(customer_router, prefix="/customers", tags=["Customers"])
    api_router.include_router(shop_router)

    app.include_router(api_router)