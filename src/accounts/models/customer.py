# src/accounts/models/customer.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.core.db import Base

class Address(Base):
    __tablename__ = "address"
    
    # Columns
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    
    # Relationships - STRING REFERENCE
    user = relationship("User", back_populates="addresses")
    
    def __repr__(self):
        return f"<Address(id={self.id}, city='{self.city}')>"


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"
    
    # Columns
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    loyalty_points = Column(Integer, default=0, nullable=False)
    preferred_address_id = Column(Integer, ForeignKey("address.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - STRING REFERENCES
    user = relationship("User", back_populates="customer_profile")
    preferred_address = relationship("Address", foreign_keys=[preferred_address_id], post_update=True)
    # Add to CustomerProfile class:
    sales = relationship(
        "Sale", 
        foreign_keys="Sale.customer_id", 
        back_populates="customer",
        lazy="selectin"
    )

    def __repr__(self):
        return f"<CustomerProfile(id={self.id}, full_name='{self.full_name}')>"
