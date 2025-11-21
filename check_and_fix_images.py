"""
Check and fix product image URLs properly
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb+srv://advikgudodagi_db_user:indostar@cluster0.zz0gmfl.mongodb.net/indostar"
DATABASE_NAME = "indostar"

async def fix_images():
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Check current images
        products = await db.products.find({}).to_list(length=100)
        print("Current product images:")
        for p in products:
            print(f"  {p['name']}: {p.get('images', [])}")
        
        print("\nFixing images...")
        
        # Update each product with proper image URL
        for product in products:
            product_name = product['name'].replace(' ', '+')
            proper_url = f"https://via.placeholder.com/400x300?text={product_name}"
            
            await db.products.update_one(
                {"_id": product["_id"]},
                {"$set": {"images": [proper_url]}}
            )
            print(f"✓ Fixed: {product['name']} -> {proper_url}")
        
        print("\n✓ All images fixed!")
        
        # Verify
        products = await db.products.find({}).to_list(length=100)
        print("\nVerified images:")
        for p in products:
            print(f"  {p['name']}: {p['images'][0]}")
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(fix_images())
