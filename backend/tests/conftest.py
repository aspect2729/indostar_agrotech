"""
Pytest configuration and fixtures for backend tests.
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from main import app
from app.config import settings
from app.database import get_database
from app.models.user import User
from app.services.token_service import token_service


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing."""
    from httpx import ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def db_client():
    """Create a MongoDB client for testing."""
    client = AsyncIOMotorClient(settings.mongodb_url)
    yield client
    client.close()


@pytest.fixture
async def test_db(db_client):
    """Get test database instance."""
    db = db_client[f"{settings.database_name}_test"]
    yield db
    # Cleanup: Drop test database after tests
    await db_client.drop_database(f"{settings.database_name}_test")


@pytest.fixture(autouse=True)
async def setup_database():
    """Setup database connection for tests."""
    from app.database import connect_to_mongodb, close_mongodb_connection
    await connect_to_mongodb()
    yield
    await close_mongodb_connection()


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "google_id": "test_google_id_123",
        "email": "test@example.com",
        "name": "Test User",
        "role": "consumer",
        "phone": "+919876543210",
        "addresses": []
    }


@pytest.fixture
def sample_consumer_user(sample_user_data):
    """Create a sample consumer user object."""
    user_data = sample_user_data.copy()
    user_data["_id"] = ObjectId()
    return User(**user_data)


@pytest.fixture
def sample_owner_user(sample_user_data):
    """Create a sample owner user object."""
    user_data = sample_user_data.copy()
    user_data["_id"] = ObjectId()
    user_data["email"] = "owner@indostar.com"
    user_data["role"] = "owner"
    return User(**user_data)


@pytest.fixture
def sample_distributor_user(sample_user_data):
    """Create a sample distributor user object."""
    user_data = sample_user_data.copy()
    user_data["_id"] = ObjectId()
    user_data["email"] = "distributor@example.com"
    user_data["role"] = "distributor"
    return User(**user_data)


@pytest.fixture
def consumer_access_token(sample_consumer_user):
    """Generate access token for consumer user."""
    return token_service.create_access_token(sample_consumer_user)


@pytest.fixture
def owner_access_token(sample_owner_user):
    """Generate access token for owner user."""
    return token_service.create_access_token(sample_owner_user)


@pytest.fixture
def distributor_access_token(sample_distributor_user):
    """Generate access token for distributor user."""
    return token_service.create_access_token(sample_distributor_user)


@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "name": "Organic Jaggery",
        "category": "jaggery",
        "description": "Pure organic jaggery from Karnataka",
        "images": ["https://example.com/jaggery.jpg"],
        "price": {
            "consumer": 150.0,
            "distributor": 120.0
        },
        "unit": "kg",
        "nutritional_info": {
            "calories": 383,
            "protein": 0.4,
            "carbohydrates": 98.0,
            "fat": 0.1
        },
        "inter_state_delivery": True,
        "is_active": True
    }


@pytest.fixture
def sample_address_data():
    """Sample address data for testing."""
    return {
        "type": "shipping",
        "street": "123 Test Street",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560001",
        "is_default": True
    }


@pytest.fixture
async def db(db_client):
    """Get database instance for integration tests."""
    db = db_client[f"{settings.database_name}_test"]
    
    # Override the database dependency
    async def override_get_database():
        return db
    
    app.dependency_overrides[get_database] = override_get_database
    
    yield db
    
    # Cleanup
    app.dependency_overrides.clear()
    await db_client.drop_database(f"{settings.database_name}_test")


@pytest.fixture
async def sample_products(db):
    """Create sample products in the database for testing."""
    products = [
        {
            "_id": ObjectId(),
            "name": "Organic Jaggery",
            "category": "jaggery",
            "description": "Pure organic jaggery from Karnataka",
            "images": ["jaggery.jpg"],
            "price": {"consumer": 150.0, "distributor": 120.0},
            "unit": "kg",
            "inter_state_delivery": True,
            "is_active": True
        },
        {
            "_id": ObjectId(),
            "name": "Cold Pressed Coconut Oil",
            "category": "oil",
            "description": "100% pure cold pressed coconut oil",
            "images": ["coconut_oil.jpg"],
            "price": {"consumer": 300.0, "distributor": 250.0},
            "unit": "liter",
            "inter_state_delivery": True,
            "is_active": True
        },
        {
            "_id": ObjectId(),
            "name": "Spicy Chutney Powder",
            "category": "chutney_powder",
            "description": "Traditional spicy chutney powder",
            "images": ["chutney.jpg"],
            "price": {"consumer": 80.0, "distributor": 65.0},
            "unit": "250g",
            "inter_state_delivery": False,
            "is_active": True
        },
        {
            "_id": ObjectId(),
            "name": "Mango Pickle",
            "category": "pickles",
            "description": "Homemade mango pickle",
            "images": ["pickle.jpg"],
            "price": {"consumer": 120.0, "distributor": 100.0},
            "unit": "500g",
            "inter_state_delivery": False,
            "is_active": True
        },
        {
            "_id": ObjectId(),
            "name": "Fresh Buffalo Milk",
            "category": "milk",
            "description": "Fresh buffalo milk",
            "images": ["milk.jpg"],
            "price": {"consumer": 60.0, "distributor": 50.0},
            "unit": "liter",
            "inter_state_delivery": False,
            "is_active": True
        }
    ]
    
    await db.products.insert_many(products)
    
    # Create inventory for each product
    inventory_items = [
        {
            "product_id": product["_id"],
            "quantity": 100,
            "unit": product["unit"],
            "low_stock_threshold": 10
        }
        for product in products
    ]
    await db.inventory.insert_many(inventory_items)
    
    return products


@pytest.fixture
async def consumer_token(client: AsyncClient, db):
    """Create a consumer user and return their access token."""
    response = await client.post(
        "/api/auth/dev/login",
        json={
            "email": "consumer_test@example.com",
            "name": "Consumer Test",
            "role": "consumer"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
async def distributor_token(client: AsyncClient, db):
    """Create a distributor user and return their access token."""
    response = await client.post(
        "/api/auth/dev/login",
        json={
            "email": "distributor_test@example.com",
            "name": "Distributor Test",
            "role": "distributor"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
async def owner_token(client: AsyncClient, db):
    """Create an owner user and return their access token."""
    response = await client.post(
        "/api/auth/dev/login",
        json={
            "email": "owner_test@example.com",
            "name": "Owner Test",
            "role": "owner"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
async def test_consumer_token(db, sample_products):
    """Create a consumer user with sample products and return their access token."""
    from app.models.user import User
    from app.services.token_service import token_service
    
    # Create user in database
    user_data = {
        "google_id": "test_consumer_integration",
        "email": "integration_consumer@example.com",
        "name": "Integration Consumer",
        "role": "consumer"
    }
    result = await db.users.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    
    # Create token
    user = User(**user_data)
    return token_service.create_access_token(user)


@pytest.fixture
async def test_distributor_token(db, sample_products):
    """Create a distributor user with sample products and return their access token."""
    from app.models.user import User
    from app.services.token_service import token_service
    
    # Create user in database
    user_data = {
        "google_id": "test_distributor_integration",
        "email": "integration_distributor@example.com",
        "name": "Integration Distributor",
        "role": "distributor"
    }
    result = await db.users.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    
    # Create token
    user = User(**user_data)
    return token_service.create_access_token(user)


@pytest.fixture
async def test_owner_token(db, sample_products):
    """Create an owner user with sample products and return their access token."""
    from app.models.user import User
    from app.services.token_service import token_service
    
    # Create user in database
    user_data = {
        "google_id": "test_owner_integration",
        "email": "integration_owner@example.com",
        "name": "Integration Owner",
        "role": "owner"
    }
    result = await db.users.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    
    # Create token
    user = User(**user_data)
    return token_service.create_access_token(user)
