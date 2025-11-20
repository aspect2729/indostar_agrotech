"""
Health check and monitoring endpoints.

This module provides comprehensive health check endpoints for monitoring
the application and its dependencies (database, external services).
"""

from fastapi import APIRouter, status
from datetime import datetime
from typing import Dict, Any
import sys
import platform
import psutil

from app.database import check_database_health
from app.config import settings
from app.utils.logging_config import get_logger
from app.utils.monitoring import error_tracker, performance_tracker, get_monitoring_summary

logger = get_logger(__name__)
router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint.
    
    Returns a simple health status indicating the application is running.
    This endpoint is suitable for load balancers and basic monitoring.
    
    Returns:
        dict: Basic health status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": settings.environment
    }


@router.get("/health/detailed", status_code=status.HTTP_200_OK)
async def detailed_health_check() -> Dict[str, Any]:
    """
    Detailed health check endpoint with dependency status.
    
    Checks the health of all application dependencies including:
    - Database connectivity
    - System resources
    - Application configuration
    
    Returns:
        dict: Detailed health status with dependency information
    """
    # Check database health
    db_health = await check_database_health()
    
    # Determine overall status
    overall_status = "healthy"
    if db_health["status"] != "healthy":
        overall_status = "degraded"
    
    # Get system information
    system_info = {
        "python_version": sys.version.split()[0],
        "platform": platform.platform(),
        "cpu_count": psutil.cpu_count(),
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent
    }
    
    health_data = {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": settings.environment,
        "version": "1.0.0",
        "dependencies": {
            "database": db_health
        },
        "system": system_info
    }
    
    # Log health check
    if overall_status != "healthy":
        logger.warning(f"Health check returned degraded status: {health_data}")
    
    return health_data


@router.get("/health/liveness", status_code=status.HTTP_200_OK)
async def liveness_probe() -> Dict[str, str]:
    """
    Kubernetes liveness probe endpoint.
    
    This endpoint indicates whether the application is alive and running.
    If this endpoint fails, the container should be restarted.
    
    Returns:
        dict: Liveness status
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@router.get("/health/readiness", status_code=status.HTTP_200_OK)
async def readiness_probe() -> Dict[str, Any]:
    """
    Kubernetes readiness probe endpoint.
    
    This endpoint indicates whether the application is ready to accept traffic.
    It checks critical dependencies like database connectivity.
    
    Returns:
        dict: Readiness status
    """
    # Check database connectivity
    db_health = await check_database_health()
    
    is_ready = db_health["status"] == "healthy"
    
    response = {
        "status": "ready" if is_ready else "not_ready",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": {
            "database": db_health["status"]
        }
    }
    
    if not is_ready:
        logger.warning(f"Readiness check failed: {response}")
    
    return response


@router.get("/health/startup", status_code=status.HTTP_200_OK)
async def startup_probe() -> Dict[str, Any]:
    """
    Kubernetes startup probe endpoint.
    
    This endpoint indicates whether the application has completed startup.
    It's useful for applications with slow startup times.
    
    Returns:
        dict: Startup status
    """
    # Check if database is initialized
    db_health = await check_database_health()
    
    is_started = db_health["connected"]
    
    return {
        "status": "started" if is_started else "starting",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "database_connected": db_health["connected"]
    }


@router.get("/metrics", status_code=status.HTTP_200_OK)
async def metrics() -> Dict[str, Any]:
    """
    Application metrics endpoint.
    
    Provides basic application metrics for monitoring and alerting.
    In production, this could be extended to integrate with Prometheus
    or other monitoring systems.
    
    Returns:
        dict: Application metrics
    """
    # Get system metrics
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Get process metrics
    process = psutil.Process()
    process_memory = process.memory_info()
    
    metrics_data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "system": {
            "cpu_percent": cpu_percent,
            "memory_total_mb": round(memory.total / (1024 * 1024), 2),
            "memory_available_mb": round(memory.available / (1024 * 1024), 2),
            "memory_percent": memory.percent,
            "disk_total_gb": round(disk.total / (1024 * 1024 * 1024), 2),
            "disk_used_gb": round(disk.used / (1024 * 1024 * 1024), 2),
            "disk_percent": disk.percent
        },
        "process": {
            "memory_rss_mb": round(process_memory.rss / (1024 * 1024), 2),
            "memory_vms_mb": round(process_memory.vms / (1024 * 1024), 2),
            "cpu_percent": process.cpu_percent(interval=0.1),
            "num_threads": process.num_threads()
        }
    }
    
    return metrics_data



@router.get("/monitoring/summary", status_code=status.HTTP_200_OK)
async def monitoring_summary() -> Dict[str, Any]:
    """
    Get comprehensive monitoring summary.
    
    Provides error statistics, performance metrics, and system health
    for monitoring dashboards and alerting systems.
    
    Returns:
        dict: Monitoring summary with errors and performance data
    """
    return get_monitoring_summary()


@router.get("/monitoring/errors", status_code=status.HTTP_200_OK)
async def error_statistics() -> Dict[str, Any]:
    """
    Get error tracking statistics.
    
    Returns:
        dict: Error statistics including counts, rates, and recent errors
    """
    return {
        "statistics": error_tracker.get_error_statistics(),
        "recent_errors": error_tracker.get_recent_errors(limit=50)
    }


@router.get("/monitoring/performance", status_code=status.HTTP_200_OK)
async def performance_statistics() -> Dict[str, Any]:
    """
    Get performance tracking statistics.
    
    Returns:
        dict: Performance statistics for all endpoints
    """
    return performance_tracker.get_endpoint_statistics()
