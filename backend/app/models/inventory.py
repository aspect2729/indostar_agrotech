from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic models."""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v, info):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class Inventory(BaseModel):
    """Inventory model for tracking product stock levels."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    product_id: PyObjectId
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., min_length=1, max_length=50)
    low_stock_threshold: float = Field(..., gt=0)
    last_restocked: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: float) -> float:
        """Validate that quantity is not negative."""
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v
    
    @field_validator("low_stock_threshold")
    @classmethod
    def validate_threshold(cls, v: float) -> float:
        """Validate that threshold is positive."""
        if v <= 0:
            raise ValueError("Low stock threshold must be greater than zero")
        return v
    
    @property
    def is_low_stock(self) -> bool:
        """Check if inventory is below low stock threshold."""
        return self.quantity <= self.low_stock_threshold
    
    @property
    def is_out_of_stock(self) -> bool:
        """Check if inventory is out of stock."""
        return self.quantity == 0
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "product_id": "507f1f77bcf86cd799439011",
                "quantity": 100.0,
                "unit": "kg",
                "low_stock_threshold": 20.0,
                "last_restocked": "2024-01-15T10:30:00Z"
            }
        }
