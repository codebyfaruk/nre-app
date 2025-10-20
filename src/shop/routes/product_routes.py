from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.db import get_db
from src.shop.controllers.product_controller import create_category, create_product
from src.shop.schemas.product import CategoryCreate, CategoryOut, ProductCreate, ProductOut

router = APIRouter()

@router.post("/categories", response_model=CategoryOut)
async def create_category_route(category_in: CategoryCreate, db: AsyncSession = Depends(get_db)):
    return await create_category(db, category_in)

@router.post("/products", response_model=ProductOut)
async def create_product_route(product_in: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await create_product(db, product_in)
