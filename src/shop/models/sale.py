from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from datetime import datetime
from src.core.db import Base


class Purchase(Base):
    __tablename__ = "purchase"

    id = Column(Integer, primary_key=True)
    supplier_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))  # updated
    quantity = Column(Integer, nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    total_cost = Column(Float, nullable=False)


class Sale(Base):
    __tablename__ = "sale"

    id = Column(Integer, primary_key=True)
    shop_id = Column(Integer, ForeignKey("shops.id"))  # updated
    product_id = Column(Integer, ForeignKey("products.id"))  # updated
    customer_id = Column(Integer, ForeignKey("users.id"))
    saler_id = Column(Integer, ForeignKey("users.id"))
    quantity = Column(Integer, nullable=False)
    discount_percent = Column(Float, default=0.0)
    sale_date = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Float, nullable=False)

class DiscountRule(Base):
    __tablename__ = "discountrule"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    shop_id = Column(Integer, ForeignKey("shops.id"))
    max_discount_percent = Column(Float, nullable=False)
