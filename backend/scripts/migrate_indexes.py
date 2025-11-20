"""
Database migration script for creating and updating indexes.

This script creates all necessary indexes for optimal query performance
across all collections: users, products, orders, and inventory.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
import logging

from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_users_indexes(db):
    """Create indexes for users collection."""
    logger.info("Creating indexes for users collection...")
    
    # Email index (unique)
    await db.users.create_index("email", unique=True, name="email_unique")
    logger.info("  ✓ Created unique index on email")
    
    # Google ID index (unique)
    await db.users.create_index("google_id", unique=True, name="google_id_unique")
    logger.info("  ✓ Created unique index on google_id")
    
    # Role index for filtering
    await db.users.create_index("role", name="role_index")
    logger.info("  ✓ Created index on role")
    
    # Created at index for sorting
    await db.users.create_index("created_at", name="created_at_index")
    logger.info("  ✓ Created index on created_at")
    
    logger.info("Users collection indexes created successfully.\n")


async def create_products_indexes(db):
    """Create indexes for products collection."""
    logger.info("Creating indexes for products collection...")
    
    # Category index for filtering
    await db.products.create_index("category", name="category_index")
    logger.info("  ✓ Created index on category")
    
    # Active status index
    await db.products.create_index("is_active", name="is_active_index")
    logger.info("  ✓ Created index on is_active")
    
    # Text search index on name and description
    await db.products.create_index(
        [("name", "text"), ("description", "text")],
        name="text_search_index"
    )
    logger.info("  ✓ Created text search index on name and description")
    
    # Compound index for category + active status
    await db.products.create_index(
        [("category", 1), ("is_active", 1)],
        name="category_active_compound"
    )
    logger.info("  ✓ Created compound index on category and is_active")
    
    # Inter-state delivery index
    await db.products.create_index("inter_state_delivery", name="inter_state_delivery_index")
    logger.info("  ✓ Created index on inter_state_delivery")
    
    # Created at index for sorting
    await db.products.create_index("created_at", name="created_at_index")
    logger.info("  ✓ Created index on created_at")
    
    logger.info("Products collection indexes created successfully.\n")


async def create_orders_indexes(db):
    """Create indexes for orders collection."""
    logger.info("Creating indexes for orders collection...")
    
    # User ID index for user's orders
    await db.orders.create_index("user_id", name="user_id_index")
    logger.info("  ✓ Created index on user_id")
    
    # Order number index (unique)
    await db.orders.create_index("order_number", unique=True, name="order_number_unique")
    logger.info("  ✓ Created unique index on order_number")
    
    # Status index for filtering
    await db.orders.create_index("status", name="status_index")
    logger.info("  ✓ Created index on status")
    
    # User type index
    await db.orders.create_index("user_type", name="user_type_index")
    logger.info("  ✓ Created index on user_type")
    
    # Payment status index
    await db.orders.create_index("payment_status", name="payment_status_index")
    logger.info("  ✓ Created index on payment_status")
    
    # Compound index for user orders sorted by date
    await db.orders.create_index(
        [("user_id", 1), ("created_at", -1)],
        name="user_orders_by_date"
    )
    logger.info("  ✓ Created compound index on user_id and created_at")
    
    # Compound index for status-based queries with date sorting
    await db.orders.create_index(
        [("status", 1), ("created_at", -1)],
        name="status_orders_by_date"
    )
    logger.info("  ✓ Created compound index on status and created_at")
    
    # Compound index for user type and status
    await db.orders.create_index(
        [("user_type", 1), ("status", 1)],
        name="user_type_status_compound"
    )
    logger.info("  ✓ Created compound index on user_type and status")
    
    # Created at index for sorting
    await db.orders.create_index("created_at", name="created_at_index")
    logger.info("  ✓ Created index on created_at")
    
    logger.info("Orders collection indexes created successfully.\n")


async def create_inventory_indexes(db):
    """Create indexes for inventory collection."""
    logger.info("Creating indexes for inventory collection...")
    
    # Product ID index (unique)
    await db.inventory.create_index("product_id", unique=True, name="product_id_unique")
    logger.info("  ✓ Created unique index on product_id")
    
    # Compound index for low stock alerts
    await db.inventory.create_index(
        [("quantity", 1), ("low_stock_threshold", 1)],
        name="low_stock_alert_compound"
    )
    logger.info("  ✓ Created compound index for low stock alerts")
    
    # Updated at index for sorting
    await db.inventory.create_index("updated_at", name="updated_at_index")
    logger.info("  ✓ Created index on updated_at")
    
    # Last restocked index
    await db.inventory.create_index("last_restocked", name="last_restocked_index")
    logger.info("  ✓ Created index on last_restocked")
    
    logger.info("Inventory collection indexes created successfully.\n")


async def list_existing_indexes(db):
    """List all existing indexes in the database."""
    logger.info("\n" + "="*60)
    logger.info("EXISTING INDEXES")
    logger.info("="*60 + "\n")
    
    collections = ["users", "products", "orders", "inventory"]
    
    for collection_name in collections:
        collection = db[collection_name]
        indexes = await collection.index_information()
        
        logger.info(f"{collection_name.upper()} Collection:")
        if indexes:
            for index_name, index_info in indexes.items():
                keys = index_info.get('key', [])
                unique = index_info.get('unique', False)
                unique_str = " (UNIQUE)" if unique else ""
                logger.info(f"  - {index_name}: {keys}{unique_str}")
        else:
            logger.info("  No indexes found")
        logger.info("")


async def migrate_indexes():
    """Run database index migration."""
    client = None
    try:
        logger.info("="*60)
        logger.info("DATABASE INDEX MIGRATION")
        logger.info("="*60 + "\n")
        
        logger.info("Connecting to MongoDB...")
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Verify connection
        await client.admin.command('ping')
        logger.info(f"Connected to database: {settings.database_name}\n")
        
        # List existing indexes before migration
        await list_existing_indexes(db)
        
        # Prompt user
        logger.info("="*60)
        response = input("Do you want to proceed with index creation? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Migration cancelled.")
            return
        
        logger.info("\nStarting index creation...\n")
        
        # Create indexes for all collections
        await create_users_indexes(db)
        await create_products_indexes(db)
        await create_orders_indexes(db)
        await create_inventory_indexes(db)
        
        # List indexes after migration
        await list_existing_indexes(db)
        
        logger.info("="*60)
        logger.info("INDEX MIGRATION COMPLETED SUCCESSFULLY!")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"Error during index migration: {str(e)}")
        raise
    finally:
        if client:
            client.close()


if __name__ == "__main__":
    asyncio.run(migrate_indexes())
