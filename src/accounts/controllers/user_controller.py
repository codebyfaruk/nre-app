# src/accounts/controllers/user_controller.py - FIXED
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.accounts.models import User, Role, UserRole
from src.accounts.schemas.user import UserUpdate, RoleCreate
from src.accounts.security import hash_password  # ✅ FIXED: Import from security
from src.core.app_logging import get_app_logger

logger = get_app_logger()


class UserController:
    """Controller for user management operations"""

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """Get a user by ID"""
        try:
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
            if user:
                logger.info(f"Retrieved user ID: {user_id}")
            else:
                logger.warning(f"User ID {user_id} not found")
            return user
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {str(e)}")
            raise

    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
        """Get a user by username"""
        try:
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(User.username == username)
            )
            user = result.scalar_one_or_none()
            if user:
                logger.info(f"Retrieved user: {username}")
            else:
                logger.warning(f"User {username} not found")
            return user
        except Exception as e:
            logger.error(f"Error getting user by username {username}: {str(e)}")
            raise

    @staticmethod
    async def get_users(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[User]:
        """Get all users with pagination"""
        try:
            query = select(User).options(selectinload(User.roles).selectinload(UserRole.role))

            if is_active is not None:
                query = query.where(User.is_active == is_active)

            query = query.offset(skip).limit(limit)
            result = await db.execute(query)
            users = result.scalars().all()
            
            logger.info(f"Retrieved {len(users)} users (skip={skip}, limit={limit}, is_active={is_active})")
            return users
        except Exception as e:
            logger.error(f"Error getting users: {str(e)}")
            raise

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: int,
        user_data: UserUpdate
    ) -> User:
        """Update a user"""
        try:
            logger.info(f"Attempting to update user ID: {user_id}")
            
            user = await UserController.get_user_by_id(db, user_id)
            if not user:
                logger.error(f"User ID {user_id} not found for update")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            update_data = user_data.model_dump(exclude_unset=True)
            
            # ✅ FIXED: Hash password if provided using hash_password from security.py
            if "password" in update_data:
                logger.info(f"Hashing new password for user ID: {user_id}")
                update_data["password_hash"] = hash_password(update_data.pop("password"))

            # Handle role_names if provided
            if "role_names" in update_data:
                role_names = update_data.pop("role_names")
                logger.info(f"Updating roles for user ID {user_id}: {role_names}")
                
                # Remove existing roles
                await db.execute(
                    select(UserRole).where(UserRole.user_id == user_id)
                )
                for user_role in user.roles:
                    await db.delete(user_role)
                
                # Add new roles
                for role_name in role_names:
                    result = await db.execute(
                        select(Role).where(Role.name == role_name)
                    )
                    role = result.scalar_one_or_none()
                    if role:
                        new_user_role = UserRole(user_id=user_id, role_id=role.id)
                        db.add(new_user_role)
                    else:
                        logger.warning(f"Role '{role_name}' not found, skipping")

            # Update other fields
            for field, value in update_data.items():
                setattr(user, field, value)

            await db.commit()
            await db.refresh(user)
            
            # Reload with roles
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(User.id == user_id)
            )
            user = result.scalar_one()
            
            logger.info(f"Successfully updated user ID: {user_id}")
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating user ID {user_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update user: {str(e)}"
            )

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: int) -> bool:
        """Delete a user"""
        try:
            logger.info(f"Attempting to delete user ID: {user_id}")
            
            user = await UserController.get_user_by_id(db, user_id)
            if not user:
                logger.error(f"User ID {user_id} not found for deletion")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            await db.delete(user)
            await db.commit()
            
            logger.info(f"Successfully deleted user ID: {user_id}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting user ID {user_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete user: {str(e)}"
            )

    @staticmethod
    async def assign_role(db: AsyncSession, user_id: int, role_id: int) -> UserRole:
        """Assign a role to a user"""
        try:
            logger.info(f"Assigning role ID {role_id} to user ID {user_id}")
            
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
            
            logger.info(f"Successfully assigned role ID {role_id} to user ID {user_id}")
            return user_role
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error assigning role {role_id} to user {user_id}: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def remove_role(db: AsyncSession, user_id: int, role_id: int) -> bool:
        """Remove a role from a user"""
        try:
            logger.info(f"Removing role ID {role_id} from user ID {user_id}")
            
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
            
            logger.info(f"Successfully removed role ID {role_id} from user ID {user_id}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error removing role {role_id} from user {user_id}: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def create_role(db: AsyncSession, role_data: RoleCreate) -> Role:
        """Create a new role"""
        try:
            logger.info(f"Creating new role: {role_data.name}")
            
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
            
            logger.info(f"Successfully created role: {role.name} (ID: {role.id})")
            return role
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating role {role_data.name}: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def get_roles(db: AsyncSession) -> List[Role]:
        """Get all roles"""
        try:
            result = await db.execute(select(Role))
            roles = result.scalars().all()
            logger.info(f"Retrieved {len(roles)} roles")
            return roles
        except Exception as e:
            logger.error(f"Error getting roles: {str(e)}")
            raise
