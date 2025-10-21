from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any


class BaseSeeder(ABC):
    """Base class for all seeders"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    @abstractmethod
    async def seed(self) -> None:
        """Implement seeding logic in subclasses"""
        pass
    
    async def check_exists(self, model, **filters) -> bool:
        """Check if a record exists"""
        result = await self.db.execute(
            select(model).filter_by(**filters)
        )
        return result.scalar_one_or_none() is not None
    
    async def create_if_not_exists(self, model, data: Dict[str, Any], unique_field: str = "name") -> Any:
        """Create a record if it doesn't exist"""
        exists = await self.check_exists(model, **{unique_field: data[unique_field]})
        
        if not exists:
            instance = model(**data)
            self.db.add(instance)
            await self.db.flush()
            print(f"✓ Created {model.__tablename__}: {data.get(unique_field)}")
            return instance
        else:
            print(f"⊘ Skipped {model.__tablename__}: {data.get(unique_field)} (already exists)")
            result = await self.db.execute(
                select(model).filter_by(**{unique_field: data[unique_field]})
            )
            return result.scalar_one()
