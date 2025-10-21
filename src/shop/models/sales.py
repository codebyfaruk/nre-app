from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from src.core.db import Base


class SaleStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    ONLINE = "online"


class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), nullable=False, unique=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customer_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    staff_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_reference = Column(String(100))
    status = Column(SQLEnum(SaleStatus), nullable=False, default=SaleStatus.COMPLETED)
    
    notes = Column(Text)
    sale_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    shop = relationship("Shop", back_populates="sales", lazy="joined")
    customer = relationship("CustomerProfile", back_populates="sales", lazy="joined")
    staff = relationship("User", foreign_keys=[staff_id], back_populates="sales", lazy="joined")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan", lazy="selectin")
    returns = relationship("Return", back_populates="sale", cascade="all, delete-orphan", lazy="selectin")
    
    def __repr__(self):
        return f"<Sale(id={self.id}, invoice='{self.invoice_number}', total={self.total_amount})>"


class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    
    product_name = Column(String(200), nullable=False)
    product_sku = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2), default=0)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    sale = relationship("Sale", back_populates="items", lazy="joined")
    product = relationship("Product", back_populates="sale_items", lazy="joined")
    
    def __repr__(self):
        return f"<SaleItem(sale_id={self.sale_id}, product='{self.product_name}', qty={self.quantity})>"


class Return(Base):
    __tablename__ = "returns"
    
    id = Column(Integer, primary_key=True, index=True)
    return_number = Column(String(50), nullable=False, unique=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    quantity = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    refund_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, approved, rejected, completed
    processed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    return_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    sale = relationship("Sale", back_populates="returns", lazy="joined")
    product = relationship("Product", lazy="joined")
    processor = relationship("User", foreign_keys=[processed_by], back_populates="returns_processed", lazy="joined")
    
    def __repr__(self):
        return f"<Return(id={self.id}, return_number='{self.return_number}', status='{self.status}')>"
