from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.accounts.models.user import User
from src.accounts.security import hash_password

async def get_user(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_users(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()

async def create_user(db: AsyncSession, user_data: dict) -> User:
    hashed_password = hash_password(user_data.pop("password"))
    user = User(**user_data, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def update_user(db: AsyncSession, user: User, updates: dict) -> User:
    if "password" in updates:
        updates["hashed_password"] = hash_password(updates.pop("password"))
    for key, value in updates.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, user: User):
    await db.delete(user)
    await db.commit()
