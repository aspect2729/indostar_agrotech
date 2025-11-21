"""Test registration with a unique email."""

import requests
import json
import random

backend_url = "https://indostar-agrotech-1.onrender.com"

# Generate unique email
unique_id = random.randint(10000, 99999)
test_data = {
    "email": f"testuser{unique_id}@example.com",
    "password": "TestPass123!",
    "name": f"Test User {unique_id}",
    "role": "consumer",
    "phone": f"+9198765{unique_id}"
}

print("Testing email registration with unique email...")
print(f"Email: {test_data['email']}\n")

try:
    response = requests.post(
        f"{backend_url}/api/auth/register/email",
        json=test_data,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("\n✅ SUCCESS! Email registration works!")
        data = response.json()
        print(f"\nUser registered:")
        print(f"  - Email: {data.get('email')}")
        print(f"  - Name: {data.get('name')}")
        print(f"  - Role: {data.get('role')}")
        print(f"  - User ID: {data.get('user_id')}")
        print(f"\n🎉 Email authentication is now working!")
    else:
        print(f"\n❌ Error: {response.status_code}")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
            
except Exception as e:
    print(f"\n❌ Request Error: {e}")
