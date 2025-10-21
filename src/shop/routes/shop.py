from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.core.db import get_db
from src.accounts.permissions import IsAdmin, IsManager
from src.accounts.dependencies import get_current_user
from src.accounts.models import User
from src.shop.controllers import ShopController
from src.shop.schemas import (
    ShopCreate, ShopUpdate, ShopResponse,
    ShopStaffCreate, ShopStaffResponse
)

router = APIRouter()


@router.post("/", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
async def create_shop(
    shop_data: ShopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsAdmin())
):
    """
    Create a new shop (Admin only)
    """
    shop = await ShopController.create_shop(db, shop_data)
    return shop


@router.get("/", response_model=List[ShopResponse])
async def get_shops(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of all shops
    """
    shops = await ShopController.get_shops(db, skip, limit, is_active)
    return shops


@router.get("/{shop_id}", response_model=ShopResponse)
async def get_shop(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get shop details by ID
    """
    shop = await ShopController.get_shop(db, shop_id)
    return shop


@router.put("/{shop_id}", response_model=ShopResponse)
async def update_shop(
    shop_id: int,
    shop_data: ShopUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsAdmin())
):
    """
    Update shop details (Admin only)
    """
    shop = await ShopController.update_shop(db, shop_id, shop_data)
    return shop


@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shop(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsAdmin())
):
    """
    Delete shop (Admin only)
    """
    await ShopController.delete_shop(db, shop_id)


# Shop Staff Management
@router.post("/staff", response_model=ShopStaffResponse, status_code=status.HTTP_201_CREATED)
async def assign_staff_to_shop(
    staff_data: ShopStaffCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Assign staff to shop (Manager+)
    """
    staff = await ShopController.assign_staff(db, staff_data)
    return staff


@router.delete("/staff/{user_id}/shop/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_staff_from_shop(
    user_id: int,
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Remove staff from shop (Manager+)
    """
    await ShopController.remove_staff(db, user_id, shop_id)
