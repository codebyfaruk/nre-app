from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    admin = "Admin"
    saler = "Saler"
    manager = "Manager"
    customer = "Customer"
    supplier = "Supplier"

class AddressBase(BaseModel):
    street: str
    city: str
    state: str
    country: str
    zip_code: str
    is_shop: bool = False

class AddressCreate(AddressBase):
    pass

class AddressRead(AddressBase):
    id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    addresses: list[AddressRead] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    user_id: int
    role: UserRole
