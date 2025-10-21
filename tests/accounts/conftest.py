import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.accounts.models import User, Role, UserRole
from src.accounts.security import hash_password
from src.accounts.jwt import create_access_token


@pytest_asyncio.fixture
async def seed_roles(db_session: AsyncSession):
    """Seed roles into test database"""
    roles_data = [
        {"name": "staff", "description": "Staff member"},
        {"name": "manager", "description": "Manager"},
        {"name": "admin", "description": "Administrator"},
        {"name": "superadmin", "description": "Super Administrator"},
    ]
    
    for role_data in roles_data:
        role = Role(**role_data)
        db_session.add(role)
    
    await db_session.commit()
    return roles_data


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession, seed_roles):
    """Create a test user with staff role"""
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=hash_password("Test@123"),
        is_active=True,
        is_staff=False,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # Assign staff role
    result = await db_session.execute(select(Role).where(Role.name == "staff"))
    staff_role = result.scalar_one()
    
    user_role = UserRole(user_id=user.id, role_id=staff_role.id)
    db_session.add(user_role)
    await db_session.commit()
    
    return user


@pytest_asyncio.fixture
async def test_manager(db_session: AsyncSession, seed_roles):
    """Create a test manager user"""
    user = User(
        username="manageruser",
        email="manager@example.com",
        password_hash=hash_password("Manager@123"),
        is_active=True,
        is_staff=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # Assign manager role
    result = await db_session.execute(select(Role).where(Role.name == "manager"))
    manager_role = result.scalar_one()
    
    user_role = UserRole(user_id=user.id, role_id=manager_role.id)
    db_session.add(user_role)
    await db_session.commit()
    
    return user


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession, seed_roles):
    """Create a test admin user"""
    user = User(
        username="adminuser",
        email="admin@example.com",
        password_hash=hash_password("Admin@123"),
        is_active=True,
        is_staff=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # Assign admin role
    result = await db_session.execute(select(Role).where(Role.name == "admin"))
    admin_role = result.scalar_one()
    
    user_role = UserRole(user_id=user.id, role_id=admin_role.id)
    db_session.add(user_role)
    await db_session.commit()
    
    return user


@pytest_asyncio.fixture
async def test_superadmin(db_session: AsyncSession, seed_roles):
    """Create a test superadmin user"""
    user = User(
        username="superadmin",
        email="superadmin@example.com",
        password_hash=hash_password("SuperAdmin@123"),
        is_active=True,
        is_staff=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # Assign superadmin role
    result = await db_session.execute(select(Role).where(Role.name == "superadmin"))
    superadmin_role = result.scalar_one()
    
    user_role = UserRole(user_id=user.id, role_id=superadmin_role.id)
    db_session.add(user_role)
    await db_session.commit()
    
    return user


@pytest.fixture
def auth_headers_user(test_user):
    """Get auth headers for test user"""
    token = create_access_token(
        data={
            "sub": str(test_user.id),
            "username": test_user.username,
            "roles": ["staff"]
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_manager(test_manager):
    """Get auth headers for manager user"""
    token = create_access_token(
        data={
            "sub": str(test_manager.id),
            "username": test_manager.username,
            "roles": ["manager"]
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_admin(test_admin):
    """Get auth headers for admin user"""
    token = create_access_token(
        data={
            "sub": str(test_admin.id),
            "username": test_admin.username,
            "roles": ["admin"]
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_superadmin(test_superadmin):
    """Get auth headers for superadmin user"""
    token = create_access_token(
        data={
            "sub": str(test_superadmin.id),
            "username": test_superadmin.username,
            "roles": ["superadmin"]
        }
    )
    return {"Authorization": f"Bearer {token}"}
