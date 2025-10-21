from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import datetime
from typing import Optional


class ShopBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: str = Field(..., max_length=255)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)
    phone: str = Field(..., max_length=20)
    email: EmailStr


class ShopCreate(ShopBase):
    is_active: Optional[bool] = True


class ShopUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class ShopResponse(ShopBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


# Shop Staff Schemas
class ShopStaffBase(BaseModel):
    user_id: int
    shop_id: int
    role: str = Field(default="staff", max_length=50)


class ShopStaffCreate(ShopStaffBase):
    is_active: Optional[bool] = True


class ShopStaffResponse(ShopStaffBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    joined_at: datetime
