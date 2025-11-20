"""
Verification script for user profile endpoints.

This script tests the user profile API endpoints including:
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId


async def verify_user_endpoints():
    """Verify user profile endpoints implementation."""
    
    print("=" * 60)
    print("User Profile Endpoints Verification")
    print("=" * 60)
    
    # Connect to MongoDB
    print("\n1. Connecting to MongoDB...")
    try:
        client = AsyncIOMotorClient("mongodb://localhost:27017")
        db = client["indostar"]
        users_collection = db["users"]
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        return False
    
    # Create test user
    print("\n2. Creating test user...")
    try:
        test_user = {
            "google_id": "test_user_profile_123",
            "email": "testuser@example.com",
            "name": "Test User",
            "role": "consumer",
            "phone": None,
            "addresses": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Delete existing test user if any
        await users_collection.delete_one({"google_id": "test_user_profile_123"})
        
        result = await users_collection.insert_one(test_user)
        test_user_id = str(result.inserted_id)
        print(f"✓ Created test user with ID: {test_user_id}")
    except Exception as e:
        print(f"✗ Failed to create test user: {e}")
        return False
    
    # Verify user service
    print("\n3. Verifying user service...")
    try:
        from app.services.user_service import user_service
        from app.schemas.user import UserProfileUpdateRequest, AddressRequest
        
        # Test get_user_profile
        user = await user_service.get_user_profile(test_user_id)
        if user:
            print(f"✓ get_user_profile works - User: {user.name}")
        else:
            print("✗ get_user_profile failed - User not found")
            return False
        
        # Test update_user_profile with phone
        update_data = UserProfileUpdateRequest(
            phone="+919876543210"
        )
        updated_user = await user_service.update_user_profile(test_user_id, update_data)
        if updated_user and updated_user.phone == "+919876543210":
            print(f"✓ update_user_profile works - Phone updated: {updated_user.phone}")
        else:
            print("✗ update_user_profile failed - Phone not updated")
            return False
        
        # Test update_user_profile with addresses
        address = AddressRequest(
            type="shipping",
            street="123 Main Street",
            city="Bangalore",
            state="Karnataka",
            pincode="560001",
            is_default=True
        )
        update_data = UserProfileUpdateRequest(
            addresses=[address]
        )
        updated_user = await user_service.update_user_profile(test_user_id, update_data)
        if updated_user and len(updated_user.addresses) == 1:
            print(f"✓ update_user_profile works - Address added: {updated_user.addresses[0].city}")
        else:
            print("✗ update_user_profile failed - Address not added")
            return False
        
        # Test update with multiple addresses
        address2 = AddressRequest(
            type="billing",
            street="456 Oak Avenue",
            city="Mumbai",
            state="Maharashtra",
            pincode="400001",
            is_default=True
        )
        update_data = UserProfileUpdateRequest(
            name="Updated Test User",
            addresses=[address, address2]
        )
        updated_user = await user_service.update_user_profile(test_user_id, update_data)
        if updated_user and len(updated_user.addresses) == 2 and updated_user.name == "Updated Test User":
            print(f"✓ update_user_profile works - Multiple addresses and name updated")
        else:
            print("✗ update_user_profile failed - Multiple updates failed")
            return False
        
        print("✓ User service verified successfully")
        
    except Exception as e:
        print(f"✗ User service verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Verify routes exist
    print("\n4. Verifying user routes...")
    try:
        from app.routes.users import router
        
        routes = [route.path for route in router.routes]
        expected_routes = ["/profile"]
        
        for expected_route in expected_routes:
            if expected_route in routes:
                print(f"✓ Route {expected_route} exists")
            else:
                print(f"✗ Route {expected_route} missing")
                return False
        
        # Check methods
        profile_route = next((r for r in router.routes if r.path == "/profile"), None)
        if profile_route:
            methods = profile_route.methods
            if "GET" in methods and "PUT" in methods:
                print(f"✓ Profile route has GET and PUT methods")
            else:
                print(f"✗ Profile route missing methods: {methods}")
                return False
        
        print("✓ User routes verified successfully")
        
    except Exception as e:
        print(f"✗ User routes verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Verify integration with main app
    print("\n5. Verifying integration with main app...")
    try:
        from main import app
        
        # Check if users router is included
        routes = [route.path for route in app.routes]
        user_routes = [r for r in routes if r.startswith("/api/users")]
        
        if len(user_routes) >= 2:  # GET and PUT for /profile
            print(f"✓ Users router integrated - Found {len(user_routes)} user routes")
        else:
            print(f"✗ Users router not properly integrated - Found {len(user_routes)} routes")
            return False
        
        print("✓ Main app integration verified successfully")
        
    except Exception as e:
        print(f"✗ Main app integration verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Cleanup
    print("\n6. Cleaning up test data...")
    try:
        await users_collection.delete_one({"_id": ObjectId(test_user_id)})
        print("✓ Test data cleaned up")
    except Exception as e:
        print(f"⚠ Warning: Failed to clean up test data: {e}")
    
    # Close connection
    client.close()
    
    print("\n" + "=" * 60)
    print("✓ All user profile endpoint verifications passed!")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    success = asyncio.run(verify_user_endpoints())
    sys.exit(0 if success else 1)
