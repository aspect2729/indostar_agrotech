"""
Master seed script to populate the entire database.

This script runs all seeding operations in the correct order:
1. Migrate indexes
2. Seed products
3. Seed inventory (requires products)
4. Seed users (optional)
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import logging

from app.config import settings

# Import seeding functions
from seed_products import SEED_PRODUCTS
from seed_users import SEED_USERS
from seed_inventory import DEFAULT_INVENTORY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_all_data(include_users=False):
    """Seed all database collections."""
    client = None
    try:
        logger.info("="*60)
        logger.info("COMPLETE DATABASE SEEDING")
        logger.info("="*60 + "\n")
        
        logger.info("Connecting to MongoDB...")
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Verify connection
        await client.admin.command('ping')
        logger.info(f"Connected to database: {settings.database_name}\n")
        
        # Check existing data
        products_count = await db.products.count_documents({})
        inventory_count = await db.inventory.count_documents({})
        users_count = await db.users.count_documents({})
        orders_count = await db.orders.count_documents({})
        
        logger.info("Current database state:")
        logger.info(f"  Products: {products_count}")
        logger.info(f"  Inventory: {inventory_count}")
        logger.info(f"  Users: {users_count}")
        logger.info(f"  Orders: {orders_count}\n")
        
        if products_count > 0 or inventory_count > 0 or users_count > 0:
            logger.warning("Database already contains data!")
            response = input("Do you want to clear ALL data and reseed? (yes/no): ")
            if response.lower() != 'yes':
                logger.info("Seeding cancelled.")
                return
            
            # Clear all collections
            logger.info("\nClearing all collections...")
            await db.products.delete_many({})
            await db.inventory.delete_many({})
            if include_users:
                await db.users.delete_many({})
            await db.orders.delete_many({})
            logger.info("All collections cleared.\n")
        
        # Step 1: Create indexes
        logger.info("="*60)
        logger.info("STEP 1: Creating database indexes")
        logger.info("="*60 + "\n")
        
        await create_all_indexes(db)
        logger.info("✓ Indexes created successfully\n")
        
        # Step 2: Seed products
        logger.info("="*60)
        logger.info("STEP 2: Seeding products")
        logger.info("="*60 + "\n")
        
        result = await db.products.insert_many(SEED_PRODUCTS)
        logger.info(f"✓ Inserted {len(result.inserted_ids)} products\n")
        
        # Step 3: Seed inventory
        logger.info("="*60)
        logger.info("STEP 3: Seeding inventory")
        logger.info("="*60 + "\n")
        
        products = await db.products.find({}).to_list(length=None)
        inventory_records = []
        
        for product in products:
            category = product['category']
            defaults = DEFAULT_INVENTORY.get(category, {
                "quantity": 100.0,
                "low_stock_threshold": 10.0
            })
            
            inventory_record = {
                "product_id": product['_id'],
                "quantity": defaults['quantity'],
                "unit": product['unit'],
                "low_stock_threshold": defaults['low_stock_threshold'],
                "last_restocked": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            inventory_records.append(inventory_record)
        
        result = await db.inventory.insert_many(inventory_records)
        logger.info(f"✓ Inserted {len(result.inserted_ids)} inventory records\n")
        
        # Step 4: Seed users (optional)
        if include_users:
            logger.info("="*60)
            logger.info("STEP 4: Seeding sample users")
            logger.info("="*60 + "\n")
            
            result = await db.users.insert_many(SEED_USERS)
            logger.info(f"✓ Inserted {len(result.inserted_ids)} sample users\n")
            
            logger.info("Sample user credentials:")
            for user in SEED_USERS:
                logger.info(f"  - {user['name']} ({user['role']}): {user['email']}")
            logger.info("")
        
        # Final summary
        logger.info("="*60)
        logger.info("SEEDING COMPLETED SUCCESSFULLY!")
        logger.info("="*60 + "\n")
        
        products_count = await db.products.count_documents({})
        inventory_count = await db.inventory.count_documents({})
        users_count = await db.users.count_documents({})
        
        logger.info("Final database state:")
        logger.info(f"  Products: {products_count}")
        logger.info(f"  Inventory: {inventory_count}")
        logger.info(f"  Users: {users_count}")
        logger.info(f"  Orders: 0 (will be created by users)\n")
        
        logger.info("Next steps:")
        logger.info("  1. Start the backend server: python main.py")
        logger.info("  2. Start the frontend: npm start")
        logger.info("  3. Login with Google OAuth or use dev login")
        logger.info("  4. Run validation: python scripts/validate_data.py\n")
        
    except Exception as e:
        logger.error(f"Error during seeding: {str(e)}")
        raise
    finally:
        if client:
            client.close()


async def create_all_indexes(db):
    """Create all database indexes."""
    # Users indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("google_id", unique=True)
    await db.users.create_index("role")
    
    # Products indexes
    await db.products.create_index("category")
    await db.products.create_index("is_active")
    await db.products.create_index([("name", "text"), ("description", "text")])
    await db.products.create_index([("category", 1), ("is_active", 1)])
    
    # Orders indexes
    await db.orders.create_index("user_id")
    await db.orders.create_index("order_number", unique=True)
    await db.orders.create_index("status")
    await db.orders.create_index("user_type")
    await db.orders.create_index([("user_id", 1), ("created_at", -1)])
    await db.orders.create_index([("status", 1), ("created_at", -1)])
    
    # Inventory indexes
    await db.inventory.create_index("product_id", unique=True)
    await db.inventory.create_index([("quantity", 1), ("low_stock_threshold", 1)])


if __name__ == "__main__":
    # Check if user wants to include sample users
    print("="*60)
    print("DATABASE SEEDING OPTIONS")
    print("="*60)
    print("\nThis script will seed:")
    print("  ✓ Products (12 items across all categories)")
    print("  ✓ Inventory records for all products")
    print("  ✓ Database indexes for optimal performance")
    print("\nOptional:")
    print("  ? Sample users for testing (owner, distributors, consumers)")
    print("")
    
    response = input("Do you want to include sample users? (yes/no): ")
    include_users = response.lower() == 'yes'
    
    print("")
    asyncio.run(seed_all_data(include_users=include_users))
