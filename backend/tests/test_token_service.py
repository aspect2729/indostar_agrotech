"""
Unit tests for token service.
"""

import pytest
from datetime import datetime, timedelta
from jose import JWTError

from app.services.token_service import token_service


class TestTokenService:
    """Test cases for TokenService."""
    
    def test_create_access_token(self, sample_consumer_user):
        """Test creating an access token."""
        token = token_service.create_access_token(sample_consumer_user)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_refresh_token(self, sample_consumer_user):
        """Test creating a refresh token."""
        token = token_service.create_refresh_token(sample_consumer_user)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_verify_access_token(self, sample_consumer_user):
        """Test verifying a valid access token."""
        token = token_service.create_access_token(sample_consumer_user)
        payload = token_service.verify_token(token, token_type="access")
        
        assert payload is not None
        assert payload["sub"] == str(sample_consumer_user.id)
        assert payload["email"] == sample_consumer_user.email
        assert payload["role"] == sample_consumer_user.role
        assert payload["type"] == "access"
    
    def test_verify_refresh_token(self, sample_consumer_user):
        """Test verifying a valid refresh token."""
        token = token_service.create_refresh_token(sample_consumer_user)
        payload = token_service.verify_token(token, token_type="refresh")
        
        assert payload is not None
        assert payload["sub"] == str(sample_consumer_user.id)
        assert payload["email"] == sample_consumer_user.email
        assert payload["type"] == "refresh"
    
    def test_verify_token_wrong_type(self, sample_consumer_user):
        """Test verifying token with wrong type."""
        access_token = token_service.create_access_token(sample_consumer_user)
        
        with pytest.raises(JWTError):
            token_service.verify_token(access_token, token_type="refresh")
    
    def test_verify_expired_token(self, sample_consumer_user):
        """Test verifying an expired token."""
        # Create token with negative expiration
        expired_token = token_service.create_access_token(
            sample_consumer_user,
            expires_delta=timedelta(seconds=-1)
        )
        
        with pytest.raises(JWTError):
            token_service.verify_token(expired_token, token_type="access")
    
    def test_create_token_pair(self, sample_consumer_user):
        """Test creating both access and refresh tokens."""
        token_pair = token_service.create_token_pair(sample_consumer_user)
        
        assert "access_token" in token_pair
        assert "refresh_token" in token_pair
        assert "token_type" in token_pair
        assert "expires_in" in token_pair
        assert token_pair["token_type"] == "bearer"
        assert token_pair["user_id"] == str(sample_consumer_user.id)
        assert token_pair["email"] == sample_consumer_user.email
        assert token_pair["role"] == sample_consumer_user.role
    
    def test_decode_token(self, sample_consumer_user):
        """Test decoding token without verification."""
        token = token_service.create_access_token(sample_consumer_user)
        payload = token_service.decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == str(sample_consumer_user.id)
        assert payload["email"] == sample_consumer_user.email
