"""
Authentication service for Google OAuth and user management.

This module handles Google OAuth flow, user registration/login,
and role assignment logic.
"""

from google.oauth2 import id_token
from google.auth.transport import requests
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from app.config import settings
from app.database import get_users_collection
from app.models.user import User
from bson import ObjectId

logger = logging.getLogger(__name__)


class AuthService:
    """Service class for authentication operations."""
    
    def __init__(self):
        self.google_client_id = settings.google_client_id
        self.google_client_secret = settings.google_client_secret
        self.google_redirect_uri = settings.google_redirect_uri
    
    def generate_google_oauth_url(self, state: str) -> str:
        """
        Generate Google OAuth authorization URL.
        
        Args:
            state: Random state string for CSRF protection
            
        Returns:
            str: Google OAuth authorization URL
        """
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": self.google_client_id,
            "redirect_uri": self.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        
        # Build query string
        query_string = "&".join([f"{key}={value}" for key, value in params.items()])
        return f"{base_url}?{query_string}"
    
    async def verify_google_token(self, token: str) -> Dict[str, Any]:
        """
        Verify Google ID token and extract user information.
        
        Args:
            token: Google ID token
            
        Returns:
            dict: User information from Google (sub, email, name, picture)
            
        Raises:
            ValueError: If token verification fails
        """
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                self.google_client_id
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Invalid token issuer')
            
            return {
                "google_id": idinfo['sub'],
                "email": idinfo['email'],
                "name": idinfo.get('name', ''),
                "picture": idinfo.get('picture', '')
            }
            
        except ValueError as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise ValueError(f"Invalid token: {str(e)}")
    
    async def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """
        Get user by Google ID.
        
        Args:
            google_id: Google user ID
            
        Returns:
            User object if found, None otherwise
        """
        users_collection = get_users_collection()
        user_data = await users_collection.find_one({"google_id": google_id})
        
        if user_data:
            return User(**user_data)
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            email: User email address
            
        Returns:
            User object if found, None otherwise
        """
        users_collection = get_users_collection()
        user_data = await users_collection.find_one({"email": email})
        
        if user_data:
            return User(**user_data)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User object if found, None otherwise
        """
        users_collection = get_users_collection()
        
        try:
            user_data = await users_collection.find_one({"_id": ObjectId(user_id)})
            if user_data:
                return User(**user_data)
        except Exception as e:
            logger.error(f"Error fetching user by ID: {str(e)}")
        
        return None

    def determine_user_role(self, email: str, google_info: Dict[str, Any]) -> str:
        """
        Determine user role based on email and Google profile information.
        
        Role assignment logic:
        - Owner: Specific email addresses configured for business owners
        - Distributor: Email domains or patterns for distributors
        - Consumer: Default role for all other users
        
        Args:
            email: User email address
            google_info: Google profile information
            
        Returns:
            str: User role ('consumer', 'distributor', or 'owner')
        """
        # Owner email addresses (can be configured via environment)
        owner_emails = [
            "owner@indostar.com",
            "admin@indostar.com",
            "indostar.owner@gmail.com"
        ]
        
        # Check if email is in owner list
        if email.lower() in [e.lower() for e in owner_emails]:
            return "owner"
        
        # Distributor patterns (emails containing 'distributor' or specific domains)
        if "distributor" in email.lower() or "wholesale" in email.lower():
            return "distributor"
        
        # Default to consumer
        return "consumer"
    
    async def create_or_update_user(
        self,
        google_id: str,
        email: str,
        name: str,
        picture: Optional[str] = None
    ) -> User:
        """
        Create a new user or update existing user based on Google profile.
        
        This method handles both user registration and login. If a user
        with the given Google ID exists, it updates their information.
        Otherwise, it creates a new user with the appropriate role.
        
        Args:
            google_id: Google user ID
            email: User email address
            name: User display name
            picture: User profile picture URL (optional)
            
        Returns:
            User: Created or updated user object
            
        Raises:
            Exception: If database operation fails
        """
        users_collection = get_users_collection()
        
        # Check if user already exists
        existing_user = await self.get_user_by_google_id(google_id)
        
        if existing_user:
            # Update existing user
            logger.info(f"Updating existing user: {email}")
            
            update_data = {
                "name": name,
                "email": email,
                "updated_at": datetime.utcnow()
            }
            
            await users_collection.update_one(
                {"google_id": google_id},
                {"$set": update_data}
            )
            
            # Fetch and return updated user
            updated_user = await self.get_user_by_google_id(google_id)
            return updated_user
        
        else:
            # Create new user
            logger.info(f"Creating new user: {email}")
            
            # Determine role
            role = self.determine_user_role(email, {"name": name, "picture": picture})
            
            # Create user document
            user_data = {
                "google_id": google_id,
                "email": email,
                "name": name,
                "role": role,
                "phone": None,
                "addresses": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert into database
            result = await users_collection.insert_one(user_data)
            user_data["_id"] = result.inserted_id
            
            # Return new user
            return User(**user_data)


# Singleton instance
auth_service = AuthService()
