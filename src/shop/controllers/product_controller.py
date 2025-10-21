from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.shop.models import Product, Category
from src.shop.schemas import ProductCreate, ProductUpdate, CategoryCreate, CategoryUpdate


class ProductController:
    """Controller for product and category management"""
    
    # Category Methods
    @staticmethod
    async def create_category(
        db: AsyncSession,
        category_data: CategoryCreate
    ) -> Category:
        """Create a new category"""
        # Check if slug exists
        result = await db.execute(
            select(Category).where(Category.slug == category_data.slug)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )
        
        category = Category(**category_data.model_dump())
        db.add(category)
        await db.commit()
        await db.refresh(category)
        
        return category
    
    @staticmethod
    async def get_categories(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        parent_id: Optional[int] = None
    ) -> List[Category]:
        """Get list of categories"""
        query = select(Category).offset(skip).limit(limit)
        
        if parent_id is not None:
            query = query.where(Category.parent_id == parent_id)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_category(db: AsyncSession, category_id: int) -> Category:
        """Get category by ID"""
        result = await db.execute(
            select(Category)
            .options(selectinload(Category.products))
            .where(Category.id == category_id)
        )
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        return category
    
    @staticmethod
    async def update_category(
        db: AsyncSession,
        category_id: int,
        category_data: CategoryUpdate
    ) -> Category:
        """Update category"""
        category = await ProductController.get_category(db, category_id)
        
        update_data = category_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        await db.commit()
        await db.refresh(category)
        
        return category
    
    # Product Methods
    @staticmethod
    async def create_product(
        db: AsyncSession,
        product_data: ProductCreate
    ) -> Product:
        """Create a new product"""
        # Check if SKU exists
        result = await db.execute(
            select(Product).where(Product.sku == product_data.sku)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists"
            )
        
        product = Product(**product_data.model_dump())
        db.add(product)
        await db.commit()
        await db.refresh(product)
        
        return product
    
    @staticmethod
    async def get_product(db: AsyncSession, product_id: int) -> Product:
        """Get product by ID"""
        result = await db.execute(
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.inventory)
            )
            .where(Product.id == product_id)
        )
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return product
    
    @staticmethod
    async def get_products(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[Product]:
        """Get list of products with filters"""
        query = select(Product).offset(skip).limit(limit)
        
        if category_id is not None:
            query = query.where(Product.category_id == category_id)
        
        if search:
            query = query.where(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                    Product.brand.ilike(f"%{search}%")
                )
            )
        
        if is_active is not None:
            query = query.where(Product.is_active == is_active)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def update_product(
        db: AsyncSession,
        product_id: int,
        product_data: ProductUpdate
    ) -> Product:
        """Update product"""
        product = await ProductController.get_product(db, product_id)
        
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        await db.commit()
        await db.refresh(product)
        
        return product
    
    @staticmethod
    async def delete_product(db: AsyncSession, product_id: int) -> None:
        """Delete product"""
        product = await ProductController.get_product(db, product_id)
        await db.delete(product)
        await db.commit()
