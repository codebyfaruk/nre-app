"""
Shop permissions - uses accounts module permissions
Import from accounts.permissions for role-based access control
"""
from .roles import (
    IsSuperAdmin,
    IsAdmin,
    IsManager,
    IsStaff
)

__all__ = [
    "IsSuperAdmin",
    "IsAdmin",
    "IsManager",
    "IsStaff",
]
