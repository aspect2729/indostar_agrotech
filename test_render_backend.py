#!/usr/bin/env python3
"""Test Render backend to see what's happening"""
import requests

backend_url = "https://indostar-agrotech-1.onrender.com"

print("Testing Render Backend...")
print("=" * 50)

# Test 1: Root endpoint
print("\n1. Testing root endpoint...")
try:
    response = requests.get(f"{backend_url}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Health endpoint
print("\n2. Testing health endpoint...")
try:
    response = requests.get(f"{backend_url}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Send OTP (should fail with CORS but we can see the error)
print("\n3. Testing OTP send endpoint...")
try:
    response = requests.post(
        f"{backend_url}/api/auth/otp/send",
        json={"phone": "9876543210"},
        headers={"Origin": "https://indostar.vercel.app"}
    )
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
    else:
        print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 4: Check CORS headers
print("\n4. Testing CORS preflight...")
try:
    response = requests.options(
        f"{backend_url}/api/auth/otp/send",
        headers={
            "Origin": "https://indostar.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"CORS Headers:")
    for key, value in response.headers.items():
        if 'access-control' in key.lower():
            print(f"  {key}: {value}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 50)
print("Test complete!")
