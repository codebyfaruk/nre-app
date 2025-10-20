from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.db import get_db
from src.accounts.schemas.user import UserCreate, UserRead, UserUpdate
from src.accounts.controllers.user_controller import get_user, get_users, create_user, update_user, delete_user

router = APIRouter()

@router.post("/", response_model=UserRead)
async def create_user_route(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, user.model_dump())

@router.get("/", response_model=list[UserRead])
async def list_users_route(db: AsyncSession = Depends(get_db)):
    return await get_users(db)

@router.get("/{user_id}", response_model=UserRead)
async def get_user_route(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserRead)
async def update_user_route(user_id: int, updates: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await update_user(db, user, updates.model_dump(exclude_unset=True))

@router.delete("/{user_id}")
async def delete_user_route(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await delete_user(db, user)
    return {"detail": "User deleted"}
