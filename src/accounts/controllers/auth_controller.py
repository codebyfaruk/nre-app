# src/accounts/controllers/auth_controller.py - FIXED
from datetime import timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.accounts.models import User, UserRole, Role
from src.accounts.schemas.user import UserCreate, UserLogin
from src.accounts.security import hash_password, verify_password
from src.accounts.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_HOURS
)
from src.core.app_logging import get_app_logger

logger = get_app_logger()


class AuthController:
    """Authentication controller for handling user authentication and JWT tokens"""

    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        username: str,
        password: str
    ) -> Optional[User]:
        """Authenticate a user by username and password"""
        try:
            logger.info(f"Authenticating user: {username}")
            
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(User.username == username)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                logger.warning(f"User not found: {username}")
                return None
                
            if not verify_password(password, user.password_hash):
                logger.warning(f"Invalid password for user: {username}")
                return None
                
            if not user.is_active:
                logger.warning(f"Inactive user attempted login: {username}")
                return None
                
            logger.info(f"Successfully authenticated user: {username}")
            return user
            
        except Exception as e:
            logger.error(f"Error authenticating user {username}: {str(e)}")
            raise

    @staticmethod
    async def register_user(db: AsyncSession, user_data: UserCreate) -> User:
        """Register a new user"""
        try:
            logger.info(f"Registering new user: {user_data.username}")
            
            # Check if username exists
            result = await db.execute(
                select(User).where(User.username == user_data.username)
            )
            if result.scalar_one_or_none():
                logger.warning(f"Username already exists: {user_data.username}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )

            # Check if email exists
            result = await db.execute(
                select(User).where(User.email == user_data.email)
            )
            if result.scalar_one_or_none():
                logger.warning(f"Email already exists: {user_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

            # Create user with hashed password
            hashed_password = hash_password(user_data.password)
            db_user = User(
                username=user_data.username,
                email=user_data.email,
                password_hash=hashed_password,
                is_staff=user_data.is_staff
            )

            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)

            # ✅ ADDED: Assign roles if role_names provided
            if hasattr(user_data, 'role_names') and user_data.role_names:
                logger.info(f"Assigning roles to user {user_data.username}: {user_data.role_names}")
                for role_name in user_data.role_names:
                    result = await db.execute(
                        select(Role).where(Role.name == role_name)
                    )
                    role = result.scalar_one_or_none()
                    if role:
                        user_role = UserRole(user_id=db_user.id, role_id=role.id)
                        db.add(user_role)
                    else:
                        logger.warning(f"Role '{role_name}' not found during registration")
                await db.commit()

            # Reload user with roles
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(User.id == db_user.id)
            )
            db_user = result.scalar_one()
            
            logger.info(f"Successfully registered user: {user_data.username} (ID: {db_user.id})")
            return db_user
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error registering user {user_data.username}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to register user: {str(e)}"
            )

    @staticmethod
    async def login(db: AsyncSession, credentials: UserLogin) -> dict:
        """Login user and return JWT tokens (access + refresh)"""
        try:
            user = await AuthController.authenticate_user(
                db,
                credentials.username,
                credentials.password
            )

            if not user:
                logger.warning(f"Failed login attempt for: {credentials.username}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Extract role names
            roles = [user_role.role.name for user_role in user.roles]

            # Create token payload
            token_data = {
                "sub": str(user.id),
                "username": user.username,
                "roles": roles
            }

            # Create access and refresh tokens
            access_token = create_access_token(
                data=token_data,
                expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            )

            refresh_token = create_refresh_token(
                data=token_data,
                expires_delta=timedelta(hours=REFRESH_TOKEN_EXPIRE_HOURS)
            )

            logger.info(f"User logged in successfully: {user.username}")
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during login for {credentials.username}: {str(e)}")
            raise

    @staticmethod
    async def refresh_access_token(
        db: AsyncSession,
        refresh_token: str
    ) -> dict:
        """Generate new access token using refresh token"""
        try:
            logger.info("Attempting to refresh access token")
            
            payload = decode_token(refresh_token)
            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired refresh token",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Verify token type
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            user_id = int(payload.get("sub"))

            # Verify user still exists and is active
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(User.id == user_id)
            )
            user = result.scalar_one_or_none()

            if not user or not user.is_active:
                logger.warning(f"Token refresh failed - user {user_id} not found or inactive")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Generate new access token
            roles = [user_role.role.name for user_role in user.roles]
            token_data = {
                "sub": str(user.id),
                "username": user.username,
                "roles": roles
            }

            access_token = create_access_token(
                data=token_data,
                expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            )

            logger.info(f"Access token refreshed for user ID: {user_id}")
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            raise

    @staticmethod
    async def get_current_user_from_token(
        db: AsyncSession,
        token: str
    ) -> User:
        """Get current user from JWT token"""
        try:
            payload = decode_token(token)
            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            user_id = int(payload.get("sub"))
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(User.id == user_id)
            )
            user = result.scalar_one_or_none()

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Inactive user"
                )

            return user
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting current user from token: {str(e)}")
            raise
