"""
Subscription API Routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.services.subscription_service import SubscriptionService
from app.schemas.subscription import (
    SubscriptionCreateRequest,
    SubscriptionUpdateRequest,
    DailyQuantityAdjustmentRequest,
    SubscriptionResponse,
    MonthlyBillResponse
)
from app.utils.dependencies import get_current_user, require_owner

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.post("", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new milk subscription (consumer only)"""
    service = SubscriptionService(db)
    subscription = await service.create_subscription(
        user_id=current_user["_id"],
        subscription_data=subscription_data
    )
    return subscription


@router.get("", response_model=List[SubscriptionResponse])
async def get_my_subscriptions(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all subscriptions for current user"""
    service = SubscriptionService(db)
    subscriptions = await service.get_user_subscriptions(current_user["_id"])
    return subscriptions


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific subscription"""
    service = SubscriptionService(db)
    subscription = await service.get_subscription(subscription_id, current_user["_id"])
    return subscription


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: str,
    update_data: SubscriptionUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update subscription details"""
    service = SubscriptionService(db)
    subscription = await service.update_subscription(
        subscription_id=subscription_id,
        user_id=current_user["_id"],
        update_data=update_data
    )
    return subscription


@router.post("/{subscription_id}/adjust", response_model=SubscriptionResponse)
async def adjust_daily_quantity(
    subscription_id: str,
    adjustment: DailyQuantityAdjustmentRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Adjust quantity for a specific date (must be at least 1 day in advance).
    Set quantity to 0 to skip delivery for that day.
    """
    service = SubscriptionService(db)
    subscription = await service.adjust_daily_quantity(
        subscription_id=subscription_id,
        user_id=current_user["_id"],
        adjustment=adjustment
    )
    return subscription


@router.get("/{subscription_id}/bill/{month}", response_model=MonthlyBillResponse)
async def get_monthly_bill(
    subscription_id: str,
    month: str,  # YYYY-MM format
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get monthly bill for a subscription.
    Month format: YYYY-MM (e.g., 2024-11)
    """
    service = SubscriptionService(db)
    bill = await service.get_monthly_bill(
        subscription_id=subscription_id,
        user_id=current_user["_id"],
        month=month
    )
    return bill


@router.post("/{subscription_id}/pause", response_model=SubscriptionResponse)
async def pause_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Pause a subscription"""
    service = SubscriptionService(db)
    subscription = await service.pause_subscription(subscription_id, current_user["_id"])
    return subscription


@router.post("/{subscription_id}/resume", response_model=SubscriptionResponse)
async def resume_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Resume a paused subscription"""
    service = SubscriptionService(db)
    subscription = await service.resume_subscription(subscription_id, current_user["_id"])
    return subscription


@router.delete("/{subscription_id}", response_model=SubscriptionResponse)
async def cancel_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cancel a subscription"""
    service = SubscriptionService(db)
    subscription = await service.cancel_subscription(subscription_id, current_user["_id"])
    return subscription


# Owner routes
@router.get("/admin/all", response_model=List[SubscriptionResponse])
async def get_all_subscriptions(
    status: Optional[str] = Query(None, regex="^(active|paused|cancelled)$"),
    current_user: dict = Depends(require_owner),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all subscriptions (owner only)"""
    service = SubscriptionService(db)
    subscriptions = await service.get_all_subscriptions(status=status)
    return subscriptions


@router.post("/admin/{subscription_id}/deliver/{date}")
async def mark_delivery_completed(
    subscription_id: str,
    date: str,  # YYYY-MM-DD format
    current_user: dict = Depends(require_owner),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark a delivery as completed (owner only)"""
    service = SubscriptionService(db)
    subscription = await service.mark_delivery_completed(subscription_id, date)
    return {"message": "Delivery marked as completed", "subscription": subscription}
