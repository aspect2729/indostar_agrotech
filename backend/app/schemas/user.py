"""
User request and response schemas.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Literal, Optional
from datetime import datetime


class AddressRequest(BaseModel):
    """Request schema for user address."""
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
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "shipping",
                "street": "123 Main St",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001",
                "is_default": True
            }
        }


class AddressResponse(BaseModel):
    """Response schema for user address."""
    type: Literal["billing", "shipping"]
    street: str
    city: str
    state: str
    pincode: str
    is_default: bool


class UserProfileResponse(BaseModel):
    """Response schema for user profile."""
    id: str = Field(..., alias="_id")
    google_id: str
    email: EmailStr
    name: str
    role: Literal["consumer", "distributor", "owner"]
    phone: Optional[str]
    addresses: List[AddressResponse]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
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
                ],
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class UserProfileUpdateRequest(BaseModel):
    """Request schema for updating user profile."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{9,14}$")
    addresses: Optional[List[AddressRequest]] = None
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate that name is not empty or whitespace."""
        if v is not None and (not v or not v.strip()):
            raise ValueError("Name cannot be empty")
        return v.strip() if v else v
    
    @field_validator("addresses")
    @classmethod
    def validate_default_address(cls, v: Optional[List[AddressRequest]]) -> Optional[List[AddressRequest]]:
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
        json_schema_extra = {
            "example": {
                "name": "John Doe",
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
