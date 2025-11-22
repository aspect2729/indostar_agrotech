#!/usr/bin/env python3
"""Test OTP verify endpoint"""
import requests

backend_url = "https://indostar-agrotech-1.onrender.com"

print("Testing OTP Verify Endpoint...")
print("=" * 50)

# First, send OTP
print("\n1. Sending OTP...")
try:
    response = requests.post(
        f"{backend_url}/api/auth/otp/send",
        json={"phone": "9876543210"}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")
    otp = data.get('otp')
    print(f"OTP: {otp}")
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Now verify OTP
print("\n2. Verifying OTP...")
try:
    response = requests.post(
        f"{backend_url}/api/auth/otp/verify",
        json={
            "phone": "9876543210",
            "otp": otp,
            "name": "Test User",
            "role": "consumer"
        },
        headers={"Origin": "https://indostar.vercel.app"}
    )
    print(f"Status: {response.status_code}")
    print(f"Headers:")
    for key, value in response.headers.items():
        if 'access-control' in key.lower() or 'content-type' in key.lower():
            print(f"  {key}: {value}")
    
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Error Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 50)
