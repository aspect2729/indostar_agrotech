"""
Product request and response schemas.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime


class NutritionalInfoSchema(BaseModel):
    """Schema for nutritional information."""
    calories: float = Field(..., ge=0)
    protein: float = Field(..., ge=0)
    carbohydrates: float = Field(..., ge=0)
    fat: float = Field(..., ge=0)
    additional_info: Optional[dict] = Field(default_factory=dict)


class PriceStructureSchema(BaseModel):
    """Schema for price structure."""
    consumer: float = Field(..., gt=0)
    distributor: float = Field(..., gt=0)


class ProductCreateRequest(BaseModel):
    """Request schema for creating a product."""
    name: str = Field(..., min_length=1, max_length=200)
    category: Literal["jaggery", "oil", "chutney_powder", "pickles", "milk"]
    description: str = Field(..., min_length=1, max_length=2000)
    images: List[str] = Field(default_factory=list)
    price: PriceStructureSchema
    unit: str = Field(..., min_length=1, max_length=50)
    nutritional_info: Optional[NutritionalInfoSchema] = None
    inter_state_delivery: bool = False
    is_active: bool = True
    
    @field_validator("name", "description")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        """Validate that string fields are not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Organic Jaggery Powder",
                "category": "jaggery",
                "description": "Pure organic jaggery powder made from sugarcane",
                "images": ["https://example.com/jaggery1.jpg"],
                "price": {
                    "consumer": 150.0,
                    "distributor": 120.0
                },
                "unit": "kg",
                "nutritional_info": {
                    "calories": 383,
                    "protein": 0.4,
                    "carbohydrates": 98.0,
                    "fat": 0.1
                },
                "inter_state_delivery": True,
                "is_active": True
            }
        }


class ProductUpdateRequest(BaseModel):
    """Request schema for updating a product."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[Literal["jaggery", "oil", "chutney_powder", "pickles", "milk"]] = None
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    images: Optional[List[str]] = None
    price: Optional[PriceStructureSchema] = None
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    nutritional_info: Optional[NutritionalInfoSchema] = None
    inter_state_delivery: Optional[bool] = None
    is_active: Optional[bool] = None
    
    @field_validator("name", "description")
    @classmethod
    def validate_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate that string fields are not empty or whitespace."""
        if v is not None and (not v or not v.strip()):
            raise ValueError("Field cannot be empty")
        return v.strip() if v else v
    
    class Config:
        json_schema_extra = {
            "example": {
                "price": {
                    "consumer": 160.0,
                    "distributor": 130.0
                },
                "is_active": True
            }
        }


class ProductResponse(BaseModel):
    """Response schema for a single product."""
    id: str = Field(..., alias="_id")
    name: str
    category: str
    description: str
    images: List[str]
    price: PriceStructureSchema
    unit: str
    nutritional_info: Optional[NutritionalInfoSchema]
    inter_state_delivery: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "name": "Organic Jaggery Powder",
                "category": "jaggery",
                "description": "Pure organic jaggery powder made from sugarcane",
                "images": ["https://example.com/jaggery1.jpg"],
                "price": {
                    "consumer": 150.0,
                    "distributor": 120.0
                },
                "unit": "kg",
                "nutritional_info": {
                    "calories": 383,
                    "protein": 0.4,
                    "carbohydrates": 98.0,
                    "fat": 0.1
                },
                "inter_state_delivery": True,
                "is_active": True,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class ProductListResponse(BaseModel):
    """Response schema for product list."""
    products: List[ProductResponse]
    total: int = Field(..., description="Total number of products")
    limit: int = Field(..., description="Number of products per page")
    offset: int = Field(..., description="Offset for pagination")
    
    class Config:
        json_schema_extra = {
            "example": {
                "products": [],
                "total": 50,
                "limit": 20,
                "offset": 0
            }
        }


class ProductQueryParams(BaseModel):
    """Query parameters for product listing."""
    category: Optional[Literal["jaggery", "oil", "chutney_powder", "pickles", "milk"]] = None
    search: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    is_active: Optional[bool] = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "category": "jaggery",
                "search": "organic",
                "limit": 20,
                "offset": 0,
                "is_active": True
            }
        }
