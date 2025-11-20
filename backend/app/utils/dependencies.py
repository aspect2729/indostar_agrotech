"""
FastAPI dependencies for authentication and authorization.

This module provides dependency functions for protecting routes
and enforcing role-based access control.
"""

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from typing import Optional, List

from app.services.token_service import token_service
from app.services.auth_service import auth_service
from app.models.user import User
from app.exceptions import AuthenticationException, AuthorizationException

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Dependency to get current authenticated user from JWT token.
    
    This dependency extracts the JWT token from the Authorization header,
    verifies it, and returns the corresponding user object.
    
    Args:
        credentials: HTTP Bearer credentials from request header
        
    Returns:
        User: Current authenticated user
        
    Raises:
        AuthenticationException: If token is invalid or user not found
    """
    try:
        # Extract token
        token = credentials.credentials
        
        # Verify token
        payload = token_service.verify_token(token, token_type="access")
        
        if payload is None:
            raise AuthenticationException("Invalid or expired token")
        
        # Extract user ID
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationException("Invalid token payload")
        
        # Fetch user from database
        user = await auth_service.get_user_by_id(user_id)
        
        if user is None:
            raise AuthenticationException("User not found")
        
        return user
        
    except JWTError:
        raise AuthenticationException("Could not validate credentials")
    except AuthenticationException:
        raise


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """
    Dependency to get current user if authenticated, None otherwise.
    
    This is useful for endpoints that have different behavior for
    authenticated vs unauthenticated users.
    
    Args:
        credentials: Optional HTTP Bearer credentials
        
    Returns:
        User or None: Current user if authenticated, None otherwise
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except AuthenticationException:
        return None


class RoleChecker:
    """
    Dependency class for role-based access control.
    
    This class creates dependencies that check if the current user
    has one of the required roles.
    """
    
    def __init__(self, allowed_roles: List[str]):
        """
        Initialize role checker with allowed roles.
        
        Args:
            allowed_roles: List of roles that are allowed access
        """
        self.allowed_roles = allowed_roles
    
    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has required role.
        
        Args:
            current_user: Current authenticated user
            
        Returns:
            User: Current user if authorized
            
        Raises:
            AuthorizationException: If user doesn't have required role
        """
        if current_user.role not in self.allowed_roles:
            raise AuthorizationException(
                message=f"Access denied. Required roles: {', '.join(self.allowed_roles)}",
                details={"user_role": current_user.role, "required_roles": self.allowed_roles}
            )
        
        return current_user


# Pre-configured role checkers for common use cases
require_owner = RoleChecker(["owner"])
require_distributor = RoleChecker(["distributor", "owner"])
require_consumer = RoleChecker(["consumer", "distributor", "owner"])
require_owner_or_distributor = RoleChecker(["owner", "distributor"])
