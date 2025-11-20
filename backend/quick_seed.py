"""Quick seed script to add inventory for existing products."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def seed():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.indostar
    
    # Clear inventory
    await db.inventory.delete_many({})
    print("Cleared inventory")
    
    # Get all products
    products = await db.products.find({}).to_list(length=None)
    print(f"Found {len(products)} products")
    
    # Create inventory for each product
    inventory_records = []
    for product in products:
        inventory_records.append({
            "productId": product["_id"],  # Store as ObjectId, not string
            "quantity": 500,
            "unit": product.get("unit", "kg"),
            "lowStockThreshold": 50,
            "lastRestocked": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })
    
    if inventory_records:
        await db.inventory.insert_many(inventory_records)
        print(f"Created {len(inventory_records)} inventory records")
    
    client.close()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(seed())
