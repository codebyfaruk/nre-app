from fastapi import HTTPException, status
from src.accounts.models.user import User


class BasePermission:
    """Base class for permission system."""
    message = "You do not have permission to perform this action."

    def has_permission(self, user: User) -> bool:
        """Override this method in subclasses."""
        raise NotImplementedError

    def __call__(self, user: User):
        """Makes class usable as dependency."""
        if not self.has_permission(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=self.message
            )
        return True
