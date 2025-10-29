from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, date

from src.core.db import get_db
from src.accounts.permissions import IsManager, IsStaff
from src.accounts.models import User
from src.shop.controllers import SalesController
from src.shop.schemas import (
    SaleCreate, SaleResponse,
    ReturnCreate, ReturnUpdate, ReturnResponse, TodaysSalesResponse
)

router = APIRouter()


# ==================== Sales Routes ====================

@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def create_sale(
    sale_data: SaleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Create a new sale (Staff+)
    
    Automatically calculates totals, generates invoice number,
    and updates inventory.
    """
    sale = await SalesController.create_sale(db, sale_data, current_user.id)
    return sale


@router.get("/", response_model=List[SaleResponse])
async def get_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    shop_id: Optional[int] = Query(None, description="Filter by shop"),
    customer_id: Optional[int] = Query(None, description="Filter by customer"),
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[datetime] = Query(None, description="Filter from date"),
    end_date: Optional[datetime] = Query(None, description="Filter to date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Get list of sales with filters (Staff+)
    """
    sales = await SalesController.get_sales(
        db, skip, limit, shop_id, customer_id, status, start_date, end_date
    )
    return sales

@router.get("/today", response_model=TodaysSalesResponse)
async def get_todays_sales(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Get today's sales summary with details (Staff+)
    """
    result = await SalesController.get_todays_sales(db)
    return result


@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(
    sale_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Get sale details by ID (Staff+)
    """
    sale = await SalesController.get_sale(db, sale_id)
    return sale


@router.post("/{sale_id}/cancel", response_model=SaleResponse)
async def cancel_sale(
    sale_id: int,
    reason: Optional[str] = Query(None, description="Cancellation reason"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Cancel a sale and restore inventory (Manager+)
    """
    sale = await SalesController.cancel_sale(db, sale_id, reason)
    return sale


# ==================== Returns Routes ====================

@router.post("/returns/", response_model=ReturnResponse, status_code=status.HTTP_201_CREATED, tags=["Returns"])
async def create_return(
    return_data: ReturnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Create a product return request (Staff+)
    """
    product_return = await SalesController.create_return(db, return_data)
    return product_return


@router.get("/returns/", response_model=List[ReturnResponse], tags=["Returns"])
async def get_returns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsStaff())
):
    """
    Get list of returns (Staff+)
    """
    returns = await SalesController.get_returns(db, skip, limit, status)
    return returns


@router.put("/returns/{return_id}/process", response_model=ReturnResponse, tags=["Returns"])
async def process_return(
    return_id: int,
    return_update: ReturnUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Process (approve/reject) a return (Manager+)
    
    If approved, inventory will be restored automatically.
    """
    product_return = await SalesController.process_return(
        db, return_id, return_update, current_user.id
    )
    return product_return
