# Authentication Implementation Summary

## Overview

This document summarizes the implementation of Google OAuth authentication and JWT token management for the Indostar E-commerce Application (Task 4).

## Implemented Components

### 1. Authentication Service (`app/services/auth_service.py`)

**Features:**
- Google OAuth URL generation for initiating authentication flow
- Google ID token verification using `google-auth` library
- User lookup by Google ID, email, and user ID
- Automatic role assignment based on email patterns:
  - **Owner**: Specific email addresses (owner@indostar.com, admin@indostar.com, etc.)
  - **Distributor**: Emails containing "distributor" or "wholesale"
  - **Consumer**: Default role for all other users
- User creation and update logic based on Google profile

**Key Methods:**
- `generate_google_oauth_url(state)`: Creates OAuth authorization URL
- `verify_google_token(token)`: Verifies Google ID token and extracts user info
- `get_user_by_google_id(google_id)`: Fetches user from database
- `determine_user_role(email, google_info)`: Assigns role based on email
- `create_or_update_user(...)`: Creates new user or updates existing user

### 2. Token Service (`app/services/token_service.py`)

**Features:**
- JWT access token generation with user claims (sub, email, name, role)
- JWT refresh token generation with minimal claims
- Token verification and decoding
- Token expiration handling
- Token pair creation (access + refresh tokens)

**Configuration:**
- Access token expiration: 30 minutes (configurable)
- Refresh token expiration: 7 days (configurable)
- Algorithm: HS256
- Secret key: Loaded from environment variables

**Key Methods:**
- `create_access_token(user)`: Creates JWT access token
- `create_refresh_token(user)`: Creates JWT refresh token
- `verify_token(token, token_type)`: Verifies and decodes token
- `create_token_pair(user)`: Creates both access and refresh tokens

### 3. Authentication Dependencies (`app/utils/dependencies.py`)

**Features:**
- FastAPI dependency for extracting current user from JWT token
- Role-based access control (RBAC) dependency
- Pre-configured role checkers for common use cases

**Dependencies:**
- `get_current_user()`: Extracts and validates current user from Bearer token
- `get_optional_user()`: Returns user if authenticated, None otherwise
- `RoleChecker(allowed_roles)`: Custom dependency for role-based access

**Pre-configured Role Checkers:**
- `require_owner`: Only owners can access
- `require_distributor`: Distributors and owners can access
- `require_consumer`: All authenticated users can access
- `require_owner_or_distributor`: Owners and distributors can access

## Usage Examples

### Protecting Routes with Authentication

```python
from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_user, require_owner
from app.models.user import User

router = APIRouter()

# Require any authenticated user
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {"user": current_user}

# Require owner role
@router.post("/products")
async def create_product(
    product_data: dict,
    current_user: User = Depends(require_owner)
):
    return {"message": "Product created"}
```

### Creating Tokens

```python
from app.services.token_service import token_service
from app.models.user import User

# After user authentication
user = User(...)  # User object from database

# Create token pair
tokens = token_service.create_token_pair(user)
# Returns: {
#     "access_token": "eyJ...",
#     "refresh_token": "eyJ...",
#     "token_type": "bearer",
#     "expires_in": 1800,
#     "user_id": "...",
#     "email": "...",
#     "name": "...",
#     "role": "..."
# }
```

### Role Assignment Logic

The system automatically assigns roles based on email patterns:

```python
# Owner role
"owner@indostar.com" -> "owner"
"admin@indostar.com" -> "owner"

# Distributor role
"distributor@example.com" -> "distributor"
"wholesale@example.com" -> "distributor"

# Consumer role (default)
"user@example.com" -> "consumer"
```

## Environment Variables Required

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
```

## Security Features

1. **JWT Token Security:**
   - Tokens are signed with HS256 algorithm
   - Access tokens expire after 30 minutes
   - Refresh tokens expire after 7 days
   - Token type verification (access vs refresh)

2. **Google OAuth Security:**
   - Token verification using Google's official library
   - Issuer validation
   - State parameter for CSRF protection (to be implemented in routes)

3. **Role-Based Access Control:**
   - Automatic role assignment based on email
   - Route-level authorization using dependencies
   - Flexible role checker for custom access rules

## Testing

A verification script (`verify_auth.py`) has been created to test the implementation:

```bash
python verify_auth.py
```

**Tests Included:**
1. Google OAuth URL generation
2. Role determination logic
3. JWT token creation (access and refresh)
4. JWT token verification
5. Token pair creation
6. Token expiration handling

All tests pass successfully ✓

## Next Steps

To complete the authentication flow, the following needs to be implemented:

1. **Authentication API Endpoints** (Task 5):
   - POST /api/auth/google - Initiate OAuth flow
   - POST /api/auth/callback - Handle OAuth callback
   - POST /api/auth/refresh - Refresh access token
   - POST /api/auth/logout - Logout user

2. **OAuth Callback Handler:**
   - Exchange authorization code for tokens
   - Verify Google ID token
   - Create or update user in database
   - Return JWT tokens to frontend

3. **Frontend Integration:**
   - Google OAuth button
   - Token storage in localStorage
   - Automatic token refresh
   - Role-based routing

## Dependencies Added

- `email-validator==2.1.0` - For email validation in Pydantic models

## Files Created

1. `backend/app/services/auth_service.py` - Authentication service
2. `backend/app/services/token_service.py` - JWT token management
3. `backend/app/utils/dependencies.py` - FastAPI authentication dependencies
4. `backend/app/services/__init__.py` - Services module exports
5. `backend/app/utils/__init__.py` - Utils module exports
6. `backend/verify_auth.py` - Verification script
7. `backend/AUTHENTICATION_IMPLEMENTATION.md` - This document

## Requirements Satisfied

✓ **Requirement 4.1**: Google OAuth login functionality implemented
✓ **Requirement 4.2**: User role determination based on account type
✓ **Requirement 4.3**: Redirect to appropriate portal based on role (dependencies ready)
✓ **Requirement 4.4**: Secure session tokens with expiration timeouts
✓ **Requirement 4.5**: Session expiration handling (redirect logic to be implemented in routes)
