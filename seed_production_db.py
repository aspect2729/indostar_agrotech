"""
Seed production database on Render
This uses the same MongoDB Atlas connection but ensures products are there
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Production MongoDB URL (same as in backend/.env)
MONGODB_URL = "mongodb+srv://advikgudodagi_db_user:indostar@cluster0.zz0gmfl.mongodb.net/indostar"
DATABASE_NAME = "indostar"

async def seed_production():
    try:
        print("Connecting to production database...")
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Check current state
        product_count = await db.products.count_documents({})
        print(f"Current products in database: {product_count}")
        
        if product_count > 0:
            print("✓ Products already exist in production database!")
            client.close()
            return
        
        print("\nSeeding products...")
        
        # Products data
        products = [
            # Jaggery Products
            {
                "name": "Organic Jaggery Powder",
                "category": "jaggery",
                "description": "Pure organic jaggery powder made from sugarcane juice. Rich in iron and minerals.",
                "images": ["https://via.placeholder.com/400x300?text=Jaggery+Powder"],
                "price": {"consumer": 120, "distributor": 100},
                "unit": "kg",
                "nutritionalInfo": {"calories": 383, "protein": 0.4, "carbohydrates": 98.0, "fat": 0.1},
                "interStateDelivery": True,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "Jaggery Cubes",
                "category": "jaggery",
                "description": "Traditional jaggery cubes, perfect for tea and desserts.",
                "images": ["https://via.placeholder.com/400x300?text=Jaggery+Cubes"],
                "price": {"consumer": 110, "distributor": 90},
                "unit": "kg",
                "nutritionalInfo": {"calories": 383, "protein": 0.4, "carbohydrates": 98.0, "fat": 0.1},
                "interStateDelivery": True,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            # Oil Products
            {
                "name": "Cold Pressed Coconut Oil",
                "category": "oil",
                "description": "100% pure cold pressed coconut oil. No chemicals or preservatives.",
                "images": ["https://via.placeholder.com/400x300?text=Coconut+Oil"],
                "price": {"consumer": 250, "distributor": 220},
                "unit": "liter",
                "nutritionalInfo": {"calories": 862, "protein": 0, "carbohydrates": 0, "fat": 100},
                "interStateDelivery": True,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "Cold Pressed Groundnut Oil",
                "category": "oil",
                "description": "Traditional groundnut oil extracted using cold press method.",
                "images": ["https://via.placeholder.com/400x300?text=Groundnut+Oil"],
                "price": {"consumer": 200, "distributor": 180},
                "unit": "liter",
                "nutritionalInfo": {"calories": 884, "protein": 0, "carbohydrates": 0, "fat": 100},
                "interStateDelivery": True,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            # Chutney Powder Products
            {
                "name": "Spicy Chutney Powder",
                "category": "chutney_powder",
                "description": "Authentic South Indian chutney powder with perfect blend of spices.",
                "images": ["https://via.placeholder.com/400x300?text=Chutney+Powder"],
                "price": {"consumer": 80, "distributor": 65},
                "unit": "kg",
                "nutritionalInfo": {"calories": 350, "protein": 12, "carbohydrates": 45, "fat": 15},
                "interStateDelivery": False,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "Garlic Chutney Powder",
                "category": "chutney_powder",
                "description": "Flavorful garlic chutney powder, great with dosa and idli.",
                "images": ["https://via.placeholder.com/400x300?text=Garlic+Chutney"],
                "price": {"consumer": 90, "distributor": 75},
                "unit": "kg",
                "nutritionalInfo": {"calories": 360, "protein": 10, "carbohydrates": 50, "fat": 12},
                "interStateDelivery": False,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            # Pickle Products
            {
                "name": "Mango Pickle",
                "category": "pickles",
                "description": "Traditional mango pickle made with authentic spices.",
                "images": ["https://via.placeholder.com/400x300?text=Mango+Pickle"],
                "price": {"consumer": 150, "distributor": 130},
                "unit": "kg",
                "nutritionalInfo": {"calories": 200, "protein": 2, "carbohydrates": 25, "fat": 10},
                "interStateDelivery": False,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "Lemon Pickle",
                "category": "pickles",
                "description": "Tangy lemon pickle with traditional recipe.",
                "images": ["https://via.placeholder.com/400x300?text=Lemon+Pickle"],
                "price": {"consumer": 140, "distributor": 120},
                "unit": "kg",
                "nutritionalInfo": {"calories": 180, "protein": 1, "carbohydrates": 20, "fat": 12},
                "interStateDelivery": False,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            # Milk Products
            {
                "name": "Fresh Cow Milk",
                "category": "milk",
                "description": "Fresh organic cow milk delivered daily.",
                "images": ["https://via.placeholder.com/400x300?text=Cow+Milk"],
                "price": {"consumer": 60, "distributor": 55},
                "unit": "liter",
                "nutritionalInfo": {"calories": 61, "protein": 3.2, "carbohydrates": 4.8, "fat": 3.3},
                "interStateDelivery": False,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "Fresh Buffalo Milk",
                "category": "milk",
                "description": "Rich and creamy buffalo milk delivered daily.",
                "images": ["https://via.placeholder.com/400x300?text=Buffalo+Milk"],
                "price": {"consumer": 70, "distributor": 65},
                "unit": "liter",
                "nutritionalInfo": {"calories": 97, "protein": 3.8, "carbohydrates": 5.2, "fat": 6.9},
                "interStateDelivery": False,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        # Insert products
        result = await db.products.insert_many(products)
        print(f"✓ Inserted {len(result.inserted_ids)} products")
        
        # Create inventory for each product
        inventory_items = []
        for product_id in result.inserted_ids:
            inventory_items.append({
                "productId": str(product_id),
                "quantity": 100,
                "unit": "units",
                "lowStockThreshold": 20,
                "lastRestocked": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            })
        
        await db.inventory.insert_many(inventory_items)
        print(f"✓ Created inventory for {len(inventory_items)} products")
        
        print("\n✓ Production database seeded successfully!")
        print("\nProducts now available:")
        products_list = await db.products.find({}).to_list(length=100)
        for p in products_list:
            print(f"  - {p['name']} ({p['category']}) - ₹{p['price']['consumer']}")
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(seed_production())
