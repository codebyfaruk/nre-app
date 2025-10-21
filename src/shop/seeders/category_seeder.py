from sqlalchemy import select

from src.core.seeders.base import BaseSeeder
from src.shop.models import Category


class CategorySeeder(BaseSeeder):
    """Seeder for product categories"""
    
    async def seed(self):
        """Seed categories"""
        print("📁 Seeding Categories...")
        
        # Parent categories
        parent_categories = [
            {
                "name": "Mobile Phones",
                "slug": "mobile-phones",
                "description": "Smartphones and feature phones",
                "is_active": True
            },
            {
                "name": "Laptops",
                "slug": "laptops",
                "description": "Laptops and notebooks",
                "is_active": True
            },
            {
                "name": "Accessories",
                "slug": "accessories",
                "description": "Electronic accessories",
                "is_active": True
            },
            {
                "name": "Audio",
                "slug": "audio",
                "description": "Headphones, speakers, and audio devices",
                "is_active": True
            },
            {
                "name": "Cameras",
                "slug": "cameras",
                "description": "Digital cameras and accessories",
                "is_active": True
            }
        ]
        
        created_parents = {}
        
        for cat_data in parent_categories:
            result = await self.db.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            existing_cat = result.scalar_one_or_none()
            
            if not existing_cat:
                category = Category(**cat_data)
                self.db.add(category)
                await self.db.flush()
                created_parents[cat_data["slug"]] = category.id
                print(f"  ✅ Created category: {cat_data['name']}")
            else:
                created_parents[cat_data["slug"]] = existing_cat.id
                print(f"  ⏭️  Category already exists: {cat_data['name']}")
        
        await self.db.commit()
        
        # Subcategories
        subcategories = [
            {
                "name": "Android Phones",
                "slug": "android-phones",
                "description": "Android smartphones",
                "parent_id": created_parents.get("mobile-phones"),
                "is_active": True
            },
            {
                "name": "iPhones",
                "slug": "iphones",
                "description": "Apple iPhones",
                "parent_id": created_parents.get("mobile-phones"),
                "is_active": True
            },
            {
                "name": "Gaming Laptops",
                "slug": "gaming-laptops",
                "description": "High-performance gaming laptops",
                "parent_id": created_parents.get("laptops"),
                "is_active": True
            },
            {
                "name": "Business Laptops",
                "slug": "business-laptops",
                "description": "Professional business laptops",
                "parent_id": created_parents.get("laptops"),
                "is_active": True
            },
            {
                "name": "Phone Cases",
                "slug": "phone-cases",
                "description": "Protective cases for phones",
                "parent_id": created_parents.get("accessories"),
                "is_active": True
            },
            {
                "name": "Chargers",
                "slug": "chargers",
                "description": "Mobile and laptop chargers",
                "parent_id": created_parents.get("accessories"),
                "is_active": True
            },
            {
                "name": "Wireless Earbuds",
                "slug": "wireless-earbuds",
                "description": "Bluetooth wireless earbuds",
                "parent_id": created_parents.get("audio"),
                "is_active": True
            },
            {
                "name": "Headphones",
                "slug": "headphones",
                "description": "Over-ear and on-ear headphones",
                "parent_id": created_parents.get("audio"),
                "is_active": True
            }
        ]
        
        for cat_data in subcategories:
            result = await self.db.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            existing_cat = result.scalar_one_or_none()
            
            if not existing_cat:
                category = Category(**cat_data)
                self.db.add(category)
                print(f"  ✅ Created subcategory: {cat_data['name']}")
            else:
                print(f"  ⏭️  Subcategory already exists: {cat_data['name']}")
        
        await self.db.commit()
        print("✅ Categories seeded successfully!\n")
