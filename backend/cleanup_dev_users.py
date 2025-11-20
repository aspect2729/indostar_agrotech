"""
Cleanup script for development users with duplicate keys.

Run this if you're getting duplicate key errors.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def cleanup_dev_users():
    """Remove users with null or duplicate googleId and fix the index."""
    
    mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    database_name = os.getenv('DATABASE_NAME', 'indostar')
    
    print(f"Connecting to MongoDB: {mongodb_url}")
    print(f"Database: {database_name}")
    print()
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    users_collection = db.users
    
    # Check for both field names (google_id and googleId)
    null_users_underscore = await users_collection.find({"google_id": None}).to_list(length=None)
    null_users_camel = await users_collection.find({"googleId": None}).to_list(length=None)
    
    print(f"Found {len(null_users_underscore)} users with null google_id")
    print(f"Found {len(null_users_camel)} users with null googleId")
    
    # Delete all users with null values
    if null_users_underscore:
        print("Deleting users with null google_id...")
        result = await users_collection.delete_many({"google_id": None})
        print(f"✓ Deleted {result.deleted_count} users")
    
    if null_users_camel:
        print("Deleting users with null googleId...")
        result = await users_collection.delete_many({"googleId": None})
        print(f"✓ Deleted {result.deleted_count} users")
    
    # Drop the problematic index if it exists
    print("\nChecking indexes...")
    indexes = await users_collection.index_information()
    
    if "googleId_1" in indexes:
        print("Dropping googleId_1 index...")
        await users_collection.drop_index("googleId_1")
        print("✓ Dropped googleId_1 index")
    
    # Create proper sparse unique index on google_id
    print("Creating sparse unique index on google_id...")
    await users_collection.create_index("google_id", unique=True, sparse=True)
    print("✓ Created sparse unique index on google_id")
    
    # Find duplicate google_ids
    pipeline = [
        {"$match": {"google_id": {"$ne": None}}},
        {"$group": {
            "_id": "$google_id",
            "count": {"$sum": 1},
            "ids": {"$push": "$_id"}
        }},
        {"$match": {"count": {"$gt": 1}}}
    ]
    
    duplicates = await users_collection.aggregate(pipeline).to_list(length=None)
    
    if duplicates:
        print(f"\nFound {len(duplicates)} duplicate google_id groups")
        for dup in duplicates:
            print(f"  google_id: {dup['_id']} - {dup['count']} users")
            # Keep first, delete rest
            ids_to_delete = dup['ids'][1:]
            if ids_to_delete:
                result = await users_collection.delete_many({"_id": {"$in": ids_to_delete}})
                print(f"  ✓ Deleted {result.deleted_count} duplicate users")
    
    # List all remaining users
    all_users = await users_collection.find({}).to_list(length=None)
    print(f"\n✓ Total users in database: {len(all_users)}")
    
    if all_users:
        print("\nCurrent users:")
        for user in all_users:
            print(f"  - {user.get('email')} ({user.get('role')}) - google_id: {user.get('google_id')}")
    
    client.close()
    print("\n✓ Cleanup complete!")

if __name__ == "__main__":
    asyncio.run(cleanup_dev_users())
