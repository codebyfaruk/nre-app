from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.core.db import Base


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), nullable=False, unique=True, index=True)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand = Column(String(100))
    model = Column(String(100))
    price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2))
    cost_price = Column(Numeric(10, 2))
    specifications = Column(Text) 
    warranty_months = Column(Integer, default=0)
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="products", lazy="joined")
    inventory = relationship("Inventory", back_populates="product", cascade="all, delete-orphan", lazy="selectin")
    sale_items = relationship("SaleItem", back_populates="product", lazy="selectin")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', sku='{self.sku}')>"
