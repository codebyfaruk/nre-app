from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.core.db import get_db
from src.accounts.permissions import IsManager, IsStaff
from src.accounts.models import User
from src.shop.controllers import InventoryController
from src.shop.schemas import (
    InventoryCreate, InventoryUpdate, InventoryResponse, StockAdjustment
)

router = APIRouter()


@router.post("/", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory(
    inventory_data: InventoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Create inventory record for a product in a shop (Manager+)
    """
    inventory = await InventoryController.create_inventory(db, inventory_data)
    return inventory


@router.get("/shop/{shop_id}", response_model=List[InventoryResponse])
async def get_shop_inventory(
    shop_id: int,
    skip: int = 0,
    limit: int = 100,
    low_stock_only: bool = Query(False, description="Show only low stock items"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Get inventory for a specific shop (Staff+)
    """
    inventory = await InventoryController.get_inventory_by_shop(
        db, shop_id, skip, limit, low_stock_only
    )
    return inventory


@router.get("/product/{product_id}", response_model=List[InventoryResponse])
async def get_product_inventory(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Get inventory across all shops for a product (Staff+)
    """
    inventory = await InventoryController.get_inventory_by_product(db, product_id)
    return inventory


@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory(
    inventory_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Get inventory by ID (Staff+)
    """
    inventory = await InventoryController.get_inventory(db, inventory_id)
    return inventory


@router.put("/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(
    inventory_id: int,
    inventory_data: InventoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Update inventory details (Manager+)
    """
    inventory = await InventoryController.update_inventory(db, inventory_id, inventory_data)
    return inventory


@router.post("/{inventory_id}/adjust", response_model=InventoryResponse)
async def adjust_inventory_stock(
    inventory_id: int,
    adjustment_data: StockAdjustment,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Adjust inventory stock quantity (Manager+)
    
    Use positive numbers to add stock, negative to remove.
    """
    inventory = await InventoryController.adjust_stock(db, inventory_id, adjustment_data)
    return inventory


@router.post("/{inventory_id}/reserve/{quantity}", response_model=InventoryResponse)
async def reserve_inventory_stock(
    inventory_id: int,
    quantity: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Reserve stock for pending orders (Staff+)
    """
    inventory = await InventoryController.reserve_stock(db, inventory_id, quantity)
    return inventory


@router.post("/{inventory_id}/release/{quantity}", response_model=InventoryResponse)
async def release_inventory_stock(
    inventory_id: int,
    quantity: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Release reserved stock (Staff+)
    """
    inventory = await InventoryController.release_stock(db, inventory_id, quantity)
    return inventory
