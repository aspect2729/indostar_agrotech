"""
Fix duplicate googleId null values in the database.
This script removes users with null googleId values.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def fix_duplicate_googleid():
    """Remove users with null googleId."""
    
    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.indostar
    users_collection = db.users
    
    try:
        # Find users with null googleId
        null_users = await users_collection.find({"google_id": None}).to_list(length=None)
        
        if null_users:
            print(f"Found {len(null_users)} users with null google_id:")
            for user in null_users:
                print(f"  - {user.get('email', 'no email')} (role: {user.get('role', 'no role')})")
            
            # Delete users with null googleId
            result = await users_collection.delete_many({"google_id": None})
            print(f"\nDeleted {result.deleted_count} users with null google_id")
        else:
            print("No users with null google_id found")
        
        # Also check for users with googleId field (old field name)
        old_field_users = await users_collection.find({"googleId": {"$exists": True}}).to_list(length=None)
        if old_field_users:
            print(f"\nFound {len(old_field_users)} users with old 'googleId' field")
            # Update to use google_id
            for user in old_field_users:
                if user.get("googleId"):
                    await users_collection.update_one(
                        {"_id": user["_id"]},
                        {
                            "$set": {"google_id": user["googleId"]},
                            "$unset": {"googleId": ""}
                        }
                    )
                    print(f"  - Updated {user.get('email', 'no email')}")
                else:
                    # Delete if googleId is null
                    await users_collection.delete_one({"_id": user["_id"]})
                    print(f"  - Deleted {user.get('email', 'no email')} (had null googleId)")
        
        print("\nDatabase cleanup complete!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_duplicate_googleid())
