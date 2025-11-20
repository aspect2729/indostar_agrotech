"""
Monitoring and error tracking utilities.

This module provides utilities for tracking errors, performance metrics,
and application health. It can be extended to integrate with external
monitoring services like Sentry, DataDog, or New Relic.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from collections import defaultdict, deque
import threading

from app.utils.logging_config import get_logger, log_with_context

logger = get_logger(__name__)


class ErrorTracker:
    """
    In-memory error tracker for monitoring application errors.
    
    This class tracks errors by type, frequency, and provides
    statistics for monitoring and alerting.
    """
    
    def __init__(self, max_errors: int = 1000, time_window_minutes: int = 60):
        """
        Initialize the error tracker.
        
        Args:
            max_errors: Maximum number of errors to keep in memory
            time_window_minutes: Time window for error rate calculations
        """
        self.max_errors = max_errors
        self.time_window = timedelta(minutes=time_window_minutes)
        self.errors: deque = deque(maxlen=max_errors)
        self.error_counts: Dict[str, int] = defaultdict(int)
        self.lock = threading.Lock()
    
    def track_error(
        self,
        error_type: str,
        error_message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Track an error occurrence.
        
        Args:
            error_type: Type/class of the error
            error_message: Error message
            context: Additional context information
        """
        with self.lock:
            error_data = {
                "timestamp": datetime.utcnow(),
                "type": error_type,
                "message": error_message,
                "context": context or {}
            }
            
            self.errors.append(error_data)
            self.error_counts[error_type] += 1
            
            # Log the error
            log_with_context(
                logger,
                "error",
                f"Error tracked: {error_type} - {error_message}",
                error_type=error_type,
                error_message=error_message,
                **(context or {})
            )
    
    def get_error_rate(self, error_type: Optional[str] = None) -> float:
        """
        Calculate error rate within the time window.
        
        Args:
            error_type: Specific error type to calculate rate for (optional)
        
        Returns:
            float: Errors per minute
        """
        with self.lock:
            cutoff_time = datetime.utcnow() - self.time_window
            
            recent_errors = [
                e for e in self.errors
                if e["timestamp"] > cutoff_time
            ]
            
            if error_type:
                recent_errors = [
                    e for e in recent_errors
                    if e["type"] == error_type
                ]
            
            if not recent_errors:
                return 0.0
            
            time_span = (datetime.utcnow() - recent_errors[0]["timestamp"]).total_seconds() / 60
            return len(recent_errors) / max(time_span, 1)
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """
        Get comprehensive error statistics.
        
        Returns:
            dict: Error statistics including counts, rates, and top errors
        """
        with self.lock:
            cutoff_time = datetime.utcnow() - self.time_window
            
            recent_errors = [
                e for e in self.errors
                if e["timestamp"] > cutoff_time
            ]
            
            # Count errors by type in recent window
            recent_counts: Dict[str, int] = defaultdict(int)
            for error in recent_errors:
                recent_counts[error["type"]] += 1
            
            # Get top error types
            top_errors = sorted(
                recent_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
            
            return {
                "total_errors_tracked": len(self.errors),
                "recent_errors": len(recent_errors),
                "time_window_minutes": self.time_window.total_seconds() / 60,
                "error_rate_per_minute": self.get_error_rate(),
                "total_error_types": len(self.error_counts),
                "top_error_types": [
                    {"type": error_type, "count": count}
                    for error_type, count in top_errors
                ],
                "all_time_counts": dict(self.error_counts)
            }
    
    def get_recent_errors(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get recent errors.
        
        Args:
            limit: Maximum number of errors to return
        
        Returns:
            list: Recent error records
        """
        with self.lock:
            recent = list(self.errors)[-limit:]
            return [
                {
                    "timestamp": e["timestamp"].isoformat() + "Z",
                    "type": e["type"],
                    "message": e["message"],
                    "context": e["context"]
                }
                for e in reversed(recent)
            ]
    
    def clear_old_errors(self) -> int:
        """
        Clear errors outside the time window.
        
        Returns:
            int: Number of errors cleared
        """
        with self.lock:
            cutoff_time = datetime.utcnow() - self.time_window
            initial_count = len(self.errors)
            
            # Keep only recent errors
            self.errors = deque(
                (e for e in self.errors if e["timestamp"] > cutoff_time),
                maxlen=self.max_errors
            )
            
            cleared = initial_count - len(self.errors)
            
            if cleared > 0:
                logger.info(f"Cleared {cleared} old errors from tracker")
            
            return cleared


class PerformanceTracker:
    """
    In-memory performance tracker for monitoring request performance.
    
    This class tracks request durations and provides statistics
    for identifying slow endpoints and performance issues.
    """
    
    def __init__(self, max_samples: int = 10000):
        """
        Initialize the performance tracker.
        
        Args:
            max_samples: Maximum number of samples to keep in memory
        """
        self.max_samples = max_samples
        self.samples: deque = deque(maxlen=max_samples)
        self.endpoint_stats: Dict[str, List[float]] = defaultdict(list)
        self.lock = threading.Lock()
    
    def track_request(
        self,
        endpoint: str,
        method: str,
        duration_ms: float,
        status_code: int
    ) -> None:
        """
        Track a request's performance.
        
        Args:
            endpoint: API endpoint path
            method: HTTP method
            duration_ms: Request duration in milliseconds
            status_code: HTTP status code
        """
        with self.lock:
            sample = {
                "timestamp": datetime.utcnow(),
                "endpoint": endpoint,
                "method": method,
                "duration_ms": duration_ms,
                "status_code": status_code
            }
            
            self.samples.append(sample)
            
            # Track per-endpoint stats
            endpoint_key = f"{method} {endpoint}"
            self.endpoint_stats[endpoint_key].append(duration_ms)
            
            # Keep only recent samples per endpoint
            if len(self.endpoint_stats[endpoint_key]) > 1000:
                self.endpoint_stats[endpoint_key] = self.endpoint_stats[endpoint_key][-1000:]
    
    def get_endpoint_statistics(self, endpoint: Optional[str] = None) -> Dict[str, Any]:
        """
        Get performance statistics for endpoints.
        
        Args:
            endpoint: Specific endpoint to get stats for (optional)
        
        Returns:
            dict: Performance statistics
        """
        with self.lock:
            if endpoint:
                durations = self.endpoint_stats.get(endpoint, [])
                if not durations:
                    return {"endpoint": endpoint, "samples": 0}
                
                return {
                    "endpoint": endpoint,
                    "samples": len(durations),
                    "avg_duration_ms": sum(durations) / len(durations),
                    "min_duration_ms": min(durations),
                    "max_duration_ms": max(durations),
                    "p50_duration_ms": self._percentile(durations, 50),
                    "p95_duration_ms": self._percentile(durations, 95),
                    "p99_duration_ms": self._percentile(durations, 99)
                }
            
            # Get stats for all endpoints
            all_stats = []
            for endpoint_key, durations in self.endpoint_stats.items():
                if durations:
                    all_stats.append({
                        "endpoint": endpoint_key,
                        "samples": len(durations),
                        "avg_duration_ms": round(sum(durations) / len(durations), 2),
                        "p95_duration_ms": round(self._percentile(durations, 95), 2)
                    })
            
            # Sort by average duration
            all_stats.sort(key=lambda x: x["avg_duration_ms"], reverse=True)
            
            return {
                "total_samples": len(self.samples),
                "endpoints": all_stats[:20]  # Top 20 slowest
            }
    
    @staticmethod
    def _percentile(data: List[float], percentile: int) -> float:
        """Calculate percentile value."""
        if not data:
            return 0.0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]


# Global instances
error_tracker = ErrorTracker()
performance_tracker = PerformanceTracker()


def track_error(
    error_type: str,
    error_message: str,
    context: Optional[Dict[str, Any]] = None
) -> None:
    """
    Track an error using the global error tracker.
    
    Args:
        error_type: Type/class of the error
        error_message: Error message
        context: Additional context information
    """
    error_tracker.track_error(error_type, error_message, context)


def track_performance(
    endpoint: str,
    method: str,
    duration_ms: float,
    status_code: int
) -> None:
    """
    Track request performance using the global performance tracker.
    
    Args:
        endpoint: API endpoint path
        method: HTTP method
        duration_ms: Request duration in milliseconds
        status_code: HTTP status code
    """
    performance_tracker.track_request(endpoint, method, duration_ms, status_code)


def get_monitoring_summary() -> Dict[str, Any]:
    """
    Get a comprehensive monitoring summary.
    
    Returns:
        dict: Monitoring summary with error and performance statistics
    """
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "errors": error_tracker.get_error_statistics(),
        "performance": performance_tracker.get_endpoint_statistics()
    }
