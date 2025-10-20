from sqlalchemy import Column, Integer, String, ForeignKey
from src.core.db import Base

class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    phone = Column(String(20), nullable=True)
