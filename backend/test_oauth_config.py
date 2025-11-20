"""
Test script to verify Google OAuth configuration
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
import requests


def test_oauth_config():
    """Test Google OAuth configuration"""
    print("=" * 60)
    print("Google OAuth Configuration Test")
    print("=" * 60)
    
    # Check environment variables
    print("\n1. Environment Variables:")
    print(f"   ✓ GOOGLE_CLIENT_ID: {settings.google_client_id[:20]}...")
    print(f"   ✓ GOOGLE_CLIENT_SECRET: {settings.google_client_secret[:10]}...")
    print(f"   ✓ GOOGLE_REDIRECT_URI: {settings.google_redirect_uri}")
    print(f"   ✓ CORS_ORIGINS: {settings.cors_origins}")
    
    # Test backend health
    print("\n2. Backend Health Check:")
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        if response.status_code == 200:
            print("   ✓ Backend is running")
        else:
            print(f"   ✗ Backend returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ✗ Backend is not running!")
        print("   → Start backend with: cd backend && uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    # Test OAuth endpoint
    print("\n3. OAuth Endpoint Test:")
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/google",
            json={"redirect_uri": "http://localhost:3000/login"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if "authorization_url" in data and "state" in data:
                print("   ✓ OAuth endpoint working")
                print(f"   ✓ Authorization URL generated")
                print(f"   ✓ State token: {data['state'][:20]}...")
                
                # Check if URL is valid
                auth_url = data["authorization_url"]
                if "accounts.google.com" in auth_url:
                    print("   ✓ Google OAuth URL is valid")
                else:
                    print(f"   ✗ Invalid OAuth URL: {auth_url}")
            else:
                print("   ✗ Response missing required fields")
                print(f"   Response: {data}")
        else:
            print(f"   ✗ OAuth endpoint returned status {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ✗ Error testing OAuth endpoint: {e}")
        return False
    
    # Check Google OAuth configuration
    print("\n4. Google Cloud Console Configuration:")
    print("   Please verify the following in Google Cloud Console:")
    print("   → Go to: https://console.cloud.google.com/")
    print("   → Navigate to: APIs & Services > Credentials")
    print("   → Click on your OAuth 2.0 Client ID")
    print("   → Verify 'Authorized redirect URIs' includes:")
    print(f"     • {settings.google_redirect_uri}")
    print("     • http://localhost:3000/login")
    
    print("\n5. Frontend Configuration:")
    frontend_env = os.path.join(os.path.dirname(__file__), "..", "frontend", ".env")
    if os.path.exists(frontend_env):
        with open(frontend_env, 'r') as f:
            content = f.read()
            if settings.google_client_id in content:
                print("   ✓ Frontend has correct GOOGLE_CLIENT_ID")
            else:
                print("   ✗ Frontend GOOGLE_CLIENT_ID mismatch")
            
            if "http://localhost:8000" in content:
                print("   ✓ Frontend API_URL is correct")
            else:
                print("   ✗ Frontend API_URL may be incorrect")
    else:
        print("   ⚠ Frontend .env file not found")
    
    print("\n" + "=" * 60)
    print("Configuration Test Complete")
    print("=" * 60)
    
    print("\n📋 Next Steps:")
    print("1. If all checks passed, try logging in at http://localhost:3000/login")
    print("2. Open browser DevTools (F12) and check Console for errors")
    print("3. Check Network tab for failed requests")
    print("4. If issues persist, check GOOGLE_OAUTH_DEBUG.md for detailed troubleshooting")
    
    return True


if __name__ == "__main__":
    try:
        test_oauth_config()
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
