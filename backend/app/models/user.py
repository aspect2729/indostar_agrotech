from pydantic import BaseModel, EmailStr, Field, field_validator
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
    """Address model for user addresses."""
    type: Literal["billing", "shipping"]
    street: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., pattern=r"^\d{6}$")
    is_default: bool = False
    
    @field_validator("street", "city", "state")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        """Validate that string fields are not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class User(BaseModel):
    """User model representing consumers, distributors, and owners."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    google_id: str = Field(..., min_length=1)
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    role: Literal["consumer", "distributor", "owner"]
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{9,14}$")
    addresses: List[Address] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate that name is not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()
    
    @field_validator("addresses")
    @classmethod
    def validate_default_address(cls, v: List[Address]) -> List[Address]:
        """Validate that only one address is marked as default per type."""
        if not v:
            return v
        
        billing_defaults = sum(1 for addr in v if addr.type == "billing" and addr.is_default)
        shipping_defaults = sum(1 for addr in v if addr.type == "shipping" and addr.is_default)
        
        if billing_defaults > 1:
            raise ValueError("Only one billing address can be marked as default")
        if shipping_defaults > 1:
            raise ValueError("Only one shipping address can be marked as default")
        
        return v
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "google_id": "1234567890",
                "email": "user@example.com",
                "name": "John Doe",
                "role": "consumer",
                "phone": "+919876543210",
                "addresses": [
                    {
                        "type": "shipping",
                        "street": "123 Main St",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "pincode": "560001",
                        "is_default": True
                    }
                ]
            }
        }
