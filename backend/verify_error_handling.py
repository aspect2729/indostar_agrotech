"""
Verification script for error handling and validation implementation.

This script tests the custom exception classes, error response schemas,
and validation utilities.
"""

import sys
from datetime import datetime


def test_custom_exceptions():
    """Test custom exception classes."""
    print("Testing custom exception classes...")
    
    from app.exceptions import (
        ValidationException,
        AuthenticationException,
        AuthorizationException,
        NotFoundException,
        ConflictException,
        InsufficientStockException,
        DatabaseException,
        ExternalServiceException,
        InvalidObjectIdException
    )
    
    # Test ValidationException
    exc = ValidationException("Invalid input", details={"field": "email"})
    assert exc.code == "VALIDATION_ERROR"
    assert exc.status_code == 400
    assert exc.message == "Invalid input"
    print("✓ ValidationException works correctly")
    
    # Test AuthenticationException
    exc = AuthenticationException()
    assert exc.code == "AUTHENTICATION_ERROR"
    assert exc.status_code == 401
    print("✓ AuthenticationException works correctly")
    
    # Test AuthorizationException
    exc = AuthorizationException()
    assert exc.code == "AUTHORIZATION_ERROR"
    assert exc.status_code == 403
    print("✓ AuthorizationException works correctly")
    
    # Test NotFoundException
    exc = NotFoundException("Product", "123")
    assert exc.code == "NOT_FOUND"
    assert exc.status_code == 404
    assert "Product" in exc.message
    assert "123" in exc.message
    print("✓ NotFoundException works correctly")
    
    # Test ConflictException
    exc = ConflictException("Duplicate entry")
    assert exc.code == "CONFLICT"
    assert exc.status_code == 409
    print("✓ ConflictException works correctly")
    
    # Test InsufficientStockException
    exc = InsufficientStockException("Jaggery", 10, 20)
    assert exc.code == "INSUFFICIENT_STOCK"
    assert exc.status_code == 400
    assert exc.details["available"] == 10
    assert exc.details["requested"] == 20
    print("✓ InsufficientStockException works correctly")
    
    # Test DatabaseException
    exc = DatabaseException()
    assert exc.code == "DATABASE_ERROR"
    assert exc.status_code == 500
    print("✓ DatabaseException works correctly")
    
    # Test ExternalServiceException
    exc = ExternalServiceException("Google OAuth", "Connection timeout")
    assert exc.code == "EXTERNAL_SERVICE_ERROR"
    assert exc.status_code == 502
    assert "Google OAuth" in exc.message
    print("✓ ExternalServiceException works correctly")
    
    # Test InvalidObjectIdException
    exc = InvalidObjectIdException("product_id", "invalid123")
    assert exc.code == "VALIDATION_ERROR"
    assert exc.status_code == 400
    assert "product_id" in exc.message
    print("✓ InvalidObjectIdException works correctly")
    
    print("\n✅ All custom exception tests passed!\n")


def test_error_schemas():
    """Test error response schemas."""
    print("Testing error response schemas...")
    
    from app.schemas.error import (
        ErrorDetail,
        ErrorResponse,
        ValidationErrorDetail,
        ValidationErrorResponse
    )
    
    # Test ErrorDetail
    error_detail = ErrorDetail(
        code="NOT_FOUND",
        message="Resource not found",
        details={"resource_id": "123"}
    )
    assert error_detail.code == "NOT_FOUND"
    assert error_detail.message == "Resource not found"
    print("✓ ErrorDetail schema works correctly")
    
    # Test ErrorResponse
    error_response = ErrorResponse(
        error=error_detail,
        path="/api/products/123"
    )
    assert error_response.error.code == "NOT_FOUND"
    assert error_response.path == "/api/products/123"
    assert error_response.timestamp is not None
    print("✓ ErrorResponse schema works correctly")
    
    # Test ValidationErrorDetail
    val_error = ValidationErrorDetail(
        field="email",
        message="Invalid email format",
        type="value_error"
    )
    assert val_error.field == "email"
    print("✓ ValidationErrorDetail schema works correctly")
    
    # Test ValidationErrorResponse
    val_response = ValidationErrorResponse(
        error=ErrorDetail(
            code="VALIDATION_ERROR",
            message="Validation failed"
        ),
        validation_errors=[val_error],
        path="/api/users"
    )
    assert len(val_response.validation_errors) == 1
    assert val_response.validation_errors[0].field == "email"
    print("✓ ValidationErrorResponse schema works correctly")
    
    print("\n✅ All error schema tests passed!\n")


def test_validation_utilities():
    """Test validation utility functions."""
    print("Testing validation utilities...")
    
    from app.middleware.validation import (
        validate_object_id,
        validate_pagination,
        validate_enum_value
    )
    from app.exceptions import InvalidObjectIdException, ValidationException
    from bson import ObjectId
    
    # Test validate_object_id with valid ID
    valid_id = "507f1f77bcf86cd799439011"
    result = validate_object_id(valid_id)
    assert isinstance(result, ObjectId)
    print("✓ validate_object_id accepts valid ObjectId")
    
    # Test validate_object_id with invalid ID
    try:
        validate_object_id("invalid123")
        assert False, "Should have raised InvalidObjectIdException"
    except InvalidObjectIdException as e:
        assert "invalid123" in e.message
        print("✓ validate_object_id rejects invalid ObjectId")
    
    # Test validate_pagination with valid values
    limit, offset = validate_pagination(20, 0)
    assert limit == 20
    assert offset == 0
    print("✓ validate_pagination accepts valid values")
    
    # Test validate_pagination with invalid limit
    try:
        validate_pagination(0, 0)
        assert False, "Should have raised ValidationException"
    except ValidationException:
        print("✓ validate_pagination rejects invalid limit")
    
    # Test validate_pagination with limit exceeding max
    try:
        validate_pagination(200, 0, max_limit=100)
        assert False, "Should have raised ValidationException"
    except ValidationException:
        print("✓ validate_pagination rejects limit exceeding max")
    
    # Test validate_pagination with negative offset
    try:
        validate_pagination(20, -1)
        assert False, "Should have raised ValidationException"
    except ValidationException:
        print("✓ validate_pagination rejects negative offset")
    
    # Test validate_enum_value with valid value
    result = validate_enum_value("jaggery", ["jaggery", "oil", "pickles"], "category")
    assert result == "jaggery"
    print("✓ validate_enum_value accepts valid value")
    
    # Test validate_enum_value with invalid value
    try:
        validate_enum_value("invalid", ["jaggery", "oil"], "category")
        assert False, "Should have raised ValidationException"
    except ValidationException as e:
        assert "category" in e.message
        print("✓ validate_enum_value rejects invalid value")
    
    print("\n✅ All validation utility tests passed!\n")


def test_middleware_imports():
    """Test that middleware can be imported correctly."""
    print("Testing middleware imports...")
    
    from app.middleware import (
        indostar_exception_handler,
        validation_exception_handler,
        database_exception_handler,
        generic_exception_handler,
        RequestValidationMiddleware,
        validate_object_id,
        validate_pagination,
        validate_enum_value
    )
    
    assert callable(indostar_exception_handler)
    assert callable(validation_exception_handler)
    assert callable(database_exception_handler)
    assert callable(generic_exception_handler)
    assert RequestValidationMiddleware is not None
    assert callable(validate_object_id)
    assert callable(validate_pagination)
    assert callable(validate_enum_value)
    
    print("✓ All middleware components imported successfully")
    print("\n✅ Middleware import tests passed!\n")


def main():
    """Run all verification tests."""
    print("=" * 60)
    print("Error Handling and Validation Verification")
    print("=" * 60)
    print()
    
    try:
        test_custom_exceptions()
        test_error_schemas()
        test_validation_utilities()
        test_middleware_imports()
        
        print("=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print()
        print("Error handling and validation implementation is complete:")
        print("  ✓ Custom exception classes created")
        print("  ✓ Error response schemas defined")
        print("  ✓ Validation utilities implemented")
        print("  ✓ Global exception handlers configured")
        print("  ✓ Request validation middleware added")
        print()
        return 0
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
