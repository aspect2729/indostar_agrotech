"""
Google OAuth Configuration Verification Script

This script helps verify that your Google OAuth credentials are correctly configured.
"""

import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

def verify_google_oauth_config():
    """Verify Google OAuth configuration."""
    
    print("=" * 60)
    print("Google OAuth Configuration Verification")
    print("=" * 60)
    print()
    
    # Get environment variables
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
    
    # Check if variables are set
    print("1. Environment Variables Check:")
    print("-" * 60)
    
    if client_id:
        print(f"✓ GOOGLE_CLIENT_ID: {client_id[:20]}...{client_id[-10:]}")
    else:
        print("✗ GOOGLE_CLIENT_ID: NOT SET")
        return False
    
    if client_secret:
        print(f"✓ GOOGLE_CLIENT_SECRET: {client_secret[:10]}...{client_secret[-5:]}")
    else:
        print("✗ GOOGLE_CLIENT_SECRET: NOT SET")
        return False
    
    if redirect_uri:
        print(f"✓ GOOGLE_REDIRECT_URI: {redirect_uri}")
    else:
        print("✗ GOOGLE_REDIRECT_URI: NOT SET")
        return False
    
    print()
    
    # Validate Client ID format
    print("2. Client ID Format Check:")
    print("-" * 60)
    
    if client_id.endswith('.apps.googleusercontent.com'):
        print("✓ Client ID has correct format")
    else:
        print("✗ Client ID format looks incorrect")
        print("  Expected format: xxxxx.apps.googleusercontent.com")
    
    print()
    
    # Validate Client Secret format
    print("3. Client Secret Format Check:")
    print("-" * 60)
    
    if client_secret.startswith('GOCSPX-'):
        print("✓ Client Secret has correct format")
    else:
        print("⚠ Client Secret format might be incorrect")
        print("  Expected format: GOCSPX-xxxxx")
    
    print()
    
    # Check redirect URI
    print("4. Redirect URI Check:")
    print("-" * 60)
    
    if redirect_uri.startswith('http://localhost') or redirect_uri.startswith('https://'):
        print("✓ Redirect URI format looks correct")
    else:
        print("✗ Redirect URI format looks incorrect")
    
    print()
    
    # Test OAuth URL generation
    print("5. OAuth URL Generation Test:")
    print("-" * 60)
    
    try:
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": "test_state",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join([f"{key}={value}" for key, value in params.items()])
        oauth_url = f"{base_url}?{query_string}"
        
        print("✓ OAuth URL generated successfully")
        print(f"\nGenerated URL (first 100 chars):")
        print(oauth_url[:100] + "...")
        
    except Exception as e:
        print(f"✗ Error generating OAuth URL: {str(e)}")
    
    print()
    
    # Instructions
    print("=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print()
    print("1. Go to Google Cloud Console:")
    print("   https://console.cloud.google.com/apis/credentials")
    print()
    print("2. Click on your OAuth 2.0 Client ID")
    print()
    print("3. Verify these settings:")
    print()
    print("   Application type: Web application")
    print()
    print("   Authorized JavaScript origins:")
    print("   - http://localhost:3000")
    print("   - http://localhost:8000")
    print()
    print("   Authorized redirect URIs:")
    print(f"   - {redirect_uri}")
    print("   - http://localhost:3000/login")
    print()
    print("4. Make sure OAuth consent screen is configured:")
    print("   - Go to: OAuth consent screen")
    print("   - User type: External (for testing)")
    print("   - Add test users if needed")
    print()
    print("5. Common Issues:")
    print()
    print("   Error 401: invalid_client")
    print("   → Wrong Client ID or Client Secret")
    print("   → Copy credentials again from Google Cloud Console")
    print()
    print("   Error 400: redirect_uri_mismatch")
    print("   → Redirect URI not whitelisted in Google Cloud Console")
    print("   → Add the exact URI shown above")
    print()
    print("   Error 403: access_denied")
    print("   → OAuth consent screen not configured")
    print("   → Add your email as a test user")
    print()
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    verify_google_oauth_config()
