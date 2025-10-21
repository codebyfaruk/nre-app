import pytest_asyncio
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.shop.models import Shop, Category, Product, Inventory, ShopStaff
from src.accounts.models import User, Role, UserRole
from src.accounts.security import hash_password
from src.accounts.jwt import create_access_token


# ==================== USER FIXTURES ====================

@pytest_asyncio.fixture
async def seed_roles(db_session):
    """Seed roles for testing"""
    roles_data = [
        {"name": "staff", "description": "Staff member"},
        {"name": "manager", "description": "Manager"},
        {"name": "admin", "description": "Administrator"},
        {"name": "superadmin", "description": "Super Administrator"}
    ]
    
    roles = []
    for role_data in roles_data:
        result = await db_session.execute(
            select(Role).where(Role.name == role_data["name"])
        )
        role = result.scalar_one_or_none()
        
        if not role:
            role = Role(**role_data)
            db_session.add(role)
        roles.append(role)
    
    await db_session.commit()
    return [{"name": r.name, "description": r.description} for r in roles]


@pytest_asyncio.fixture
async def test_user(db_session, seed_roles):
    """Create a test user with staff role"""
    # Check if user exists
    result = await db_session.execute(
        select(User).where(User.username == "testuser")
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=hash_password("Test@123"),
            is_active=True,
            is_staff=False
        )
        db_session.add(user)
        await db_session.flush()
        
        # Assign staff role
        result = await db_session.execute(
            select(Role).where(Role.name == "staff")
        )
        staff_role = result.scalar_one()
        
        user_role = UserRole(user_id=user.id, role_id=staff_role.id)
        db_session.add(user_role)
        
        await db_session.commit()
    
    # Reload with relationships
    result = await db_session.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(UserRole.role))
        .where(User.id == user.id)
    )
    return result.scalar_one()


@pytest_asyncio.fixture
async def test_manager(db_session, seed_roles):
    """Create a test manager user"""
    result = await db_session.execute(
        select(User).where(User.username == "testmanager")
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            username="testmanager",
            email="manager@example.com",
            password_hash=hash_password("Manager@123"),
            is_active=True,
            is_staff=True
        )
        db_session.add(user)
        await db_session.flush()
        
        # Assign manager role
        result = await db_session.execute(
            select(Role).where(Role.name == "manager")
        )
        manager_role = result.scalar_one()
        
        user_role = UserRole(user_id=user.id, role_id=manager_role.id)
        db_session.add(user_role)
        
        await db_session.commit()
    
    # Reload with relationships
    result = await db_session.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(UserRole.role))
        .where(User.id == user.id)
    )
    return result.scalar_one()


@pytest_asyncio.fixture
async def test_admin(db_session, seed_roles):
    """Create a test admin user"""
    result = await db_session.execute(
        select(User).where(User.username == "testadmin")
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            username="testadmin",
            email="admin@example.com",
            password_hash=hash_password("Admin@123"),
            is_active=True,
            is_staff=True
        )
        db_session.add(user)
        await db_session.flush()
        
        # Assign admin role
        result = await db_session.execute(
            select(Role).where(Role.name == "admin")
        )
        admin_role = result.scalar_one()
        
        user_role = UserRole(user_id=user.id, role_id=admin_role.id)
        db_session.add(user_role)
        
        await db_session.commit()
    
    # Reload with relationships
    result = await db_session.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(UserRole.role))
        .where(User.id == user.id)
    )
    return result.scalar_one()


@pytest_asyncio.fixture
async def test_superadmin(db_session, seed_roles):
    """Create a test superadmin user"""
    result = await db_session.execute(
        select(User).where(User.username == "testsuperadmin")
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            username="testsuperadmin",
            email="superadmin@example.com",
            password_hash=hash_password("SuperAdmin@123"),
            is_active=True,
            is_staff=True
        )
        db_session.add(user)
        await db_session.flush()
        
        # Assign superadmin role
        result = await db_session.execute(
            select(Role).where(Role.name == "superadmin")
        )
        superadmin_role = result.scalar_one()
        
        user_role = UserRole(user_id=user.id, role_id=superadmin_role.id)
        db_session.add(user_role)
        
        await db_session.commit()
    
    # Reload with relationships
    result = await db_session.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(UserRole.role))
        .where(User.id == user.id)
    )
    return result.scalar_one()


# ==================== AUTH HEADER FIXTURES ====================

@pytest_asyncio.fixture
async def auth_headers_user(test_user):
    """Get auth headers for test user (staff)"""
    token = create_access_token(
        data={
            "sub": str(test_user.id),
            "username": test_user.username,
            "roles": ["staff"]
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers_manager(test_manager):
    """Get auth headers for manager user"""
    token = create_access_token(
        data={
            "sub": str(test_manager.id),
            "username": test_manager.username,
            "roles": ["manager"]
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers_admin(test_admin):
    """Get auth headers for admin user"""
    token = create_access_token(
        data={
            "sub": str(test_admin.id),
            "username": test_admin.username,
            "roles": ["admin"]
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers_superadmin(test_superadmin):
    """Get auth headers for superadmin user"""
    token = create_access_token(
        data={
            "sub": str(test_superadmin.id),
            "username": test_superadmin.username,
            "roles": ["superadmin"]
        }
    )
    return {"Authorization": f"Bearer {token}"}


# ==================== SHOP FIXTURES ====================

@pytest_asyncio.fixture
async def test_shop(db_session):
    """Create a test shop"""
    shop = Shop(
        name="Test Shop",
        address="123 Test Street",
        city="Test City",
        state="Test State",
        country="India",
        phone="+91-1234567890",
        email="testshop@example.com",
        is_active=True
    )
    db_session.add(shop)
    await db_session.commit()
    await db_session.refresh(shop)
    return shop


@pytest_asyncio.fixture
async def test_shop_2(db_session):
    """Create a second test shop"""
    shop = Shop(
        name="Second Test Shop",
        address="456 Second Street",
        city="Another City",
        state="Another State",
        country="India",
        phone="+91-9876543210",
        email="shop2@example.com",
        is_active=True
    )
    db_session.add(shop)
    await db_session.commit()
    await db_session.refresh(shop)
    return shop


@pytest_asyncio.fixture
async def parent_category(db_session):
    """Create a parent test category"""
    category = Category(
        name="Electronics",
        slug="electronics",
        description="Electronic devices",
        is_active=True
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category


@pytest_asyncio.fixture
async def test_category(db_session, parent_category):
    """Create a test category with parent"""
    category = Category(
        name="Smartphones",
        slug="smartphones",
        description="Mobile phones and accessories",
        parent_id=parent_category.id,
        is_active=True
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category


@pytest_asyncio.fixture
async def test_product(db_session, test_category):
    """Create a test product"""
    product = Product(
        name="Test Smartphone",
        slug="test-smartphone",
        sku="TEST-PHONE-001",
        description="A test smartphone for testing",
        category_id=test_category.id,
        brand="TestBrand",
        model="Model X",
        price=Decimal("29999.00"),
        discount_price=Decimal("27999.00"),
        cost_price=Decimal("22000.00"),
        specifications='{"ram": "8GB", "storage": "128GB"}',
        warranty_months=12,
        is_active=True
    )
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(product)
    return product


@pytest_asyncio.fixture
async def test_product_2(db_session, test_category):
    """Create a second test product"""
    product = Product(
        name="Test Laptop",
        slug="test-laptop",
        sku="TEST-LAPTOP-001",
        description="A test laptop for testing",
        category_id=test_category.id,
        brand="TestBrand",
        model="Laptop Pro",
        price=Decimal("59999.00"),
        discount_price=Decimal("54999.00"),
        cost_price=Decimal("45000.00"),
        specifications='{"processor": "i7", "ram": "16GB"}',
        warranty_months=24,
        is_active=True
    )
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(product)
    return product


@pytest_asyncio.fixture
async def test_inventory(db_session, test_shop, test_product):
    """Create test inventory"""
    inventory = Inventory(
        product_id=test_product.id,
        shop_id=test_shop.id,
        quantity=100,
        reserved_quantity=0,
        min_stock_level=10,
        max_stock_level=500
    )
    db_session.add(inventory)
    await db_session.commit()
    await db_session.refresh(inventory)
    return inventory


@pytest_asyncio.fixture
async def test_inventory_2(db_session, test_shop, test_product_2):
    """Create second test inventory"""
    inventory = Inventory(
        product_id=test_product_2.id,
        shop_id=test_shop.id,
        quantity=50,
        reserved_quantity=5,
        min_stock_level=5,
        max_stock_level=200
    )
    db_session.add(inventory)
    await db_session.commit()
    await db_session.refresh(inventory)
    return inventory


@pytest_asyncio.fixture
async def assign_manager_to_shop(db_session, test_manager, test_shop):
    """Assign manager to test shop"""
    shop_staff = ShopStaff(
        user_id=test_manager.id,
        shop_id=test_shop.id,
        role="manager",
        is_active=True
    )
    db_session.add(shop_staff)
    await db_session.commit()
    return shop_staff
