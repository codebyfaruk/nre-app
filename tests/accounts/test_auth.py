import pytest
from fastapi import status


@pytest.mark.asyncio
class TestAuthRegistration:
    """Test user registration endpoint"""
    
    async def test_register_user_success(self, client, seed_roles):
        """Test successful user registration"""
        response = await client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "NewUser@123",
                "is_staff": False
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert data["is_active"] is True
        assert "password" not in data
        assert "password_hash" not in data
    
    async def test_register_duplicate_username(self, client, test_user, seed_roles):
        """Test registration with duplicate username"""
        response = await client.post(
            "/api/auth/register",  
            json={
                "username": "testuser",
                "email": "different@example.com",
                "password": "Test@123"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "username already registered" in response.json()["detail"].lower()
    
    async def test_register_duplicate_email(self, client, test_user, seed_roles):
        """Test registration with duplicate email"""
        response = await client.post(
            "/api/auth/register",  # ✅ Updated
            json={
                "username": "differentuser",
                "email": "test@example.com",
                "password": "Test@123"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email already registered" in response.json()["detail"].lower()
    
    async def test_register_invalid_email(self, client, seed_roles):
        """Test registration with invalid email"""
        response = await client.post(
            "/api/auth/register",  # ✅ Updated
            json={
                "username": "newuser",
                "email": "invalid-email",
                "password": "Test@123"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    
    async def test_register_short_password(self, client, seed_roles):
        """Test registration with short password"""
        response = await client.post(
            "/api/auth/register",  # ✅ Updated
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "short"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


@pytest.mark.asyncio
class TestAuthLogin:
    """Test user login endpoint"""
    
    async def test_login_success(self, client, test_user, seed_roles):
        """Test successful login"""
        response = await client.post(
            "/api/auth/login",  # ✅ Updated
            json={
                "username": "testuser",
                "password": "Test@123"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
    
    async def test_login_wrong_password(self, client, test_user, seed_roles):
        """Test login with wrong password"""
        response = await client.post(
            "/api/auth/login",  # ✅ Updated
            json={
                "username": "testuser",
                "password": "WrongPassword@123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "incorrect username or password" in response.json()["detail"].lower()
    
    async def test_login_nonexistent_user(self, client, seed_roles):
        """Test login with non-existent user"""
        response = await client.post(
            "/api/auth/login",  # ✅ Updated
            json={
                "username": "nonexistent",
                "password": "Test@123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    async def test_login_inactive_user(self, client, db_session, seed_roles):
        """Test login with inactive user"""
        from src.accounts.models import User
        from src.accounts.security import hash_password
        
        # Create inactive user
        inactive_user = User(
            username="inactive",
            email="inactive@example.com",
            password_hash=hash_password("Test@123"),
            is_active=False
        )
        db_session.add(inactive_user)
        await db_session.commit()
        
        response = await client.post(
            "/api/auth/login",  # ✅ Updated
            json={
                "username": "inactive",
                "password": "Test@123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
class TestAuthToken:
    """Test token-related endpoints"""
    
    async def test_get_current_user(self, client, test_user, auth_headers_user, seed_roles):
        """Test getting current user info"""
        response = await client.get(
            "/api/auth/me", 
            headers=auth_headers_user
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["is_active"] is True
    
    async def test_get_current_user_without_token(self, client):
        """Test getting current user without token"""
        response = await client.get("/api/auth/me")  # ✅ Updated
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    async def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    async def test_refresh_token(self, client, test_user, seed_roles):
        """Test refreshing access token"""
        # First login to get refresh token
        login_response = await client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "Test@123"
            }
        )
        login_data = login_response.json()
        
        refresh_token = login_data["refresh_token"]
        
        # Use refresh token to get new access token
        response = await client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == status.HTTP_200_OK
    
    async def test_refresh_token_invalid(self, client):
        """Test refreshing with invalid token"""
        response = await client.post(
            "/api/auth/refresh",  # ✅ Updated
            json={"refresh_token": "invalid_token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
