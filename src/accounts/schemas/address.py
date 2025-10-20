from pydantic import BaseModel
from datetime import datetime

class AddressBase(BaseModel):
    line1: str
    line2: str | None = None
    city: str
    state: str | None = None
    postal_code: str | None = None
    country: str
    is_shop: bool = False

class AddressCreate(AddressBase):
    pass

class AddressRead(AddressBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class AddressUpdate(AddressBase):
    pass
