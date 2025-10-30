# src/shop/routes/inventory.py - COMPLETE & FIXED

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.core.db import get_db
from src.shop.controllers.inventory_controller import InventoryController
from src.shop.schemas.inventory import (
    InventoryResponse,
    InventoryCreate,
    InventoryUpdate,
    StockAdjustment
)

router = APIRouter()


# ============================================
# 📦 SPECIFIC ROUTES (MUST COME FIRST!)
# ============================================

@router.get("/low-stock", response_model=List[InventoryResponse])
async def get_low_stock_items(
    threshold: int = Query(5, description="Stock level threshold", ge=0),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get inventory items with stock below threshold
    
    - **threshold**: Minimum stock level (default: 5)
    """
    return await InventoryController.get_low_stock_items(db=db, threshold=threshold, skip=skip, limit=limit)


@router.get("/shop/{shop_id}", response_model=List[InventoryResponse])
async def get_shop_inventory(
    shop_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("updated_at", description="Sort by: updated_at, quantity, or product_id"),
    db: AsyncSession = Depends(get_db)
):
    """Get all inventory for a specific shop"""
    return await InventoryController.get_shop_inventory(db, shop_id, skip=skip, limit=limit, sort_by=sort_by)


@router.get("/product/{product_id}", response_model=List[InventoryResponse])
async def get_product_inventory(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Get inventory across all shops for a specific product"""
    return await InventoryController.get_product_inventory(db=db, skip=skip, limit=limit, product_id=product_id)


# ============================================
# 📋 GENERAL ROUTES
# ============================================

@router.get("/", response_model=List[InventoryResponse])
async def get_all_inventory(
    db: AsyncSession = Depends(get_db)
):
    """Get all inventory records"""
    return await InventoryController.get_all_inventory(db)


@router.post("/", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory(
    inventory_data: InventoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new inventory record for a product in a shop"""
    return await InventoryController.create_inventory(db, inventory_data)


# ============================================
# 🔢 DYNAMIC ID ROUTES (MUST COME LAST!)
# ============================================

@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory(
    inventory_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get inventory record by ID"""
    return await InventoryController.get_inventory(db, inventory_id)


@router.put("/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(
    inventory_id: int,
    inventory_data: InventoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update inventory record"""
    return await InventoryController.update_inventory(db, inventory_id, inventory_data)


@router.delete("/{inventory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory(
    inventory_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete inventory record"""
    await InventoryController.delete_inventory(db, inventory_id)
    return None


# ============================================
# 📊 STOCK MANAGEMENT ROUTES
# ============================================

@router.post("/{inventory_id}/adjust", response_model=InventoryResponse)
async def adjust_stock(
    inventory_id: int,
    adjustment: StockAdjustment,
    db: AsyncSession = Depends(get_db)
):
    """
    Adjust inventory stock quantity
    
    - Positive quantity = Add stock
    - Negative quantity = Remove stock
    """
    return await InventoryController.adjust_stock(db, inventory_id, adjustment)


@router.post("/{inventory_id}/reserve", response_model=InventoryResponse)
async def reserve_stock(
    inventory_id: int,
    quantity: int = Query(..., gt=0, description="Quantity to reserve"),
    db: AsyncSession = Depends(get_db)
):
    """Reserve stock for pending orders"""
    return await InventoryController.reserve_stock(db, inventory_id, quantity)


@router.post("/{inventory_id}/release", response_model=InventoryResponse)
async def release_stock(
    inventory_id: int,
    quantity: int = Query(..., gt=0, description="Quantity to release"),
    db: AsyncSession = Depends(get_db)
):
    """Release reserved stock (e.g., cancelled order)"""
    return await InventoryController.release_stock(db, inventory_id, quantity)
