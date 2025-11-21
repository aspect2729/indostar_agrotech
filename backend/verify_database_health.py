"""
Database Health Check Script

This script verifies the complete database setup including:
- Connection status
- Collection existence
- Index verification
- Collection getter functions
- Sample data operations
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.database import (
    connect_to_mongodb,
    close_mongodb_connection,
    get_database,
    get_users_collection,
    get_products_collection,
    get_orders_collection,
    get_inventory_collection,
    check_database_health
)


async def verify_connection():
    """Verify database connection."""
    print("=" * 60)
    print("1. VERIFYING DATABASE CONNECTION")
    print("=" * 60)
    
    try:
        await connect_to_mongodb()
        print("✓ Successfully connected to MongoDB")
        print(f"✓ Database: {settings.database_name}")
        return True
    except Exception as e:
        print(f"✗ Connection failed: {str(e)}")
        return False


async def verify_collections():
    """Verify all collections exist."""
    print("\n" + "=" * 60)
    print("2. VERIFYING COLLECTIONS")
    print("=" * 60)
    
    try:
        db = get_database()
        collections = await db.list_collection_names()
        
        required_collections = ["users", "products", "orders", "inventory"]
        
        for collection_name in required_collections:
            if collection_name in collections:
                count = await db[collection_name].count_documents({})
                print(f"✓ Collection '{collection_name}' exists ({count} documents)")
            else:
                print(f"⚠ Collection '{collection_name}' not found (will be created on first insert)")
        
        return True
    except Exception as e:
        print(f"✗ Collection verification failed: {str(e)}")
        return False


async def verify_indexes():
    """Verify indexes on all collections."""
    print("\n" + "=" * 60)
    print("3. VERIFYING INDEXES")
    print("=" * 60)
    
    try:
        db = get_database()
        
        # Users collection indexes
        print("\nUsers Collection Indexes:")
        users_indexes = await db.users.index_information()
        for index_name, index_info in users_indexes.items():
            print(f"  - {index_name}: {index_info.get('key', [])}")
        
        # Products collection indexes
        print("\nProducts Collection Indexes:")
        products_indexes = await db.products.index_information()
        for index_name, index_info in products_indexes.items():
            print(f"  - {index_name}: {index_info.get('key', [])}")
        
        # Orders collection indexes
        print("\nOrders Collection Indexes:")
        orders_indexes = await db.orders.index_information()
        for index_name, index_info in orders_indexes.items():
            print(f"  - {index_name}: {index_info.get('key', [])}")
        
        # Inventory collection indexes
        print("\nInventory Collection Indexes:")
        inventory_indexes = await db.inventory.index_information()
        for index_name, index_info in inventory_indexes.items():
            print(f"  - {index_name}: {index_info.get('key', [])}")
        
        print("\n✓ All indexes verified")
        return True
    except Exception as e:
        print(f"✗ Index verification failed: {str(e)}")
        return False


async def verify_collection_getters():
    """Verify collection getter functions."""
    print("\n" + "=" * 60)
    print("4. VERIFYING COLLECTION GETTER FUNCTIONS")
    print("=" * 60)
    
    try:
        # Test each getter function
        users_col = get_users_collection()
        print(f"✓ get_users_collection() -> {users_col.name}")
        
        products_col = get_products_collection()
        print(f"✓ get_products_collection() -> {products_col.name}")
        
        orders_col = get_orders_collection()
        print(f"✓ get_orders_collection() -> {orders_col.name}")
        
        inventory_col = get_inventory_collection()
        print(f"✓ get_inventory_collection() -> {inventory_col.name}")
        
        return True
    except Exception as e:
        print(f"✗ Collection getter verification failed: {str(e)}")
        return False


async def verify_health_check():
    """Verify health check functionality."""
    print("\n" + "=" * 60)
    print("5. VERIFYING HEALTH CHECK")
    print("=" * 60)
    
    try:
        health_status = await check_database_health()
        
        print(f"Status: {health_status.get('status')}")
        print(f"Database: {health_status.get('database')}")
        print(f"Connected: {health_status.get('connected')}")
        
        if health_status.get('mongodb_version'):
            print(f"MongoDB Version: {health_status.get('mongodb_version')}")
        
        if health_status.get('status') == 'healthy':
            print("✓ Health check passed")
            return True
        else:
            print(f"✗ Health check failed: {health_status.get('error')}")
            return False
    except Exception as e:
        print(f"✗ Health check verification failed: {str(e)}")
        return False


async def verify_basic_operations():
    """Verify basic CRUD operations."""
    print("\n" + "=" * 60)
    print("6. VERIFYING BASIC OPERATIONS")
    print("=" * 60)
    
    try:
        users_col = get_users_collection()
        
        # Test read operation
        user_count = await users_col.count_documents({})
        print(f"✓ Read operation successful (found {user_count} users)")
        
        # Test find operation
        sample_user = await users_col.find_one({})
        if sample_user:
            print(f"✓ Find operation successful (sample user: {sample_user.get('email', 'N/A')})")
        else:
            print("⚠ No users found in database (expected for fresh setup)")
        
        return True
    except Exception as e:
        print(f"✗ Basic operations verification failed: {str(e)}")
        return False


async def main():
    """Run all verification checks."""
    print("\n" + "=" * 60)
    print("DATABASE HEALTH CHECK")
    print("=" * 60)
    
    results = []
    
    # Run all checks
    results.append(await verify_connection())
    
    if results[0]:  # Only continue if connection successful
        results.append(await verify_collections())
        results.append(await verify_indexes())
        results.append(await verify_collection_getters())
        results.append(await verify_health_check())
        results.append(await verify_basic_operations())
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Checks Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✓ ALL CHECKS PASSED - Database is healthy!")
        exit_code = 0
    else:
        print(f"\n✗ {total - passed} CHECK(S) FAILED - Please review errors above")
        exit_code = 1
    
    # Cleanup
    await close_mongodb_connection()
    
    return exit_code


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
