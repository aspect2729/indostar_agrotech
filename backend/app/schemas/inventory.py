"""
Inventory request and response schemas.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional
from datetime import datetime


class InventoryUpdateRequest(BaseModel):
    """Request schema for updating inventory."""
    quantity: float = Field(..., description="Quantity value")
    operation: Literal["set", "add", "subtract"] = Field(
        default="set",
        description="Operation type: set (replace), add (increase), subtract (decrease)"
    )
    
    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: float, info) -> float:
        """Validate quantity based on operation."""
        operation = info.data.get("operation", "set")
        
        if operation == "set" and v < 0:
            raise ValueError("Quantity cannot be negative for 'set' operation")
        
        if operation in ["add", "subtract"] and v <= 0:
            raise ValueError(f"Quantity must be positive for '{operation}' operation")
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "quantity": 50.0,
                "operation": "add"
            }
        }


class InventoryResponse(BaseModel):
    """Response schema for inventory."""
    id: str = Field(..., alias="_id")
    product_id: str
    product_name: Optional[str] = None
    quantity: float
    unit: str
    low_stock_threshold: float
    is_low_stock: bool
    is_out_of_stock: bool
    last_restocked: Optional[datetime]
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "product_id": "507f1f77bcf86cd799439012",
                "product_name": "Organic Jaggery Powder",
                "quantity": 100.0,
                "unit": "kg",
                "low_stock_threshold": 20.0,
                "is_low_stock": False,
                "is_out_of_stock": False,
                "last_restocked": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class InventoryListResponse(BaseModel):
    """Response schema for inventory list."""
    inventory: List[InventoryResponse]
    total: int = Field(..., description="Total number of inventory items")
    
    class Config:
        json_schema_extra = {
            "example": {
                "inventory": [],
                "total": 50
            }
        }


class InventoryAlertResponse(BaseModel):
    """Response schema for low stock alerts."""
    alerts: List[InventoryResponse]
    total: int = Field(..., description="Total number of low stock items")
    
    class Config:
        json_schema_extra = {
            "example": {
                "alerts": [],
                "total": 5
            }
        }
