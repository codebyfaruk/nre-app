# src/shop/controllers/sales_controller.py - COMPLETE & FIXED

from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status as http_status

from src.core.app_logging import get_app_logger
from src.shop.models.sales import Sale, SaleItem, Return
from src.shop.models.inventory import Inventory
from src.shop.schemas.sales import SaleCreate

logger = get_app_logger()


class SalesController:
    """Controller for sales operations"""

    @staticmethod
    async def get_todays_sales(db: AsyncSession) -> dict:
        """Get today's sales with summary statistics"""
        try:
            logger.info("Fetching today's sales")
            
            today = date.today()
            
            # Query sales created today WITH relationships loaded
            query = (
                select(Sale)
                .options(
                    selectinload(Sale.items),
                    selectinload(Sale.shop),
                    selectinload(Sale.customer),
                    selectinload(Sale.staff)
                )
                .where(func.date(Sale.created_at) == today)
                .order_by(Sale.created_at.desc())
            )
            
            result = await db.execute(query)
            sales = result.scalars().all()
            
            # Calculate summary
            total_amount = sum(sale.total_amount for sale in sales)
            
            logger.info(f"Retrieved {len(sales)} sales for today, total amount: {total_amount}")
            
            return {
                "date": today,
                "total_sales_count": len(sales),
                "total_amount": float(total_amount),
                "sales": sales
            }
            
        except Exception as e:
            logger.error(f"Error fetching today's sales: {str(e)}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch today's sales: {str(e)}"
            )

    @staticmethod
    async def get_sales(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        shop_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Sale]:
        """Get sales with filters"""
        try:
            logger.info(f"Fetching sales (skip={skip}, limit={limit}, shop_id={shop_id})")
            
            query = select(Sale).options(
                selectinload(Sale.items),
                selectinload(Sale.shop),
                selectinload(Sale.customer),
                selectinload(Sale.staff)
            )
            
            # Apply filters
            if shop_id:
                query = query.where(Sale.shop_id == shop_id)
            
            if start_date:
                query = query.where(Sale.sale_date >= start_date)
            
            if end_date:
                query = query.where(Sale.sale_date <= end_date)
            
            query = query.order_by(Sale.created_at.desc()).offset(skip).limit(limit)
            
            result = await db.execute(query)
            sales = result.scalars().all()
            
            logger.info(f"Retrieved {len(sales)} sales")
            return sales
            
        except Exception as e:
            logger.error(f"Error fetching sales: {str(e)}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch sales: {str(e)}"
            )

    @staticmethod
    async def get_sale(db: AsyncSession, sale_id: int) -> Sale:
        """Get single sale by ID"""
        try:
            logger.info(f"Fetching sale {sale_id}")
            
            query = select(Sale).options(
                selectinload(Sale.items),
                selectinload(Sale.shop),
                selectinload(Sale.customer),
                selectinload(Sale.staff)
            ).where(Sale.id == sale_id)
            
            result = await db.execute(query)
            sale = result.scalar_one_or_none()
            
            if not sale:
                raise HTTPException(
                    status_code=http_status.HTTP_404_NOT_FOUND,
                    detail=f"Sale {sale_id} not found"
                )
            
            logger.info(f"Retrieved sale {sale_id}")
            return sale
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching sale {sale_id}: {str(e)}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch sale: {str(e)}"
            )

    @staticmethod
    async def create_sale(db: AsyncSession, sale_data: SaleCreate) -> Sale:
        """Create new sale and adjust inventory"""
        try:
            logger.info(f"Creating sale for shop {sale_data.shop_id}")
            
            # Calculate totals
            subtotal = sum(item.quantity * item.unit_price for item in sale_data.items)
            total_discount = sum(item.discount or 0 for item in sale_data.items)
            
            # Create sale
            sale = Sale(
                shop_id=sale_data.shop_id,
                customer_id=sale_data.customer_id,
                staff_id=sale_data.staff_id,
                subtotal=subtotal,
                discount_amount=total_discount,
                tax_amount=sale_data.tax_amount or 0,
                total_amount=subtotal - total_discount + (sale_data.tax_amount or 0),
                payment_method=sale_data.payment_method,
                payment_reference=sale_data.payment_reference,
                status=sale_data.status or "completed",
                notes=sale_data.notes
            )
            
            db.add(sale)
            await db.flush()  # Get sale ID
            
            # Create sale items and adjust inventory
            for item_data in sale_data.items:
                # Create sale item
                sale_item = SaleItem(
                    sale_id=sale.id,
                    product_id=item_data.product_id,
                    product_name=item_data.product_name,
                    product_sku=item_data.product_sku,
                    quantity=item_data.quantity,
                    unit_price=item_data.unit_price,
                    discount=item_data.discount or 0,
                    total_price=item_data.quantity * item_data.unit_price - (item_data.discount or 0)
                )
                db.add(sale_item)
                
                # Adjust inventory
                inventory_query = select(Inventory).where(
                    and_(
                        Inventory.shop_id == sale_data.shop_id,
                        Inventory.product_id == item_data.product_id
                    )
                )
                inventory_result = await db.execute(inventory_query)
                inventory = inventory_result.scalar_one_or_none()
                
                if inventory:
                    if inventory.quantity < item_data.quantity:
                        raise HTTPException(
                            status_code=http_status.HTTP_400_BAD_REQUEST,
                            detail=f"Insufficient stock for product {item_data.product_name}"
                        )
                    inventory.quantity -= item_data.quantity
                else:
                    raise HTTPException(
                        status_code=http_status.HTTP_404_NOT_FOUND,
                        detail=f"Inventory not found for product {item_data.product_name}"
                    )
            
            await db.commit()
            await db.refresh(sale)
            
            logger.info(f"Created sale {sale.id}")
            return sale
            
        except HTTPException:
            await db.rollback()
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating sale: {str(e)}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create sale: {str(e)}"
            )

    # @staticmethod
    # async def update_sale(db: AsyncSession, sale_id: int, sale_data: SaleUpdate) -> Sale:
    #     """Update sale"""
    #     try:
    #         logger.info(f"Updating sale {sale_id}")
            
    #         sale = await SalesController.get_sale(db, sale_id)
            
    #         # Update fields
    #         update_data = sale_data.model_dump(exclude_unset=True)
    #         for field, value in update_data.items():
    #             setattr(sale, field, value)
            
    #         await db.commit()
    #         await db.refresh(sale)
            
    #         logger.info(f"Updated sale {sale_id}")
    #         return sale
            
    #     except HTTPException:
    #         await db.rollback()
    #         raise
    #     except Exception as e:
    #         await db.rollback()
    #         logger.error(f"Error updating sale {sale_id}: {str(e)}")
    #         raise HTTPException(
    #             status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Failed to update sale: {str(e)}"
    #         )

    # @staticmethod
    # async def delete_sale(db: AsyncSession, sale_id: int) -> None:
    #     """Delete sale"""
    #     try:
    #         logger.info(f"Deleting sale {sale_id}")
            
    #         sale = await SalesController.get_sale(db, sale_id)
            
    #         await db.delete(sale)
    #         await db.commit()
            
    #         logger.info(f"Deleted sale {sale_id}")
            
    #     except HTTPException:
    #         await db.rollback()
    #         raise
    #     except Exception as e:
    #         await db.rollback()
    #         logger.error(f"Error deleting sale {sale_id}: {str(e)}")
    #         raise HTTPException(
    #             status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Failed to delete sale: {str(e)}"
    #         )

    @staticmethod
    async def get_returns(
        db: AsyncSession,
        return_status: Optional[str] = None
    ) -> List[Return]:
        """Get list of returns with optional status filter"""
        try:
            logger.info(f"Fetching returns (status={return_status})")
            
            # ✅ FIXED: Removed selectinload(Return.processed_by) - it's a column, not relationship
            query = select(Return).options(
                selectinload(Return.sale),
                selectinload(Return.product)
            )
            
            if return_status:
                query = query.where(Return.status == return_status)
                
            query = query.order_by(Return.return_date.desc())
            
            result = await db.execute(query)
            returns = result.scalars().all()
            
            logger.info(f"Retrieved {len(returns)} returns")
            return returns
            
        except Exception as e:
            logger.error(f"Error fetching returns: {str(e)}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch returns: {str(e)}"
            )

    @staticmethod
    async def get_return(db: AsyncSession, return_id: int) -> Return:
        """Get single return by ID"""
        try:
            logger.info(f"Fetching return {return_id}")
            
            query = select(Return).options(
                selectinload(Return.sale),
                selectinload(Return.product)
            ).where(Return.id == return_id)
            
            result = await db.execute(query)
            return_record = result.scalar_one_or_none()
            
            if not return_record:
                raise HTTPException(
                    status_code=http_status.HTTP_404_NOT_FOUND,
                    detail=f"Return {return_id} not found"
                )
            
            logger.info(f"Retrieved return {return_id}")
            return return_record
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching return {return_id}: {str(e)}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch return: {str(e)}"
            )
