import pytest
from fastapi import status


@pytest.mark.asyncio
class TestInventoryCreation:
    """Test inventory creation"""
    
    async def test_create_inventory_as_manager(self, client, test_shop, test_product, auth_headers_manager, seed_roles):
        """Test creating inventory as manager"""
        response = await client.post(
            "/api/inventory/",
            headers=auth_headers_manager,
            json={
                "product_id": test_product.id,
                "shop_id": test_shop.id,
                "quantity": 150,
                "reserved_quantity": 0,
                "min_stock_level": 20,
                "max_stock_level": 1000
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["product_id"] == test_product.id
        assert data["shop_id"] == test_shop.id
        assert data["quantity"] == 150
        assert data["available_quantity"] == 150
    
    async def test_create_duplicate_inventory(self, client, test_inventory, auth_headers_manager, seed_roles):
        """Test creating duplicate inventory (should fail)"""
        response = await client.post(
            "/api/inventory/",
            headers=auth_headers_manager,
            json={
                "product_id": test_inventory.product_id,
                "shop_id": test_inventory.shop_id,
                "quantity": 100
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    async def test_create_inventory_as_staff(self, client, test_shop, test_product, auth_headers_user, seed_roles):
        """Test creating inventory as staff (should fail)"""
        response = await client.post(
            "/api/inventory/",
            headers=auth_headers_user,
            json={
                "product_id": test_product.id,
                "shop_id": test_shop.id,
                "quantity": 50
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
class TestInventoryRetrieval:
    """Test inventory retrieval"""
    
    async def test_get_shop_inventory(self, client, test_shop, test_inventory, test_inventory_2, auth_headers_user, seed_roles):
        """Test getting inventory for a shop"""
        response = await client.get(
            f"/api/inventory/shop/{test_shop.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
    
    async def test_get_low_stock_items(self, client, test_shop, test_inventory, auth_headers_user, seed_roles, db_session):
        """Test getting low stock items"""
        # Update inventory to low stock
        test_inventory.quantity = 5  # Below min_stock_level of 10
        await db_session.commit()
        
        response = await client.get(
            f"/api/inventory/shop/{test_shop.id}?low_stock_only=true",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for item in data:
            assert item["needs_restock"] is True
    
    async def test_get_product_inventory(self, client, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test getting inventory for a product across all shops"""
        response = await client.get(
            f"/api/inventory/product/{test_product.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        for item in data:
            assert item["product_id"] == test_product.id
    
    async def test_get_inventory_by_id(self, client, test_inventory, auth_headers_user, seed_roles):
        """Test getting inventory by ID"""
        response = await client.get(
            f"/api/inventory/{test_inventory.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_inventory.id
        assert data["quantity"] == 100


@pytest.mark.asyncio
class TestInventoryUpdate:
    """Test inventory update"""
    
    async def test_update_inventory(self, client, test_inventory, auth_headers_manager, seed_roles):
        """Test updating inventory"""
        response = await client.put(
            f"/api/inventory/{test_inventory.id}",
            headers=auth_headers_manager,
            json={
                "min_stock_level": 15,
                "max_stock_level": 600
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["min_stock_level"] == 15
        assert data["max_stock_level"] == 600
    
    async def test_update_inventory_as_staff(self, client, test_inventory, auth_headers_user, seed_roles):
        """Test updating inventory as staff (should fail)"""
        response = await client.put(
            f"/api/inventory/{test_inventory.id}",
            headers=auth_headers_user,
            json={"quantity": 999}
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
class TestStockAdjustment:
    """Test stock adjustment"""
    
    async def test_add_stock(self, client, test_inventory, auth_headers_manager, seed_roles):
        """Test adding stock"""
        original_quantity = test_inventory.quantity
        
        response = await client.post(
            f"/api/inventory/{test_inventory.id}/adjust",
            headers=auth_headers_manager,
            json={
                "adjustment": 50,
                "reason": "Restocking"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity"] == original_quantity + 50
    
    async def test_remove_stock(self, client, test_inventory, auth_headers_manager, seed_roles):
        """Test removing stock"""
        original_quantity = test_inventory.quantity
        
        response = await client.post(
            f"/api/inventory/{test_inventory.id}/adjust",
            headers=auth_headers_manager,
            json={
                "adjustment": -20,
                "reason": "Damaged goods"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity"] == original_quantity - 20
    
    async def test_remove_stock_insufficient(self, client, test_inventory, auth_headers_manager, seed_roles):
        """Test removing more stock than available"""
        response = await client.post(
            f"/api/inventory/{test_inventory.id}/adjust",
            headers=auth_headers_manager,
            json={
                "adjustment": -200,  # More than available
                "reason": "Test"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
class TestStockReservation:
    """Test stock reservation"""
    
    async def test_reserve_stock(self, client, test_inventory, auth_headers_user, seed_roles):
        """Test reserving stock"""
        original_reserved = test_inventory.reserved_quantity
        
        response = await client.post(
            f"/api/inventory/{test_inventory.id}/reserve/10",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["reserved_quantity"] == original_reserved + 10
        assert data["available_quantity"] == test_inventory.quantity - (original_reserved + 10)
    
    async def test_reserve_stock_insufficient(self, client, test_inventory, auth_headers_user, seed_roles):
        """Test reserving more stock than available"""
        response = await client.post(
            f"/api/inventory/{test_inventory.id}/reserve/200",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    async def test_release_stock(self, client, test_inventory, auth_headers_user, seed_roles, db_session):
        """Test releasing reserved stock"""
        # First reserve some stock
        test_inventory.reserved_quantity = 20
        await db_session.commit()
        
        response = await client.post(
            f"/api/inventory/{test_inventory.id}/release/10",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["reserved_quantity"] == 10
