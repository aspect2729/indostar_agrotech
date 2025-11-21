"""Test with a specific email to see the exact error."""

import requests
import json

backend_url = "https://indostar-agrotech-1.onrender.com"

# Test with the email you're trying to use
print("What email are you trying to register with?")
print("Testing with a sample email first...\n")

test_data = {
    "email": "mytest@example.com",  # Change this to the email you're using
    "password": "TestPass123!",
    "name": "My Test User",
    "role": "consumer"
}

print(f"Testing registration with: {test_data['email']}")
print(f"Data being sent:")
print(json.dumps(test_data, indent=2))
print()

try:
    response = requests.post(
        f"{backend_url}/api/auth/register/email",
        json=test_data,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        print("✅ SUCCESS!")
        data = response.json()
        print(f"User ID: {data.get('user_id')}")
        print(f"Email: {data.get('email')}")
    elif response.status_code == 400:
        print("❌ 400 Bad Request")
        try:
            error = response.json()
            print(f"Error: {json.dumps(error, indent=2)}")
            
            if "detail" in error:
                detail = error["detail"]
                if "already registered" in detail.lower():
                    print("\n💡 This email is already in the database.")
                    print("   Try a different email address.")
                elif "validation" in detail.lower():
                    print("\n💡 Validation error - check your input data.")
                else:
                    print(f"\n💡 Error: {detail}")
        except:
            print(f"Raw response: {response.text}")
    else:
        print(f"❌ Unexpected status: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Request failed: {e}")

print("\n" + "="*60)
print("To test with your specific email:")
print("1. Edit this file (test_specific_email.py)")
print("2. Change the email on line 11")
print("3. Run: python test_specific_email.py")
