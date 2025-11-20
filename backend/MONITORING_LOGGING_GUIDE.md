# Monitoring and Logging Guide

This guide explains the monitoring and logging infrastructure implemented for the Indostar E-commerce application.

## Overview

The application includes comprehensive monitoring and logging capabilities:

- **Structured Logging**: JSON-formatted logs in production, human-readable in development
- **Request Tracking**: Unique request IDs for tracing requests across the system
- **Error Tracking**: In-memory error tracking with statistics and rates
- **Performance Monitoring**: Request duration tracking and endpoint performance metrics
- **Health Checks**: Multiple health check endpoints for different monitoring scenarios
- **Log Rotation**: Automatic log rotation to manage disk space

## Logging

### Log Levels

The application uses standard Python logging levels:

- **DEBUG**: Detailed information for debugging (development only)
- **INFO**: General informational messages
- **WARNING**: Warning messages for potentially problematic situations
- **ERROR**: Error messages for failures
- **CRITICAL**: Critical errors that may cause application failure

### Log Files

Logs are written to the `logs/` directory:

- `indostar.log`: All application logs (rotated at 10MB, keeps 5 backups)
- `errors.log`: Error-level logs only (rotated at 10MB, keeps 10 backups)

### Log Format

**Development (Human-Readable):**
```
2024-11-14 10:30:45 - app.routes.products - INFO - Product created: Organic Jaggery [req:a1b2c3d4]
```

**Production (JSON):**
```json
{
  "timestamp": "2024-11-14T10:30:45.123Z",
  "level": "INFO",
  "logger": "app.routes.products",
  "message": "Product created: Organic Jaggery",
  "module": "products",
  "function": "create_product",
  "line": 45,
  "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Request Tracking

Every request is assigned a unique request ID that:
- Appears in all logs related to that request
- Is returned in the `X-Request-ID` response header
- Can be used to trace a request through the entire system

### Using Logging in Code

```python
from app.utils.logging_config import get_logger, log_with_context

logger = get_logger(__name__)

# Simple logging
logger.info("User logged in")
logger.error("Failed to process order", exc_info=True)

# Logging with additional context
log_with_context(
    logger,
    "info",
    "Order created successfully",
    order_id="ORD-12345",
    user_id="user123",
    total_amount=150.00
)
```

## Health Check Endpoints

### Basic Health Check
```
GET /api/health
```

Returns basic health status. Suitable for load balancers.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-14T10:30:45.123Z",
  "environment": "production"
}
```

### Detailed Health Check
```
GET /api/health/detailed
```

Returns comprehensive health information including database status and system resources.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-14T10:30:45.123Z",
  "environment": "production",
  "version": "1.0.0",
  "dependencies": {
    "database": {
      "status": "healthy",
      "database": "indostar",
      "connected": true,
      "mongodb_version": "6.0.0"
    }
  },
  "system": {
    "python_version": "3.10.0",
    "platform": "Linux-5.15.0",
    "cpu_count": 4,
    "cpu_percent": 25.5,
    "memory_percent": 45.2,
    "disk_percent": 60.1
  }
}
```

### Kubernetes Probes

**Liveness Probe:**
```
GET /api/health/liveness
```

Indicates if the application is alive. If this fails, the container should be restarted.

**Readiness Probe:**
```
GET /api/health/readiness
```

Indicates if the application is ready to accept traffic. Checks database connectivity.

**Startup Probe:**
```
GET /api/health/startup
```

Indicates if the application has completed startup. Useful for slow-starting applications.

## Monitoring Endpoints

### Monitoring Summary
```
GET /api/monitoring/summary
```

Returns comprehensive monitoring data including errors and performance metrics.

**Response:**
```json
{
  "timestamp": "2024-11-14T10:30:45.123Z",
  "errors": {
    "total_errors_tracked": 150,
    "recent_errors": 5,
    "time_window_minutes": 60,
    "error_rate_per_minute": 0.08,
    "total_error_types": 8,
    "top_error_types": [
      {"type": "VALIDATION_ERROR", "count": 3},
      {"type": "NOT_FOUND", "count": 2}
    ]
  },
  "performance": {
    "total_samples": 1000,
    "endpoints": [
      {
        "endpoint": "POST /api/orders",
        "samples": 50,
        "avg_duration_ms": 245.5,
        "p95_duration_ms": 450.2
      }
    ]
  }
}
```

### Error Statistics
```
GET /api/monitoring/errors
```

Returns detailed error tracking statistics and recent errors.

### Performance Statistics
```
GET /api/monitoring/performance
```

Returns performance metrics for all endpoints including average duration, percentiles, etc.

### Application Metrics
```
GET /api/metrics
```

Returns system and process metrics for monitoring.

**Response:**
```json
{
  "timestamp": "2024-11-14T10:30:45.123Z",
  "system": {
    "cpu_percent": 25.5,
    "memory_total_mb": 8192.0,
    "memory_available_mb": 4096.0,
    "memory_percent": 50.0,
    "disk_total_gb": 100.0,
    "disk_used_gb": 60.0,
    "disk_percent": 60.0
  },
  "process": {
    "memory_rss_mb": 256.5,
    "memory_vms_mb": 512.0,
    "cpu_percent": 5.2,
    "num_threads": 8
  }
}
```

## Error Tracking

The application automatically tracks all errors with:

- Error type and message
- Timestamp
- Request context (path, method, etc.)
- Error frequency and rates
- Recent error history

Errors are tracked in memory for the last 60 minutes (configurable) and up to 1000 errors.

## Performance Tracking

The application automatically tracks request performance:

- Request duration for all endpoints
- Average, min, max, and percentile (p50, p95, p99) durations
- Slow request detection (threshold: 1 second)
- Per-endpoint statistics

Performance data is kept for the last 10,000 requests.

## Log Rotation

### Automatic Rotation (Built-in)

The application uses Python's `RotatingFileHandler` for automatic log rotation:

- **indostar.log**: Rotates at 10MB, keeps 5 backup files
- **errors.log**: Rotates at 10MB, keeps 10 backup files

### System-Level Rotation (Linux)

For production deployments on Linux, use the provided `logrotate.conf`:

1. Copy the configuration:
   ```bash
   sudo cp logrotate.conf /etc/logrotate.d/indostar
   ```

2. Update the log file paths in the configuration

3. Test the configuration:
   ```bash
   sudo logrotate -d /etc/logrotate.d/indostar
   ```

4. Logrotate will run automatically via cron

### Docker Log Rotation

For Docker deployments, use Docker's built-in log rotation:

```bash
docker run \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=5 \
  indostar-backend
```

Or in docker-compose.yml:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
```

## Integration with External Monitoring

The monitoring infrastructure can be easily integrated with external services:

### Sentry (Error Tracking)

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment=settings.environment,
    traces_sample_rate=1.0
)
```

### Prometheus (Metrics)

Install `prometheus-fastapi-instrumentator`:

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

### DataDog / New Relic

Follow their respective Python integration guides to add APM monitoring.

## Best Practices

1. **Use Structured Logging**: Always use `log_with_context()` for important events to include additional context

2. **Log Appropriate Levels**:
   - Use INFO for normal operations
   - Use WARNING for recoverable issues
   - Use ERROR for failures that need attention
   - Use DEBUG only in development

3. **Don't Log Sensitive Data**: Never log passwords, tokens, or PII

4. **Monitor Health Endpoints**: Set up automated monitoring to check health endpoints regularly

5. **Set Up Alerts**: Configure alerts for:
   - High error rates
   - Slow requests
   - Database connectivity issues
   - High resource usage

6. **Review Logs Regularly**: Check error logs daily in production

7. **Rotate Logs**: Ensure log rotation is configured to prevent disk space issues

## Troubleshooting

### Logs Not Appearing

1. Check that the `logs/` directory exists and is writable
2. Verify the log level is set appropriately
3. Check file permissions

### High Disk Usage

1. Verify log rotation is working
2. Reduce log retention period
3. Lower log level in production (INFO instead of DEBUG)

### Performance Issues

1. Check `/api/monitoring/performance` for slow endpoints
2. Review slow request warnings in logs
3. Optimize database queries for slow endpoints

### High Error Rates

1. Check `/api/monitoring/errors` for error patterns
2. Review `errors.log` for detailed error information
3. Check database connectivity if seeing DATABASE_ERROR

## Configuration

Logging configuration is controlled by environment variables:

- `ENVIRONMENT`: Set to "production" or "development"
- Log level is automatically set based on environment:
  - Production: INFO
  - Development: DEBUG

To customize, modify `app/utils/logging_config.py`.
