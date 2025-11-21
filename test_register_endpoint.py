"""Test email registration endpoint to debug 400 error."""

import requests
import json

# Test data
test_data = {
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User",
    "role": "consumer",
    "phone": "+919876543210"
}

# Backend URL
backend_url = "https://indostar-agrotech-1.onrender.com/api/auth/register/email"

print("Testing email registration endpoint...")
print(f"URL: {backend_url}")
print(f"Data: {json.dumps(test_data, indent=2)}")
print()

try:
    response = requests.post(backend_url, json=test_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 400:
        print("\n❌ 400 Bad Request Error")
        try:
            error_detail = response.json()
            print(f"Error Details: {json.dumps(error_detail, indent=2)}")
        except:
            print(f"Raw Response: {response.text}")
    elif response.status_code == 200:
        print("\n✅ Registration successful!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"\n⚠️ Unexpected status code: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
