"""
Authentication API endpoints.

This module provides endpoints for Google OAuth authentication,
token management, and logout functionality.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from google_auth_oauthlib.flow import Flow
from google.auth.transport import requests as google_requests
from jose import JWTError
import secrets
import logging
from typing import Dict

from app.schemas.auth import (
    GoogleAuthRequest,
    GoogleAuthCallbackRequest,
    TokenResponse,
    RefreshTokenRequest,
    LogoutResponse,
    EmailRegisterRequest,
    EmailLoginRequest,
    PhoneLoginRequest
)
from app.services.auth_service import auth_service
from app.services.token_service import token_service
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/google", response_model=Dict[str, str])
async def initiate_google_oauth(request: GoogleAuthRequest):
    """
    Initiate Google OAuth flow.
    
    This endpoint generates a Google OAuth authorization URL that the
    frontend should redirect the user to for authentication.
    
    Args:
        request: GoogleAuthRequest containing redirect_uri
        
    Returns:
        dict: Contains authorization_url and state for CSRF protection
        
    Requirements: 4.1, 4.2
    """
    try:
        # Generate random state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Generate Google OAuth URL
        auth_url = auth_service.generate_google_oauth_url(state)
        
        logger.info("Generated Google OAuth URL")
        
        return {
            "authorization_url": auth_url,
            "state": state
        }
        
    except Exception as e:
        logger.error(f"Error initiating Google OAuth: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate authentication: {str(e)}"
        )


@router.post("/callback", response_model=TokenResponse)
async def google_oauth_callback(request: GoogleAuthCallbackRequest):
    """
    Handle Google OAuth callback.
    
    This endpoint receives the authorization code from Google, exchanges it
    for user information, creates or updates the user in the database,
    and returns JWT tokens.
    
    Args:
        request: GoogleAuthCallbackRequest containing code and state
        
    Returns:
        TokenResponse: JWT tokens and user information
        
    Requirements: 4.1, 4.2, 4.3, 4.4
    """
    try:
        # Create OAuth flow
        flow = Flow.from_client_config(
            client_config={
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.google_redirect_uri]
                }
            },
            scopes=["openid", "email", "profile"]
        )
        
        flow.redirect_uri = settings.google_redirect_uri
        
        # Exchange authorization code for tokens
        flow.fetch_token(code=request.code)
        
        # Get credentials
        credentials = flow.credentials
        
        # Verify ID token and get user info
        id_token = credentials.id_token
        google_info = await auth_service.verify_google_token(id_token)
        
        # Create or update user
        user = await auth_service.create_or_update_user(
            google_id=google_info["google_id"],
            email=google_info["email"],
            name=google_info["name"],
            picture=google_info.get("picture")
        )
        
        # Generate JWT tokens
        token_data = token_service.create_token_pair(user)
        
        logger.info(f"User authenticated successfully: {user.email}")
        
        return TokenResponse(**token_data)
        
    except ValueError as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error in OAuth callback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    
    This endpoint accepts a refresh token and returns a new access token
    and refresh token pair.
    
    Args:
        request: RefreshTokenRequest containing refresh_token
        
    Returns:
        TokenResponse: New JWT tokens and user information
        
    Requirements: 4.4, 4.5
    """
    try:
        # Verify refresh token
        payload = token_service.verify_token(request.refresh_token, token_type="refresh")
        
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Extract user ID
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Fetch user from database
        user = await auth_service.get_user_by_id(user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Generate new token pair
        token_data = token_service.create_token_pair(user)
        
        logger.info(f"Token refreshed for user: {user.email}")
        
        return TokenResponse(**token_data)
        
    except JWTError as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user.
    
    This endpoint invalidates the current session. In a stateless JWT system,
    the actual token invalidation happens on the client side by removing
    the stored tokens. This endpoint serves as a confirmation and can be
    extended to maintain a token blacklist if needed.
    
    Args:
        current_user: Current authenticated user (from dependency)
        
    Returns:
        LogoutResponse: Success message
        
    Requirements: 4.5
    """
    try:
        logger.info(f"User logged out: {current_user.email}")
        
        # In a stateless JWT system, logout is handled client-side
        # by removing tokens from storage. This endpoint confirms the action.
        # Future enhancement: Implement token blacklist for revocation
        
        return LogoutResponse(message="Successfully logged out")
        
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )



@router.post("/register/email", response_model=TokenResponse)
async def register_with_email(request: EmailRegisterRequest):
    """Register a new user with email and password."""
    try:
        user = await auth_service.register_user_with_email(
            email=request.email,
            password=request.password,
            name=request.name,
            role=request.role,
            phone=request.phone
        )
        
        token_data = token_service.create_token_pair(user)
        logger.info(f"User registered with email: {request.email}")
        
        return TokenResponse(**token_data)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login/email", response_model=TokenResponse)
async def login_with_email(request: EmailLoginRequest):
    """Login with email and password."""
    try:
        user = await auth_service.authenticate_with_email(
            email=request.email,
            password=request.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        token_data = token_service.create_token_pair(user)
        logger.info(f"User logged in with email: {request.email}")
        
        return TokenResponse(**token_data)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/login/phone", response_model=TokenResponse)
async def login_with_phone(request: PhoneLoginRequest):
    """Login with phone and password."""
    try:
        user = await auth_service.authenticate_with_phone(
            phone=request.phone,
            password=request.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid phone or password"
            )
        
        token_data = token_service.create_token_pair(user)
        logger.info(f"User logged in with phone: {request.phone}")
        
        return TokenResponse(**token_data)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )
