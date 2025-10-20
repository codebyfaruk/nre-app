from typing import Optional
from pydantic import BaseModel


# -------------------- SHOP --------------------
class ShopBase(BaseModel):
    name: str
    address_id: int
    phone: Optional[str] = None

class ShopCreate(ShopBase):
    pass

class ShopOut(ShopBase):
    id: int

    class Config:
        from_attributes = True

