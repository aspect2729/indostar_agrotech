from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal, Dict
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


class NutritionalInfo(BaseModel):
    """Nutritional information for products."""
    calories: float = Field(..., ge=0)
    protein: float = Field(..., ge=0)
    carbohydrates: float = Field(..., ge=0)
    fat: float = Field(..., ge=0)
    additional_info: Optional[Dict[str, float]] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "calories": 383,
                "protein": 0.4,
                "carbohydrates": 98.0,
                "fat": 0.1,
                "additional_info": {
                    "fiber": 0.0,
                    "sugar": 97.0
                }
            }
        }


class PriceStructure(BaseModel):
    """Price structure for different user types."""
    consumer: float = Field(..., gt=0)
    distributor: float = Field(..., gt=0)
    
    @field_validator("distributor")
    @classmethod
    def validate_distributor_price(cls, v: float, info) -> float:
        """Validate that distributor price is less than or equal to consumer price."""
        consumer_price = info.data.get("consumer")
        if consumer_price and v > consumer_price:
            raise ValueError("Distributor price cannot be greater than consumer price")
        return v


class Product(BaseModel):
    """Product model representing items available for sale."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., min_length=1, max_length=200)
    category: Literal["jaggery", "oil", "chutney_powder", "pickles", "milk"]
    description: str = Field(..., min_length=1, max_length=2000)
    images: List[str] = Field(default_factory=list)
    price: PriceStructure
    unit: str = Field(..., min_length=1, max_length=50)
    nutritional_info: Optional[NutritionalInfo] = None
    inter_state_delivery: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator("name", "description")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        """Validate that string fields are not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()
    
    @field_validator("category")
    @classmethod
    def validate_inter_state_delivery(cls, v: str, info) -> str:
        """Set inter_state_delivery based on category."""
        # This validator runs before inter_state_delivery is set
        # The actual logic will be in the service layer
        return v
    
    @field_validator("images")
    @classmethod
    def validate_images(cls, v: List[str]) -> List[str]:
        """Validate that image URLs are not empty."""
        if v:
            for img in v:
                if not img or not img.strip():
                    raise ValueError("Image URL cannot be empty")
        return v
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
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
