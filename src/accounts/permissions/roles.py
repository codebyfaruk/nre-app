from fastapi import Depends, HTTPException, status
from src.accounts.models import User
from src.accounts.dependencies import get_current_active_user
from src.accounts.permissions.base import RoleChecker


class IsSuperAdmin:
    """
    SuperAdmin permission - highest level (Level 4).
    Only users with SuperAdmin role can access.
    
    Usage: user: User = Depends(IsSuperAdmin())
    """
    
    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if not RoleChecker.has_role_or_higher(current_user, "superadmin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This action requires SuperAdmin privileges"
            )
        return current_user


class IsAdmin:
    """
    Admin permission (Level 3).
    Users with Admin or SuperAdmin role can access.
    
    Usage: user: User = Depends(IsAdmin())
    """
    
    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if not RoleChecker.has_role_or_higher(current_user, "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This action requires Admin privileges or higher"
            )
        return current_user


class IsManager:
    """
    Manager permission (Level 2).
    Users with Manager, Admin, or SuperAdmin role can access.
    
    Usage: user: User = Depends(IsManager())
    """
    
    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if not RoleChecker.has_role_or_higher(current_user, "manager"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This action requires Manager privileges or higher"
            )
        return current_user


class IsStaff:
    """
    Staff permission - lowest level (Level 1).
    Any user with Staff, Manager, Admin, or SuperAdmin role can access.
    
    Usage: user: User = Depends(IsStaff())
    """
    
    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if not RoleChecker.has_role_or_higher(current_user, "staff"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This action requires Staff privileges or higher"
            )
        return current_user
