from fastapi import APIRouter
from .shop import router as shop_router
from .product import router as product_router
from .inventory import router as inventory_router
from .sales import router as sales_router

router = APIRouter()

router.include_router(shop_router, prefix="/shops", tags=["Shops"])
router.include_router(product_router, prefix="/products", tags=["Products"])
router.include_router(inventory_router, prefix="/inventory", tags=["Inventory"])
router.include_router(sales_router, prefix="/sales", tags=["Sales"])

__all__ = ["router"]
