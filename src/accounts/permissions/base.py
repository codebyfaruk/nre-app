from typing import List

from src.accounts.models import User
from src.accounts.permissions.hierarchy import RoleHierarchy


class RoleChecker:
    """
    Helper class to check user roles with hierarchy support.
    """
    
    @staticmethod
    def get_user_roles(user: User) -> List[str]:
        """Extract role names from user's roles relationship."""
        if not user.roles:
            return []
        return [user_role.role.name for user_role in user.roles]
    
    @staticmethod
    def has_role_or_higher(user: User, required_role: str) -> bool:
        """
        Check if user has the required role or any higher role in hierarchy.
        
        Example:
            - required_role = 'manager'
            - User with 'admin' role → True (admin > manager)
            - User with 'staff' role → False (staff < manager)
        """
        user_roles = RoleChecker.get_user_roles(user)
        return RoleHierarchy.has_sufficient_role(user_roles, required_role)
    
    @staticmethod
    def get_highest_role(user: User) -> str:
        """Get user's highest role in the hierarchy"""
        user_roles = RoleChecker.get_user_roles(user)
        highest = RoleHierarchy.get_user_highest_role(user_roles)
        return highest if highest else "none"
