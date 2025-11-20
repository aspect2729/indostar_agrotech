"""
MongoDB database connection and utilities.

This module provides async MongoDB connection management using Motor,
database initialization, index creation, and health check functionality.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from typing import Optional
import logging

from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Global MongoDB client and database instances
_mongodb_client: Optional[AsyncIOMotorClient] = None
_mongodb_database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongodb() -> None:
    """
    Establish connection to MongoDB with connection pooling.
    
    This function initializes the Motor async MongoDB client with
    connection pooling and error handling. It should be called on
    application startup.
    
    Raises:
        ConnectionFailure: If unable to connect to MongoDB
    """
    global _mongodb_client, _mongodb_database
    
    try:
        logger.info(f"Connecting to MongoDB at {settings.mongodb_url}")
        
        # Initialize Motor client with connection pooling
        _mongodb_client = AsyncIOMotorClient(
            settings.mongodb_url,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
        )
        
        # Get database instance
        _mongodb_database = _mongodb_client[settings.database_name]
        
        # Verify connection by pinging the database
        await _mongodb_client.admin.command('ping')
        
        logger.info(f"Successfully connected to MongoDB database: {settings.database_name}")
        
        # Create indexes after successful connection
        await create_database_indexes()
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise ConnectionFailure(f"Could not connect to MongoDB: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during MongoDB connection: {str(e)}")
        raise


async def close_mongodb_connection() -> None:
    """
    Close MongoDB connection and cleanup resources.
    
    This function should be called on application shutdown to
    properly close the MongoDB connection and release resources.
    """
    global _mongodb_client, _mongodb_database
    
    if _mongodb_client:
        logger.info("Closing MongoDB connection")
        _mongodb_client.close()
        _mongodb_client = None
        _mongodb_database = None
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the MongoDB database instance.
    
    Returns:
        AsyncIOMotorDatabase: The MongoDB database instance
        
    Raises:
        RuntimeError: If database connection is not initialized
    """
    if _mongodb_database is None:
        raise RuntimeError(
            "Database connection not initialized. "
            "Call connect_to_mongodb() first."
        )
    return _mongodb_database


async def create_database_indexes() -> None:
    """
    Create database indexes for all collections.
    
    This function creates indexes for users, products, orders, and
    inventory collections to optimize query performance.
    """
    try:
        db = get_database()
        logger.info("Creating database indexes...")
        
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("google_id", unique=True, sparse=True)
        await db.users.create_index("role")
        logger.info("Created indexes for users collection")
        
        # Products collection indexes
        await db.products.create_index("category")
        await db.products.create_index("isActive")
        await db.products.create_index([("name", "text"), ("description", "text")])
        await db.products.create_index([("category", 1), ("isActive", 1)])
        logger.info("Created indexes for products collection")
        
        # Orders collection indexes
        await db.orders.create_index("userId")
        await db.orders.create_index("orderNumber", unique=True)
        await db.orders.create_index("status")
        await db.orders.create_index("userType")
        await db.orders.create_index([("userId", 1), ("createdAt", -1)])
        await db.orders.create_index([("status", 1), ("createdAt", -1)])
        logger.info("Created indexes for orders collection")
        
        # Inventory collection indexes
        await db.inventory.create_index("productId", unique=True)
        await db.inventory.create_index([("quantity", 1), ("lowStockThreshold", 1)])
        logger.info("Created indexes for inventory collection")
        
        logger.info("All database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating database indexes: {str(e)}")
        raise


async def check_database_health() -> dict:
    """
    Check MongoDB database health and connection status.
    
    This function performs a health check on the MongoDB connection
    and returns status information for monitoring purposes.
    
    Returns:
        dict: Health check status with the following keys:
            - status: "healthy" or "unhealthy"
            - database: database name
            - connected: boolean indicating connection status
            - error: error message if unhealthy (optional)
    """
    try:
        if _mongodb_client is None or _mongodb_database is None:
            return {
                "status": "unhealthy",
                "database": settings.database_name,
                "connected": False,
                "error": "Database connection not initialized"
            }
        
        # Ping the database to verify connection
        await _mongodb_client.admin.command('ping')
        
        # Get server info
        server_info = await _mongodb_client.server_info()
        
        return {
            "status": "healthy",
            "database": settings.database_name,
            "connected": True,
            "mongodb_version": server_info.get("version", "unknown")
        }
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": settings.database_name,
            "connected": False,
            "error": f"Connection error: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Unexpected error during health check: {str(e)}")
        return {
            "status": "unhealthy",
            "database": settings.database_name,
            "connected": False,
            "error": f"Unexpected error: {str(e)}"
        }


# Collection helper functions
def get_users_collection():
    """Get users collection."""
    return get_database().users


def get_products_collection():
    """Get products collection."""
    return get_database().products


def get_orders_collection():
    """Get orders collection."""
    return get_database().orders


def get_inventory_collection():
    """Get inventory collection."""
    return get_database().inventory
