"""
Test if backend API is accessible
"""
import requests

# Test deployed backend on Render
backend_url = "https://indostar-agrotech-1.onrender.com"

print(f"Testing backend at: {backend_url}")
print("=" * 60)

# Test 1: Health check
try:
    response = requests.get(f"{backend_url}/api/health", timeout=10)
    print(f"✓ Health check: {response.status_code}")
    if response.status_code == 200:
        print(f"  Response: {response.json()}")
except Exception as e:
    print(f"✗ Health check failed: {str(e)}")

print()

# Test 2: Get products
try:
    response = requests.get(f"{backend_url}/api/products", timeout=10)
    print(f"✓ Get products: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  Total products: {data.get('total', 0)}")
        if data.get('data'):
            print(f"  First product: {data['data'][0]['name']}")
    else:
        print(f"  Error: {response.text}")
except Exception as e:
    print(f"✗ Get products failed: {str(e)}")

print()

# Test 3: Root endpoint
try:
    response = requests.get(f"{backend_url}/", timeout=10)
    print(f"✓ Root endpoint: {response.status_code}")
    if response.status_code == 200:
        print(f"  Response: {response.json()}")
except Exception as e:
    print(f"✗ Root endpoint failed: {str(e)}")
