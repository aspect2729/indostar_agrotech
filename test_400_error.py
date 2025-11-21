"""Test to see the actual 400 error details."""

import requests
import json

backend_url = "https://indostar-agrotech-1.onrender.com"

# Test with the exact data the frontend is sending
test_data = {
    "email": "newuser@example.com",
    "password": "TestPass123!",
    "name": "New User",
    "role": "consumer",
    "phone": "+919876543210"
}

print("Testing email registration...")
print(f"Data: {json.dumps(test_data, indent=2)}\n")

try:
    response = requests.post(
        f"{backend_url}/api/auth/register/email",
        json=test_data,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}\n")
    
    try:
        error_data = response.json()
        print("Response JSON:")
        print(json.dumps(error_data, indent=2))
        
        # Check if it's a validation error
        if "detail" in error_data:
            print(f"\n❌ Error: {error_data['detail']}")
        if "validation_errors" in error_data:
            print("\nValidation Errors:")
            for err in error_data['validation_errors']:
                print(f"  - {err.get('field')}: {err.get('message')}")
                
    except Exception as e:
        print(f"Raw Response: {response.text}")
        print(f"Parse Error: {e}")
        
except Exception as e:
    print(f"❌ Request Error: {e}")

# Also test without phone
print("\n" + "="*60)
print("Testing without phone number...")
test_data_no_phone = {
    "email": "newuser2@example.com",
    "password": "TestPass123!",
    "name": "New User 2",
    "role": "consumer"
}

try:
    response = requests.post(
        f"{backend_url}/api/auth/register/email",
        json=test_data_no_phone,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    try:
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except:
        print(f"Raw Response: {response.text}")
        
except Exception as e:
    print(f"❌ Request Error: {e}")
