"""Add Jaggery Block product to the database."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId

async def add_product():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.indostar
    
    # Create the product
    product = {
        "name": "Jaggery Block",
        "category": "jaggery",
        "description": "Pure organic jaggery made from sugarcane",
        "images": [],
        "price": {
            "consumer": 100,
            "distributor": 65
        },
        "unit": "kg",
        "nutritionalInfo": {
            "calories": 383,
            "protein": 0.4,
            "carbohydrates": 98.0,
            "fat": 0.1
        },
        "interStateDelivery": True,
        "isActive": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    # Insert product
    result = await db.products.insert_one(product)
    product_id = result.inserted_id
    print(f"✓ Added product: Jaggery Block (ID: {product_id})")
    
    # Create inventory for the product
    inventory = {
        "productId": product_id,
        "quantity": 500,
        "unit": "kg",
        "lowStockThreshold": 50,
        "lastRestocked": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    await db.inventory.insert_one(inventory)
    print(f"✓ Added inventory: 500 kg")
    
    client.close()
    print("\n✓ Jaggery Block product added successfully!")

if __name__ == "__main__":
    asyncio.run(add_product())
