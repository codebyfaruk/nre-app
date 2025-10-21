from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.accounts.models import User, Role, UserRole
from src.accounts.schemas.user import UserUpdate, RoleCreate
from src.accounts.controllers.auth_controller import AuthController


class UserController:
    """Controller for user management operations"""
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """Get a user by ID"""
        result = await db.execute(
            select(User)
            .options(selectinload(User.roles).selectinload(UserRole.role))
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
        """Get a user by username"""
        result = await db.execute(
            select(User)
            .options(selectinload(User.roles).selectinload(UserRole.role))
            .where(User.username == username)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_users(
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[User]:
        """Get all users with pagination"""
        query = select(User).options(selectinload(User.roles).selectinload(UserRole.role))
        
        if is_active is not None:
            query = query.where(User.is_active == is_active)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def update_user(
        db: AsyncSession, 
        user_id: int, 
        user_data: UserUpdate
    ) -> User:
        """Update a user"""
        user = await UserController.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Hash password if provided
        if "password" in update_data:
            update_data["password_hash"] = AuthController.get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def delete_user(db: AsyncSession, user_id: int) -> bool:
        """Delete a user"""
        user = await UserController.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        await db.delete(user)
        await db.commit()
        
        return True
    
    @staticmethod
    async def assign_role(db: AsyncSession, user_id: int, role_id: int) -> UserRole:
        """Assign a role to a user"""
        # Check if user exists
        user = await UserController.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if role exists
        result = await db.execute(select(Role).where(Role.id == role_id))
        role = result.scalar_one_or_none()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        # Check if already assigned
        result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role already assigned to user"
            )
        
        user_role = UserRole(user_id=user_id, role_id=role_id)
        db.add(user_role)
        await db.commit()
        await db.refresh(user_role)
        
        return user_role
    
    @staticmethod
    async def remove_role(db: AsyncSession, user_id: int, role_id: int) -> bool:
        """Remove a role from a user"""
        result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id
            )
        )
        user_role = result.scalar_one_or_none()
        
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User role assignment not found"
            )
        
        await db.delete(user_role)
        await db.commit()
        
        return True
    
    @staticmethod
    async def create_role(db: AsyncSession, role_data: RoleCreate) -> Role:
        """Create a new role"""
        # Check if role name exists
        result = await db.execute(select(Role).where(Role.name == role_data.name))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists"
            )
        
        role = Role(**role_data.model_dump())
        db.add(role)
        await db.commit()
        await db.refresh(role)
        
        return role
    
    @staticmethod
    async def get_roles(db: AsyncSession) -> List[Role]:
        """Get all roles"""
        result = await db.execute(select(Role))
        return result.scalars().all()
