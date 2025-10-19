from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.accounts.models.user import User
from src.accounts.schemas.user import UserCreate, UserRead, AddressCreate, AddressRead, Token
from src.accounts.controllers.user import create_user, create_address
from src.core.db import get_db
from src.accounts.jwt import create_access_token, create_refresh_token, decode_token, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserRead)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.post("/address", response_model=AddressRead)
def add_address(address: AddressCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return create_address(db, current_user.id, address)

@router.post("/login", response_model=Token)
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.verify_password(password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {"user_id": user.id, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    new_access_token = create_access_token({"user_id": payload["user_id"], "role": payload["role"]})
    return {"access_token": new_access_token, "refresh_token": refresh_token, "token_type": "bearer"}
