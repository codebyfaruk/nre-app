# src/accounts/dependencies.py
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.core.db import get_db
from src.accounts.jwt import oauth2_scheme
from src.accounts.controllers.auth_controller import AuthController
from src.accounts.models.user import User


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    return await AuthController.get_current_user_from_token(db, token)


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure current user is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_staff_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Ensure current user is staff"""
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def require_roles(required_roles: List[str]):
    """Dependency to check if user has required roles"""
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        user_roles = [user_role.role.name for user_role in current_user.roles]
        
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required roles: {', '.join(required_roles)}"
            )
        
        return current_user
    
    return role_checker
