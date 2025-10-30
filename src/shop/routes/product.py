from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.core.db import get_db
from src.accounts.permissions import IsAdmin, IsManager
from src.accounts.dependencies import get_current_user
from src.accounts.models import User
from src.shop.controllers import ProductController
from src.shop.schemas import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse
)

from fastapi import File, UploadFile
from src.core.file_upload import save_upload_file

router = APIRouter()


# Category Routes
@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, tags=["Categories"])
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Create a new category (Manager+)
    """
    category = await ProductController.create_category(db, category_data)
    return category


@router.get("/categories", response_model=List[CategoryResponse], tags=["Categories"])
async def get_categories(
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of categories
    """
    categories = await ProductController.get_categories(
        db=db,           # ✅ Use keyword arguments
        is_active=is_active
    )
    return categories


@router.get("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get category by ID
    """
    category = await ProductController.get_category(db, category_id)
    return category


@router.put("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Update category (Manager+)
    """
    category = await ProductController.update_category(db, category_id, category_data)
    return category


# Product Routes
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Create a new product (Manager+)
    """
    product = await ProductController.create_product(db, product_data)
    return product


@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name, SKU, or brand"),
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of products with filters
    """
    products = await ProductController.get_products(
        db, skip, limit, category_id, search, is_active
    )
    return products

@router.post("/upload-image", tags=["Products"])
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload product image"""
    try:
        file_url = await save_upload_file(file, folder="products")
        return {
            "success": True,
            "file_url": file_url,
            "message": "Image uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get product by ID
    """
    product = await ProductController.get_product(db, product_id)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsManager())
):
    """
    Update product (Manager+)
    """
    product = await ProductController.update_product(db, product_id, product_data)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(IsAdmin())
):
    """
    Delete product (Admin only)
    """
    await ProductController.delete_product(db, product_id)
