"""
Verification script to check authentication routes are properly registered.
"""

import sys
sys.path.insert(0, '.')

from main import app


def verify_routes():
    """Verify that authentication routes are registered."""
    
    print("Verifying Authentication Routes")
    print("=" * 60)
    
    # Get all routes from the FastAPI app
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes.append({
                'path': route.path,
                'methods': route.methods,
                'name': route.name
            })
    
    # Filter authentication routes
    auth_routes = [r for r in routes if '/api/auth/' in r['path']]
    
    print(f"\nFound {len(auth_routes)} authentication routes:\n")
    
    expected_routes = {
        '/api/auth/google': ['POST'],
        '/api/auth/callback': ['POST'],
        '/api/auth/refresh': ['POST'],
        '/api/auth/logout': ['POST']
    }
    
    all_found = True
    
    for expected_path, expected_methods in expected_routes.items():
        matching_routes = [r for r in auth_routes if r['path'] == expected_path]
        
        if matching_routes:
            route = matching_routes[0]
            methods = list(route['methods'])
            print(f"✓ {expected_path}")
            print(f"  Methods: {', '.join(methods)}")
            print(f"  Name: {route['name']}")
            
            # Check if expected methods are present
            for method in expected_methods:
                if method not in methods:
                    print(f"  ✗ Missing method: {method}")
                    all_found = False
        else:
            print(f"✗ {expected_path} - NOT FOUND")
            all_found = False
        
        print()
    
    # Show all registered routes for debugging
    print("\nAll registered routes:")
    print("-" * 60)
    for route in routes:
        methods = ', '.join(route['methods']) if route['methods'] else 'N/A'
        print(f"{methods:10} {route['path']}")
    
    print("\n" + "=" * 60)
    
    if all_found:
        print("✓ SUCCESS: All authentication endpoints are properly registered!")
        return True
    else:
        print("✗ FAILURE: Some authentication endpoints are missing!")
        return False


if __name__ == "__main__":
    try:
        success = verify_routes()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Error during verification: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
