"""
Drop the old googleId index (camelCase) from the users collection.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def drop_old_index():
    """Drop the old googleId index."""
    
    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.indostar
    users_collection = db.users
    
    try:
        # List current indexes
        print("Current indexes:")
        indexes = await users_collection.list_indexes().to_list(length=None)
        for idx in indexes:
            print(f"  {idx.get('name')}: {idx.get('key')}")
        
        # Drop the old googleId index
        try:
            await users_collection.drop_index("googleId_1")
            print("\n✓ Dropped old 'googleId_1' index")
        except Exception as e:
            print(f"\nCouldn't drop googleId_1 index: {str(e)}")
        
        # List indexes after dropping
        print("\nIndexes after cleanup:")
        indexes = await users_collection.list_indexes().to_list(length=None)
        for idx in indexes:
            print(f"  {idx.get('name')}: {idx.get('key')}")
        
        print("\nIndex cleanup complete!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(drop_old_index())
