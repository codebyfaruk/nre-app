# src/shop/routes/shop_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.db import get_db
from src.shop.controllers.shop_controller import create_shop
from src.shop.schemas.shop import ShopCreate, ShopOut

router = APIRouter()

@router.post("/shops", response_model=ShopOut)
async def create_shop_route(shop_in: ShopCreate, db: AsyncSession = Depends(get_db)):
    return await create_shop(db, shop_in)
