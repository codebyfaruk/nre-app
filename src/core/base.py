from src.core.db import Base # noqa: F401

from src.accounts.models import User, Role, UserRole, CustomerProfile, Address # noqa: F401
from src.shop.models import Shop, ShopStaff, Category, Product, Inventory, Sale, SaleItem, Return # noqa: F401