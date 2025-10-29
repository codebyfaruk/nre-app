# src/shop/controllers/shop_controller.py - FIXED
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.shop.models import Shop, ShopStaff
from src.shop.schemas import ShopCreate, ShopUpdate, ShopStaffCreate
from src.core.app_logging import get_app_logger

logger = get_app_logger()


class ShopController:
    """Controller for shop management operations"""

    @staticmethod
    async def create_shop(db: AsyncSession, shop_data: ShopCreate) -> Shop:
        """Create a new shop"""
        try:
            logger.info(f"Creating new shop: {shop_data.name}")
            
            # Check if shop name already exists
            result = await db.execute(
                select(Shop).where(Shop.name == shop_data.name)
            )
            if result.scalar_one_or_none():
                logger.warning(f"Shop name already exists: {shop_data.name}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Shop with this name already exists"
                )

            shop = Shop(**shop_data.model_dump())
            db.add(shop)
            await db.commit()
            await db.refresh(shop)
            
            logger.info(f"Successfully created shop: {shop.name} (ID: {shop.id})")
            return shop
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating shop {shop_data.name}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create shop: {str(e)}"
            )

    @staticmethod
    async def get_shop(db: AsyncSession, shop_id: int) -> Shop:
        """Get shop by ID"""
        try:
            logger.info(f"Fetching shop ID: {shop_id}")
            
            result = await db.execute(
                select(Shop)
                .options(selectinload(Shop.staff))
                .where(Shop.id == shop_id)
            )
            shop = result.scalar_one_or_none()
            
            if not shop:
                logger.warning(f"Shop ID {shop_id} not found")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Shop not found"
                )
            
            logger.info(f"Retrieved shop: {shop.name}")
            return shop
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching shop ID {shop_id}: {str(e)}")
            raise

    @staticmethod
    async def get_shops(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[Shop]:
        """Get list of shops"""
        try:
            logger.info(f"Fetching shops (skip={skip}, limit={limit}, is_active={is_active})")
            
            query = select(Shop).offset(skip).limit(limit)
            if is_active is not None:
                query = query.where(Shop.is_active == is_active)
                
            result = await db.execute(query)
            shops = result.scalars().all()
            
            logger.info(f"Retrieved {len(shops)} shops")
            return shops
            
        except Exception as e:
            logger.error(f"Error fetching shops: {str(e)}")
            raise

    @staticmethod
    async def update_shop(
        db: AsyncSession,
        shop_id: int,
        shop_data: ShopUpdate
    ) -> Shop:
        """Update shop details"""
        try:
            logger.info(f"Updating shop ID: {shop_id}")
            
            shop = await ShopController.get_shop(db, shop_id)
            update_data = shop_data.model_dump(exclude_unset=True)
            
            for field, value in update_data.items():
                setattr(shop, field, value)
                
            await db.commit()
            await db.refresh(shop)
            
            logger.info(f"Successfully updated shop ID: {shop_id}")
            return shop
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating shop ID {shop_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update shop: {str(e)}"
            )

    @staticmethod
    async def delete_shop(db: AsyncSession, shop_id: int) -> None:
        """Delete shop"""
        try:
            logger.info(f"Deleting shop ID: {shop_id}")
            
            shop = await ShopController.get_shop(db, shop_id)
            await db.delete(shop)
            await db.commit()
            
            logger.info(f"Successfully deleted shop ID: {shop_id}")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting shop ID {shop_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete shop: {str(e)}"
            )

    @staticmethod
    async def assign_staff(
        db: AsyncSession,
        staff_data: ShopStaffCreate
    ) -> ShopStaff:
        """Assign staff to shop"""
        try:
            logger.info(f"Assigning user ID {staff_data.user_id} to shop ID {staff_data.shop_id}")
            
            # Check if already assigned
            result = await db.execute(
                select(ShopStaff).where(
                    ShopStaff.user_id == staff_data.user_id,
                    ShopStaff.shop_id == staff_data.shop_id
                )
            )
            if result.scalar_one_or_none():
                logger.warning(f"User {staff_data.user_id} already assigned to shop {staff_data.shop_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Staff already assigned to this shop"
                )

            staff_assignment = ShopStaff(**staff_data.model_dump())
            db.add(staff_assignment)
            await db.commit()
            await db.refresh(staff_assignment)
            
            logger.info(f"Successfully assigned staff ID {staff_assignment.id}")
            return staff_assignment
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error assigning staff: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to assign staff: {str(e)}"
            )

    @staticmethod
    async def remove_staff(
        db: AsyncSession,
        user_id: int,
        shop_id: int
    ) -> None:
        """Remove staff from shop"""
        try:
            logger.info(f"Removing user ID {user_id} from shop ID {shop_id}")
            
            result = await db.execute(
                select(ShopStaff).where(
                    ShopStaff.user_id == user_id,
                    ShopStaff.shop_id == shop_id
                )
            )
            staff = result.scalar_one_or_none()
            
            if not staff:
                logger.warning(f"Staff assignment not found: user {user_id}, shop {shop_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Staff assignment not found"
                )

            await db.delete(staff)
            await db.commit()
            
            logger.info(f"Successfully removed staff assignment")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error removing staff: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to remove staff: {str(e)}"
            )
