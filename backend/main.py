from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from pymongo.errors import PyMongoError
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_to_mongodb, close_mongodb_connection
from app.exceptions import IndostarException
from app.middleware import (
    indostar_exception_handler,
    validation_exception_handler,
    database_exception_handler,
    generic_exception_handler,
    RequestValidationMiddleware
)
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.utils.logging_config import setup_logging, get_logger

# Configure structured logging
setup_logging(
    environment=settings.environment,
    log_level="INFO" if settings.environment == "production" else "DEBUG"
)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for application startup and shutdown events.
    """
    # Startup: Connect to MongoDB
    await connect_to_mongodb()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongodb_connection()


# Initialize FastAPI application
app = FastAPI(
    title="Indostar E-commerce API",
    description="Backend API for Indostar Agrotech Private Limited e-commerce platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Configure CORS middleware with pattern matching for Vercel deployments
def get_cors_origins():
    """Get CORS origins including patterns for Vercel preview deployments."""
    origins = settings.cors_origins_list.copy()
    
    # Add pattern for all Vercel preview deployments
    # Note: FastAPI CORS doesn't support regex, so we'll use allow_origin_regex
    return origins

# Use allow_origin_regex to match all Vercel deployment URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",  # Matches all Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware, slow_request_threshold=1.0)

# Add request validation middleware
app.add_middleware(RequestValidationMiddleware)

# Register exception handlers
app.add_exception_handler(IndostarException, indostar_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(PyMongoError, database_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get("/")
async def root():
    """Root endpoint."""
    logger.info("Root endpoint accessed")
    return {
        "message": "Indostar E-commerce API",
        "status": "running",
        "environment": settings.environment,
        "version": "1.0.0"
    }


# Include routers
from app.routes import auth, products, inventory, orders, users, dev_auth, health, subscriptions

app.include_router(health.router, prefix="/api", tags=["Health & Monitoring"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dev_auth.router, prefix="/api/auth", tags=["Development Auth"])  # DEV ONLY
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(subscriptions.router, tags=["Subscriptions"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.environment == "development" else False
    )
