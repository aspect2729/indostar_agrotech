"""
Subscription Model for Milk Delivery
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId


class DailyDelivery(BaseModel):
    """Daily delivery record"""
    date: str  # YYYY-MM-DD format
    quantity_liters: float
    status: str = "scheduled"  # scheduled, delivered, skipped, modified
    modified_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    notes: Optional[str] = None


class Subscription(BaseModel):
    """Milk Subscription Model"""
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    product_id: str
    product_name: str
    default_quantity_liters: float  # Default daily quantity
    price_per_liter: float
    status: str = "active"  # active, paused, cancelled
    start_date: str  # YYYY-MM-DD
    end_date: Optional[str] = None  # YYYY-MM-DD, None for ongoing
    delivery_address: dict
    delivery_time_preference: str = "morning"  # morning, evening
    skip_days: List[str] = []  # Days to skip (e.g., ["sunday"])
    daily_deliveries: List[DailyDelivery] = []
    total_delivered_liters: float = 0.0
    total_amount: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }


class SubscriptionCreate(BaseModel):
    """Schema for creating a subscription"""
    product_id: str
    default_quantity_liters: float
    delivery_address: dict
    delivery_time_preference: str = "morning"
    skip_days: List[str] = []


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription"""
    default_quantity_liters: Optional[float] = None
    delivery_address: Optional[dict] = None
    delivery_time_preference: Optional[str] = None
    skip_days: Optional[List[str]] = None
    status: Optional[str] = None


class DailyQuantityAdjustment(BaseModel):
    """Schema for adjusting daily quantity"""
    date: str  # YYYY-MM-DD
    quantity_liters: float
    notes: Optional[str] = None


class MonthlyBill(BaseModel):
    """Monthly bill summary"""
    subscription_id: str
    month: str  # YYYY-MM format
    product_name: str
    deliveries: List[dict]
    total_liters: float
    total_amount: float
    price_per_liter: float
