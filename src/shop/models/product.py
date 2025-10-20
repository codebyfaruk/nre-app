from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.db import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship for subcategories
    children = relationship("Category", backref="parent", remote_side=[id])

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    name = Column(String(100), nullable=False)
    stock_quantity = Column(Integer, default=0)
    purchase_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
