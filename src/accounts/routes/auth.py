from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.accounts.schemas.user import UserCreate, UserLogin, UserResponse
from src.accounts.controllers.auth_controller import AuthController
from src.accounts.dependencies import get_current_user
from src.accounts.models import User
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import HTTPException


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    user = await AuthController.register_user(db, user_data)
    return user


@router.post("/login")
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login and get access + refresh tokens
    
    Returns:
    - access_token: Short-lived token for API requests
    - refresh_token: Long-lived token to get new access tokens
    - token_type: Bearer
    - expires_in: Access token expiration in seconds
    """
    tokens = await AuthController.login(db, credentials)
    return tokens


@router.post("/refresh")
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    """
    Get new access token using refresh token
    
    Request body:
    {
        "refresh_token": "your_refresh_token"
    }
    """
    tokens = await AuthController.refresh_access_token(db, refresh_token)
    return tokens


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user details"""
    return current_user

@router.post("/token", summary="Login with username/password (OAuth2)")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    OAuth2 compatible token endpoint.
    
    This is used by Swagger UI when you click Authorize and enter username/password.
    """
    # Create UserLogin from form data
    credentials = UserLogin(
        username=form_data.username,
        password=form_data.password
    )
    
    # Authenticate user
    try:
        tokens = await AuthController.login(db, credentials)
    except HTTPException as e:
        # Re-raise with proper OAuth2 error format
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect username or password:: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Return in OAuth2 format (only access_token, not refresh_token)
    return {
        "access_token": tokens["access_token"],
        "token_type": "bearer"
    }
