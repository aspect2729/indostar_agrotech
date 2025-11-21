"""Detailed backend testing to identify the issue."""

import requests
import json

backend_url = "https://indostar-agrotech-1.onrender.com"

print("=" * 60)
print("BACKEND HEALTH CHECK")
print("=" * 60)

# Test 1: Health endpoint
try:
    response = requests.get(f"{backend_url}/api/health")
    print(f"✅ Health: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"❌ Health check failed: {e}")

print("\n" + "=" * 60)
print("TEST EMAIL REGISTRATION")
print("=" * 60)

# Test 2: Email registration with different data
test_cases = [
    {
        "name": "Full registration",
        "data": {
            "email": f"test{hash('test1')}@example.com",
            "password": "TestPass123!",
            "name": "Test User",
            "role": "consumer",
            "phone": "+919876543210"
        }
    },
    {
        "name": "Without phone",
        "data": {
            "email": f"test{hash('test2')}@example.com",
            "password": "TestPass123!",
            "name": "Test User",
            "role": "consumer"
        }
    },
    {
        "name": "Short password (should fail validation)",
        "data": {
            "email": f"test{hash('test3')}@example.com",
            "password": "short",
            "name": "Test User",
            "role": "consumer"
        }
    }
]

for test in test_cases:
    print(f"\nTest: {test['name']}")
    print(f"Data: {json.dumps(test['data'], indent=2)}")
    
    try:
        response = requests.post(
            f"{backend_url}/api/auth/register/email",
            json=test['data'],
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response (raw): {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("TEST GOOGLE OAUTH INITIATION")
print("=" * 60)

try:
    response = requests.post(
        f"{backend_url}/api/auth/google",
        json={"redirect_uri": "https://indostar.vercel.app/auth/callback"},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Google OAuth endpoint working")
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
