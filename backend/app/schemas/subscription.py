"""
Subscription Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SubscriptionCreateRequest(BaseModel):
    """Request schema for creating a subscription"""
    product_id: str
    default_quantity_liters: float = Field(..., gt=0, description="Default daily quantity in liters")
    delivery_address: dict
    delivery_time_preference: str = Field(default="morning", pattern="^(morning|evening)$")
    skip_days: List[str] = Field(default=[], description="Days to skip (e.g., ['sunday'])")


class SubscriptionUpdateRequest(BaseModel):
    """Request schema for updating a subscription"""
    default_quantity_liters: Optional[float] = Field(None, gt=0)
    delivery_address: Optional[dict] = None
    delivery_time_preference: Optional[str] = Field(None, pattern="^(morning|evening)$")
    skip_days: Optional[List[str]] = None
    status: Optional[str] = Field(None, pattern="^(active|paused|cancelled)$")


class DailyQuantityAdjustmentRequest(BaseModel):
    """Request schema for adjusting daily quantity"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    quantity_liters: float = Field(..., ge=0, description="Quantity in liters (0 to skip)")
    notes: Optional[str] = None


class SubscriptionResponse(BaseModel):
    """Response schema for subscription"""
    id: str = Field(..., alias="_id")
    user_id: str
    product_id: str
    product_name: str
    default_quantity_liters: float
    price_per_liter: float
    status: str
    start_date: str
    end_date: Optional[str]
    delivery_address: dict
    delivery_time_preference: str
    skip_days: List[str]
    total_delivered_liters: float
    total_amount: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class DailyDeliveryResponse(BaseModel):
    """Response schema for daily delivery"""
    date: str
    quantity_liters: float
    status: str
    modified_at: Optional[datetime]
    delivered_at: Optional[datetime]
    notes: Optional[str]


class MonthlyBillResponse(BaseModel):
    """Response schema for monthly bill"""
    subscription_id: str
    month: str
    product_name: str
    deliveries: List[dict]
    total_liters: float
    total_amount: float
    price_per_liter: float
    start_date: str
    end_date: str
