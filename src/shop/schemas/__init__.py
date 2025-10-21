from .shop import (
    ShopBase, ShopCreate, ShopUpdate, ShopResponse,
    ShopStaffBase, ShopStaffCreate, ShopStaffResponse
)
from .category import CategoryBase, CategoryCreate, CategoryUpdate, CategoryResponse
from .product import ProductBase, ProductCreate, ProductUpdate, ProductResponse
from .inventory import InventoryBase, InventoryCreate, InventoryUpdate, InventoryResponse,StockAdjustment
from .sales import (
    SaleBase, SaleCreate, SaleResponse,
    SaleItemBase, SaleItemCreate, SaleItemResponse,
    ReturnBase, ReturnCreate, ReturnUpdate, ReturnResponse
)

__all__ = [
    # Shop
    "ShopBase", "ShopCreate", "ShopUpdate", "ShopResponse",
    "ShopStaffBase", "ShopStaffCreate", "ShopStaffResponse",
    # Category
    "CategoryBase", "CategoryCreate", "CategoryUpdate", "CategoryResponse",
    # Product
    "ProductBase", "ProductCreate", "ProductUpdate", "ProductResponse",
    # Inventory
    "InventoryBase", "InventoryCreate", "InventoryUpdate", "InventoryResponse","StockAdjustment",
    # Sales
    "SaleBase", "SaleCreate", "SaleResponse",
    "SaleItemBase", "SaleItemCreate", "SaleItemResponse",
    "ReturnBase", "ReturnCreate", "ReturnUpdate", "ReturnResponse",
]
