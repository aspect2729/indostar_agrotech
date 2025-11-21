"""
Check if products exist in database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('backend/.env')

async def check_products():
    mongodb_url = os.getenv('MONGODB_URL')
    database_name = os.getenv('DATABASE_NAME')
    
    try:
        # Create client
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        
        # Count products
        product_count = await db.products.count_documents({})
        print(f"Total products in database: {product_count}")
        
        if product_count > 0:
            # Get all products
            products = await db.products.find({}).to_list(length=100)
            print("\nProducts:")
            for product in products:
                print(f"  - {product['name']} ({product['category']}) - ₹{product['price']['consumer']}")
        else:
            print("\n⚠️ No products found in database!")
            print("You need to seed the database with products.")
            print("\nRun: python backend/scripts/seed_all.py")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_products())
