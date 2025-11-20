"""
Global exception handlers for the FastAPI application.

This module provides centralized error handling for all exceptions,
ensuring consistent error responses across the API.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from pymongo.errors import PyMongoError
import logging
from typing import Union

from app.exceptions import IndostarException
from app.schemas.error import ErrorResponse, ErrorDetail, ValidationErrorResponse, ValidationErrorDetail
from app.utils.logging_config import get_logger
from app.utils.monitoring import track_error


# Configure logger
logger = get_logger(__name__)


async def indostar_exception_handler(request: Request, exc: IndostarException) -> JSONResponse:
    """
    Handler for custom IndostarException and its subclasses.
    
    Converts custom exceptions into structured error responses.
    
    Args:
        request: The FastAPI request object
        exc: The custom exception instance
        
    Returns:
        JSONResponse with structured error information
    """
    logger.error(
        f"IndostarException: {exc.code} - {exc.message}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "code": exc.code,
            "details": exc.details
        }
    )
    
    # Track error for monitoring
    track_error(
        error_type=exc.code,
        error_message=exc.message,
        context={
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code
        }
    )
    
    error_response = ErrorResponse(
        error=ErrorDetail(
            code=exc.code,
            message=exc.message,
            details=exc.details
        ),
        path=request.url.path
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


async def validation_exception_handler(
    request: Request,
    exc: Union[RequestValidationError, ValidationError]
) -> JSONResponse:
    """
    Handler for Pydantic validation errors.
    
    Converts Pydantic validation errors into structured error responses
    with detailed field-level error information.
    
    Args:
        request: The FastAPI request object
        exc: The validation error instance
        
    Returns:
        JSONResponse with detailed validation error information
    """
    validation_errors = []
    
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        validation_errors.append(
            ValidationErrorDetail(
                field=field or "unknown",
                message=error["msg"],
                type=error["type"]
            )
        )
    
    logger.warning(
        f"Validation error on {request.url.path}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": validation_errors
        }
    )
    
    # Track error for monitoring
    track_error(
        error_type="VALIDATION_ERROR",
        error_message=f"Validation failed with {len(validation_errors)} errors",
        context={
            "path": request.url.path,
            "method": request.method,
            "error_count": len(validation_errors)
        }
    )
    
    error_response = ValidationErrorResponse(
        error=ErrorDetail(
            code="VALIDATION_ERROR",
            message="Request validation failed",
            details={"error_count": len(validation_errors)}
        ),
        validation_errors=[ve.model_dump() for ve in validation_errors],
        path=request.url.path
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump()
    )


async def database_exception_handler(request: Request, exc: PyMongoError) -> JSONResponse:
    """
    Handler for MongoDB/PyMongo errors.
    
    Converts database errors into structured error responses while
    hiding sensitive database details from clients.
    
    Args:
        request: The FastAPI request object
        exc: The PyMongo exception instance
        
    Returns:
        JSONResponse with generic database error information
    """
    logger.error(
        f"Database error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__
        },
        exc_info=True
    )
    
    # Track error for monitoring
    track_error(
        error_type="DATABASE_ERROR",
        error_message=str(exc),
        context={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__
        }
    )
    
    error_response = ErrorResponse(
        error=ErrorDetail(
            code="DATABASE_ERROR",
            message="A database error occurred. Please try again later.",
            details=None  # Don't expose database details to clients
        ),
        path=request.url.path
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump()
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler for all unhandled exceptions.
    
    Catches any exceptions not handled by specific handlers and
    returns a generic error response.
    
    Args:
        request: The FastAPI request object
        exc: The exception instance
        
    Returns:
        JSONResponse with generic error information
    """
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__
        },
        exc_info=True
    )
    
    # Track error for monitoring
    track_error(
        error_type="INTERNAL_ERROR",
        error_message=str(exc),
        context={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__
        }
    )
    
    error_response = ErrorResponse(
        error=ErrorDetail(
            code="INTERNAL_ERROR",
            message="An unexpected error occurred. Please try again later.",
            details=None  # Don't expose internal details to clients
        ),
        path=request.url.path
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump()
    )
