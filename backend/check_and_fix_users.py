"""Check and fix users with null google_id."""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_users():
    """Check users with null google_id."""
    
    mongodb_url = os.getenv("MONGODB_URL")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.indostar
    
    try:
        # Count users with null google_id
        null_google_id_count = await db.users.count_documents({"google_id": None})
        print(f"\n📊 Users with google_id=null: {null_google_id_count}")
        
        # List them
        if null_google_id_count > 0:
            print("\n📋 Users with null google_id:")
            users = await db.users.find({"google_id": None}).to_list(length=None)
            for user in users:
                print(f"  - {user.get('email')} (role: {user.get('role')})")
        
        # Count total users
        total_users = await db.users.count_documents({})
        print(f"\n📊 Total users: {total_users}")
        
        # Check if there are duplicate emails
        pipeline = [
            {"$group": {"_id": "$email", "count": {"$sum": 1}}},
            {"$match": {"count": {"$gt": 1}}}
        ]
        duplicates = await db.users.aggregate(pipeline).to_list(length=None)
        if duplicates:
            print(f"\n⚠️  Duplicate emails found:")
            for dup in duplicates:
                print(f"  - {dup['_id']}: {dup['count']} users")
        else:
            print(f"\n✅ No duplicate emails")
        
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
