from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.accounts.models import CustomerProfile, Address
from src.accounts.schemas.customer import (
    CustomerProfileCreate,
    CustomerProfileUpdate,
    AddressCreate,
    AddressUpdate
)


class CustomerController:
    """Controller for customer profile and address management"""
    
    @staticmethod
    async def create_customer_profile(
        db: AsyncSession, 
        profile_data: CustomerProfileCreate
    ) -> CustomerProfile:
        """Create a customer profile"""
        # Check if profile already exists for user
        result = await db.execute(
            select(CustomerProfile).where(CustomerProfile.user_id == profile_data.user_id)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer profile already exists for this user"
            )
        
        profile = CustomerProfile(**profile_data.model_dump())
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
        return profile
    
    @staticmethod
    async def get_customer_profile_by_user_id(
        db: AsyncSession, 
        user_id: int
    ) -> Optional[CustomerProfile]:
        """Get customer profile by user ID"""
        result = await db.execute(
            select(CustomerProfile)
            .options(selectinload(CustomerProfile.preferred_address))
            .where(CustomerProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_customer_profile_by_id(
        db: AsyncSession, 
        profile_id: int
    ) -> Optional[CustomerProfile]:
        """Get customer profile by ID"""
        result = await db.execute(
            select(CustomerProfile)
            .options(selectinload(CustomerProfile.preferred_address))
            .where(CustomerProfile.id == profile_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_customer_profile(
        db: AsyncSession, 
        profile_id: int, 
        profile_data: CustomerProfileUpdate
    ) -> CustomerProfile:
        """Update a customer profile"""
        profile = await CustomerController.get_customer_profile_by_id(db, profile_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer profile not found"
            )
        
        update_data = profile_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(profile, field, value)
        
        await db.commit()
        await db.refresh(profile)
        
        return profile
    
    @staticmethod
    async def create_address(db: AsyncSession, address_data: AddressCreate) -> Address:
        """Create an address"""
        address = Address(**address_data.model_dump())
        db.add(address)
        await db.commit()
        await db.refresh(address)
        
        return address
    
    @staticmethod
    async def get_user_addresses(db: AsyncSession, user_id: int) -> List[Address]:
        """Get all addresses for a user"""
        result = await db.execute(
            select(Address).where(Address.user_id == user_id)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_address_by_id(db: AsyncSession, address_id: int) -> Optional[Address]:
        """Get an address by ID"""
        result = await db.execute(select(Address).where(Address.id == address_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_address(
        db: AsyncSession, 
        address_id: int, 
        address_data: AddressUpdate
    ) -> Address:
        """Update an address"""
        address = await CustomerController.get_address_by_id(db, address_id)
        
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        
        update_data = address_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(address, field, value)
        
        await db.commit()
        await db.refresh(address)
        
        return address
    
    @staticmethod
    async def delete_address(db: AsyncSession, address_id: int) -> bool:
        """Delete an address"""
        address = await CustomerController.get_address_by_id(db, address_id)
        
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        
        await db.delete(address)
        await db.commit()
        
        return True
