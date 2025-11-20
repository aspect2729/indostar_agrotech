# User Profile Service and Endpoints Implementation

## Overview

This document describes the implementation of user profile management functionality for the Indostar E-commerce Application. The implementation includes a service layer for profile operations and REST API endpoints for retrieving and updating user profiles.

## Implementation Details

### 1. User Service Layer (`app/services/user_service.py`)

The `UserService` class provides the following methods:

#### `get_user_profile(user_id: str) -> Optional[User]`
- Retrieves user profile by user ID
- Returns User object or None if not found
- Handles database errors gracefully

#### `update_user_profile(user_id: str, update_data: UserProfileUpdateRequest) -> Optional[User]`
- Updates user profile information (name, phone, addresses)
- Only updates fields that are provided (partial updates supported)
- Validates address constraints (e.g., only one default per type)
- Returns updated User object
- Raises ValueError for validation errors

#### `add_address(user_id: str, address: AddressRequest) -> Optional[User]`
- Adds a new address to user profile
- Automatically unsets other default addresses of same type if new address is default
- Returns updated User object

#### `remove_address(user_id: str, address_index: int) -> Optional[User]`
- Removes an address from user profile by index
- Returns updated User object

### 2. API Endpoints (`app/routes/users.py`)

#### GET `/api/users/profile`
**Description:** Retrieve the current authenticated user's profile information

**Authentication:** Required (JWT Bearer token)

**Response:** `UserProfileResponse`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "google_id": "1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "consumer",
  "phone": "+919876543210",
  "addresses": [
    {
      "type": "shipping",
      "street": "123 Main St",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "is_default": true
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized (invalid or missing token)
- 404: User profile not found
- 500: Internal server error

#### PUT `/api/users/profile`
**Description:** Update the current authenticated user's profile information

**Authentication:** Required (JWT Bearer token)

**Request Body:** `UserProfileUpdateRequest`
```json
{
  "name": "John Doe",
  "phone": "+919876543210",
  "addresses": [
    {
      "type": "shipping",
      "street": "123 Main St",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "is_default": true
    }
  ]
}
```

**Notes:**
- All fields are optional - only provided fields will be updated
- Phone must match pattern: `^\+?[1-9]\d{9,14}$`
- Pincode must be exactly 6 digits
- Only one address can be marked as default per type (billing/shipping)

**Response:** `UserProfileResponse` (same as GET)

**Status Codes:**
- 200: Success
- 400: Bad request (validation error)
- 401: Unauthorized (invalid or missing token)
- 404: User profile not found
- 500: Internal server error

### 3. Integration

The user routes are integrated into the main FastAPI application:

```python
from app.routes import users
app.include_router(users.router, prefix="/api/users", tags=["Users"])
```

## Requirements Satisfied

### Requirement 1.4
**User Story:** As a consumer, I want to provide delivery address and contact information during checkout.

**Implementation:**
- Users can update their profile with multiple addresses
- Addresses include type (billing/shipping), street, city, state, and pincode
- Phone number can be stored and updated
- Default address selection supported

### Requirement 2.3
**User Story:** As a distributor, I want to manage my delivery addresses for bulk orders.

**Implementation:**
- Same profile management functionality available to distributors
- Multiple addresses supported with type distinction
- Address validation ensures data integrity

## Data Validation

### Phone Number
- Pattern: `^\+?[1-9]\d{9,14}$`
- Examples: `+919876543210`, `9876543210`

### Address
- Street: 1-200 characters, non-empty
- City: 1-100 characters, non-empty
- State: 1-100 characters, non-empty
- Pincode: Exactly 6 digits (e.g., `560001`)
- Type: Either "billing" or "shipping"
- Only one default address per type

### Name
- 1-100 characters, non-empty, no whitespace-only strings

## Error Handling

The implementation includes comprehensive error handling:

1. **Authentication Errors**: Returns 401 for invalid/missing tokens
2. **Validation Errors**: Returns 400 with detailed error messages
3. **Not Found Errors**: Returns 404 when user profile doesn't exist
4. **Database Errors**: Logged and returns 500 with generic error message
5. **Unexpected Errors**: Caught and logged with stack traces

## Testing

### Verification Script
Run `python verify_user_implementation.py` to verify:
- User service module and methods exist
- User routes are properly defined
- Schemas are correctly imported
- Integration with main app is successful
- Dependencies are available

### Manual Testing
1. Start the FastAPI server: `uvicorn main:app --reload`
2. Access API documentation: `http://localhost:8000/api/docs`
3. Authenticate using Google OAuth to get JWT token
4. Test GET `/api/users/profile` with Bearer token
5. Test PUT `/api/users/profile` with various update payloads

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT token
2. **User Isolation**: Users can only access/update their own profile
3. **Input Validation**: All inputs validated using Pydantic models
4. **SQL Injection Prevention**: MongoDB with parameterized queries
5. **Error Messages**: Generic error messages to prevent information leakage

## Future Enhancements

Potential improvements for future versions:
1. Address verification using external APIs
2. Profile picture upload and management
3. Email/phone verification
4. Address geocoding for delivery optimization
5. Bulk address import for distributors
6. Address history and audit trail
