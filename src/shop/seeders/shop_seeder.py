from sqlalchemy import select

from src.core.seeders.base import BaseSeeder
from src.shop.models import Shop


class ShopSeeder(BaseSeeder):
    """Seeder for shops"""
    
    async def seed(self):
        """Seed shops"""
        print("🏪 Seeding Shops...")
        
        shops_data = [
            {
                "name": "Main Store - Mumbai",
                "address": "123 MG Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "phone": "+91-22-1234-5678",
                "email": "mumbai@electronicsshop.com",
                "is_active": True
            },
            {
                "name": "Branch Store - Delhi",
                "address": "456 Connaught Place",
                "city": "New Delhi",
                "state": "Delhi",
                "country": "India",
                "phone": "+91-11-9876-5432",
                "email": "delhi@electronicsshop.com",
                "is_active": True
            },
            {
                "name": "Outlet - Bangalore",
                "address": "789 MG Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "country": "India",
                "phone": "+91-80-5555-6666",
                "email": "bangalore@electronicsshop.com",
                "is_active": True
            }
        ]
        
        for shop_data in shops_data:
            # Check if shop exists
            result = await self.db.execute(
                select(Shop).where(Shop.name == shop_data["name"])
            )
            existing_shop = result.scalar_one_or_none()
            
            if not existing_shop:
                shop = Shop(**shop_data)
                self.db.add(shop)
                print(f"  ✅ Created shop: {shop_data['name']}")
            else:
                print(f"  ⏭️  Shop already exists: {shop_data['name']}")
        
        await self.db.commit()
        print("✅ Shops seeded successfully!\n")
