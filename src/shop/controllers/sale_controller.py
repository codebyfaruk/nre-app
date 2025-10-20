from sqlalchemy.ext.asyncio import AsyncSession
from src.shop.models.sale import Purchase, Sale, DiscountRule
from src.shop.schemas.sale import PurchaseCreate, SaleCreate, DiscountRuleCreate

async def create_purchase(db: AsyncSession, purchase_in: PurchaseCreate) -> Purchase:
    purchase = Purchase(**purchase_in.dict())
    db.add(purchase)
    await db.commit()
    await db.refresh(purchase)
    return purchase

async def create_sale(db: AsyncSession, sale_in: SaleCreate) -> Sale:
    sale = Sale(**sale_in.dict())
    db.add(sale)
    await db.commit()
    await db.refresh(sale)
    return sale

async def create_discount_rule(db: AsyncSession, rule_in: DiscountRuleCreate) -> DiscountRule:
    rule = DiscountRule(**rule_in.dict())
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule
