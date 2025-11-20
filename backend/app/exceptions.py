"""
Custom exception classes for the Indostar E-commerce application.

This module defines custom exceptions for different error scenarios,
providing structured error handling throughout the application.
"""

from typing import Any, Optional


class IndostarException(Exception):
    """
    Base exception class for all custom exceptions in the application.
    
    Attributes:
        message: Human-readable error message
        code: Error code for client identification
        status_code: HTTP status code
        details: Additional error details
    """
    
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        details: Optional[Any] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class ValidationException(IndostarException):
    """
    Exception raised when request validation fails.
    
    Used for business logic validation errors that go beyond
    Pydantic schema validation.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )


class AuthenticationException(IndostarException):
    """
    Exception raised when authentication fails.
    
    Used for invalid credentials, expired tokens, or missing authentication.
    """
    
    def __init__(self, message: str = "Authentication failed", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="AUTHENTICATION_ERROR",
            status_code=401,
            details=details
        )


class AuthorizationException(IndostarException):
    """
    Exception raised when user lacks required permissions.
    
    Used for role-based access control violations.
    """
    
    def __init__(self, message: str = "Insufficient permissions", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="AUTHORIZATION_ERROR",
            status_code=403,
            details=details
        )


class NotFoundException(IndostarException):
    """
    Exception raised when a requested resource is not found.
    
    Used for missing database records or invalid resource IDs.
    """
    
    def __init__(self, resource: str, identifier: str, details: Optional[Any] = None):
        message = f"{resource} with identifier '{identifier}' not found"
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404,
            details=details
        )


class ConflictException(IndostarException):
    """
    Exception raised when a request conflicts with existing data.
    
    Used for duplicate records, concurrent modification conflicts, etc.
    """
    
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=409,
            details=details
        )


class InsufficientStockException(IndostarException):
    """
    Exception raised when inventory is insufficient for an order.
    
    Used specifically for inventory validation during order creation.
    """
    
    def __init__(self, product_name: str, available: int, requested: int):
        message = f"Insufficient stock for {product_name}. Available: {available}, Requested: {requested}"
        super().__init__(
            message=message,
            code="INSUFFICIENT_STOCK",
            status_code=400,
            details={
                "product_name": product_name,
                "available": available,
                "requested": requested
            }
        )


class DatabaseException(IndostarException):
    """
    Exception raised when database operations fail.
    
    Used for connection errors, query failures, or transaction errors.
    """
    
    def __init__(self, message: str = "Database operation failed", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="DATABASE_ERROR",
            status_code=500,
            details=details
        )


class ExternalServiceException(IndostarException):
    """
    Exception raised when external service calls fail.
    
    Used for Google OAuth failures or other third-party service errors.
    """
    
    def __init__(self, service: str, message: str, details: Optional[Any] = None):
        full_message = f"{service} service error: {message}"
        super().__init__(
            message=full_message,
            code="EXTERNAL_SERVICE_ERROR",
            status_code=502,
            details=details
        )


class InvalidObjectIdException(ValidationException):
    """
    Exception raised when an invalid MongoDB ObjectId is provided.
    
    Specialized validation exception for ObjectId format errors.
    """
    
    def __init__(self, field: str, value: str):
        super().__init__(
            message=f"Invalid ObjectId format for field '{field}': {value}",
            details={"field": field, "value": value}
        )
