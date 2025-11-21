"""
Fix google_id index to be sparse.

This script drops the old google_id index and recreates it as sparse
to allow multiple users with null google_id (email-registered users).
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_google_id_index():
    """Drop and recreate google_id index as sparse."""
    
    mongodb_url = os.getenv("MONGODB_URL")
    if not mongodb_url:
        print("❌ MONGODB_URL not found in environment variables")
        return
    
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.indostar
    
    try:
        # Check existing indexes
        print("\n📋 Current indexes on users collection:")
        indexes = await db.users.list_indexes().to_list(length=None)
        for idx in indexes:
            print(f"  - {idx['name']}: {idx.get('key', {})}, unique={idx.get('unique', False)}, sparse={idx.get('sparse', False)}")
        
        # Drop the old google_id index if it exists
        print("\n🗑️  Dropping old google_id index...")
        try:
            await db.users.drop_index("google_id_1")
            print("✅ Dropped google_id_1 index")
        except Exception as e:
            if "index not found" in str(e).lower():
                print("ℹ️  Index google_id_1 doesn't exist (already dropped)")
            else:
                print(f"⚠️  Error dropping index: {e}")
        
        # Create new sparse index
        print("\n🔨 Creating new sparse google_id index...")
        await db.users.create_index("google_id", unique=True, sparse=True)
        print("✅ Created sparse google_id index")
        
        # Verify new indexes
        print("\n📋 Updated indexes on users collection:")
        indexes = await db.users.list_indexes().to_list(length=None)
        for idx in indexes:
            print(f"  - {idx['name']}: {idx.get('key', {})}, unique={idx.get('unique', False)}, sparse={idx.get('sparse', False)}")
        
        print("\n✅ Index fix complete!")
        print("\nℹ️  Now email registration will work correctly.")
        print("   Multiple users can have google_id=null without conflicts.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise
    finally:
        client.close()
        print("\n🔌 MongoDB connection closed")

if __name__ == "__main__":
    asyncio.run(fix_google_id_index())
