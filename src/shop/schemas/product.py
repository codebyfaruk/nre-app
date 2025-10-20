from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# -------------------- CATEGORY --------------------
class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------- PRODUCT --------------------
class ProductBase(BaseModel):
    name: str
    category_id: int
    supplier_id: int
    shop_id: int
    stock_quantity: int
    purchase_price: float
    selling_price: float

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
