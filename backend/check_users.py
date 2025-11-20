"""
Check all users in the database to see their structure.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_users():
    """Check all users in the database."""
    
    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.indostar
    users_collection = db.users
    
    try:
        # Get all users
        users = await users_collection.find({}).to_list(length=None)
        
        print(f"Total users: {len(users)}\n")
        
        for user in users:
            print(f"User: {user.get('email', 'no email')}")
            print(f"  _id: {user.get('_id')}")
            print(f"  google_id: {user.get('google_id', 'NOT SET')}")
            print(f"  googleId: {user.get('googleId', 'NOT SET')}")
            print(f"  role: {user.get('role', 'no role')}")
            print()
        
        # Check indexes
        print("\nIndexes:")
        indexes = await users_collection.list_indexes().to_list(length=None)
        for idx in indexes:
            print(f"  {idx}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
