from enum import IntEnum
from typing import List, Optional

class RoleHierarchy(IntEnum):
    """
    Role hierarchy with integer levels.
    Higher numbers = higher privilege levels.
    Higher roles automatically inherit permissions of lower roles.
    """
    STAFF = 1
    MANAGER = 2
    ADMIN = 3
    SUPERADMIN = 4
    
    @classmethod
    def get_role_level(cls, role_name: str) -> Optional[int]:
        """Get the hierarchy level of a role by name (case-insensitive)"""
        role_name_upper = role_name.upper()
        try:
            return cls[role_name_upper].value
        except KeyError:
            return None
    
    @classmethod
    def has_sufficient_role(cls, user_roles: List[str], required_role: str) -> bool:
        """
        Check if user has a role at or above the required level.
        
        Example:
            - User has 'admin' role, required is 'manager' → True (admin > manager)
            - User has 'staff' role, required is 'admin' → False (staff < admin)
            - User has 'manager' role, required is 'manager' → True (equal)
        """
        required_level = cls.get_role_level(required_role)
        if required_level is None:
            return False
        
        # Get the highest role level the user has
        user_max_level = 0
        for role in user_roles:
            role_level = cls.get_role_level(role)
            if role_level and role_level > user_max_level:
                user_max_level = role_level
        
        # User's highest role must be >= required role level
        return user_max_level >= required_level
    
    @classmethod
    def get_user_highest_role(cls, user_roles: List[str]) -> Optional[str]:
        """Get the highest role a user has in the hierarchy"""
        max_level = 0
        highest_role = None
        
        for role in user_roles:
            role_level = cls.get_role_level(role)
            if role_level and role_level > max_level:
                max_level = role_level
                highest_role = role.lower()
        
        return highest_role
