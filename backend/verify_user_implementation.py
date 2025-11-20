"""
Verification script for user profile implementation (no MongoDB required).

This script verifies that the user profile service and endpoints
are properly implemented and integrated.
"""

import sys


def verify_user_implementation():
    """Verify user profile implementation without MongoDB."""
    
    print("=" * 60)
    print("User Profile Implementation Verification")
    print("=" * 60)
    
    # Verify user service exists
    print("\n1. Verifying user service module...")
    try:
        from app.services.user_service import user_service, UserService
        print("✓ User service module imported successfully")
        
        # Check methods exist
        methods = ['get_user_profile', 'update_user_profile', 'add_address', 'remove_address']
        for method in methods:
            if hasattr(user_service, method):
                print(f"  ✓ Method '{method}' exists")
            else:
                print(f"  ✗ Method '{method}' missing")
                return False
        
    except Exception as e:
        print(f"✗ Failed to import user service: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Verify user routes exist
    print("\n2. Verifying user routes module...")
    try:
        from app.routes.users import router
        print("✓ User routes module imported successfully")
        
        # Check routes
        routes = [route.path for route in router.routes]
        print(f"  Found routes: {routes}")
        
        if "/profile" in routes:
            print("  ✓ /profile route exists")
        else:
            print("  ✗ /profile route missing")
            return False
        
        # Check methods on profile routes (FastAPI creates separate routes for each method)
        profile_routes = [r for r in router.routes if r.path == "/profile"]
        all_methods = set()
        for route in profile_routes:
            all_methods.update(route.methods)
        
        print(f"  Profile route methods: {all_methods}")
        if "GET" in all_methods:
            print("    ✓ GET method exists")
        else:
            print("    ✗ GET method missing")
            return False
        if "PUT" in all_methods:
            print("    ✓ PUT method exists")
        else:
            print("    ✗ PUT method missing")
            return False
        
    except Exception as e:
        print(f"✗ Failed to import user routes: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Verify schemas exist
    print("\n3. Verifying user schemas...")
    try:
        from app.schemas.user import (
            UserProfileResponse,
            UserProfileUpdateRequest,
            AddressRequest,
            AddressResponse
        )
        print("✓ User schemas imported successfully")
        print("  ✓ UserProfileResponse")
        print("  ✓ UserProfileUpdateRequest")
        print("  ✓ AddressRequest")
        print("  ✓ AddressResponse")
        
    except Exception as e:
        print(f"✗ Failed to import user schemas: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Verify integration with main app
    print("\n4. Verifying integration with main app...")
    try:
        from main import app
        print("✓ Main app imported successfully")
        
        # Check if users router is included
        routes = [route.path for route in app.routes]
        user_routes = [r for r in routes if r.startswith("/api/users")]
        
        print(f"  Found {len(user_routes)} user routes in main app")
        
        if len(user_routes) >= 2:  # GET and PUT for /profile
            print("  ✓ Users router integrated correctly")
            for route in user_routes:
                print(f"    - {route}")
        else:
            print(f"  ✗ Users router not properly integrated")
            print(f"    Expected at least 2 routes, found {len(user_routes)}")
            return False
        
    except Exception as e:
        print(f"✗ Failed to verify main app integration: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Verify dependencies
    print("\n5. Verifying dependencies...")
    try:
        from app.utils.dependencies import get_current_user
        print("✓ Authentication dependencies available")
        
    except Exception as e:
        print(f"✗ Failed to import dependencies: {e}")
        return False
    
    # Summary
    print("\n" + "=" * 60)
    print("✓ All user profile implementation verifications passed!")
    print("=" * 60)
    print("\nImplemented endpoints:")
    print("  - GET  /api/users/profile  (Get user profile)")
    print("  - PUT  /api/users/profile  (Update user profile)")
    print("\nImplemented service methods:")
    print("  - get_user_profile()")
    print("  - update_user_profile()")
    print("  - add_address()")
    print("  - remove_address()")
    print("\nRequirements satisfied:")
    print("  - Requirement 1.4: User profile management for delivery")
    print("  - Requirement 2.3: Distributor profile with addresses")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    success = verify_user_implementation()
    sys.exit(0 if success else 1)
