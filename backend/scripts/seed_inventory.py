"""
Seed script for inventory data.

This script creates inventory records for all products in the database.
It should be run after seeding products.
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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Default inventory quantities by category
DEFAULT_INVENTORY = {
    "jaggery": {
        "quantity": 500.0,
        "low_stock_threshold": 50.0
    },
    "oil": {
        "quantity": 300.0,
        "low_stock_threshold": 30.0
    },
    "chutney_powder": {
        "quantity": 200.0,
        "low_stock_threshold": 20.0
    },
    "pickles": {
        "quantity": 150.0,
        "low_stock_threshold": 15.0
    },
    "milk": {
        "quantity": 100.0,
        "low_stock_threshold": 20.0
    }
}


async def seed_inventory():
    """Create inventory records for all products."""
    client = None
    try:
        logger.info("Connecting to MongoDB...")
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Get all products
        products = await db.products.find({}).to_list(length=None)
        
        if not products:
            logger.error("No products found in database. Please run seed_products.py first.")
            return
        
        logger.info(f"Found {len(products)} products.")
        
        # Check if inventory already exists
        existing_count = await db.inventory.count_documents({})
        if existing_count > 0:
            logger.warning(f"Inventory collection already contains {existing_count} documents.")
            response = input("Do you want to clear existing inventory and reseed? (yes/no): ")
            if response.lower() != 'yes':
                logger.info("Seeding cancelled.")
                return
            
            # Clear existing inventory
            logger.info("Clearing existing inventory...")
            await db.inventory.delete_many({})
            logger.info("Existing inventory cleared.")
        
        # Create inventory records
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
        
        # Insert inventory records
        logger.info(f"Inserting {len(inventory_records)} inventory records...")
        result = await db.inventory.insert_many(inventory_records)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} inventory records.")
        
        # Display inventory summary
        logger.info("\nInventory summary:")
        for product, inventory in zip(products, inventory_records):
            logger.info(
                f"  - {product['name']}: {inventory['quantity']} {inventory['unit']} "
                f"(threshold: {inventory['low_stock_threshold']})"
            )
        
        logger.info("\nInventory seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding inventory: {str(e)}")
        raise
    finally:
        if client:
            client.close()


if __name__ == "__main__":
    asyncio.run(seed_inventory())
