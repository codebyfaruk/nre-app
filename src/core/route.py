from fastapi import FastAPI, APIRouter
from src.accounts.routes.user_route import router as users_router
from src.accounts.routes.address_route import router as addresses_router
from src.accounts.routes.auth_route import router as auth_router
from src.shop.routes.product_routes import router as product_router
from src.shop.routes.sale_routes import router as sale_router
from src.shop.routes.shop_routes import router as shop_router


def include_routers(app: FastAPI):
    api_router = APIRouter(prefix="/api")
    api_router.include_router(users_router, prefix="/users")
    api_router.include_router(addresses_router, prefix="/address")
    api_router.include_router(auth_router, prefix="/auth")
    api_router.include_router(product_router, prefix="/products")
    api_router.include_router(sale_router, prefix="/sales")
    api_router.include_router(shop_router, prefix="/shops")

    app.include_router(api_router)