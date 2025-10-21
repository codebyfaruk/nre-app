from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional


class AddressBase(BaseModel):
    address: str = Field(..., max_length=255)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)
    phone: str = Field(..., max_length=20)


class AddressCreate(AddressBase):
    user_id: int


class AddressUpdate(BaseModel):
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class AddressResponse(AddressBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int


class CustomerProfileBase(BaseModel):
    full_name: str = Field(..., max_length=100)
    phone: str = Field(..., max_length=20)


class CustomerProfileCreate(CustomerProfileBase):
    user_id: int
    preferred_address_id: Optional[int] = None


class CustomerProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    loyalty_points: Optional[int] = None
    preferred_address_id: Optional[int] = None


class CustomerProfileResponse(CustomerProfileBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    loyalty_points: int
    preferred_address_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    preferred_address: Optional[AddressResponse] = None
