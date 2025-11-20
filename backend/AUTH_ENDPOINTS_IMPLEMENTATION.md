# Authentication API Endpoints Implementation

## Overview

This document describes the implementation of authentication API endpoints for the Indostar E-commerce Application. All endpoints are implemented in `app/routes/auth.py` and registered under the `/api/auth` prefix.

## Implemented Endpoints

### 1. POST /api/auth/google

**Purpose**: Initiate Google OAuth flow

**Description**: Generates a Google OAuth authorization URL that the frontend should redirect the user to for authentication.

**Request Body**:
```json
{
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**Response** (200 OK):
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random_state_string_for_csrf_protection"
}
```

**Requirements Addressed**: 4.1, 4.2

**Usage Flow**:
1. Frontend calls this endpoint with the redirect URI
2. Backend generates OAuth URL with CSRF state token
3. Frontend redirects user to the authorization URL
4. User authenticates with Google

---

### 2. POST /api/auth/callback

**Purpose**: Handle Google OAuth callback

**Description**: Receives the authorization code from Google, exchanges it for user information, creates or updates the user in the database, and returns JWT tokens.

**Request Body**:
```json
{
  "code": "4/0AX4XfWh...",
  "state": "random_state_string"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "consumer"
}
```

**Error Responses**:
- 401 Unauthorized: Invalid authorization code or token verification failed
- 500 Internal Server Error: OAuth flow error

**Requirements Addressed**: 4.1, 4.2, 4.3, 4.4

**Usage Flow**:
1. Google redirects user back to frontend with authorization code
2. Frontend sends code to this endpoint
3. Backend exchanges code for Google ID token
4. Backend verifies token and extracts user info
5. Backend creates/updates user with appropriate role
6. Backend generates JWT token pair
7. Frontend stores tokens and redirects to appropriate portal

---

### 3. POST /api/auth/refresh

**Purpose**: Refresh access token using refresh token

**Description**: Accepts a refresh token and returns a new access token and refresh token pair.

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "consumer"
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or expired refresh token
- 500 Internal Server Error: Token refresh error

**Requirements Addressed**: 4.4, 4.5

**Usage Flow**:
1. Frontend detects access token expiration
2. Frontend calls this endpoint with refresh token
3. Backend verifies refresh token
4. Backend generates new token pair
5. Frontend updates stored tokens

---

### 4. POST /api/auth/logout

**Purpose**: Logout current user

**Description**: Invalidates the current session. In a stateless JWT system, the actual token invalidation happens on the client side by removing the stored tokens. This endpoint serves as a confirmation.

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "message": "Successfully logged out"
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing access token
- 500 Internal Server Error: Logout error

**Requirements Addressed**: 4.5

**Usage Flow**:
1. Frontend calls this endpoint with access token
2. Backend confirms logout (can be extended with token blacklist)
3. Frontend removes stored tokens
4. Frontend redirects to login page

---

## Role-Based Authorization Decorators

The implementation includes role-based authorization decorators that can be used to protect endpoints:

### Available Decorators

1. **`require_owner`**: Only allows owner role
   ```python
   @router.get("/admin/settings")
   async def get_settings(user: User = Depends(require_owner)):
       # Only owners can access
   ```

2. **`require_distributor`**: Allows distributor and owner roles
   ```python
   @router.get("/bulk-orders")
   async def get_bulk_orders(user: User = Depends(require_distributor)):
       # Distributors and owners can access
   ```

3. **`require_consumer`**: Allows all roles (consumer, distributor, owner)
   ```python
   @router.get("/products")
   async def get_products(user: User = Depends(require_consumer)):
       # All authenticated users can access
   ```

4. **`require_owner_or_distributor`**: Allows owner and distributor roles
   ```python
   @router.post("/wholesale-inquiry")
   async def create_inquiry(user: User = Depends(require_owner_or_distributor)):
       # Owners and distributors can access
   ```

### Custom Role Checker

You can also create custom role checkers:

```python
from app.utils.dependencies import RoleChecker

# Allow only specific roles
custom_checker = RoleChecker(["owner", "admin"])

@router.get("/custom-endpoint")
async def custom_endpoint(user: User = Depends(custom_checker)):
    # Only owners and admins can access
```

---

## Authentication Flow

### Complete Authentication Flow

```
1. User clicks "Login with Google" on frontend
   ↓
2. Frontend calls POST /api/auth/google
   ↓
3. Backend returns authorization_url and state
   ↓
4. Frontend redirects user to authorization_url
   ↓
5. User authenticates with Google
   ↓
6. Google redirects to frontend with code
   ↓
7. Frontend calls POST /api/auth/callback with code
   ↓
8. Backend exchanges code for user info
   ↓
9. Backend creates/updates user with role assignment
   ↓
10. Backend returns JWT tokens and user info
    ↓
11. Frontend stores tokens and redirects based on role:
    - consumer → Consumer Portal
    - distributor → Distributor Portal
    - owner → Owner Dashboard
```

### Token Refresh Flow

```
1. Frontend detects access token expiration
   ↓
2. Frontend calls POST /api/auth/refresh with refresh_token
   ↓
3. Backend verifies refresh token
   ↓
4. Backend generates new token pair
   ↓
5. Frontend updates stored tokens
   ↓
6. Frontend retries original request with new access token
```

### Logout Flow

```
1. User clicks "Logout"
   ↓
2. Frontend calls POST /api/auth/logout with access_token
   ↓
3. Backend confirms logout
   ↓
4. Frontend removes tokens from storage
   ↓
5. Frontend redirects to login page
```

---

## Role Assignment Logic

The system automatically assigns roles based on email addresses:

### Owner Role
- Specific email addresses configured for business owners
- Default owner emails:
  - `owner@indostar.com`
  - `admin@indostar.com`
  - `indostar.owner@gmail.com`

### Distributor Role
- Emails containing "distributor" or "wholesale"
- Example: `john.distributor@example.com`

### Consumer Role
- Default role for all other users
- Any email not matching owner or distributor patterns

**Note**: Role assignment logic can be customized in `app/services/auth_service.py` in the `determine_user_role()` method.

---

## Security Features

1. **CSRF Protection**: State parameter in OAuth flow
2. **JWT Tokens**: Secure token-based authentication
3. **Token Expiration**: 
   - Access tokens: 30 minutes
   - Refresh tokens: 7 days
4. **Role-Based Access Control**: Enforced at endpoint level
5. **HTTPS Required**: In production environment
6. **CORS Configuration**: Controlled via environment variables

---

## Testing

### Verification Scripts

1. **Route Registration Test**:
   ```bash
   python verify_auth_routes.py
   ```
   Verifies all authentication endpoints are properly registered.

2. **Role Decorator Test**:
   ```bash
   python verify_role_decorators.py
   ```
   Tests role-based authorization decorators.

### Manual Testing

Access the interactive API documentation:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

---

## Environment Variables

Required environment variables in `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Error Handling

All endpoints return structured error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200 OK`: Successful operation
- `401 Unauthorized`: Invalid or missing authentication
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server-side error

---

## Future Enhancements

1. **Token Blacklist**: Implement token revocation for logout
2. **Multi-Factor Authentication**: Add 2FA support
3. **Session Management**: Track active sessions per user
4. **Rate Limiting**: Prevent brute force attacks
5. **Audit Logging**: Log all authentication events

---

## Files Modified/Created

### Created Files:
- `backend/app/routes/auth.py` - Authentication endpoints
- `backend/verify_auth_routes.py` - Route verification script
- `backend/verify_role_decorators.py` - Role decorator verification script
- `backend/AUTH_ENDPOINTS_IMPLEMENTATION.md` - This documentation

### Modified Files:
- `backend/main.py` - Added auth router registration
- `backend/app/routes/__init__.py` - Exported auth module

### Existing Files Used:
- `backend/app/services/auth_service.py` - Authentication service
- `backend/app/services/token_service.py` - Token management service
- `backend/app/schemas/auth.py` - Request/response schemas
- `backend/app/utils/dependencies.py` - Authorization dependencies
- `backend/app/models/user.py` - User model

---

## Conclusion

All authentication API endpoints have been successfully implemented and verified. The system provides:

✓ Google OAuth authentication flow
✓ JWT token generation and refresh
✓ Role-based access control
✓ Secure logout functionality
✓ Comprehensive error handling
✓ Interactive API documentation

The implementation satisfies all requirements (4.1, 4.2, 4.3, 4.4, 4.5) and is ready for integration with the frontend application.
