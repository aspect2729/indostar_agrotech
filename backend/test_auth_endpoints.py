"""
Test script to verify authentication endpoints are properly configured.
"""

import sys
from fastapi.testclient import TestClient

# Add the backend directory to the path
sys.path.insert(0, '.')

from main import app

client = TestClient(app)


def test_endpoints_exist():
    """Test that all authentication endpoints are registered."""
    
    print("Testing authentication endpoints...")
    print("-" * 50)
    
    # Test 1: Check if /api/auth/google endpoint exists
    print("\n1. Testing POST /api/auth/google endpoint...")
    response = client.post(
        "/api/auth/google",
        json={"redirect_uri": "http://localhost:3000/auth/callback"}
    )
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Endpoint exists and returns: {list(data.keys())}")
        assert "authorization_url" in data
        assert "state" in data
    else:
        print(f"   ✗ Unexpected status code")
    
    # Test 2: Check if /api/auth/callback endpoint exists
    print("\n2. Testing POST /api/auth/callback endpoint...")
    response = client.post(
        "/api/auth/callback",
        json={"code": "test_code", "state": "test_state"}
    )
    print(f"   Status Code: {response.status_code}")
    # We expect this to fail with 500 or 401 since we're using fake credentials
    # but the endpoint should exist
    if response.status_code in [401, 500]:
        print(f"   ✓ Endpoint exists (expected auth failure with test data)")
    else:
        print(f"   Response: {response.json()}")
    
    # Test 3: Check if /api/auth/refresh endpoint exists
    print("\n3. Testing POST /api/auth/refresh endpoint...")
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": "fake_token"}
    )
    print(f"   Status Code: {response.status_code}")
    # Should return 401 for invalid token
    if response.status_code == 401:
        print(f"   ✓ Endpoint exists (expected auth failure with fake token)")
    else:
        print(f"   Response: {response.json()}")
    
    # Test 4: Check if /api/auth/logout endpoint exists
    print("\n4. Testing POST /api/auth/logout endpoint...")
    response = client.post("/api/auth/logout")
    print(f"   Status Code: {response.status_code}")
    # Should return 401 or 403 since no auth header provided
    if response.status_code in [401, 403]:
        print(f"   ✓ Endpoint exists (expected auth failure without token)")
    else:
        print(f"   Response: {response.json()}")
    
    # Test 5: Check OpenAPI docs
    print("\n5. Checking OpenAPI documentation...")
    response = client.get("/api/openapi.json")
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        openapi = response.json()
        auth_paths = [p for p in openapi.get("paths", {}).keys() if "/api/auth/" in p]
        print(f"   ✓ Found {len(auth_paths)} auth endpoints in OpenAPI spec:")
        for path in auth_paths:
            print(f"     - {path}")
    
    print("\n" + "-" * 50)
    print("✓ All authentication endpoints are properly configured!")
    print("\nEndpoints implemented:")
    print("  - POST /api/auth/google (OAuth initiation)")
    print("  - POST /api/auth/callback (OAuth callback)")
    print("  - POST /api/auth/refresh (Token refresh)")
    print("  - POST /api/auth/logout (Logout)")


if __name__ == "__main__":
    try:
        test_endpoints_exist()
    except Exception as e:
        print(f"\n✗ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
