"""
Test subscription endpoint to see the actual error
"""
import requests
import json

backend_url = "https://indostar-agrotech-1.onrender.com"

print("Testing subscription endpoint...")
print("=" * 60)

# First, let's test if the endpoint exists
try:
    # Try to get subscriptions (should require auth)
    response = requests.get(f"{backend_url}/api/subscriptions", timeout=10)
    print(f"GET /api/subscriptions: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {str(e)}")

print("\n" + "=" * 60)

# Test POST (will fail without auth, but we can see the error)
try:
    test_data = {
        "product_id": "test123",
        "default_quantity_liters": 1.0,
        "delivery_address": {
            "street": "Test St",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456",
            "phone": "1234567890"
        },
        "delivery_time_preference": "morning",
        "skip_days": []
    }
    
    response = requests.post(
        f"{backend_url}/api/subscriptions",
        json=test_data,
        timeout=10
    )
    print(f"POST /api/subscriptions: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {str(e)}")
