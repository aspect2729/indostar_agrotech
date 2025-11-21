"""
Fix product image URLs
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb+srv://advikgudodagi_db_user:indostar@cluster0.zz0gmfl.mongodb.net/indostar"
DATABASE_NAME = "indostar"

async def fix_images():
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Update all products with correct image URLs
        await db.products.update_many(
            {},
            {"$set": {
                "images": ["https://via.placeholder.com/400x300?text=Product+Image"]
            }}
        )
        
        print("✓ Fixed all product images")
        client.close()
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(fix_images())
