"""Fix inventory duplicate productId null values."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def fix_inventory():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    db = client.indostar
    
    # Delete inventory items with null productId
    result = await db.inventory.delete_many({"productId": None})
    print(f"Deleted {result.deleted_count} inventory items with null productId")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_inventory())
