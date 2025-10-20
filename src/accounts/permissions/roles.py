from src.accounts.permissions.base import BasePermission
from src.accounts.models.user import RoleEnum


class IsAdmin(BasePermission):
    message = "Only admins can perform this action."

    def has_permission(self, user):
        return user.role == RoleEnum.ADMIN


class IsManager(BasePermission):
    message = "Only managers can perform this action."

    def has_permission(self, user):
        return user.role == RoleEnum.MANAGER


class IsSupplier(BasePermission):
    message = "Only suppliers can perform this action."

    def has_permission(self, user):
        return user.role == RoleEnum.SUPPLIER


class IsSalesRep(BasePermission):
    message = "Only sales representatives can perform this action."

    def has_permission(self, user):
        return user.role == RoleEnum.SALES_REP


class IsAdminOrManager(BasePermission):
    message = "Only admins or managers can perform this action."

    def has_permission(self, user):
        return user.role in [RoleEnum.ADMIN, RoleEnum.MANAGER]


class IsAdminOrSupplier(BasePermission):
    message = "Only admins or suppliers can perform this action."

    def has_permission(self, user):
        return user.role in [RoleEnum.ADMIN, RoleEnum.SUPPLIER]
