from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.accounts.models.address import Address

async def get_address(db: AsyncSession, address_id: int) -> Address | None:
    result = await db.execute(select(Address).where(Address.id == address_id))
    return result.scalars().first()

async def get_addresses(db: AsyncSession):
    result = await db.execute(select(Address))
    return result.scalars().all()

async def create_address(db: AsyncSession, address_data: dict) -> Address:
    address = Address(**address_data)
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address

async def update_address(db: AsyncSession, address: Address, updates: dict) -> Address:
    for key, value in updates.items():
        setattr(address, key, value)
    await db.commit()
    await db.refresh(address)
    return address

async def delete_address(db: AsyncSession, address: Address):
    await db.delete(address)
    await db.commit()
