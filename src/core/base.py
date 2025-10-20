from src.core.db import Base # noqa: F401
from src.accounts.models.address import Address  # noqa: F401
from src.accounts.models.user import User  # noqa: F401

from src.shop.models.shop import Shop # noqa: F401
from src.shop.models.product import Product, Category # noqa: F401
from src.shop.models.sale import Sale, Purchase, DiscountRule # noqa: F401
from src.shop.models.activity import UserActivity # noqa: F401
