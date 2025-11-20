"""List all products in the database."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def list_products():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.indostar
    
    products = await db.products.find({}).to_list(length=None)
    print(f'Total products: {len(products)}\n')
    
    for p in products:
        print(f'- {p["name"]} ({p["category"]})')
        print(f'  Consumer: ₹{p["price"]["consumer"]}, Distributor: ₹{p["price"]["distributor"]}')
        print(f'  Active: {p.get("isActive", True)}')
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(list_products())
