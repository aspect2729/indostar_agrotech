"""Quick seed script - no prompts"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from scripts.seed_products import seed_products
from scripts.seed_inventory import seed_inventory
from scripts.migrate_indexes import migrate_indexes

async def quick_seed():
    print("Seeding products...")
    await seed_products()
    print("Seeding inventory...")
    await seed_inventory()
    print("Migrating indexes...")
    await migrate_indexes()
    print("✓ Done!")

if __name__ == "__main__":
    asyncio.run(quick_seed())
