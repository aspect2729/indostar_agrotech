"""
Subscription Service Layer
"""
from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.subscription import Subscription, DailyDelivery, MonthlyBill
from app.schemas.subscription import (
    SubscriptionCreateRequest,
    SubscriptionUpdateRequest,
    DailyQuantityAdjustmentRequest
)
from app.exceptions import NotFoundException, ValidationException


class SubscriptionService:
    """Service for managing milk subscriptions"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.subscriptions = db.subscriptions
        self.products = db.products
    
    async def create_subscription(
        self,
        user_id: str,
        subscription_data: SubscriptionCreateRequest
    ) -> dict:
        """Create a new milk subscription"""
        # Verify product exists and is milk category
        product = await self.products.find_one({"_id": ObjectId(subscription_data.product_id)})
        if not product:
            raise NotFoundException("Product not found")
        
        if product.get("category") != "milk":
            raise ValidationException("Subscriptions are only available for milk products")
        
        # Create subscription
        subscription = {
            "user_id": user_id,
            "product_id": subscription_data.product_id,
            "product_name": product["name"],
            "default_quantity_liters": subscription_data.default_quantity_liters,
            "price_per_liter": product["price"],
            "status": "active",
            "start_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "end_date": None,
            "delivery_address": subscription_data.delivery_address,
            "delivery_time_preference": subscription_data.delivery_time_preference,
            "skip_days": subscription_data.skip_days,
            "daily_deliveries": [],
            "total_delivered_liters": 0.0,
            "total_amount": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.subscriptions.insert_one(subscription)
        subscription["_id"] = str(result.inserted_id)
        
        return subscription
    
    async def get_user_subscriptions(self, user_id: str) -> List[dict]:
        """Get all subscriptions for a user"""
        cursor = self.subscriptions.find({"user_id": user_id})
        subscriptions = await cursor.to_list(length=100)
        
        for sub in subscriptions:
            sub["_id"] = str(sub["_id"])
        
        return subscriptions
    
    async def get_subscription(self, subscription_id: str, user_id: str) -> dict:
        """Get a specific subscription"""
        subscription = await self.subscriptions.find_one({
            "_id": ObjectId(subscription_id),
            "user_id": user_id
        })
        
        if not subscription:
            raise NotFoundException("Subscription not found")
        
        subscription["_id"] = str(subscription["_id"])
        return subscription
    
    async def update_subscription(
        self,
        subscription_id: str,
        user_id: str,
        update_data: SubscriptionUpdateRequest
    ) -> dict:
        """Update subscription details"""
        subscription = await self.get_subscription(subscription_id, user_id)
        
        update_fields = update_data.dict(exclude_unset=True)
        update_fields["updated_at"] = datetime.utcnow()
        
        await self.subscriptions.update_one(
            {"_id": ObjectId(subscription_id)},
            {"$set": update_fields}
        )
        
        return await self.get_subscription(subscription_id, user_id)
    
    async def adjust_daily_quantity(
        self,
        subscription_id: str,
        user_id: str,
        adjustment: DailyQuantityAdjustmentRequest
    ) -> dict:
        """Adjust quantity for a specific date (must be at least 1 day in advance)"""
        subscription = await self.get_subscription(subscription_id, user_id)
        
        # Parse the date
        try:
            target_date = datetime.strptime(adjustment.date, "%Y-%m-%d")
        except ValueError:
            raise ValidationException("Invalid date format. Use YYYY-MM-DD")
        
        # Check if date is at least 1 day in advance
        tomorrow = datetime.utcnow() + timedelta(days=1)
        tomorrow_date = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        
        if target_date < tomorrow_date:
            raise ValidationException("Quantity can only be adjusted at least 1 day in advance")
        
        # Check if subscription is active
        if subscription["status"] != "active":
            raise ValidationException("Cannot adjust quantity for inactive subscription")
        
        # Find or create daily delivery record
        daily_deliveries = subscription.get("daily_deliveries", [])
        existing_delivery = None
        
        for delivery in daily_deliveries:
            if delivery["date"] == adjustment.date:
                existing_delivery = delivery
                break
        
        if existing_delivery:
            # Update existing delivery
            existing_delivery["quantity_liters"] = adjustment.quantity_liters
            existing_delivery["status"] = "scheduled" if adjustment.quantity_liters > 0 else "skipped"
            existing_delivery["modified_at"] = datetime.utcnow()
            existing_delivery["notes"] = adjustment.notes
        else:
            # Create new delivery record
            new_delivery = {
                "date": adjustment.date,
                "quantity_liters": adjustment.quantity_liters,
                "status": "scheduled" if adjustment.quantity_liters > 0 else "skipped",
                "modified_at": datetime.utcnow(),
                "delivered_at": None,
                "notes": adjustment.notes
            }
            daily_deliveries.append(new_delivery)
        
        # Update subscription
        await self.subscriptions.update_one(
            {"_id": ObjectId(subscription_id)},
            {
                "$set": {
                    "daily_deliveries": daily_deliveries,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return await self.get_subscription(subscription_id, user_id)
    
    async def get_monthly_bill(
        self,
        subscription_id: str,
        user_id: str,
        month: str  # YYYY-MM format
    ) -> dict:
        """Generate monthly bill for a subscription"""
        subscription = await self.get_subscription(subscription_id, user_id)
        
        # Parse month
        try:
            year, month_num = map(int, month.split("-"))
            start_date = datetime(year, month_num, 1)
            
            # Calculate end date (last day of month)
            if month_num == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = datetime(year, month_num + 1, 1) - timedelta(days=1)
        except ValueError:
            raise ValidationException("Invalid month format. Use YYYY-MM")
        
        # Get all deliveries for the month
        daily_deliveries = subscription.get("daily_deliveries", [])
        month_deliveries = []
        total_liters = 0.0
        
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            day_name = current_date.strftime("%A").lower()
            
            # Check if day should be skipped
            if day_name in subscription.get("skip_days", []):
                current_date += timedelta(days=1)
                continue
            
            # Find delivery record for this date
            delivery_record = None
            for delivery in daily_deliveries:
                if delivery["date"] == date_str:
                    delivery_record = delivery
                    break
            
            if delivery_record:
                quantity = delivery_record["quantity_liters"]
                status = delivery_record["status"]
            else:
                # Use default quantity if no specific record
                quantity = subscription["default_quantity_liters"]
                status = "scheduled"
            
            if quantity > 0 and status != "skipped":
                amount = quantity * subscription["price_per_liter"]
                month_deliveries.append({
                    "date": date_str,
                    "day": current_date.strftime("%A"),
                    "quantity_liters": quantity,
                    "price_per_liter": subscription["price_per_liter"],
                    "amount": amount,
                    "status": status
                })
                total_liters += quantity
            
            current_date += timedelta(days=1)
        
        total_amount = total_liters * subscription["price_per_liter"]
        
        return {
            "subscription_id": subscription_id,
            "month": month,
            "product_name": subscription["product_name"],
            "deliveries": month_deliveries,
            "total_liters": total_liters,
            "total_amount": total_amount,
            "price_per_liter": subscription["price_per_liter"],
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        }
    
    async def cancel_subscription(self, subscription_id: str, user_id: str) -> dict:
        """Cancel a subscription"""
        await self.subscriptions.update_one(
            {"_id": ObjectId(subscription_id), "user_id": user_id},
            {
                "$set": {
                    "status": "cancelled",
                    "end_date": datetime.utcnow().strftime("%Y-%m-%d"),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return await self.get_subscription(subscription_id, user_id)
    
    async def pause_subscription(self, subscription_id: str, user_id: str) -> dict:
        """Pause a subscription"""
        await self.subscriptions.update_one(
            {"_id": ObjectId(subscription_id), "user_id": user_id},
            {
                "$set": {
                    "status": "paused",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return await self.get_subscription(subscription_id, user_id)
    
    async def resume_subscription(self, subscription_id: str, user_id: str) -> dict:
        """Resume a paused subscription"""
        await self.subscriptions.update_one(
            {"_id": ObjectId(subscription_id), "user_id": user_id},
            {
                "$set": {
                    "status": "active",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return await self.get_subscription(subscription_id, user_id)
    
    # Owner methods
    async def get_all_subscriptions(self, status: Optional[str] = None) -> List[dict]:
        """Get all subscriptions (owner only)"""
        query = {}
        if status:
            query["status"] = status
        
        cursor = self.subscriptions.find(query)
        subscriptions = await cursor.to_list(length=1000)
        
        for sub in subscriptions:
            sub["_id"] = str(sub["_id"])
        
        return subscriptions
    
    async def mark_delivery_completed(
        self,
        subscription_id: str,
        date: str
    ) -> dict:
        """Mark a delivery as completed (owner only)"""
        subscription = await self.subscriptions.find_one({"_id": ObjectId(subscription_id)})
        if not subscription:
            raise NotFoundException("Subscription not found")
        
        daily_deliveries = subscription.get("daily_deliveries", [])
        delivery_found = False
        delivered_quantity = 0.0
        
        for delivery in daily_deliveries:
            if delivery["date"] == date:
                delivery["status"] = "delivered"
                delivery["delivered_at"] = datetime.utcnow()
                delivery_found = True
                delivered_quantity = delivery["quantity_liters"]
                break
        
        if not delivery_found:
            # Create delivery record with default quantity
            delivered_quantity = subscription["default_quantity_liters"]
            daily_deliveries.append({
                "date": date,
                "quantity_liters": delivered_quantity,
                "status": "delivered",
                "modified_at": None,
                "delivered_at": datetime.utcnow(),
                "notes": None
            })
        
        # Update totals
        new_total_liters = subscription.get("total_delivered_liters", 0.0) + delivered_quantity
        new_total_amount = new_total_liters * subscription["price_per_liter"]
        
        await self.subscriptions.update_one(
            {"_id": ObjectId(subscription_id)},
            {
                "$set": {
                    "daily_deliveries": daily_deliveries,
                    "total_delivered_liters": new_total_liters,
                    "total_amount": new_total_amount,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        subscription["_id"] = str(subscription["_id"])
        return subscription
