from sqlalchemy import select
from decimal import Decimal

from src.core.seeders.base import BaseSeeder
from src.shop.models import Product, Category, Inventory, Shop


class ProductSeeder(BaseSeeder):
    """Seeder for products and inventory"""
    
    async def seed(self):
        """Seed products"""
        print("📦 Seeding Products...")
        
        # Get category IDs
        result = await self.db.execute(select(Category))
        categories = {cat.slug: cat.id for cat in result.scalars().all()}
        
        # Get shop IDs
        shop_result = await self.db.execute(select(Shop))
        shops = list(shop_result.scalars().all())
        
        if not shops:
            print("  ⚠️  No shops found. Please seed shops first.")
            return
        
        products_data = [
            {
                "name": "Samsung Galaxy S23 Ultra",
                "slug": "samsung-galaxy-s23-ultra",
                "sku": "SAMS23U-256-BLK",
                "description": "Flagship Samsung smartphone with 256GB storage",
                "category_id": categories.get("android-phones"),
                "brand": "Samsung",
                "model": "Galaxy S23 Ultra",
                "price": Decimal("124999.00"),
                "discount_price": Decimal("119999.00"),
                "cost_price": Decimal("100000.00"),
                "specifications": '{"ram": "12GB", "storage": "256GB", "display": "6.8 inch", "camera": "200MP"}',
                "warranty_months": 12,
                "is_active": True
            },
            {
                "name": "iPhone 15 Pro Max",
                "slug": "iphone-15-pro-max",
                "sku": "APIP15PM-256-TIT",
                "description": "Latest Apple iPhone with A17 Pro chip",
                "category_id": categories.get("iphones"),
                "brand": "Apple",
                "model": "iPhone 15 Pro Max",
                "price": Decimal("159900.00"),
                "discount_price": Decimal("154900.00"),
                "cost_price": Decimal("135000.00"),
                "specifications": '{"ram": "8GB", "storage": "256GB", "display": "6.7 inch", "camera": "48MP"}',
                "warranty_months": 12,
                "is_active": True
            },
            {
                "name": "Dell XPS 15",
                "slug": "dell-xps-15",
                "sku": "DELL-XPS15-I7-512",
                "description": "Premium Dell laptop with Intel i7 processor",
                "category_id": categories.get("business-laptops"),
                "brand": "Dell",
                "model": "XPS 15",
                "price": Decimal("149999.00"),
                "discount_price": Decimal("139999.00"),
                "cost_price": Decimal("120000.00"),
                "specifications": '{"processor": "Intel i7", "ram": "16GB", "storage": "512GB SSD", "display": "15.6 inch 4K"}',
                "warranty_months": 24,
                "is_active": True
            },
            {
                "name": "ASUS ROG Strix G16",
                "slug": "asus-rog-strix-g16",
                "sku": "ASUS-ROG-G16-RTX4060",
                "description": "Gaming laptop with RTX 4060 graphics",
                "category_id": categories.get("gaming-laptops"),
                "brand": "ASUS",
                "model": "ROG Strix G16",
                "price": Decimal("129999.00"),
                "discount_price": Decimal("124999.00"),
                "cost_price": Decimal("105000.00"),
                "specifications": '{"processor": "Intel i7", "ram": "16GB", "storage": "1TB SSD", "gpu": "RTX 4060"}',
                "warranty_months": 24,
                "is_active": True
            },
            {
                "name": "Sony WH-1000XM5",
                "slug": "sony-wh1000xm5",
                "sku": "SONY-WH1000XM5-BLK",
                "description": "Premium noise-canceling headphones",
                "category_id": categories.get("headphones"),
                "brand": "Sony",
                "model": "WH-1000XM5",
                "price": Decimal("29990.00"),
                "discount_price": Decimal("27990.00"),
                "cost_price": Decimal("22000.00"),
                "specifications": '{"type": "Over-ear", "connectivity": "Bluetooth 5.2", "battery": "30 hours"}',
                "warranty_months": 12,
                "is_active": True
            },
            {
                "name": "Apple AirPods Pro 2",
                "slug": "apple-airpods-pro-2",
                "sku": "APPL-AIRPODS-PRO2",
                "description": "Active noise cancellation wireless earbuds",
                "category_id": categories.get("wireless-earbuds"),
                "brand": "Apple",
                "model": "AirPods Pro 2",
                "price": Decimal("26900.00"),
                "discount_price": Decimal("24900.00"),
                "cost_price": Decimal("20000.00"),
                "specifications": '{"type": "In-ear", "connectivity": "Bluetooth", "battery": "6 hours"}',
                "warranty_months": 12,
                "is_active": True
            },
            {
                "name": "Canon EOS R6 Mark II",
                "slug": "canon-eos-r6-mark-ii",
                "sku": "CANON-R6M2-BODY",
                "description": "Professional mirrorless camera",
                "category_id": categories.get("cameras"),
                "brand": "Canon",
                "model": "EOS R6 Mark II",
                "price": Decimal("239999.00"),
                "discount_price": Decimal("229999.00"),
                "cost_price": Decimal("200000.00"),
                "specifications": '{"sensor": "24.2MP Full-frame", "video": "4K 60fps", "stabilization": "8-stop IBIS"}',
                "warranty_months": 24,
                "is_active": True
            },
            {
                "name": "Spigen Tough Armor Case",
                "slug": "spigen-tough-armor-case",
                "sku": "SPIGEN-CASE-S23U",
                "description": "Heavy-duty protection case for Galaxy S23 Ultra",
                "category_id": categories.get("phone-cases"),
                "brand": "Spigen",
                "model": "Tough Armor",
                "price": Decimal("1999.00"),
                "discount_price": Decimal("1799.00"),
                "cost_price": Decimal("1200.00"),
                "specifications": '{"material": "TPU + Polycarbonate", "features": "Kickstand, Drop protection"}',
                "warranty_months": 6,
                "is_active": True
            },
            {
                "name": "Anker PowerPort III 65W",
                "slug": "anker-powerport-iii-65w",
                "sku": "ANKER-PP3-65W",
                "description": "Fast charging USB-C charger",
                "category_id": categories.get("chargers"),
                "brand": "Anker",
                "model": "PowerPort III",
                "price": Decimal("2999.00"),
                "discount_price": Decimal("2499.00"),
                "cost_price": Decimal("1800.00"),
                "specifications": '{"power": "65W", "ports": "USB-C x2, USB-A x1", "technology": "GaN"}',
                "warranty_months": 18,
                "is_active": True
            }
        ]
        
        for prod_data in products_data:
            result = await self.db.execute(
                select(Product).where(Product.sku == prod_data["sku"])
            )
            existing_product = result.scalar_one_or_none()
            
            if not existing_product:
                product = Product(**prod_data)
                self.db.add(product)
                await self.db.flush()
                
                # Create inventory for each shop
                for shop in shops:
                    inventory = Inventory(
                        product_id=product.id,
                        shop_id=shop.id,
                        quantity=50,  # Initial stock
                        reserved_quantity=0,
                        min_stock_level=10,
                        max_stock_level=500
                    )
                    self.db.add(inventory)
                
                print(f"  ✅ Created product: {prod_data['name']}")
            else:
                print(f"  ⏭️  Product already exists: {prod_data['name']}")
        
        await self.db.commit()
        print("✅ Products and inventory seeded successfully!\n")
