from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.shop.models import Shop, ShopStaff
from src.shop.schemas import ShopCreate, ShopUpdate, ShopStaffCreate


class ShopController:
    """Controller for shop management operations"""
    
    @staticmethod
    async def create_shop(db: AsyncSession, shop_data: ShopCreate) -> Shop:
        """Create a new shop"""
        # Check if shop name already exists
        result = await db.execute(
            select(Shop).where(Shop.name == shop_data.name)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shop with this name already exists"
            )
        
        shop = Shop(**shop_data.model_dump())
        db.add(shop)
        await db.commit()
        await db.refresh(shop)
        
        return shop
    
    @staticmethod
    async def get_shop(db: AsyncSession, shop_id: int) -> Shop:
        """Get shop by ID"""
        result = await db.execute(
            select(Shop)
            .options(selectinload(Shop.staff))
            .where(Shop.id == shop_id)
        )
        shop = result.scalar_one_or_none()
        
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shop not found"
            )
        
        return shop
    
    @staticmethod
    async def get_shops(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[Shop]:
        """Get list of shops"""
        query = select(Shop).offset(skip).limit(limit)
        
        if is_active is not None:
            query = query.where(Shop.is_active == is_active)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def update_shop(
        db: AsyncSession,
        shop_id: int,
        shop_data: ShopUpdate
    ) -> Shop:
        """Update shop details"""
        shop = await ShopController.get_shop(db, shop_id)
        
        update_data = shop_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(shop, field, value)
        
        await db.commit()
        await db.refresh(shop)
        
        return shop
    
    @staticmethod
    async def delete_shop(db: AsyncSession, shop_id: int) -> None:
        """Delete shop"""
        shop = await ShopController.get_shop(db, shop_id)
        await db.delete(shop)
        await db.commit()
    
    @staticmethod
    async def assign_staff(
        db: AsyncSession,
        staff_data: ShopStaffCreate
    ) -> ShopStaff:
        """Assign staff to shop"""
        # Check if already assigned
        result = await db.execute(
            select(ShopStaff).where(
                ShopStaff.user_id == staff_data.user_id,
                ShopStaff.shop_id == staff_data.shop_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff already assigned to this shop"
            )
        
        staff_assignment = ShopStaff(**staff_data.model_dump())
        db.add(staff_assignment)
        await db.commit()
        await db.refresh(staff_assignment)
        
        return staff_assignment
    
    @staticmethod
    async def remove_staff(
        db: AsyncSession,
        user_id: int,
        shop_id: int
    ) -> None:
        """Remove staff from shop"""
        result = await db.execute(
            select(ShopStaff).where(
                ShopStaff.user_id == user_id,
                ShopStaff.shop_id == shop_id
            )
        )
        staff = result.scalar_one_or_none()
        
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff assignment not found"
            )
        
        await db.delete(staff)
        await db.commit()
