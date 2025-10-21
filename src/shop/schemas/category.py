from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = Field(None, max_length=500)


class CategoryCreate(CategoryBase):
    is_active: Optional[bool] = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
