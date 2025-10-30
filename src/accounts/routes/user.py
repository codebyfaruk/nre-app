from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.accounts.schemas.user import UserResponse, UserUpdate, RoleCreate, RoleResponse
from src.accounts.controllers.user_controller import UserController
from src.accounts.models.user import User
from src.accounts.permissions.roles import IsAdmin, IsStaff, IsSuperAdmin

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsAdmin())
):
    """Get all users with pagination (Admin+ only)"""
    users = await UserController.get_users(db, skip=skip, limit=limit, is_active=is_active)
    return users


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsSuperAdmin())
):
    """Create a new role (SuperAdmin only)"""
    role = await UserController.create_role(db, role_data)
    return role


@router.get("/roles", response_model=List[RoleResponse])
async def get_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Get all roles"""
    roles = await UserController.get_roles(db)
    return roles


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Get a user by ID"""
    # Users can only view their own profile unless they're admin
    if user_id != current_user.id:
        # Check if user has admin privileges
        from src.accounts.permissions.base import RoleChecker
        if not RoleChecker.has_role_or_higher(current_user, "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    user = await UserController.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """Update a user"""
    # Users can only update their own profile unless they're admin
    if user_id != current_user.id:
        from src.accounts.permissions.base import RoleChecker
        if not RoleChecker.has_role_or_higher(current_user, "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    user = await UserController.update_user(db, user_id, user_data)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsAdmin())
):
    """Delete a user (Admin+ only)"""
    await UserController.delete_user(db, user_id)
    return None


@router.post("/{user_id}/roles/{role_id}", status_code=status.HTTP_201_CREATED)
async def assign_role_to_user(
    user_id: int,
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsSuperAdmin())
):
    """Assign a role to a user (SuperAdmin only)"""
    user_role = await UserController.assign_role(db, user_id, role_id)
    return {"message": "Role assigned successfully", "user_role_id": user_role.id}


@router.delete("/{user_id}/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role_from_user(
    user_id: int,
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsSuperAdmin())
):
    """Remove a role from a user (SuperAdmin only)"""
    await UserController.remove_role(db, user_id, role_id)
    return None
