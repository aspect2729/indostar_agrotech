"""
Request validation middleware for the FastAPI application.

This module provides middleware for additional request validation
beyond Pydantic schema validation.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import logging
from bson import ObjectId

from app.schemas.error import ErrorResponse, ErrorDetail


logger = logging.getLogger(__name__)


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """
    Middleware for validating incoming requests.
    
    Performs additional validation checks such as:
    - Request size limits
    - Content type validation
    - Custom header validation
    """
    
    MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10 MB
    
    async def dispatch(self, request: Request, call_next: Callable):
        """
        Process the request and perform validation checks.
        
        Args:
            request: The incoming request
            call_next: The next middleware or route handler
            
        Returns:
            Response from the next handler or error response
        """
        # Check request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.MAX_REQUEST_SIZE:
            logger.warning(
                f"Request size exceeds limit: {content_length} bytes",
                extra={"path": request.url.path, "method": request.method}
            )
            
            error_response = ErrorResponse(
                error=ErrorDetail(
                    code="REQUEST_TOO_LARGE",
                    message=f"Request size exceeds maximum allowed size of {self.MAX_REQUEST_SIZE} bytes",
                    details={"max_size": self.MAX_REQUEST_SIZE, "actual_size": int(content_length)}
                ),
                path=request.url.path
            )
            
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content=error_response.model_dump()
            )
        
        # Validate Content-Type for POST/PUT/PATCH requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            
            # Skip validation for multipart/form-data (file uploads)
            if not content_type.startswith("multipart/form-data"):
                if not content_type.startswith("application/json"):
                    logger.warning(
                        f"Invalid content type: {content_type}",
                        extra={"path": request.url.path, "method": request.method}
                    )
                    
                    error_response = ErrorResponse(
                        error=ErrorDetail(
                            code="INVALID_CONTENT_TYPE",
                            message="Content-Type must be application/json",
                            details={"received": content_type}
                        ),
                        path=request.url.path
                    )
                    
                    return JSONResponse(
                        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                        content=error_response.model_dump()
                    )
        
        # Process the request
        response = await call_next(request)
        return response


def validate_object_id(value: str, field_name: str = "id") -> ObjectId:
    """
    Validate and convert a string to MongoDB ObjectId.
    
    This utility function provides consistent ObjectId validation
    across the application.
    
    Args:
        value: The string value to validate
        field_name: The name of the field being validated (for error messages)
        
    Returns:
        Valid ObjectId instance
        
    Raises:
        ValidationException: If the value is not a valid ObjectId
    """
    from app.exceptions import InvalidObjectIdException
    
    if not ObjectId.is_valid(value):
        raise InvalidObjectIdException(field=field_name, value=value)
    
    return ObjectId(value)


def validate_pagination(limit: int, offset: int, max_limit: int = 100) -> tuple[int, int]:
    """
    Validate pagination parameters.
    
    Ensures limit and offset are within acceptable ranges.
    
    Args:
        limit: Number of items to return
        offset: Number of items to skip
        max_limit: Maximum allowed limit value
        
    Returns:
        Tuple of validated (limit, offset)
        
    Raises:
        ValidationException: If parameters are invalid
    """
    from app.exceptions import ValidationException
    
    if limit < 1:
        raise ValidationException(
            message="Limit must be at least 1",
            details={"limit": limit}
        )
    
    if limit > max_limit:
        raise ValidationException(
            message=f"Limit cannot exceed {max_limit}",
            details={"limit": limit, "max_limit": max_limit}
        )
    
    if offset < 0:
        raise ValidationException(
            message="Offset must be non-negative",
            details={"offset": offset}
        )
    
    return limit, offset


def validate_enum_value(value: str, allowed_values: list[str], field_name: str) -> str:
    """
    Validate that a value is in the allowed enum values.
    
    Args:
        value: The value to validate
        allowed_values: List of allowed values
        field_name: The name of the field being validated
        
    Returns:
        The validated value
        
    Raises:
        ValidationException: If the value is not in allowed values
    """
    from app.exceptions import ValidationException
    
    if value not in allowed_values:
        raise ValidationException(
            message=f"Invalid value for {field_name}",
            details={
                "field": field_name,
                "value": value,
                "allowed_values": allowed_values
            }
        )
    
    return value
