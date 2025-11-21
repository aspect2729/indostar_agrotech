"""
Quick test to check MongoDB connection
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('backend/.env')

async def test_connection():
    mongodb_url = os.getenv('MONGODB_URL')
    database_name = os.getenv('DATABASE_NAME')
    
    print(f"Testing connection to: {database_name}")
    print(f"MongoDB URL: {mongodb_url[:50]}...")
    
    try:
        # Create client
        client = AsyncIOMotorClient(mongodb_url)
        
        # Test connection
        await client.admin.command('ping')
        print("✓ MongoDB connection successful!")
        
        # Get database
        db = client[database_name]
        
        # List collections
        collections = await db.list_collection_names()
        print(f"\n✓ Database '{database_name}' found")
        print(f"✓ Collections: {', '.join(collections) if collections else 'No collections yet'}")
        
        # Check if subscriptions collection exists
        if 'subscriptions' in collections:
            print("✓ Subscriptions collection exists")
        else:
            print("⚠ Subscriptions collection not created yet (will be created on first use)")
        
        # Close connection
        client.close()
        
        return True
        
    except Exception as e:
        print(f"✗ Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())
