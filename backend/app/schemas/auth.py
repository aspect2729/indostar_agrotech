"""
Authentication request and response schemas.
"""

from pydantic import BaseModel, Field
from typing import Literal


class GoogleAuthRequest(BaseModel):
    """Request schema for initiating Google OAuth flow."""
    redirect_uri: str = Field(..., description="Frontend redirect URI after authentication")
    
    class Config:
        json_schema_extra = {
            "example": {
                "redirect_uri": "http://localhost:3000/auth/callback"
            }
        }


class GoogleAuthCallbackRequest(BaseModel):
    """Request schema for Google OAuth callback."""
    code: str = Field(..., description="Authorization code from Google")
    state: str = Field(..., description="State parameter for CSRF protection")
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": "4/0AX4XfWh...",
                "state": "random_state_string"
            }
        }


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user_id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    name: str = Field(..., description="User name")
    role: Literal["consumer", "distributor", "owner"] = Field(..., description="User role")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user_id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "name": "John Doe",
                "role": "consumer"
            }
        }


class RefreshTokenRequest(BaseModel):
    """Request schema for refreshing access token."""
    refresh_token: str = Field(..., description="Refresh token")
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class LogoutResponse(BaseModel):
    """Response schema for logout."""
    message: str = Field(default="Successfully logged out")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Successfully logged out"
            }
        }


class EmailRegisterRequest(BaseModel):
    """Request schema for email registration."""
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=8, max_length=100, description="User password")
    name: str = Field(..., min_length=1, max_length=100, description="User name")
    role: Literal["consumer", "distributor", "owner"] = Field(..., description="User role")
    phone: str | None = Field(None, description="User phone number")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!",
                "name": "John Doe",
                "role": "consumer",
                "phone": "+919876543210"
            }
        }


class EmailLoginRequest(BaseModel):
    """Request schema for email login."""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }


class PhoneLoginRequest(BaseModel):
    """Request schema for phone login."""
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$", description="User phone number")
    password: str = Field(..., description="User password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+919876543210",
                "password": "SecurePass123!"
            }
        }
