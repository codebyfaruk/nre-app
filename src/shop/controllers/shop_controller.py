from sqlalchemy.ext.asyncio import AsyncSession
from src.shop.models.shop import Shop
from src.shop.schemas.shop import ShopCreate

async def create_shop(db: AsyncSession, shop_in: ShopCreate) -> Shop:
    shop = Shop(**shop_in.dict())
    db.add(shop)
    await db.commit()
    await db.refresh(shop)
    return shop
