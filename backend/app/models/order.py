from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
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


class Address(BaseModel):
    """Address model for delivery addresses."""
    type: Literal["billing", "shipping"]
    street: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., pattern=r"^\d{6}$")
    is_default: bool = False


class OrderItem(BaseModel):
    """Order item model representing a product in an order."""
    product_id: PyObjectId
    product_name: str = Field(..., min_length=1, max_length=200)
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=50)
    price_per_unit: float = Field(..., gt=0)
    total: float = Field(..., gt=0)
    
    @field_validator("total")
    @classmethod
    def validate_total(cls, v: float, info) -> float:
        """Validate that total matches quantity * price_per_unit."""
        quantity = info.data.get("quantity")
        price_per_unit = info.data.get("price_per_unit")
        
        if quantity and price_per_unit:
            expected_total = round(quantity * price_per_unit, 2)
            if abs(v - expected_total) > 0.01:  # Allow small floating point differences
                raise ValueError(f"Total must equal quantity * price_per_unit (expected {expected_total})")
        
        return v
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Order(BaseModel):
    """Order model representing customer and distributor orders."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    order_number: str = Field(..., min_length=1, max_length=50)
    user_id: PyObjectId
    user_type: Literal["consumer", "distributor"]
    items: List[OrderItem] = Field(..., min_length=1)
    subtotal: float = Field(..., ge=0)
    tax: float = Field(..., ge=0)
    shipping_cost: float = Field(..., ge=0)
    total: float = Field(..., gt=0)
    delivery_address: Address
    status: Literal["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] = "pending"
    payment_status: Literal["pending", "completed", "failed"] = "pending"
    payment_method: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=1000)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator("order_number")
    @classmethod
    def validate_order_number(cls, v: str) -> str:
        """Validate that order number is not empty."""
        if not v or not v.strip():
            raise ValueError("Order number cannot be empty")
        return v.strip()
    
    @field_validator("items")
    @classmethod
    def validate_items(cls, v: List[OrderItem]) -> List[OrderItem]:
        """Validate that order has at least one item."""
        if not v:
            raise ValueError("Order must contain at least one item")
        return v
    
    @field_validator("total")
    @classmethod
    def validate_total(cls, v: float, info) -> float:
        """Validate that total matches subtotal + tax + shipping_cost."""
        subtotal = info.data.get("subtotal", 0)
        tax = info.data.get("tax", 0)
        shipping_cost = info.data.get("shipping_cost", 0)
        
        expected_total = round(subtotal + tax + shipping_cost, 2)
        if abs(v - expected_total) > 0.01:  # Allow small floating point differences
            raise ValueError(f"Total must equal subtotal + tax + shipping_cost (expected {expected_total})")
        
        return v
    
    @field_validator("subtotal")
    @classmethod
    def validate_subtotal(cls, v: float, info) -> float:
        """Validate that subtotal matches sum of item totals."""
        items = info.data.get("items", [])
        if items:
            expected_subtotal = round(sum(item.total for item in items), 2)
            if abs(v - expected_subtotal) > 0.01:  # Allow small floating point differences
                raise ValueError(f"Subtotal must equal sum of item totals (expected {expected_subtotal})")
        
        return v
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "order_number": "ORD-2024-001",
                "user_id": "507f1f77bcf86cd799439011",
                "user_type": "consumer",
                "items": [
                    {
                        "product_id": "507f1f77bcf86cd799439012",
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
                "payment_status": "pending"
            }
        }
