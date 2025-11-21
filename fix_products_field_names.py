"""
Fix product field names in database
Change isActive to is_active and interStateDelivery to inter_state_delivery
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Production MongoDB URL
MONGODB_URL = "mongodb+srv://advikgudodagi_db_user:indostar@cluster0.zz0gmfl.mongodb.net/indostar"
DATABASE_NAME = "indostar"

async def fix_field_names():
    try:
        print("Connecting to database...")
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Get all products
        products = await db.products.find({}).to_list(length=1000)
        print(f"Found {len(products)} products")
        
        # Update each product
        for product in products:
            update_fields = {}
            
            # Fix isActive -> is_active
            if "isActive" in product:
                update_fields["is_active"] = product["isActive"]
                await db.products.update_one(
                    {"_id": product["_id"]},
                    {"$unset": {"isActive": ""}}
                )
            
            # Fix interStateDelivery -> inter_state_delivery
            if "interStateDelivery" in product:
                update_fields["inter_state_delivery"] = product["interStateDelivery"]
                await db.products.update_one(
                    {"_id": product["_id"]},
                    {"$unset": {"interStateDelivery": ""}}
                )
            
            # Apply updates
            if update_fields:
                await db.products.update_one(
                    {"_id": product["_id"]},
                    {"$set": update_fields}
                )
                print(f"✓ Fixed {product['name']}")
        
        print("\n✓ All products fixed!")
        
        # Verify
        products = await db.products.find({"is_active": True}).to_list(length=100)
        print(f"\nActive products: {len(products)}")
        for p in products:
            print(f"  - {p['name']}")
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(fix_field_names())
