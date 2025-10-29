# src/shop/schemas/product.py - FIXED

from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    price: Decimal = Field(..., ge=0)
    discount_price: Optional[Decimal] = Field(None, ge=0)
    cost_price: Optional[Decimal] = Field(None, ge=0)
    specifications: Optional[str] = None
    warranty_months: Optional[int] = Field(0, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)


class ProductCreate(ProductBase):
    is_active: Optional[bool] = True


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    price: Optional[Decimal] = Field(None, ge=0)
    discount_price: Optional[Decimal] = Field(None, ge=0)
    cost_price: Optional[Decimal] = Field(None, ge=0)
    specifications: Optional[str] = None
    warranty_months: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


# ✅ Simple Inventory Response for nested use
class InventoryInProductResponse(BaseModel):
    """Simplified inventory response for use in ProductResponse"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    shop_id: int
    quantity: int
    reserved_quantity: int = 0
    min_stock_level: int
    max_stock_level: int


# ✅ FIXED - NOW INCLUDES INVENTORY
class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # ✅ ADD THIS - Include inventory list
    inventory: List[InventoryInProductResponse] = []
