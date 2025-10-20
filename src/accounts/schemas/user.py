from pydantic import BaseModel, EmailStr
from datetime import datetime
from src.accounts.models.user import RoleEnum
from src.accounts.schemas.address import AddressRead

class UserBase(BaseModel):
    name: str
    email: EmailStr
    username: str
    role: RoleEnum
    is_active: bool = True
    is_superuser: bool = False
    address_id: int | None = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    address: AddressRead | None = None

    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    username: str | None = None
    role: RoleEnum | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None
    address_id: int | None = None
    password: str | None = None
