from sqlalchemy.orm import Session
from src.accounts.models.user import User
from src.accounts.models.address import Address
from src.accounts.schemas.user import UserCreate, AddressCreate
from src.accounts.security import hash_password

def create_user(db: Session, user: UserCreate):
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_address(db: Session, user_id: int, address: AddressCreate):
    db_address = Address(**address.dict(), user_id=user_id)
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address
