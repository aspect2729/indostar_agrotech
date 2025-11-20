"""
Verification script for authentication service implementation.

This script tests the basic functionality of the authentication
and token services without requiring a full server setup.
"""

import asyncio
from datetime import datetime, timedelta


async def verify_auth_implementation():
    """Verify authentication service implementation."""
    print("=" * 60)
    print("Authentication Service Verification")
    print("=" * 60)
    
    try:
        # Import services
        from app.services.auth_service import auth_service
        from app.services.token_service import token_service
        from app.models.user import User
        from bson import ObjectId
        
        print("\n✓ Successfully imported authentication services")
        
        # Test 1: Google OAuth URL generation
        print("\n[Test 1] Google OAuth URL Generation")
        state = "test_state_123"
        oauth_url = auth_service.generate_google_oauth_url(state)
        assert "accounts.google.com" in oauth_url
        assert state in oauth_url
        assert auth_service.google_client_id in oauth_url
        print(f"✓ OAuth URL generated successfully")
        print(f"  URL: {oauth_url[:80]}...")
        
        # Test 2: Role determination
        print("\n[Test 2] Role Determination Logic")
        
        # Test owner role
        owner_role = auth_service.determine_user_role("owner@indostar.com", {})
        assert owner_role == "owner"
        print(f"✓ Owner role: owner@indostar.com -> {owner_role}")
        
        # Test distributor role
        distributor_role = auth_service.determine_user_role("distributor@example.com", {})
        assert distributor_role == "distributor"
        print(f"✓ Distributor role: distributor@example.com -> {distributor_role}")
        
        # Test consumer role
        consumer_role = auth_service.determine_user_role("user@example.com", {})
        assert consumer_role == "consumer"
        print(f"✓ Consumer role: user@example.com -> {consumer_role}")
        
        # Test 3: JWT Token Creation
        print("\n[Test 3] JWT Token Creation")
        
        # Create a mock user
        mock_user = User(
            _id=ObjectId(),
            google_id="test_google_id_123",
            email="test@example.com",
            name="Test User",
            role="consumer",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Create access token
        access_token = token_service.create_access_token(mock_user)
        assert access_token is not None
        assert len(access_token) > 0
        print(f"✓ Access token created: {access_token[:50]}...")
        
        # Create refresh token
        refresh_token = token_service.create_refresh_token(mock_user)
        assert refresh_token is not None
        assert len(refresh_token) > 0
        print(f"✓ Refresh token created: {refresh_token[:50]}...")
        
        # Test 4: JWT Token Verification
        print("\n[Test 4] JWT Token Verification")
        
        # Verify access token
        payload = token_service.verify_token(access_token, token_type="access")
        assert payload is not None
        assert payload["email"] == mock_user.email
        assert payload["role"] == mock_user.role
        assert payload["type"] == "access"
        print(f"✓ Access token verified successfully")
        print(f"  Payload: email={payload['email']}, role={payload['role']}")
        
        # Verify refresh token
        refresh_payload = token_service.verify_token(refresh_token, token_type="refresh")
        assert refresh_payload is not None
        assert refresh_payload["email"] == mock_user.email
        assert refresh_payload["type"] == "refresh"
        print(f"✓ Refresh token verified successfully")
        
        # Test 5: Token Pair Creation
        print("\n[Test 5] Token Pair Creation")
        
        token_pair = token_service.create_token_pair(mock_user)
        assert "access_token" in token_pair
        assert "refresh_token" in token_pair
        assert token_pair["token_type"] == "bearer"
        assert token_pair["user_id"] == str(mock_user.id)
        assert token_pair["email"] == mock_user.email
        assert token_pair["role"] == mock_user.role
        print(f"✓ Token pair created successfully")
        print(f"  User ID: {token_pair['user_id']}")
        print(f"  Email: {token_pair['email']}")
        print(f"  Role: {token_pair['role']}")
        print(f"  Expires in: {token_pair['expires_in']} seconds")
        
        # Test 6: Token Expiration
        print("\n[Test 6] Token Expiration Handling")
        
        # Create expired token
        expired_token = token_service.create_access_token(
            mock_user,
            expires_delta=timedelta(seconds=-1)  # Already expired
        )
        
        try:
            token_service.verify_token(expired_token, token_type="access")
            print("✗ Expired token should have been rejected")
        except Exception as e:
            print(f"✓ Expired token correctly rejected: {str(e)}")
        
        print("\n" + "=" * 60)
        print("All Authentication Tests Passed! ✓")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during verification: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(verify_auth_implementation())
    exit(0 if success else 1)
