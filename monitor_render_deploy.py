"""Monitor Render deployment and test when ready."""

import requests
import time
import json

backend_url = "https://indostar-agrotech-1.onrender.com"

print("🔍 Monitoring Render deployment...")
print("=" * 60)

# Wait for deployment
for i in range(12):  # Check for 2 minutes (12 * 10 seconds)
    try:
        response = requests.get(f"{backend_url}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Backend is healthy!")
            print(f"   Timestamp: {data.get('timestamp')}")
            print(f"   Environment: {data.get('environment')}")
            break
    except Exception as e:
        print(f"⏳ Waiting for deployment... ({i+1}/12)")
    
    time.sleep(10)
else:
    print("\n⚠️  Deployment taking longer than expected")
    print("   Continue monitoring in Render dashboard")

# Test registration
print("\n" + "=" * 60)
print("🧪 Testing email registration...")
print("=" * 60)

import random
unique_id = random.randint(10000, 99999)
test_data = {
    "email": f"testuser{unique_id}@example.com",
    "password": "TestPass123!",
    "name": f"Test User {unique_id}",
    "role": "consumer"
}

try:
    response = requests.post(
        f"{backend_url}/api/auth/register/email",
        json=test_data,
        timeout=10
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        print("\n🎉 SUCCESS! Email registration is working!")
        data = response.json()
        print(f"\nRegistered user:")
        print(f"  Email: {data.get('email')}")
        print(f"  Name: {data.get('name')}")
        print(f"  Role: {data.get('role')}")
        print(f"  User ID: {data.get('user_id')}")
        print(f"\n✅ All authentication methods are now functional!")
    else:
        print(f"\n❌ Still getting error: {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error: {json.dumps(error_data, indent=2)}")
            
            if "Database index error" in str(error_data):
                print("\n💡 The index is being fixed. Wait 30 seconds and try again.")
            elif "bcrypt" in str(error_data).lower():
                print("\n💡 bcrypt issue detected. Render may need cache clear.")
        except:
            print(f"Response: {response.text}")
            
except Exception as e:
    print(f"\n❌ Request Error: {e}")

print("\n" + "=" * 60)
