# src/accounts/schemas/user.py - ADD role_names to UserCreate
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import datetime
from typing import Optional, List

class RoleBase(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=255)

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class UserRoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    role: RoleResponse

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    is_staff: Optional[bool] = True
    role_names: Optional[List[str]] = []  # ✅ ADDED

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    is_staff: Optional[bool] = None
    role_names: Optional[List[str]] = None  # ✅ ADDED

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    is_staff: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    roles: List[UserRoleResponse] = []

class UserLogin(BaseModel):
    username: str
    password: str
