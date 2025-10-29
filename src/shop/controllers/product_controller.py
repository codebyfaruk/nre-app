# src/shop/controllers/product_controller.py - FIXED
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from src.shop.models import Product, Category
from src.shop.schemas import ProductCreate, ProductUpdate, CategoryCreate, CategoryUpdate
from src.core.app_logging import get_app_logger

logger = get_app_logger()


class ProductController:
    """Controller for product and category management"""

    # ==================== CATEGORY METHODS ====================

    @staticmethod
    async def create_category(
        db: AsyncSession,
        category_data: CategoryCreate
    ) -> Category:
        """Create a new category"""
        try:
            logger.info(f"Creating new category: {category_data.name}")
            
            # Check if slug exists
            result = await db.execute(
                select(Category).where(Category.slug == category_data.slug)
            )
            if result.scalar_one_or_none():
                logger.warning(f"Category slug already exists: {category_data.slug}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category with this slug already exists"
                )

            category = Category(**category_data.model_dump())
            db.add(category)
            await db.commit()
            await db.refresh(category)
            
            logger.info(f"Successfully created category: {category.name} (ID: {category.id})")
            return category
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating category {category_data.name}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create category: {str(e)}"
            )

    @staticmethod
    async def get_category(db: AsyncSession, category_id: int) -> Category:
        """Get category by ID"""
        try:
            logger.info(f"Fetching category ID: {category_id}")
            
            result = await db.execute(
                select(Category).where(Category.id == category_id)
            )
            category = result.scalar_one_or_none()
            
            if not category:
                logger.warning(f"Category ID {category_id} not found")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
            
            logger.info(f"Retrieved category: {category.name}")
            return category
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching category ID {category_id}: {str(e)}")
            raise

    @staticmethod
    async def get_categories(
        db: AsyncSession,
        is_active: Optional[bool] = None
    ) -> List[Category]:
        """Get all categories"""
        try:
            logger.info(f"Fetching categories (is_active={is_active})")
            
            query = select(Category)
            if is_active is not None:
                query = query.where(Category.is_active == is_active)
                
            result = await db.execute(query)
            categories = result.scalars().all()
            
            logger.info(f"Retrieved {len(categories)} categories")
            return categories
            
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            raise

    @staticmethod
    async def update_category(
        db: AsyncSession,
        category_id: int,
        category_data: CategoryUpdate
    ) -> Category:
        """Update category"""
        try:
            logger.info(f"Updating category ID: {category_id}")
            
            category = await ProductController.get_category(db, category_id)
            update_data = category_data.model_dump(exclude_unset=True)
            
            for field, value in update_data.items():
                setattr(category, field, value)
                
            await db.commit()
            await db.refresh(category)
            
            logger.info(f"Successfully updated category ID: {category_id}")
            return category
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating category ID {category_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update category: {str(e)}"
            )

    @staticmethod
    async def delete_category(db: AsyncSession, category_id: int) -> None:
        """Delete category"""
        try:
            logger.info(f"Deleting category ID: {category_id}")
            
            category = await ProductController.get_category(db, category_id)
            await db.delete(category)
            await db.commit()
            
            logger.info(f"Successfully deleted category ID: {category_id}")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting category ID {category_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete category: {str(e)}"
            )

    # ==================== PRODUCT METHODS ====================

    @staticmethod
    async def create_product(
        db: AsyncSession,
        product_data: ProductCreate
    ) -> Product:
        """Create a new product"""
        try:
            logger.info(f"Creating new product: {product_data.name}")
            
            # Check if SKU exists
            result = await db.execute(
                select(Product).where(Product.sku == product_data.sku)
            )
            if result.scalar_one_or_none():
                logger.warning(f"Product SKU already exists: {product_data.sku}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product with this SKU already exists"
                )

            product = Product(**product_data.model_dump())
            db.add(product)
            await db.commit()
            await db.refresh(product)
            
            logger.info(f"Successfully created product: {product.name} (ID: {product.id})")
            return product
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating product {product_data.name}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create product: {str(e)}"
            )

    @staticmethod
    async def get_product(db: AsyncSession, product_id: int) -> Product:
        """Get product by ID"""
        try:
            logger.info(f"Fetching product ID: {product_id}")
            
            result = await db.execute(
                select(Product)
                .options(selectinload(Product.category))
                .where(Product.id == product_id)
            )
            product = result.scalar_one_or_none()
            
            if not product:
                logger.warning(f"Product ID {product_id} not found")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found"
                )
            
            logger.info(f"Retrieved product: {product.name}")
            return product
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching product ID {product_id}: {str(e)}")
            raise

    @staticmethod
    async def get_products(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None
    ) -> List[Product]:
        """Get products with filters"""
        try:
            logger.info(f"Fetching products (skip={skip}, limit={limit}, category={category_id}, search={search})")
            
            query = select(Product).options(selectinload(Product.category))
            
            if category_id:
                query = query.where(Product.category_id == category_id)
            if is_active is not None:
                query = query.where(Product.is_active == is_active)
            if search:
                query = query.where(
                    or_(
                        Product.name.ilike(f"%{search}%"),
                        Product.sku.ilike(f"%{search}%")
                    )
                )
                
            query = query.offset(skip).limit(limit)
            result = await db.execute(query)
            products = result.scalars().all()
            
            logger.info(f"Retrieved {len(products)} products")
            return products
            
        except Exception as e:
            logger.error(f"Error fetching products: {str(e)}")
            raise

    @staticmethod
    async def update_product(
        db: AsyncSession,
        product_id: int,
        product_data: ProductUpdate
    ) -> Product:
        """Update product"""
        try:
            logger.info(f"Updating product ID: {product_id}")
            
            product = await ProductController.get_product(db, product_id)
            update_data = product_data.model_dump(exclude_unset=True)
            
            for field, value in update_data.items():
                setattr(product, field, value)
                
            await db.commit()
            await db.refresh(product)
            
            # Reload with category
            result = await db.execute(
                select(Product)
                .options(selectinload(Product.category))
                .where(Product.id == product_id)
            )
            product = result.scalar_one()
            
            logger.info(f"Successfully updated product ID: {product_id}")
            return product
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating product ID {product_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update product: {str(e)}"
            )

    @staticmethod
    async def delete_product(db: AsyncSession, product_id: int) -> None:
        """Delete product"""
        try:
            logger.info(f"Deleting product ID: {product_id}")
            
            product = await ProductController.get_product(db, product_id)
            await db.delete(product)
            await db.commit()
            
            logger.info(f"Successfully deleted product ID: {product_id}")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting product ID {product_id}: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete product: {str(e)}"
            )
