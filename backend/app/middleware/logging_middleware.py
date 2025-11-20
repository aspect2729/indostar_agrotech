"""
Logging middleware for request/response tracking and monitoring.

This middleware logs all incoming requests and outgoing responses,
tracks request duration, and assigns unique request IDs for tracing.
"""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.utils.logging_config import get_logger, set_request_id, clear_request_id, log_with_context
from app.utils.monitoring import track_performance

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses.
    
    This middleware:
    - Assigns a unique request ID to each request
    - Logs request details (method, path, client IP)
    - Logs response details (status code, duration)
    - Tracks slow requests
    - Adds request ID to response headers
    """
    
    def __init__(self, app: ASGIApp, slow_request_threshold: float = 1.0):
        """
        Initialize the logging middleware.
        
        Args:
            app: ASGI application
            slow_request_threshold: Threshold in seconds for slow request warnings
        """
        super().__init__(app)
        self.slow_request_threshold = slow_request_threshold
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process the request and log details.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware or route handler
        
        Returns:
            Response: HTTP response
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        set_request_id(request_id)
        
        # Extract request details
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Log incoming request
        log_with_context(
            logger,
            "info",
            f"Incoming request: {method} {path}",
            request_id=request_id,
            method=method,
            path=path,
            client_ip=client_ip,
            user_agent=user_agent
        )
        
        # Track request start time
        start_time = time.time()
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate request duration
            duration = time.time() - start_time
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            # Track performance
            duration_ms = round(duration * 1000, 2)
            track_performance(path, method, duration_ms, response.status_code)
            
            # Log response
            log_level = "warning" if response.status_code >= 400 else "info"
            
            log_with_context(
                logger,
                log_level,
                f"Request completed: {method} {path} - {response.status_code}",
                request_id=request_id,
                method=method,
                path=path,
                status_code=response.status_code,
                duration_ms=duration_ms,
                client_ip=client_ip
            )
            
            # Warn about slow requests
            if duration > self.slow_request_threshold:
                log_with_context(
                    logger,
                    "warning",
                    f"Slow request detected: {method} {path}",
                    request_id=request_id,
                    method=method,
                    path=path,
                    duration_ms=round(duration * 1000, 2),
                    threshold_ms=self.slow_request_threshold * 1000
                )
            
            return response
            
        except Exception as e:
            # Calculate request duration
            duration = time.time() - start_time
            
            # Log error
            log_with_context(
                logger,
                "error",
                f"Request failed: {method} {path} - {str(e)}",
                request_id=request_id,
                method=method,
                path=path,
                duration_ms=round(duration * 1000, 2),
                error=str(e),
                error_type=type(e).__name__
            )
            
            raise
        
        finally:
            # Clear request ID from context
            clear_request_id()
