from typing import List 
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_ , and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime

from src.shop.models import Inventory, Product, Shop
from src.shop.schemas import InventoryCreate, InventoryUpdate, StockAdjustment


class InventoryController:
    """Controller for inventory management operations"""
    
    @staticmethod
    async def create_inventory(
        db: AsyncSession,
        inventory_data: InventoryCreate
    ) -> Inventory:
        """Create inventory record for a product in a shop"""
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
        product_result = await db.execute(
            select(Product).where(Product.id == inventory_data.product_id)
        )
        if not product_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Verify shop exists
        shop_result = await db.execute(
            select(Shop).where(Shop.id == inventory_data.shop_id)
        )
        if not shop_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shop not found"
            )
        
        inventory = Inventory(**inventory_data.model_dump())
        inventory.last_restocked_at = datetime.now()
        
        db.add(inventory)
        await db.commit()
        await db.refresh(inventory)
        
        return inventory

    @staticmethod
    async def get_low_stock_items(
        db: AsyncSession,
        threshold: int = 10,
        shop_id: int | None = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Inventory]:
        """
        Get inventory items with stock at or below threshold
        
        Args:
            db: Database session
            threshold: Stock level threshold (default: 10)
            shop_id: Optional shop filter
            skip: Number of records to skip
            limit: Maximum number of records to return
        
        Returns:
            List of low stock inventory items
        """
        
        # Build query
        query = select(Inventory).where(
            # Available quantity (quantity - reserved) is low OR needs restock
            or_(
                (Inventory.quantity - Inventory.reserved_quantity) <= threshold,
                Inventory.quantity <= Inventory.min_stock_level
            )
        )
        
        # Filter by shop if specified
        if shop_id is not None:
            query = query.where(Inventory.shop_id == shop_id)
        
        # Order by most urgent first (lowest available stock)
        query = query.order_by(
            (Inventory.quantity - Inventory.reserved_quantity).asc()
        )
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        inventory_items = result.scalars().all()
        
        return inventory_items
    
    @staticmethod
    async def get_inventory(
        db: AsyncSession,
        inventory_id: int
    ) -> Inventory:
        """Get inventory by ID"""
        result = await db.execute(
            select(Inventory)
            .options(
                selectinload(Inventory.product),
                selectinload(Inventory.shop)
            )
            .where(Inventory.id == inventory_id)
        )
        inventory = result.scalar_one_or_none()
        
        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory not found"
            )
        
        return inventory
    
    @staticmethod
    async def get_inventory_by_shop(
        db: AsyncSession,
        shop_id: int,
        skip: int = 0,
        limit: int = 100,
        low_stock_only: bool = False
    ) -> List[Inventory]:
        """Get inventory for a specific shop"""
        query = (
            select(Inventory)
            .options(selectinload(Inventory.product))
            .where(Inventory.shop_id == shop_id)
            .offset(skip)
            .limit(limit)
        )
        
        if low_stock_only:
            query = query.where(Inventory.quantity <= Inventory.min_stock_level)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_inventory_by_product(
        db: AsyncSession,
        product_id: int
    ) -> List[Inventory]:
        """Get inventory across all shops for a product"""
        result = await db.execute(
            select(Inventory)
            .options(selectinload(Inventory.shop))
            .where(Inventory.product_id == product_id)
        )
        return result.scalars().all()
    
    @staticmethod
    async def update_inventory(
        db: AsyncSession,
        inventory_id: int,
        inventory_data: InventoryUpdate
    ) -> Inventory:
        """Update inventory details"""
        inventory = await InventoryController.get_inventory(db, inventory_id)
        
        update_data = inventory_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(inventory, field, value)
        
        await db.commit()
        await db.refresh(inventory)
        
        return inventory
    
    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        inventory_id: int,
        adjustment_data: StockAdjustment
    ) -> Inventory:
        """Adjust inventory quantity (add or remove stock)"""
        inventory = await InventoryController.get_inventory(db, inventory_id)
        
        new_quantity = inventory.quantity + adjustment_data.adjustment
        
        if new_quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock for this adjustment"
            )
        
        inventory.quantity = new_quantity
        
        # Update last restocked date if adding stock
        if adjustment_data.adjustment > 0:
            inventory.last_restocked_at = datetime.now()
        
        await db.commit()
        await db.refresh(inventory)
        
        return inventory
    
    @staticmethod
    async def reserve_stock(
        db: AsyncSession,
        inventory_id: int,
        quantity: int
    ) -> Inventory:
        """Reserve stock for pending orders"""
        inventory = await InventoryController.get_inventory(db, inventory_id)
        
        if inventory.available_quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient available stock. Available: {inventory.available_quantity}"
            )
        
        inventory.reserved_quantity += quantity
        
        await db.commit()
        await db.refresh(inventory)
        
        return inventory
    
    @staticmethod
    async def release_stock(
        db: AsyncSession,
        inventory_id: int,
        quantity: int
    ) -> Inventory:
        """Release reserved stock"""
        inventory = await InventoryController.get_inventory(db, inventory_id)
        
        if inventory.reserved_quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot release more than reserved quantity"
            )
        
        inventory.reserved_quantity -= quantity
        
        await db.commit()
        await db.refresh(inventory)
        
        return inventory
    
    @staticmethod
    async def check_stock_availability(
        db: AsyncSession,
        product_id: int,
        shop_id: int,
        required_quantity: int
    ) -> bool:
        """Check if sufficient stock is available"""
        result = await db.execute(
            select(Inventory).where(
                and_(
                    Inventory.product_id == product_id,
                    Inventory.shop_id == shop_id
                )
            )
        )
        inventory = result.scalar_one_or_none()
        
        if not inventory:
            return False
        
        return inventory.available_quantity >= required_quantity
