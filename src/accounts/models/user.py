from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from datetime import datetime
from enum import Enum
from src.core.db import Base


class RoleEnum(str, Enum):
    ADMIN = "Admin"
    SALE = "Saler"
    MANAGER = "Manager"
    CUSTOMER = "Customer"
    SUPPLIER = "Supplier"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    role = Column(SQLEnum(RoleEnum), nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
