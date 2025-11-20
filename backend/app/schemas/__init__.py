"""
Request and response schemas for API endpoints.
"""

from .auth import (
    GoogleAuthRequest,
    GoogleAuthCallbackRequest,
    TokenResponse,
    RefreshTokenRequest,
    LogoutResponse,
)
from .product import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductResponse,
    ProductListResponse,
    ProductQueryParams,
)
from .order import (
    OrderCreateRequest,
    OrderUpdateStatusRequest,
    OrderResponse,
    OrderListResponse,
    OrderItemRequest,
)
from .inventory import (
    InventoryUpdateRequest,
    InventoryResponse,
    InventoryListResponse,
    InventoryAlertResponse,
)
from .user import (
    UserProfileResponse,
    UserProfileUpdateRequest,
    AddressRequest,
)
from .error import (
    ErrorResponse,
    ErrorDetail,
    ValidationErrorResponse,
    ValidationErrorDetail,
)

__all__ = [
    # Auth schemas
    "GoogleAuthRequest",
    "GoogleAuthCallbackRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    "LogoutResponse",
    # Product schemas
    "ProductCreateRequest",
    "ProductUpdateRequest",
    "ProductResponse",
    "ProductListResponse",
    "ProductQueryParams",
    # Order schemas
    "OrderCreateRequest",
    "OrderUpdateStatusRequest",
    "OrderResponse",
    "OrderListResponse",
    "OrderItemRequest",
    # Inventory schemas
    "InventoryUpdateRequest",
    "InventoryResponse",
    "InventoryListResponse",
    "InventoryAlertResponse",
    # User schemas
    "UserProfileResponse",
    "UserProfileUpdateRequest",
    "AddressRequest",
    # Error schemas
    "ErrorResponse",
    "ErrorDetail",
    "ValidationErrorResponse",
    "ValidationErrorDetail",
]
