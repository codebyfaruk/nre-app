from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.db import get_db
from src.accounts.schemas.address import AddressCreate, AddressRead, AddressUpdate
from src.accounts.controllers.address_controller import get_address, get_addresses, create_address, update_address, delete_address

router = APIRouter()

@router.post("/", response_model=AddressRead)
async def create_address_route(address: AddressCreate, db: AsyncSession = Depends(get_db)):
    return await create_address(db, address.model_dump())

@router.get("/", response_model=list[AddressRead])
async def list_addresses_route(db: AsyncSession = Depends(get_db)):
    return await get_addresses(db)

@router.get("/{address_id}", response_model=AddressRead)
async def get_address_route(address_id: int, db: AsyncSession = Depends(get_db)):
    address = await get_address(db, address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@router.put("/{address_id}", response_model=AddressRead)
async def update_address_route(address_id: int, updates: AddressUpdate, db: AsyncSession = Depends(get_db)):
    address = await get_address(db, address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return await update_address(db, address, updates.model_dump(exclude_unset=True))

@router.delete("/{address_id}")
async def delete_address_route(address_id: int, db: AsyncSession = Depends(get_db)):
    address = await get_address(db, address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    await delete_address(db, address)
    return {"detail": "Address deleted"}
