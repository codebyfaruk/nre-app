from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from decimal import Decimal
from datetime import datetime

from src.shop.models.sales import Sale, SaleItem
from src.shop.models.inventory import Inventory
from src.shop.models.product import Product
from src.shop.schemas.sales import SaleCreate


class SalesController:
    @staticmethod
    async def create_sale(db: AsyncSession, sale_data: SaleCreate, staff_id: int):
        """
        Create a new sale with items
        """
        try:
            # Calculate totals
            subtotal = Decimal("0.00")
            for item in sale_data.items:
                subtotal += Decimal(str(item.unit_price)) * item.quantity
            
            # Calculate tax (18% GST for example)
            tax_rate = Decimal("0.18")  
            tax_amount = subtotal * tax_rate
            total_amount = subtotal + tax_amount
            
            # Generate invoice number
            invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{datetime.now().microsecond}"
            
            # Create sale record
            sale = Sale(
                invoice_number=invoice_number,
                shop_id=sale_data.shop_id,
                customer_id=sale_data.customer_id,
                staff_id=staff_id,
                subtotal=subtotal,
                discount_amount=Decimal("0.00"),
                tax_amount=tax_amount,
                total_amount=total_amount,
                payment_method=sale_data.payment_method,
                payment_reference=sale_data.payment_reference,
                status="completed",
                notes=sale_data.notes,
                sale_date=datetime.now()
            )
            
            db.add(sale)
            await db.flush()  # Get the sale ID
            
            # Create sale items and update inventory
            for item_data in sale_data.items:
                # ✅ FIX: Fetch product details first
                product_stmt = select(Product).where(Product.id == item_data.product_id)
                product_result = await db.execute(product_stmt)
                product = product_result.scalar_one_or_none()
                
                if not product:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Product with ID {item_data.product_id} not found"
                    )
                
                # ✅ FIX: Create sale item with product_name and product_sku
                sale_item = SaleItem(
                    sale_id=sale.id,
                    product_id=item_data.product_id,
                    product_name=product.name,      # ✅ Add product name
                    product_sku=product.sku,         # ✅ Add product SKU
                    quantity=item_data.quantity,
                    unit_price=Decimal(str(item_data.unit_price)),
                    discount=Decimal(str(item_data.discount)),
                    total_price=Decimal(str(item_data.unit_price)) * item_data.quantity
                )
                db.add(sale_item)
                
                # Update inventory
                inventory_stmt = select(Inventory).where(
                    and_(
                        Inventory.product_id == item_data.product_id,
                        Inventory.shop_id == sale_data.shop_id
                    )
                )
                inventory_result = await db.execute(inventory_stmt)
                inventory = inventory_result.scalar_one_or_none()
                
                if not inventory:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Inventory not found for product {product.name} in shop {sale_data.shop_id}"
                    )
                
                if inventory.quantity < item_data.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for {product.name}. Available: {inventory.quantity}, Requested: {item_data.quantity}"
                    )
                
                # Decrease inventory quantity
                inventory.quantity -= item_data.quantity
                inventory.updated_at = datetime.now()
            
            await db.commit()
            await db.refresh(sale)
            
            # Load relationships
            await db.refresh(sale, ['items', 'shop', 'customer', 'staff'])
            
            return sale
            
        except HTTPException:
            await db.rollback()
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Error creating sale: {str(e)}")
        
        
    @staticmethod
    async def get_todays_sales(db: AsyncSession) -> dict:
        """Get today's sales with summary"""
        from datetime import date
        from sqlalchemy import select, func
        from sqlalchemy.orm import selectinload
        
        today = date.today()
        
        query = select(Sale).options(
            selectinload(Sale.items),
            selectinload(Sale.shop),
            selectinload(Sale.customer),
            selectinload(Sale.staff)
        ).where(
            func.date(Sale.sale_date) == today  # ✅ Use sale_date, not created_at
        ).order_by(Sale.sale_date.desc())
        
        result = await db.execute(query)
        todays_sales = result.scalars().all()
        
        # Calculate totals
        total_amount = sum(Decimal(str(sale.total_amount)) for sale in todays_sales)
        
        return {
            "date": today.isoformat(),
            "count": len(todays_sales),
            "total_amount": float(total_amount),
            "sales": [
                {
                    "id": sale.id,
                    "invoice_number": sale.invoice_number,
                    "customer_name": sale.customer.name if sale.customer else "Walk-in",
                    "total_amount": float(sale.total_amount),
                    "payment_method": sale.payment_method,
                    "sale_date": sale.sale_date.isoformat()
                }
                for sale in todays_sales
            ]
        }
