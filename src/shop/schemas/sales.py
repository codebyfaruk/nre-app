from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date as DateType
from typing import Optional, List 
from decimal import Decimal
from enum import Enum


class PaymentMethodEnum(str, Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    ONLINE = "online"


class SaleStatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


# Sale Item Schemas
class SaleItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)
    discount: Decimal = Field(0, ge=0)


class SaleItemCreate(SaleItemBase):
    pass


class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    sale_id: int
    product_id: Optional[int]
    product_name: str
    product_sku: str
    quantity: int
    unit_price: Decimal
    discount: Decimal
    total_price: Decimal


# Sale Schemas
class SaleBase(BaseModel):
    shop_id: int
    customer_id: Optional[int] = None
    payment_method: PaymentMethodEnum
    payment_reference: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    items: List[SaleItemCreate] = Field(..., min_length=1)


class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    invoice_number: str
    shop_id: int
    customer_id: Optional[int]
    staff_id: Optional[int]
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    payment_method: PaymentMethodEnum
    payment_reference: Optional[str]
    status: SaleStatusEnum
    notes: Optional[str]
    sale_date: datetime
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[SaleItemResponse] = []

# ✅ ADD THIS - Lightweight sale summary
class SaleSummary(BaseModel):
    """Lightweight sale summary for lists/dashboard"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    invoice_number: str
    shop_id: int
    customer_id: Optional[int]
    staff_id: Optional[int]
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    payment_method: PaymentMethodEnum
    payment_reference: Optional[str]
    status: SaleStatusEnum
    notes: Optional[str]
    sale_date: datetime
    created_at: datetime
    updated_at: Optional[datetime]


# ✅ UPDATE THIS - Change to use SaleSummary
class TodaysSalesResponse(BaseModel):
    """Today's sales summary with full details"""
    date: DateType = Field(..., description="Today's date")
    total_sales_count: int = Field(..., description="Number of sales today")
    total_amount: Decimal = Field(..., description="Total revenue today")
    sales: List[SaleSummary] = Field(default_factory=list, description="All sales today")  # ✅ Changed here
    
    class Config:
        from_attributes = True


# Return Schemas
class ReturnBase(BaseModel):
    sale_id: int
    product_id: int
    quantity: int = Field(..., gt=0)
    reason: str = Field(..., min_length=10)


class ReturnCreate(ReturnBase):
    pass


class ReturnUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|approved|rejected|completed)$")
    processed_by: Optional[int] = None


class ReturnResponse(ReturnBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    return_number: str
    refund_amount: Decimal
    status: str
    processed_by: Optional[int]
    return_date: datetime
    processed_at: Optional[datetime]
    created_at: datetime
