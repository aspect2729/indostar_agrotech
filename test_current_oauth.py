"""
Quick test to see if current OAuth credentials might work
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.config import settings

print("=" * 60)
print("Testing Current OAuth Credentials")
print("=" * 60)
print()

client_id = settings.google_client_id
client_secret = settings.google_client_secret

print(f"Client ID: {client_id}")
print(f"Client Secret: {client_secret[:15]}...")
print()

# Check if these look like real credentials
if client_id.startswith("355932236944-") and len(client_id) > 50:
    print("✓ Client ID format looks valid")
    print("  (Starts with project number, has correct length)")
else:
    print("✗ Client ID format looks invalid")

if client_secret.startswith("GOCSPX-") and len(client_secret) > 20:
    print("✓ Client Secret format looks valid")
    print("  (Starts with GOCSPX-, has correct length)")
else:
    print("✗ Client Secret format looks invalid")

print()
print("=" * 60)
print("Recommendation:")
print("=" * 60)
print()

if client_id.startswith("355932236944-") and client_secret.startswith("GOCSPX-"):
    print("These credentials MIGHT work if they're still configured")
    print("in Google Cloud Console.")
    print()
    print("To test:")
    print("1. Start backend: cd backend && uvicorn main:app --reload")
    print("2. Start frontend: cd frontend && npm start")
    print("3. Try logging in at http://localhost:3000/login")
    print()
    print("If you get 'redirect_uri_mismatch' or 'invalid_client',")
    print("then you need to either:")
    print("  - Use dev login (http://localhost:3000/dev-login)")
    print("  - Set up your own OAuth credentials (see FIX_GOOGLE_OAUTH.md)")
else:
    print("These don't look like valid Google OAuth credentials.")
    print()
    print("You should:")
    print("  - Use dev login for testing (http://localhost:3000/dev-login)")
    print("  - Set up real OAuth credentials (see FIX_GOOGLE_OAUTH.md)")
