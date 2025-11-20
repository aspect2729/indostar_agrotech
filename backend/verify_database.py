"""
Simple verification script to test MongoDB connection and database utilities.
"""

import asyncio
import sys
from app.database import (
    connect_to_mongodb,
    close_mongodb_connection,
    check_database_health,
    get_database
)


async def verify_database_connection():
    """Verify database connection and utilities."""
    print("=" * 60)
    print("MongoDB Connection Verification")
    print("=" * 60)
    
    try:
        # Test connection
        print("\n1. Testing MongoDB connection...")
        await connect_to_mongodb()
        print("   ✓ Successfully connected to MongoDB")
        
        # Test database access
        print("\n2. Testing database access...")
        db = get_database()
        print(f"   ✓ Database instance obtained: {db.name}")
        
        # Test health check
        print("\n3. Testing health check...")
        health = await check_database_health()
        print(f"   ✓ Health check status: {health['status']}")
        print(f"   ✓ Database: {health['database']}")
        print(f"   ✓ Connected: {health['connected']}")
        if 'mongodb_version' in health:
            print(f"   ✓ MongoDB version: {health['mongodb_version']}")
        
        # Test collections access
        print("\n4. Testing collection access...")
        collections = await db.list_collection_names()
        print(f"   ✓ Available collections: {collections if collections else 'None (new database)'}")
        
        # Test indexes
        print("\n5. Verifying indexes...")
        for collection_name in ['users', 'products', 'orders', 'inventory']:
            indexes = await db[collection_name].list_indexes().to_list(length=None)
            index_names = [idx['name'] for idx in indexes]
            print(f"   ✓ {collection_name}: {len(index_names)} indexes created")
        
        print("\n" + "=" * 60)
        print("✓ All verification tests passed!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during verification: {str(e)}")
        print("=" * 60)
        return False
        
    finally:
        # Close connection
        print("\n6. Closing connection...")
        await close_mongodb_connection()
        print("   ✓ Connection closed")


if __name__ == "__main__":
    success = asyncio.run(verify_database_connection())
    sys.exit(0 if success else 1)
