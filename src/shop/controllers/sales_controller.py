from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, date
from decimal import Decimal

from src.shop.models import Sale, SaleItem, Return, Product, Inventory
from src.shop.schemas import SaleCreate, ReturnCreate, ReturnUpdate


class SalesController:
    """Controller for sales and returns management"""

    # ==================== TODAY'S SALES ====================
    @staticmethod
    async def get_todays_sales(db: AsyncSession) -> dict:
        """
        Get today's sales with summary statistics
        Returns:
            dict: Contains date, total_sales_count, total_amount, and sales list
        """
        today = date.today()
        
        # ✅ OPTIMIZED: Simple query without relationships
        query = (
            select(Sale)
            .where(func.date(Sale.created_at) == today)
            .order_by(Sale.created_at.desc())
        )
        
        result = await db.execute(query)
        todays_sales = result.scalars().all()
        
        # Calculate totals
        total_sales_count = len(todays_sales)
        total_amount = sum(
            sale.total_amount for sale in todays_sales
        ) if todays_sales else Decimal('0.00')
        
        return {
            "date": today,
            "total_sales_count": total_sales_count,
            "total_amount": total_amount,
            "sales": todays_sales
        }

    # ==================== INVOICE GENERATION ====================
    @staticmethod
    async def generate_invoice_number(db: AsyncSession) -> str:
        """Generate unique invoice number"""
        # Format: INV-YYYYMMDD-XXXXXX
        date_str = datetime.now().strftime("%Y%m%d")
        
        # Get count of sales today
        result = await db.execute(
            select(func.count(Sale.id)).where(
                func.date(Sale.sale_date) == datetime.now().date()
            )
        )
        count = result.scalar() or 0
        invoice_number = f"INV-{date_str}-{(count + 1):06d}"
        
        return invoice_number

    @staticmethod
    async def generate_return_number(db: AsyncSession) -> str:
        """Generate unique return number"""
        # Format: RET-YYYYMMDD-XXXX
        date_str = datetime.now().strftime("%Y%m%d")
        
        result = await db.execute(
            select(func.count(Return.id)).where(
                func.date(Return.return_date) == datetime.now().date()
            )
        )
        count = result.scalar() or 0
        return_number = f"RET-{date_str}-{(count + 1):04d}"
        
        return return_number

    # ==================== CREATE SALE ====================
    @staticmethod
    async def create_sale(
        db: AsyncSession,
        sale_data: SaleCreate,
        staff_id: int
    ) -> Sale:
        """Create a new sale with items"""
        # Generate invoice number
        invoice_number = await SalesController.generate_invoice_number(db)
        
        # Calculate totals
        subtotal = Decimal('0')
        sale_items_data = []
        
        for item in sale_data.items:
            # Get product details
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} not found"
                )
            
            # Check stock availability
            inventory_result = await db.execute(
                select(Inventory).where(
                    and_(
                        Inventory.product_id == item.product_id,
                        Inventory.shop_id == sale_data.shop_id
                    )
                )
            )
            inventory = inventory_result.scalar_one_or_none()
            
            if not inventory or inventory.available_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.name}"
                )
            
            # Calculate item total
            item_total = (item.unit_price * item.quantity) - item.discount
            subtotal += item_total
            
            # Store item data for later
            sale_items_data.append({
                'product': product,
                'inventory': inventory,
                'item_data': item,
                'item_total': item_total
            })
        
        # Calculate tax (example: 18% GST)
        tax_amount = subtotal * Decimal('0.18')
        discount_amount = Decimal('0')  # Can be added from sale_data if needed
        total_amount = subtotal + tax_amount - discount_amount
        
        # Create sale
        sale = Sale(
            invoice_number=invoice_number,
            shop_id=sale_data.shop_id,
            customer_id=sale_data.customer_id,
            staff_id=staff_id,
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            payment_method=sale_data.payment_method,
            payment_reference=sale_data.payment_reference,
            status="completed",
            notes=sale_data.notes
        )
        
        db.add(sale)
        await db.flush()  # Get sale.id
        
        # Create sale items and update inventory
        for item_data in sale_items_data:
            product = item_data['product']
            inventory = item_data['inventory']
            item = item_data['item_data']
            item_total = item_data['item_total']
            
            # Create sale item
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                quantity=item.quantity,
                unit_price=item.unit_price,
                discount=item.discount,
                total_price=item_total
            )
            db.add(sale_item)
            
            # Update inventory
            inventory.quantity -= item.quantity
        
        await db.commit()
        
        # Reload with relationships
        result = await db.execute(
            select(Sale)
            .options(selectinload(Sale.items))
            .where(Sale.id == sale.id)
        )
        
        return result.scalar_one()

    # ==================== GET SALES ====================
    @staticmethod
    async def get_sale(db: AsyncSession, sale_id: int) -> Sale:
        """Get single sale by ID with full details"""
        result = await db.execute(
            select(Sale)
            .options(
                selectinload(Sale.items),
                selectinload(Sale.customer),
                selectinload(Sale.staff),
                selectinload(Sale.shop)
            )
            .where(Sale.id == sale_id)
        )
        
        sale = result.scalar_one_or_none()
        if not sale:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sale not found"
            )
        
        return sale

    @staticmethod
    async def get_sales(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        shop_id: Optional[int] = None,
        customer_id: Optional[int] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Sale]:
        """Get list of sales with filters"""
        query = (
            select(Sale)
            .options(selectinload(Sale.items))
            .offset(skip)
            .limit(limit)
            .order_by(Sale.sale_date.desc())
        )
        
        # Apply filters
        if shop_id:
            query = query.where(Sale.shop_id == shop_id)
        if customer_id:
            query = query.where(Sale.customer_id == customer_id)
        if status:
            query = query.where(Sale.status == status)
        if start_date:
            query = query.where(Sale.sale_date >= start_date)
        if end_date:
            query = query.where(Sale.sale_date <= end_date)
        
        result = await db.execute(query)
        return result.scalars().all()

    # ==================== CANCEL SALE ====================
    @staticmethod
    async def cancel_sale(
        db: AsyncSession,
        sale_id: int,
        reason: Optional[str] = None
    ) -> Sale:
        """Cancel a sale and restore inventory"""
        sale = await SalesController.get_sale(db, sale_id)
        
        if sale.status == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sale is already cancelled"
            )
        
        # Restore inventory for each item
        for item in sale.items:
            inventory_result = await db.execute(
                select(Inventory).where(
                    and_(
                        Inventory.product_id == item.product_id,
                        Inventory.shop_id == sale.shop_id
                    )
                )
            )
            inventory = inventory_result.scalar_one_or_none()
            if inventory:
                inventory.quantity += item.quantity
        
        # Update sale status
        sale.status = "cancelled"
        if reason:
            sale.notes = f"{sale.notes or ''}\nCancellation Reason: {reason}"
        
        await db.commit()
        await db.refresh(sale)
        
        return sale

    # ==================== RETURNS ====================
    @staticmethod
    async def create_return(
        db: AsyncSession,
        return_data: ReturnCreate
    ) -> Return:
        """Create a product return"""
        # Verify sale exists
        sale = await SalesController.get_sale(db, return_data.sale_id)
        
        # Verify product was in the sale
        sale_item = None
        for item in sale.items:
            if item.product_id == return_data.product_id:
                sale_item = item
                break
        
        if not sale_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product not found in this sale"
            )
        
        # Check quantity
        if return_data.quantity > sale_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return quantity exceeds purchased quantity"
            )
        
        # Calculate refund amount
        refund_per_unit = (sale_item.total_price / sale_item.quantity)
        refund_amount = refund_per_unit * return_data.quantity
        
        # Generate return number
        return_number = await SalesController.generate_return_number(db)
        
        # Create return
        product_return = Return(
            return_number=return_number,
            sale_id=return_data.sale_id,
            product_id=return_data.product_id,
            quantity=return_data.quantity,
            reason=return_data.reason,
            refund_amount=refund_amount,
            status="pending"
        )
        
        db.add(product_return)
        await db.commit()
        await db.refresh(product_return)
        
        return product_return

    @staticmethod
    async def process_return(
        db: AsyncSession,
        return_id: int,
        return_update: ReturnUpdate,
        processor_id: int
    ) -> Return:
        """Process (approve/reject) a return"""
        result = await db.execute(
            select(Return)
            .options(selectinload(Return.sale))
            .where(Return.id == return_id)
        )
        product_return = result.scalar_one_or_none()
        
        if not product_return:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Return not found"
            )
        
        if product_return.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return has already been processed"
            )
        
        # Update return status
        product_return.status = return_update.status
        product_return.processed_by = processor_id
        product_return.processed_at = datetime.now()
        
        # If approved, restore inventory
        if return_update.status == "approved":
            inventory_result = await db.execute(
                select(Inventory).where(
                    and_(
                        Inventory.product_id == product_return.product_id,
                        Inventory.shop_id == product_return.sale.shop_id
                    )
                )
            )
            inventory = inventory_result.scalar_one_or_none()
            if inventory:
                inventory.quantity += product_return.quantity
        
        await db.commit()
        await db.refresh(product_return)
        
        return product_return

    @staticmethod
    async def get_returns(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[Return]:
        """Get list of returns"""
        query = (
            select(Return)
            .offset(skip)
            .limit(limit)
            .order_by(Return.return_date.desc())
        )
        
        if status:
            query = query.where(Return.status == status)
        
        result = await db.execute(query)
        return result.scalars().all()
