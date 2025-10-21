from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.accounts.schemas.customer import (
    CustomerProfileCreate,
    CustomerProfileUpdate,
    CustomerProfileResponse,
    AddressCreate,
    AddressUpdate,
    AddressResponse
)
from src.accounts.controllers.customer_controller import CustomerController
from src.accounts.models import User
from src.accounts.permissions.roles import IsAdmin, IsManager, IsStaff

router = APIRouter()


@router.post("/profiles", response_model=CustomerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_profile(
    profile_data: CustomerProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Create a customer profile"""
    profile = await CustomerController.create_customer_profile(db, profile_data)
    return profile


@router.get("/profiles/user/{user_id}", response_model=CustomerProfileResponse)
async def get_customer_profile_by_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Get customer profile by user ID"""
    # Users can view their own profile, managers+ can view all
    if user_id != current_user.id:
        from src.accounts.permissions.base import RoleChecker
        if not RoleChecker.has_role_or_higher(current_user, "manager"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view other profiles"
            )
    
    profile = await CustomerController.get_customer_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found"
        )
    return profile


@router.get("/profiles/{profile_id}", response_model=CustomerProfileResponse)
async def get_customer_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """Get customer profile by ID (Manager+ only)"""
    profile = await CustomerController.get_customer_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found"
        )
    return profile


@router.put("/profiles/{profile_id}", response_model=CustomerProfileResponse)
async def update_customer_profile(
    profile_id: int,
    profile_data: CustomerProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Update a customer profile"""
    profile = await CustomerController.update_customer_profile(db, profile_id, profile_data)
    return profile


@router.post("/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_data: AddressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Create an address"""
    # Users can only create addresses for themselves unless manager+
    if address_data.user_id != current_user.id:
        from src.accounts.permissions.base import RoleChecker
        if not RoleChecker.has_role_or_higher(current_user, "manager"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    address = await CustomerController.create_address(db, address_data)
    return address


@router.get("/addresses/user/{user_id}", response_model=List[AddressResponse])
async def get_user_addresses(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Get all addresses for a user"""
    # Users can view their own addresses, managers+ can view all
    if user_id != current_user.id:
        from src.accounts.permissions.base import RoleChecker
        if not RoleChecker.has_role_or_higher(current_user, "manager"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    addresses = await CustomerController.get_user_addresses(db, user_id)
    return addresses


@router.get("/addresses/{address_id}", response_model=AddressResponse)
async def get_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Get an address by ID"""
    address = await CustomerController.get_address_by_id(db, address_id)
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    return address


@router.put("/addresses/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: int,
    address_data: AddressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Update an address"""
    address = await CustomerController.update_address(db, address_id, address_data)
    return address


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsAdmin())
):
    """Delete an address (Admin+ only)"""
    await CustomerController.delete_address(db, address_id)
    return None
