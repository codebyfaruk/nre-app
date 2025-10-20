from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# -------------------- SALE --------------------
class SaleBase(BaseModel):
    shop_id: int
    product_id: int
    customer_id: int
    saler_id: int
    quantity: int
    discount_percent: float = 0.0
    total_amount: float

class SaleCreate(SaleBase):
    pass

class SaleOut(SaleBase):
    sale_id: int
    sale_date: datetime

    class Config:
        from_attributes = True

# -------------------- PURCHASE --------------------
class PurchaseBase(BaseModel):
    supplier_id: int
    product_id: int
    quantity: int
    total_cost: float

class PurchaseCreate(PurchaseBase):
    pass

class PurchaseOut(PurchaseBase):
    purchase_id: int
    purchase_date: datetime

    class Config:
        from_attributes = True


# -------------------- DISCOUNT RULE --------------------
class DiscountRuleBase(BaseModel):
    manager_id: int
    shop_id: int
    max_discount_percent: float

class DiscountRuleCreate(DiscountRuleBase):
    pass

class DiscountRuleOut(DiscountRuleBase):
    discount_rule_id: int

    class Config:
        from_attributes = True


# ---------- USER ACTIVITY ----------
class UserActivityBase(BaseModel):
    user_id: int
    action: str
    timestamp: datetime
    details: Optional[str] = None


class UserActivityCreate(UserActivityBase):
    pass


class UserActivityOut(UserActivityBase):
    id: int

    class Config:
        from_attributes = True
