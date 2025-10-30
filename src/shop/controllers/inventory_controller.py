# src/shop/controllers/inventory_controller.py - PAGE 1 OPTIMIZED
# CHANGES: Remove success logs + Query optimization (remove selectinload, add pagination)

from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime
from src.shop.models import Inventory, Product, Shop
from src.shop.schemas import InventoryCreate, InventoryUpdate, StockAdjustment
from src.core.app_logging import get_app_logger

logger = get_app_logger()

class InventoryController:
    """Controller for inventory management operations"""

    @staticmethod
    async def create_inventory(
        db: AsyncSession,
        inventory_data: InventoryCreate
    ) -> Inventory:
        """Create inventory record for a product in a shop"""
        try:
            # Check if inventory already exists
            result = await db.execute(
                select(Inventory).where(
                    and_(
                        Inventory.product_id == inventory_data.product_id,
                        Inventory.shop_id == inventory_data.shop_id
                    )
                )
            )
            if result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Inventory already exists for this product in this shop"
                )

            # Verify product exists
            result = await db.execute(
                select(Product).where(Product.id == inventory_data.product_id)
            )
            if not result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found"
                )

            # Verify shop exists
            result = await db.execute(
                select(Shop).where(Shop.id == inventory_data.shop_id)
            )
            if not result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Shop not found"
                )

            inventory = Inventory(**inventory_data.model_dump())
            db.add(inventory)
            await db.commit()
            await db.refresh(inventory)
            return inventory

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating inventory: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create inventory: {str(e)}"
            )

    @staticmethod
    async def get_inventory(db: AsyncSession, inventory_id: int) -> Inventory:
        """Get inventory by ID - OPTIMIZED: Removed selectinload"""
        try:
            result = await db.execute(
                select(Inventory).where(Inventory.id == inventory_id)
            )
            inventory = result.scalar_one_or_none()

            if not inventory:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Inventory not found"
                )

            return inventory

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching inventory ID {inventory_id}: {str(e)}")
            raise

    @staticmethod
    async def get_all_inventory(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
    ) -> List[Inventory]:
        """Get all inventory records - OPTIMIZED: Removed selectinload + Added pagination"""
        try:
            result = await db.execute(
                select(Inventory)
                .offset(skip)
                .limit(limit)
                .order_by(Inventory.updated_at.desc())
            )
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error fetching all inventory: {str(e)}")
            raise

    @staticmethod
    async def get_shop_inventory(
        db: AsyncSession,
        shop_id: int,
        skip: int = 0,
        limit: int = 50,
        sort_by: str = "updated_at"
    ) -> List[Inventory]:
        """Get all inventory for a specific shop - OPTIMIZED"""
        try:
            query = select(Inventory).where(Inventory.shop_id == shop_id)

            if sort_by == "quantity":
                query = query.order_by(Inventory.quantity.asc())
            elif sort_by == "product_id":
                query = query.order_by(Inventory.product_id.asc())
            else:
                query = query.order_by(Inventory.updated_at.desc())

            query = query.offset(skip).limit(limit)
            result = await db.execute(query)
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error fetching shop inventory for shop {shop_id}: {str(e)}")
            raise

    @staticmethod
    async def get_product_inventory(
        db: AsyncSession,
        product_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[Inventory]:
        """Get inventory across all shops for a product - OPTIMIZED"""
        try:
            query = (
                select(Inventory)
                .where(Inventory.product_id == product_id)
                .order_by(Inventory.quantity.desc())
                .offset(skip)
                .limit(limit)
            )
            result = await db.execute(query)
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error fetching product inventory for product {product_id}: {str(e)}")
            raise

    @staticmethod
    async def get_low_stock_items(
        db: AsyncSession,
        threshold: int = 5,
        skip: int = 0,
        limit: int = 50
    ) -> List[Inventory]:
        """Get inventory items with low stock - OPTIMIZED"""
        try:
            result = await db.execute(
                select(Inventory)
                .where(Inventory.quantity <= threshold)
                .order_by(Inventory.quantity.asc())
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error fetching low stock items: {str(e)}")
            raise

    @staticmethod
    async def update_inventory(
        db: AsyncSession,
        inventory_id: int,
        inventory_data: InventoryUpdate
    ) -> Inventory:
        """Update inventory details"""
        try:
            inventory = await InventoryController.get_inventory(db, inventory_id)

            update_data = inventory_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(inventory, field, value)

            await db.commit()
            await db.refresh(inventory)
            return inventory

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating inventory ID {inventory_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update inventory: {str(e)}"
            )

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        inventory_id: int,
        adjustment: StockAdjustment
    ) -> Inventory:
        """Adjust inventory stock quantity"""
        try:
            inventory = await InventoryController.get_inventory(db, inventory_id)

            new_quantity = inventory.quantity + adjustment.quantity

            if new_quantity < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient stock for this adjustment"
                )

            inventory.quantity = new_quantity
            inventory.last_restocked_at = datetime.now()

            await db.commit()
            await db.refresh(inventory)
            return inventory

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error adjusting stock for inventory {inventory_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to adjust stock: {str(e)}"
            )

    @staticmethod
    async def reserve_stock(
        db: AsyncSession,
        inventory_id: int,
        quantity: int
    ) -> Inventory:
        """Reserve stock for pending orders"""
        try:
            inventory = await InventoryController.get_inventory(db, inventory_id)

            available = inventory.quantity - inventory.reserved_quantity

            if available < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient available stock. Available: {available}"
                )

            inventory.reserved_quantity += quantity

            await db.commit()
            await db.refresh(inventory)
            return inventory

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error reserving stock for inventory {inventory_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to reserve stock: {str(e)}"
            )

    @staticmethod
    async def release_stock(
        db: AsyncSession,
        inventory_id: int,
        quantity: int
    ) -> Inventory:
        """Release reserved stock"""
        try:
            inventory = await InventoryController.get_inventory(db, inventory_id)

            if inventory.reserved_quantity < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot release more than reserved. Reserved: {inventory.reserved_quantity}"
                )

            inventory.reserved_quantity -= quantity

            await db.commit()
            await db.refresh(inventory)
            return inventory

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error releasing stock for inventory {inventory_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to release stock: {str(e)}"
            )