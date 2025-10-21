# tests/shop/test_shops.py
import pytest
from fastapi import status


@pytest.mark.asyncio
class TestShopCreation:
    """Test shop creation endpoints"""
    
    async def test_create_shop_as_admin(self, client, auth_headers_admin, seed_roles):
        """Test creating shop as admin"""
        response = await client.post(
            "/api/shops/",
            headers=auth_headers_admin,
            json={
                "name": "New Electronics Store",
                "address": "789 Commerce Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "phone": "+91-22-12345678",
                "email": "mumbai@electronicsshop.com",
                "is_active": True
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Electronics Store"
        assert data["city"] == "Mumbai"
        assert data["is_active"] is True
        assert "id" in data
    
    async def test_create_shop_as_manager(self, client, auth_headers_manager, seed_roles):
        """Test creating shop as manager (should fail)"""
        response = await client.post(
            "/api/shops/",
            headers=auth_headers_manager,
            json={
                "name": "Unauthorized Shop",
                "address": "123 Street",
                "city": "Delhi",
                "state": "Delhi",
                "country": "India",
                "phone": "+91-11-11111111",
                "email": "test@test.com"
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    async def test_create_shop_as_staff(self, client, auth_headers_user, seed_roles):
        """Test creating shop as staff (should fail)"""
        response = await client.post(
            "/api/shops/",
            headers=auth_headers_user,
            json={
                "name": "Another Shop",
                "address": "456 Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "country": "India",
                "phone": "+91-80-22222222",
                "email": "bangalore@test.com"
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    async def test_create_shop_duplicate_name(self, client, test_shop, auth_headers_admin, seed_roles):
        """Test creating shop with duplicate name"""
        response = await client.post(
            "/api/shops/",
            headers=auth_headers_admin,
            json={
                "name": "Test Shop",  # Same as test_shop
                "address": "Different Address",
                "city": "Different City",
                "state": "Different State",
                "country": "India",
                "phone": "+91-99-99999999",
                "email": "different@email.com"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.json()["detail"].lower()


@pytest.mark.asyncio
class TestShopRetrieval:
    """Test shop retrieval endpoints"""
    
    async def test_get_shops_list(self, client, test_shop, test_shop_2, auth_headers_user, seed_roles):
        """Test getting list of shops"""
        response = await client.get(
            "/api/shops/",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
    
    async def test_get_shops_with_pagination(self, client, test_shop, auth_headers_user, seed_roles):
        """Test getting shops with pagination"""
        response = await client.get(
            "/api/shops/?skip=0&limit=1",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 1
    
    async def test_get_active_shops_only(self, client, test_shop, auth_headers_admin, seed_roles):
        """Test filtering active shops"""
        # First, create an inactive shop
        await client.post(
            "/api/shops/",
            headers=auth_headers_admin,
            json={
                "name": "Inactive Shop",
                "address": "999 Street",
                "city": "City",
                "state": "State",
                "country": "India",
                "phone": "+91-99-88888888",
                "email": "inactive@shop.com",
                "is_active": False
            }
        )
        
        # Get only active shops
        response = await client.get(
            "/api/shops/?is_active=true",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for shop in data:
            assert shop["is_active"] is True
    
    async def test_get_shop_by_id(self, client, test_shop, auth_headers_user, seed_roles):
        """Test getting shop by ID"""
        response = await client.get(
            f"/api/shops/{test_shop.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_shop.id
        assert data["name"] == "Test Shop"
        assert data["email"] == "testshop@example.com"
    
    async def test_get_nonexistent_shop(self, client, auth_headers_user, seed_roles):
        """Test getting non-existent shop"""
        response = await client.get(
            "/api/shops/99999",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
class TestShopUpdate:
    """Test shop update endpoints"""
    
    async def test_update_shop_as_admin(self, client, test_shop, auth_headers_admin, seed_roles):
        """Test updating shop as admin"""
        response = await client.put(
            f"/api/shops/{test_shop.id}",
            headers=auth_headers_admin,
            json={
                "name": "Updated Shop Name",
                "city": "Updated City"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Shop Name"
        assert data["city"] == "Updated City"
        # Other fields should remain unchanged
        assert data["address"] == test_shop.address
    
    async def test_update_shop_deactivate(self, client, test_shop, auth_headers_admin, seed_roles):
        """Test deactivating shop"""
        response = await client.put(
            f"/api/shops/{test_shop.id}",
            headers=auth_headers_admin,
            json={"is_active": False}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_active"] is False
    
    async def test_update_shop_as_staff(self, client, test_shop, auth_headers_user, seed_roles):
        """Test updating shop as staff (should fail)"""
        response = await client.put(
            f"/api/shops/{test_shop.id}",
            headers=auth_headers_user,
            json={"name": "Hacked Name"}
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
class TestShopDeletion:
    """Test shop deletion endpoints"""
    
    async def test_delete_shop_as_admin(self, client, test_shop, auth_headers_admin, seed_roles):
        """Test deleting shop as admin"""
        shop_id = test_shop.id
        
        response = await client.delete(
            f"/api/shops/{shop_id}",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify shop is deleted
        get_response = await client.get(
            f"/api/shops/{shop_id}",
            headers=auth_headers_admin
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    async def test_delete_shop_as_manager(self, client, test_shop, auth_headers_manager, seed_roles):
        """Test deleting shop as manager (should fail)"""
        response = await client.delete(
            f"/api/shops/{test_shop.id}",
            headers=auth_headers_manager
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    async def test_delete_nonexistent_shop(self, client, auth_headers_admin, seed_roles):
        """Test deleting non-existent shop"""
        response = await client.delete(
            "/api/shops/99999",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
class TestShopStaffManagement:
    """Test shop staff assignment"""
    
    async def test_assign_staff_to_shop(self, client, test_shop, test_user, auth_headers_manager, seed_roles):
        """Test assigning staff to shop"""
        response = await client.post(
            "/api/shops/staff",
            headers=auth_headers_manager,
            json={
                "user_id": test_user.id,
                "shop_id": test_shop.id,
                "role": "staff"
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["user_id"] == test_user.id
        assert data["shop_id"] == test_shop.id
        assert data["role"] == "staff"
    
    async def test_assign_manager_to_shop(self, client, test_shop, test_manager, auth_headers_manager, seed_roles):
        """Test assigning manager to shop"""
        response = await client.post(
            "/api/shops/staff",
            headers=auth_headers_manager,
            json={
                "user_id": test_manager.id,
                "shop_id": test_shop.id,
                "role": "manager"
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["role"] == "manager"
    
    async def test_assign_duplicate_staff(self, client, test_shop, test_user, auth_headers_manager, seed_roles):
        """Test assigning same staff twice"""
        # First assignment
        await client.post(
            "/api/shops/staff",
            headers=auth_headers_manager,
            json={
                "user_id": test_user.id,
                "shop_id": test_shop.id,
                "role": "staff"
            }
        )
        
        # Try duplicate
        response = await client.post(
            "/api/shops/staff",
            headers=auth_headers_manager,
            json={
                "user_id": test_user.id,
                "shop_id": test_shop.id,
                "role": "staff"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    async def test_remove_staff_from_shop(self, client, test_shop, test_user, auth_headers_manager, seed_roles):
        """Test removing staff from shop"""
        # First assign
        await client.post(
            "/api/shops/staff",
            headers=auth_headers_manager,
            json={
                "user_id": test_user.id,
                "shop_id": test_shop.id,
                "role": "staff"
            }
        )
        
        # Then remove
        response = await client.delete(
            f"/api/shops/staff/{test_user.id}/shop/{test_shop.id}",
            headers=auth_headers_manager
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
    
    async def test_assign_staff_as_staff_user(self, client, test_shop, test_manager, auth_headers_user, seed_roles):
        """Test assigning staff as regular staff (should fail)"""
        response = await client.post(
            "/api/shops/staff",
            headers=auth_headers_user,
            json={
                "user_id": test_manager.id,
                "shop_id": test_shop.id,
                "role": "staff"
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
