from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.core.db import Base


class Shop(Base):
    __tablename__ = "shops"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    staff = relationship("ShopStaff", back_populates="shop", cascade="all, delete-orphan", lazy="selectin")
    inventory = relationship("Inventory", back_populates="shop", cascade="all, delete-orphan", lazy="selectin")
    sales = relationship("Sale", back_populates="shop", cascade="all, delete-orphan", lazy="selectin")
    
    def __repr__(self):
        return f"<Shop(id={self.id}, name='{self.name}')>"


class ShopStaff(Base):
    __tablename__ = "shop_staff"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False, default="staff")  # staff, manager
    is_active = Column(Boolean, default=True, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="shop_staff", lazy="joined")
    shop = relationship("Shop", back_populates="staff", lazy="joined")
    
    def __repr__(self):
        return f"<ShopStaff(user_id={self.user_id}, shop_id={self.shop_id})>"
