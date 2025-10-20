from sqlalchemy.ext.asyncio import AsyncSession
from src.shop.models.product import Category, Product
from src.shop.schemas.product import CategoryCreate, ProductCreate

# CATEGORY
async def create_category(db: AsyncSession, category_in: CategoryCreate) -> Category:
    category = Category(**category_in.dict())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

# PRODUCT
async def create_product(db: AsyncSession, product_in: ProductCreate) -> Product:
    product = Product(**product_in.dict())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product
