# src/shop/schemas/inventory.py - UPDATED

from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional


class InventoryBase(BaseModel):
    product_id: int
    shop_id: int
    quantity: int = Field(..., ge=0)
    reserved_quantity: int = Field(0, ge=0)
    min_stock_level: int = Field(10, ge=0)
    max_stock_level: int = Field(1000, ge=0)


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=0)
    reserved_quantity: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)


class InventoryResponse(InventoryBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    available_quantity: int
    needs_restock: bool
    last_restocked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class StockAdjustment(BaseModel):
    """Schema for adjusting stock quantity"""
    adjustment: int = Field(..., description="Positive for adding stock, negative for removing")
    reason: Optional[str] = Field(None, max_length=255)
