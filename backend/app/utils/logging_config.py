"""
Structured logging configuration for the Indostar application.

This module provides structured logging with JSON formatting for production
and human-readable formatting for development. It includes log rotation,
contextual logging, and integration with monitoring systems.
"""

import logging
import logging.handlers
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional
from contextvars import ContextVar

# Context variable for request ID tracking
request_id_var: ContextVar[Optional[str]] = ContextVar('request_id', default=None)


class StructuredFormatter(logging.Formatter):
    """
    Custom formatter that outputs structured JSON logs for production.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add request ID if available
        request_id = request_id_var.get()
        if request_id:
            log_data["request_id"] = request_id
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields from record
        if hasattr(record, 'extra_fields'):
            log_data.update(record.extra_fields)
        
        return json.dumps(log_data)


class ColoredFormatter(logging.Formatter):
    """
    Custom formatter with colors for development environment.
    """
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors."""
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        # Add request ID if available
        request_id = request_id_var.get()
        request_id_str = f" [req:{request_id[:8]}]" if request_id else ""
        
        record.levelname = f"{color}{record.levelname}{reset}"
        record.name = f"{color}{record.name}{reset}"
        
        formatted = super().format(record)
        return f"{formatted}{request_id_str}"


def setup_logging(
    environment: str = "development",
    log_level: str = "INFO",
    log_dir: Optional[str] = None
) -> None:
    """
    Configure application logging with structured output and rotation.
    
    Args:
        environment: Application environment (development/production)
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory for log files (optional, defaults to ./logs)
    """
    # Create logs directory if it doesn't exist
    if log_dir is None:
        log_dir = "logs"
    
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))
    
    if environment == "production":
        # Use structured JSON logging in production
        console_formatter = StructuredFormatter()
    else:
        # Use colored, human-readable logging in development
        console_formatter = ColoredFormatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler with rotation for all logs
    all_logs_handler = logging.handlers.RotatingFileHandler(
        filename=log_path / "indostar.log",
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
        encoding='utf-8'
    )
    all_logs_handler.setLevel(logging.DEBUG)
    
    if environment == "production":
        all_logs_formatter = StructuredFormatter()
    else:
        all_logs_formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    all_logs_handler.setFormatter(all_logs_formatter)
    root_logger.addHandler(all_logs_handler)
    
    # Error file handler with rotation for errors only
    error_handler = logging.handlers.RotatingFileHandler(
        filename=log_path / "errors.log",
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=10,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    
    if environment == "production":
        error_formatter = StructuredFormatter()
    else:
        error_formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s\n%(pathname)s:%(lineno)d\n',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    error_handler.setFormatter(error_formatter)
    root_logger.addHandler(error_handler)
    
    # Set logging levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("motor").setLevel(logging.WARNING)
    
    root_logger.info(
        f"Logging configured for {environment} environment at {log_level} level"
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Logger name (typically __name__ of the module)
    
    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name)


def log_with_context(
    logger: logging.Logger,
    level: str,
    message: str,
    **extra_fields: Any
) -> None:
    """
    Log a message with additional context fields.
    
    Args:
        logger: Logger instance
        level: Log level (debug, info, warning, error, critical)
        message: Log message
        **extra_fields: Additional fields to include in structured logs
    """
    log_method = getattr(logger, level.lower())
    
    # Create a log record with extra fields
    extra = {'extra_fields': extra_fields} if extra_fields else {}
    log_method(message, extra=extra)


def set_request_id(request_id: str) -> None:
    """
    Set the request ID for the current context.
    
    Args:
        request_id: Unique request identifier
    """
    request_id_var.set(request_id)


def get_request_id() -> Optional[str]:
    """
    Get the request ID for the current context.
    
    Returns:
        Optional[str]: Request ID if set, None otherwise
    """
    return request_id_var.get()


def clear_request_id() -> None:
    """Clear the request ID from the current context."""
    request_id_var.set(None)
