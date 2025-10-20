# src/shop/routes/sale_purchase_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.db import get_db
from src.shop.controllers.sale_controller import create_purchase, create_sale, create_discount_rule
from src.shop.schemas.sale import PurchaseCreate, PurchaseOut, SaleCreate, SaleOut, DiscountRuleCreate, DiscountRuleOut

router = APIRouter()

@router.post("/purchases", response_model=PurchaseOut)
async def create_purchase_route(purchase_in: PurchaseCreate, db: AsyncSession = Depends(get_db)):
    return await create_purchase(db, purchase_in)

@router.post("/sales", response_model=SaleOut)
async def create_sale_route(sale_in: SaleCreate, db: AsyncSession = Depends(get_db)):
    return await create_sale(db, sale_in)

@router.post("/discount-rules", response_model=DiscountRuleOut)
async def create_discount_rule_route(rule_in: DiscountRuleCreate, db: AsyncSession = Depends(get_db)):
    return await create_discount_rule(db, rule_in)
