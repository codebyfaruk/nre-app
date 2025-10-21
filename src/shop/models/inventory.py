from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.core.db import Base


class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)  # For pending orders
    min_stock_level = Column(Integer, default=10)
    max_stock_level = Column(Integer, default=1000)
    last_restocked_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="inventory", lazy="joined")
    shop = relationship("Shop", back_populates="inventory", lazy="joined")
    
    @property
    def available_quantity(self):
        """Available quantity = total - reserved"""
        return self.quantity - self.reserved_quantity
    
    @property
    def needs_restock(self):
        """Check if inventory needs restocking"""
        return self.quantity <= self.min_stock_level
    
    def __repr__(self):
        return f"<Inventory(product_id={self.product_id}, shop_id={self.shop_id}, qty={self.quantity})>"
