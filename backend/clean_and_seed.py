"""Clean database and seed fresh data"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def clean_and_seed():
    mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    database_name = os.getenv('DATABASE_NAME', 'indostar')
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    print("Cleaning database...")
    await db.products.delete_many({})
    await db.inventory.delete_many({})
    print("✓ Cleaned products and inventory")
    
    # Drop problematic indexes
    try:
        await db.inventory.drop_index("productId_1")
        print("✓ Dropped productId_1 index")
    except:
        pass
    
    client.close()
    
    # Now seed
    from scripts.seed_products import seed_products
    from scripts.seed_inventory import seed_inventory
    from scripts.migrate_indexes import migrate_indexes
    
    print("\nSeeding products...")
    await seed_products()
    print("\nSeeding inventory...")
    await seed_inventory()
    print("\nMigrating indexes...")
    await migrate_indexes()
    print("\n✓ All done!")

if __name__ == "__main__":
    asyncio.run(clean_and_seed())
