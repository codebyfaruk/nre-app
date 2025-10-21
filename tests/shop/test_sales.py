import pytest
from fastapi import status


@pytest.mark.asyncio
class TestSaleCreation:
    """Test sale creation"""
    
    async def test_create_sale(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test creating a sale"""
        response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [
                    {
                        "product_id": test_product.id,
                        "quantity": 2,
                        "unit_price": "27999.00",
                        "discount": "0.00"
                    }
                ]
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "invoice_number" in data
        assert data["shop_id"] == test_shop.id
        assert data["payment_method"] == "cash"
        assert data["status"] == "completed"
        assert len(data["items"]) == 1
        assert float(data["total_amount"]) > 0
    
    async def test_create_sale_multiple_items(self, client, test_shop, test_product, test_product_2, test_inventory, test_inventory_2, auth_headers_user, seed_roles):
        """Test creating sale with multiple items"""
        response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "card",
                "items": [
                    {
                        "product_id": test_product.id,
                        "quantity": 1,
                        "unit_price": "27999.00",
                        "discount": "0.00"
                    },
                    {
                        "product_id": test_product_2.id,
                        "quantity": 1,
                        "unit_price": "54999.00",
                        "discount": "1000.00"
                    }
                ]
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data["items"]) == 2
    
    async def test_create_sale_insufficient_stock(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test creating sale with insufficient stock"""
        response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [
                    {
                        "product_id": test_product.id,
                        "quantity": 200,  # More than available
                        "unit_price": "27999.00",
                        "discount": "0.00"
                    }
                ]
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "insufficient stock" in response.json()["detail"].lower()
    
    async def test_create_sale_with_customer(self, client, test_shop, test_product, test_inventory, test_user, auth_headers_user, seed_roles, db_session):
        """Test creating sale with customer"""
        # Create customer profile
        from src.accounts.models import CustomerProfile
        customer = CustomerProfile(
            user_id=test_user.id,
            full_name="Test Customer",
            phone="+91-9999999999"
        )
        db_session.add(customer)
        await db_session.commit()
        await db_session.refresh(customer)
        
        response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "customer_id": customer.id,
                "payment_method": "upi",
                "payment_reference": "UPI123456789",
                "items": [
                    {
                        "product_id": test_product.id,
                        "quantity": 1,
                        "unit_price": "27999.00",
                        "discount": "500.00"
                    }
                ]
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["customer_id"] == customer.id
        assert data["payment_reference"] == "UPI123456789"


@pytest.mark.asyncio
class TestSaleRetrieval:
    """Test sale retrieval"""
    
    async def test_get_sales(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test getting list of sales"""
        # Create a sale first
        await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [
                    {
                        "product_id": test_product.id,
                        "quantity": 1,
                        "unit_price": "27999.00",
                        "discount": "0.00"
                    }
                ]
            }
        )
        
        response = await client.get(
            "/api/sales/",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    async def test_get_sales_by_shop(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test filtering sales by shop"""
        # Create sale
        await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 1, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        
        response = await client.get(
            f"/api/sales/?shop_id={test_shop.id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for sale in data:
            assert sale["shop_id"] == test_shop.id
    
    async def test_get_sale_by_id(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test getting sale by ID"""
        # Create sale
        create_response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 1, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        sale_id = create_response.json()["id"]
        
        response = await client.get(
            f"/api/sales/{sale_id}",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sale_id


@pytest.mark.asyncio
class TestSaleCancellation:
    """Test sale cancellation"""
    
    async def test_cancel_sale(self, client, test_shop, test_product, test_inventory, auth_headers_manager, seed_roles):
        """Test cancelling a sale"""
        # Create sale
        create_response = await client.post(
            "/api/sales/",
            headers=auth_headers_manager,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 2, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        sale_id = create_response.json()["id"]
        
        # Cancel sale
        response = await client.post(
            f"/api/sales/{sale_id}/cancel?reason=Customer requested",
            headers=auth_headers_manager
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "cancelled"
    
    async def test_cancel_sale_as_staff(self, client, test_shop, test_product, test_inventory, auth_headers_user, auth_headers_manager, seed_roles):
        """Test cancelling sale as staff (should fail)"""
        # Create sale
        create_response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 1, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        sale_id = create_response.json()["id"]
        
        # Try to cancel as staff
        response = await client.post(
            f"/api/sales/{sale_id}/cancel",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
class TestReturns:
    """Test return functionality"""
    
    async def test_create_return(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test creating a return"""
        # Create sale first
        sale_response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 2, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        sale_id = sale_response.json()["id"]
        
        # Create return
        response = await client.post(
            "/api/sales/returns/",
            headers=auth_headers_user,
            json={
                "sale_id": sale_id,
                "product_id": test_product.id,
                "quantity": 1,
                "reason": "Product defective, not working as expected"
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "return_number" in data
        assert data["sale_id"] == sale_id
        assert data["quantity"] == 1
        assert data["status"] == "pending"
    
    async def test_create_return_excessive_quantity(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test creating return with quantity > purchased"""
        # Create sale
        sale_response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 1, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        sale_id = sale_response.json()["id"]
        
        # Try to return more than purchased
        response = await client.post(
            "/api/sales/returns/",
            headers=auth_headers_user,
            json={
                "sale_id": sale_id,
                "product_id": test_product.id,
                "quantity": 5,  # More than purchased
                "reason": "Test reason more than 10 characters"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    async def test_process_return_approve(self, client, test_shop, test_product, test_inventory, auth_headers_user, auth_headers_manager, seed_roles):
        """Test approving a return"""
        # Create sale
        sale_response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 2, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        sale_id = sale_response.json()["id"]
        
        # Create return
        return_response = await client.post(
            "/api/sales/returns/",
            headers=auth_headers_user,
            json={
                "sale_id": sale_id,
                "product_id": test_product.id,
                "quantity": 1,
                "reason": "Defective product needs replacement"
            }
        )
        return_id = return_response.json()["id"]
        
        # Approve return
        response = await client.put(
            f"/api/sales/returns/{return_id}/process",
            headers=auth_headers_manager,
            json={"status": "approved"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "approved"
        assert data["processed_by"] is not None
    
    async def test_process_return_as_staff(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test processing return as staff (should fail)"""
        # Create sale and return first
        sale_response = await client.post(
            "/api/sales/",
            headers=auth_headers_user,
            json={
                "shop_id": test_shop.id,
                "payment_method": "cash",
                "items": [{"product_id": test_product.id, "quantity": 1, "unit_price": "27999.00", "discount": "0.00"}]
            }
        )
        
        return_response = await client.post(
            "/api/sales/returns/",
            headers=auth_headers_user,
            json={
                "sale_id": sale_response.json()["id"],
                "product_id": test_product.id,
                "quantity": 1,
                "reason": "Test reason for return request"
            }
        )
        
        # Try to process as staff
        response = await client.put(
            f"/api/sales/returns/{return_response.json()['id']}/process",
            headers=auth_headers_user,
            json={"status": "approved"}
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    async def test_get_returns_list(self, client, test_shop, test_product, test_inventory, auth_headers_user, seed_roles):
        """Test getting list of returns"""
        response = await client.get(
            "/api/sales/returns/",
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
