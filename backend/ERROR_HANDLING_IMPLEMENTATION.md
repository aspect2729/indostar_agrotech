# Error Handling and Validation Implementation

This document describes the comprehensive error handling and validation system implemented for the Indostar E-commerce backend API.

## Overview

The error handling system provides:
- **Custom exception classes** for different error scenarios
- **Structured error responses** with consistent format
- **Global exception handlers** for centralized error processing
- **Request validation middleware** for additional validation
- **Validation utilities** for common validation tasks

## Components

### 1. Custom Exception Classes (`app/exceptions.py`)

All custom exceptions inherit from `IndostarException` base class:

#### Base Exception
- **IndostarException**: Base class with `message`, `code`, `status_code`, and `details` attributes

#### Specific Exceptions
- **ValidationException** (400): Business logic validation errors
- **AuthenticationException** (401): Authentication failures
- **AuthorizationException** (403): Permission/role violations
- **NotFoundException** (404): Resource not found
- **ConflictException** (409): Data conflicts (duplicates, etc.)
- **InsufficientStockException** (400): Inventory validation failures
- **DatabaseException** (500): Database operation failures
- **ExternalServiceException** (502): Third-party service errors
- **InvalidObjectIdException** (400): Invalid MongoDB ObjectId format

#### Usage Example
```python
from app.exceptions import NotFoundException, ValidationException

# Raise when resource not found
raise NotFoundException(resource="Product", identifier=product_id)

# Raise for validation errors
raise ValidationException(
    message="Invalid quantity",
    details={"quantity": -5, "min": 0}
)
```

### 2. Error Response Schemas (`app/schemas/error.py`)

Pydantic models for consistent error responses:

#### ErrorDetail
```python
{
    "code": "NOT_FOUND",
    "message": "Product with identifier '123' not found",
    "details": null
}
```

#### ErrorResponse
```python
{
    "error": {
        "code": "NOT_FOUND",
        "message": "Product with identifier '123' not found",
        "details": null
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/products/123"
}
```

#### ValidationErrorResponse
```python
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Request validation failed",
        "details": {"error_count": 2}
    },
    "validation_errors": [
        {
            "field": "price.consumer",
            "message": "Price must be greater than 0",
            "type": "value_error"
        }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/products"
}
```

### 3. Global Exception Handlers (`app/middleware/error_handlers.py`)

Centralized handlers for all exception types:

#### Handlers
- **indostar_exception_handler**: Handles all custom IndostarException subclasses
- **validation_exception_handler**: Handles Pydantic validation errors
- **database_exception_handler**: Handles MongoDB/PyMongo errors
- **generic_exception_handler**: Catches all unhandled exceptions

#### Features
- Structured error responses
- Logging with context information
- Security (hides sensitive details from clients)
- Consistent error format across all endpoints

### 4. Request Validation Middleware (`app/middleware/validation.py`)

#### RequestValidationMiddleware
Validates incoming requests for:
- **Request size limits** (max 10 MB)
- **Content-Type validation** (must be application/json for POST/PUT/PATCH)
- Returns structured error responses for violations

#### Validation Utilities

##### validate_object_id()
```python
from app.middleware.validation import validate_object_id

# Validates and converts string to ObjectId
object_id = validate_object_id(product_id, "product_id")
# Raises InvalidObjectIdException if invalid
```

##### validate_pagination()
```python
from app.middleware.validation import validate_pagination

# Validates limit and offset parameters
limit, offset = validate_pagination(limit=20, offset=0, max_limit=100)
# Raises ValidationException if invalid
```

##### validate_enum_value()
```python
from app.middleware.validation import validate_enum_value

# Validates enum values
category = validate_enum_value(
    value=category,
    allowed_values=["jaggery", "oil", "pickles"],
    field_name="category"
)
# Raises ValidationException if invalid
```

### 5. Integration with FastAPI (`main.py`)

The error handling system is registered in the FastAPI application:

```python
# Add middleware
app.add_middleware(RequestValidationMiddleware)

# Register exception handlers
app.add_exception_handler(IndostarException, indostar_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(PyMongoError, database_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

## Usage in Routes

### Before (Old Pattern)
```python
from fastapi import HTTPException, status

try:
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    
    product = await product_service.get_product_by_id(product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    return product
    
except HTTPException:
    raise
except Exception as e:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Error: {str(e)}"
    )
```

### After (New Pattern)
```python
from app.exceptions import NotFoundException
from app.middleware.validation import validate_object_id

# Validate ObjectId format
validate_object_id(product_id, "product_id")

# Get product
product = await product_service.get_product_by_id(product_id)

if not product:
    raise NotFoundException(resource="Product", identifier=product_id)

return product
```

### Benefits
- **Cleaner code**: No try-catch blocks needed
- **Consistent errors**: All errors follow same format
- **Better logging**: Automatic logging with context
- **Type safety**: Custom exceptions are more specific
- **Automatic handling**: Global handlers catch everything

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| AUTHENTICATION_ERROR | 401 | Authentication failed |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Data conflict |
| INSUFFICIENT_STOCK | 400 | Inventory insufficient |
| REQUEST_TOO_LARGE | 413 | Request size exceeds limit |
| INVALID_CONTENT_TYPE | 415 | Invalid Content-Type header |
| DATABASE_ERROR | 500 | Database operation failed |
| EXTERNAL_SERVICE_ERROR | 502 | External service failed |
| INTERNAL_ERROR | 500 | Unexpected error |

## Logging

All errors are automatically logged with:
- Error message and code
- Request path and method
- Exception details
- Stack trace (for 500 errors)

Log levels:
- **WARNING**: Validation errors (400-level)
- **ERROR**: Server errors (500-level)

## Security Considerations

1. **No sensitive data exposure**: Database errors and internal errors don't expose sensitive details to clients
2. **Structured responses**: Consistent format prevents information leakage
3. **Request size limits**: Prevents DoS attacks via large payloads
4. **Content-Type validation**: Prevents certain injection attacks

## Testing

Run the verification script to test the implementation:

```bash
cd backend
python verify_error_handling.py
```

This tests:
- Custom exception classes
- Error response schemas
- Validation utilities
- Middleware imports

## Migration Guide

To update existing routes to use the new error handling:

1. **Remove try-catch blocks** around route logic
2. **Replace HTTPException** with custom exceptions:
   - 400 errors → `ValidationException`
   - 401 errors → `AuthenticationException`
   - 403 errors → `AuthorizationException`
   - 404 errors → `NotFoundException`
   - 409 errors → `ConflictException`
3. **Use validation utilities**:
   - Replace `ObjectId.is_valid()` checks with `validate_object_id()`
   - Add pagination validation with `validate_pagination()`
4. **Let global handlers catch exceptions**: No need to catch and re-raise

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 6.4**: Proper error handling with structured error responses
- **Requirement 10.4**: Health check endpoints and error logging capabilities

## Files Created/Modified

### Created
- `backend/app/exceptions.py` - Custom exception classes
- `backend/app/schemas/error.py` - Error response schemas
- `backend/app/middleware/error_handlers.py` - Global exception handlers
- `backend/app/middleware/validation.py` - Request validation middleware
- `backend/app/middleware/__init__.py` - Middleware package exports
- `backend/verify_error_handling.py` - Verification script
- `backend/ERROR_HANDLING_IMPLEMENTATION.md` - This documentation

### Modified
- `backend/main.py` - Registered exception handlers and middleware
- `backend/app/schemas/__init__.py` - Added error schema exports
- `backend/app/utils/dependencies.py` - Updated to use custom exceptions
- `backend/app/routes/products.py` - Example of using new error handling

## Next Steps

To complete the migration:

1. Update remaining routes (auth, orders, inventory, users) to use custom exceptions
2. Update service layer to raise custom exceptions instead of returning None
3. Add more specific validation in service layer using validation utilities
4. Add integration tests for error scenarios
5. Document API error responses in OpenAPI schema
