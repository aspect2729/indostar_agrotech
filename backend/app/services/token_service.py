"""
JWT token management service.

This module handles JWT token generation, verification, and refresh
for authentication and authorization.
"""

from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

from app.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


class TokenService:
    """Service class for JWT token operations."""
    
    def __init__(self):
        self.secret_key = settings.jwt_secret
        self.algorithm = settings.jwt_algorithm
        self.access_token_expire_minutes = settings.access_token_expire_minutes
        self.refresh_token_expire_days = settings.refresh_token_expire_days
    
    def create_access_token(
        self,
        user: User,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT access token with user claims.
        
        Args:
            user: User object
            expires_delta: Optional custom expiration time
            
        Returns:
            str: Encoded JWT access token
        """
        # Prepare token data
        to_encode = {
            "sub": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "type": "access"
        }
        
        # Set expiration time
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode["exp"] = expire
        to_encode["iat"] = datetime.utcnow()
        
        # Encode token
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        logger.info(f"Created access token for user: {user.email}")
        return encoded_jwt
    
    def create_refresh_token(
        self,
        user: User,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT refresh token.
        
        Args:
            user: User object
            expires_delta: Optional custom expiration time
            
        Returns:
            str: Encoded JWT refresh token
        """
        # Prepare token data (minimal claims for refresh token)
        to_encode = {
            "sub": str(user.id),
            "email": user.email,
            "type": "refresh"
        }
        
        # Set expiration time
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        to_encode["exp"] = expire
        to_encode["iat"] = datetime.utcnow()
        
        # Encode token
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        logger.info(f"Created refresh token for user: {user.email}")
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token.
        
        Args:
            token: JWT token string
            token_type: Expected token type ('access' or 'refresh')
            
        Returns:
            dict: Decoded token payload if valid, None otherwise
            
        Raises:
            JWTError: If token is invalid or expired
        """
        try:
            # Decode token
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            
            # Verify token type
            if payload.get("type") != token_type:
                logger.warning(f"Invalid token type. Expected: {token_type}, Got: {payload.get('type')}")
                raise JWTError("Invalid token type")
            
            # Verify expiration
            exp = payload.get("exp")
            if exp is None:
                raise JWTError("Token has no expiration")
            
            if datetime.fromtimestamp(exp) < datetime.utcnow():
                raise JWTError("Token has expired")
            
            return payload
            
        except JWTError as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Decode JWT token without verification (for debugging).
        
        Args:
            token: JWT token string
            
        Returns:
            dict: Decoded token payload
        """
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_signature": False}
            )
            return payload
        except JWTError as e:
            logger.error(f"Token decoding failed: {str(e)}")
            return None
    
    def create_token_pair(self, user: User) -> Dict[str, Any]:
        """
        Create both access and refresh tokens for a user.
        
        Args:
            user: User object
            
        Returns:
            dict: Dictionary containing access_token, refresh_token, and metadata
        """
        access_token = self.create_access_token(user)
        refresh_token = self.create_refresh_token(user)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": self.access_token_expire_minutes * 60,  # Convert to seconds
            "user_id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role
        }


# Singleton instance
token_service = TokenService()
