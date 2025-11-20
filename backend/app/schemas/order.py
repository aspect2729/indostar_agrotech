"""
Order request and response schemas.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional
from datetime import datetime


class AddressSchema(BaseModel):
    """Schema for delivery address."""
    type: Literal["billing", "shipping"]
    street: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., pattern=r"^\d{6}$")
    is_default: bool = False


class OrderItemRequest(BaseModel):
    """Request schema for order item."""
    product_id: str = Field(..., description="Product ID")
    quantity: float = Field(..., gt=0, description="Quantity to order")
    
    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "507f1f77bcf86cd799439011",
                "quantity": 2.0
            }
        }


class OrderItemResponse(BaseModel):
    """Response schema for order item."""
    product_id: str
    product_name: str
    quantity: float
    unit: str
    price_per_unit: float
    total: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "507f1f77bcf86cd799439011",
                "product_name": "Organic Jaggery Powder",
                "quantity": 2.0,
                "unit": "kg",
                "price_per_unit": 150.0,
                "total": 300.0
            }
        }


class OrderCreateRequest(BaseModel):
    """Request schema for creating an order."""
    items: List[OrderItemRequest] = Field(..., min_length=1)
    delivery_address: AddressSchema
    notes: Optional[str] = Field(None, max_length=1000)
    
    @field_validator("items")
    @classmethod
    def validate_items(cls, v: List[OrderItemRequest]) -> List[OrderItemRequest]:
        """Validate that order has at least one item."""
        if not v:
            raise ValueError("Order must contain at least one item")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "product_id": "507f1f77bcf86cd799439011",
                        "quantity": 2.0
                    }
                ],
                "delivery_address": {
                    "type": "shipping",
                    "street": "123 Main St",
                    "city": "Bangalore",
                    "state": "Karnataka",
                    "pincode": "560001",
                    "is_default": True
                },
                "notes": "Please deliver before 5 PM"
            }
        }


class OrderUpdateStatusRequest(BaseModel):
    """Request schema for updating order status."""
    status: Literal["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    notes: Optional[str] = Field(None, max_length=1000)
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "confirmed",
                "notes": "Order confirmed and ready for processing"
            }
        }


class OrderResponse(BaseModel):
    """Response schema for a single order."""
    id: str = Field(..., alias="_id")
    order_number: str
    user_id: str
    user_type: Literal["consumer", "distributor"]
    items: List[OrderItemResponse]
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    delivery_address: AddressSchema
    status: Literal["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    payment_status: Literal["pending", "completed", "failed"]
    payment_method: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "order_number": "ORD-2024-001",
                "user_id": "507f1f77bcf86cd799439012",
                "user_type": "consumer",
                "items": [
                    {
                        "product_id": "507f1f77bcf86cd799439013",
                        "product_name": "Organic Jaggery Powder",
                        "quantity": 2.0,
                        "unit": "kg",
                        "price_per_unit": 150.0,
                        "total": 300.0
                    }
                ],
                "subtotal": 300.0,
                "tax": 54.0,
                "shipping_cost": 50.0,
                "total": 404.0,
                "delivery_address": {
                    "type": "shipping",
                    "street": "123 Main St",
                    "city": "Bangalore",
                    "state": "Karnataka",
                    "pincode": "560001",
                    "is_default": True
                },
                "status": "pending",
                "payment_status": "pending",
                "payment_method": None,
                "notes": "Please deliver before 5 PM",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class OrderListResponse(BaseModel):
    """Response schema for order list."""
    orders: List[OrderResponse]
    total: int = Field(..., description="Total number of orders")
    limit: int = Field(..., description="Number of orders per page")
    offset: int = Field(..., description="Offset for pagination")
    
    class Config:
        json_schema_extra = {
            "example": {
                "orders": [],
                "total": 25,
                "limit": 20,
                "offset": 0
            }
        }
