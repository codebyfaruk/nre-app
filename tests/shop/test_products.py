import pytest
from fastapi import status


@pytest.mark.asyncio
class TestCategoryCreation:
    """Test category creation"""
    
    async def test_create_category_as_manager(self, client, auth_headers_manager, seed_roles):
        """Test creating category as manager"""
        response = await client.post(
            "/api/products/categories",
            headers=auth_headers_manager,
            json={
                "name": "Tablets",
                "slug": "tablets",
                "description": "Tablet devices",
                "is_active": True
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Tablets"
        assert data["slug"] == "tablets"
        assert data["is_active"] is True
    
    async def test_create_subcategory(self, client, parent_category, auth_headers_manager, seed_roles):
        """Test creating subcategory"""
        response = await client.post(
            "/api/products/categories",
            headers=auth_headers_manager,
            json={
                "name": "Gaming Tablets",
                "slug": "gaming-tablets",
                "description": "High-performance tablets",
                "parent_id": parent_category.id,
                "is_active": True
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["parent_id"] == parent_category.id
    
    async def test_create_category_duplicate_slug(self, client, test_category, auth_headers_manager, seed_roles):
        """Test creating category with duplicate slug"""
        response = await client.post(
            "/api/products/categories",
            headers=auth_headers_manager,
            json={
                "name": "Different Name",
                "slug": "smartphones",  # Same as test_category
                "description": "Test",
                "is_active": True
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    async def test_create_category_as_staff(self, client, auth_headers_user, seed_roles):
        """Test creating category as staff (should fail)"""
        response = await client.post(
            "/api/products/categories",
            headers=auth_headers_user,
            json={
                "name": "Unauthorized Category",
                "slug": "unauthorized",
                "description": "Test"
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
class TestCategoryRetrieval:
    """Test category retrieval"""
    
    async def test_get_categories(self, client, test_category, parent_category, auth_headers_user, seed_roles):
        """Test getting list of categories"""
        response = await client.get(
            "/api/products/categories",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
    
    async def test_get_categories_by_parent(self, client, parent_category, test_category, auth_headers_user, seed_roles):
        """Test filtering categories by parent"""
        response = await client.get(
            f"/api/products/categories?parent_id={parent_category.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for cat in data:
            assert cat["parent_id"] == parent_category.id
    
    async def test_get_category_by_id(self, client, test_category, auth_headers_user, seed_roles):
        """Test getting category by ID"""
        response = await client.get(
            f"/api/products/categories/{test_category.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_category.id
        assert data["name"] == "Smartphones"


@pytest.mark.asyncio
class TestCategoryUpdate:
    """Test category update"""
    
    async def test_update_category(self, client, test_category, auth_headers_manager, seed_roles):
        """Test updating category"""
        response = await client.put(
            f"/api/products/categories/{test_category.id}",
            headers=auth_headers_manager,
            json={
                "name": "Updated Category",
                "description": "Updated description"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Category"
        assert data["description"] == "Updated description"


@pytest.mark.asyncio
class TestProductCreation:
    """Test product creation"""
    
    async def test_create_product_as_manager(self, client, test_category, auth_headers_manager, seed_roles):
        """Test creating product as manager"""
        response = await client.post(
            "/api/products/",
            headers=auth_headers_manager,
            json={
                "name": "New Smartphone",
                "slug": "new-smartphone",
                "sku": "NEW-PHONE-001",
                "description": "Latest smartphone",
                "category_id": test_category.id,
                "brand": "Samsung",
                "model": "Galaxy S24",
                "price": "89999.00",
                "discount_price": "84999.00",
                "cost_price": "70000.00",
                "warranty_months": 12,
                "is_active": True
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Smartphone"
        assert data["sku"] == "NEW-PHONE-001"
        assert float(data["price"]) == 89999.00
    
    async def test_create_product_duplicate_sku(self, client, test_product, auth_headers_manager, seed_roles):
        """Test creating product with duplicate SKU"""
        response = await client.post(
            "/api/products/",
            headers=auth_headers_manager,
            json={
                "name": "Different Product",
                "slug": "different-product",
                "sku": "TEST-PHONE-001",  # Same as test_product
                "description": "Test",
                "category_id": 1,
                "brand": "Test",
                "model": "Test",
                "price": "10000.00"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    async def test_create_product_as_staff(self, client, test_category, auth_headers_user, seed_roles):
        """Test creating product as staff (should fail)"""
        response = await client.post(
            "/api/products/",
            headers=auth_headers_user,
            json={
                "name": "Unauthorized Product",
                "slug": "unauthorized",
                "sku": "UNAUTH-001",
                "price": "1000.00"
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
class TestProductRetrieval:
    """Test product retrieval"""
    
    async def test_get_products(self, client, test_product, test_product_2, auth_headers_user, seed_roles):
        """Test getting list of products"""
        response = await client.get(
            "/api/products/",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
    
    async def test_get_products_by_category(self, client, test_category, test_product, auth_headers_user, seed_roles):
        """Test filtering products by category"""
        response = await client.get(
            f"/api/products/?category_id={test_category.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for product in data:
            assert product["category_id"] == test_category.id
    
    async def test_search_products(self, client, test_product, auth_headers_user, seed_roles):
        """Test searching products"""
        response = await client.get(
            "/api/products/?search=Test",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 1
    
    async def test_get_product_by_id(self, client, test_product, auth_headers_user, seed_roles):
        """Test getting product by ID"""
        response = await client.get(
            f"/api/products/{test_product.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_product.id
        assert data["sku"] == "TEST-PHONE-001"
    
    async def test_get_products_pagination(self, client, test_product, auth_headers_user, seed_roles):
        """Test product pagination"""
        response = await client.get(
            "/api/products/?skip=0&limit=1",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 1


@pytest.mark.asyncio
class TestProductUpdate:
    """Test product update"""
    
    async def test_update_product(self, client, test_product, auth_headers_manager, seed_roles):
        """Test updating product"""
        response = await client.put(
            f"/api/products/{test_product.id}",
            headers=auth_headers_manager,
            json={
                "name": "Updated Product Name",
                "price": "32999.00"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Product Name"
        assert float(data["price"]) == 32999.00
    
    async def test_update_product_as_staff(self, client, test_product, auth_headers_user, seed_roles):
        """Test updating product as staff (should fail)"""
        response = await client.put(
            f"/api/products/{test_product.id}",
            headers=auth_headers_user,
            json={"name": "Hacked Name"}
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
class TestProductDeletion:
    """Test product deletion"""
    
    async def test_delete_product_as_admin(self, client, test_product, auth_headers_admin, seed_roles):
        """Test deleting product as admin"""
        product_id = test_product.id
        
        response = await client.delete(
            f"/api/products/{product_id}",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify deletion
        get_response = await client.get(
            f"/api/products/{product_id}",
            headers=auth_headers_admin
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    async def test_delete_product_as_manager(self, client, test_product, auth_headers_manager, seed_roles):
        """Test deleting product as manager (should fail)"""
        response = await client.delete(
            f"/api/products/{test_product.id}",
            headers=auth_headers_manager
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
