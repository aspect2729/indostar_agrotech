"""
Error response schemas for structured error handling.

This module defines Pydantic models for consistent error responses
across all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime


class ErrorDetail(BaseModel):
    """
    Detailed error information.
    
    Attributes:
        code: Machine-readable error code
        message: Human-readable error message
        details: Additional context-specific error details
    """
    
    code: str = Field(
        ...,
        description="Machine-readable error code for client handling",
        examples=["VALIDATION_ERROR", "NOT_FOUND", "AUTHENTICATION_ERROR"]
    )
    
    message: str = Field(
        ...,
        description="Human-readable error message",
        examples=["Invalid product ID format", "User not found"]
    )
    
    details: Optional[Any] = Field(
        None,
        description="Additional error details or context"
    )


class ErrorResponse(BaseModel):
    """
    Standard error response format for all API errors.
    
    This format ensures consistent error handling across the application
    and provides clients with structured error information.
    
    Attributes:
        error: Detailed error information
        timestamp: ISO 8601 timestamp when the error occurred
        path: Request path where the error occurred (optional)
    """
    
    error: ErrorDetail = Field(
        ...,
        description="Detailed error information"
    )
    
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="ISO 8601 timestamp when the error occurred"
    )
    
    path: Optional[str] = Field(
        None,
        description="Request path where the error occurred"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Product with identifier '507f1f77bcf86cd799439011' not found",
                    "details": None
                },
                "timestamp": "2024-01-15T10:30:00.000Z",
                "path": "/api/products/507f1f77bcf86cd799439011"
            }
        }


class ValidationErrorDetail(BaseModel):
    """
    Detailed validation error information for field-level errors.
    
    Used when Pydantic validation fails to provide specific field errors.
    """
    
    field: str = Field(
        ...,
        description="Field name that failed validation"
    )
    
    message: str = Field(
        ...,
        description="Validation error message"
    )
    
    type: str = Field(
        ...,
        description="Type of validation error"
    )


class ValidationErrorResponse(BaseModel):
    """
    Specialized error response for validation errors.
    
    Provides detailed field-level validation errors.
    """
    
    error: ErrorDetail = Field(
        ...,
        description="General validation error information"
    )
    
    validation_errors: list[ValidationErrorDetail] = Field(
        default_factory=list,
        description="List of field-level validation errors"
    )
    
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="ISO 8601 timestamp when the error occurred"
    )
    
    path: Optional[str] = Field(
        None,
        description="Request path where the error occurred"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed",
                    "details": None
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
        }
