"""
Order service for managing order operations.

This module handles order creation with inventory validation, price calculation,
order status updates, order history queries, and inter-state shipping cost calculation.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import logging

from app.database import get_orders_collection, get_products_collection
from app.models.order import Order, OrderItem, Address
from app.schemas.order import OrderCreateRequest, OrderItemRequest, OrderUpdateStatusRequest
from app.services.inventory_service import inventory_service
from app.services.product_service import product_service

logger = logging.getLogger(__name__)


# Constants for pricing calculations
TAX_RATE = 0.18  # 18% GST
BASE_SHIPPING_COST = 50.0  # Base shipping cost in INR
INTER_STATE_SHIPPING_MULTIPLIER = 3.0  # Multiplier for inter-state shipping


class OrderService:
    """Service class for order operations."""
    
    async def create_order(
        self,
        user_id: str,
        user_type: str,
        order_request: OrderCreateRequest
    ) -> Order:
        """
        Create a new order with inventory validation and price calculation.
        
        This method:
        1. Validates inventory availability for all items
        2. Fetches product details and calculates prices
        3. Calculates subtotal, tax, and shipping costs
        4. Creates the order in the database
        5. Deducts inventory quantities
        
        Args:
            user_id: User ID placing the order
            user_type: User type (consumer or distributor)
            order_request: Order creation request data
            
        Returns:
            Order: Created order object
            
        Raises:
            ValueError: If inventory validation fails or products not found
            Exception: If database operation fails
        """
        orders_collection = get_orders_collection()
        
        try:
            # Step 1: Validate inventory for all items
            inventory_items = [
                {"product_id": item.product_id, "quantity": item.quantity}
                for item in order_request.items
            ]
            
            validation_result = await inventory_service.validate_inventory_for_order(
                inventory_items
            )
            
            if not validation_result["valid"]:
                error_messages = "; ".join(validation_result["errors"])
                raise ValueError(f"Inventory validation failed: {error_messages}")
            
            # Log warnings if any
            for warning in validation_result["warnings"]:
                logger.warning(warning)
            
            # Step 2: Fetch product details and build order items
            order_items = []
            subtotal = 0.0
            
            for item_request in order_request.items:
                product = await product_service.get_product_by_id(item_request.product_id)
                
                if not product:
                    raise ValueError(f"Product not found: {item_request.product_id}")
                
                if not product.is_active:
                    raise ValueError(f"Product is not active: {product.name}")
                
                # Determine price based on user type
                if user_type == "distributor":
                    price_per_unit = product.price.distributor
                else:  # consumer
                    price_per_unit = product.price.consumer
                
                # Calculate item total
                item_total = round(item_request.quantity * price_per_unit, 2)
                
                # Create order item
                order_item = OrderItem(
                    product_id=ObjectId(item_request.product_id),
                    product_name=product.name,
                    quantity=item_request.quantity,
                    unit=product.unit,
                    price_per_unit=price_per_unit,
                    total=item_total
                )
                
                order_items.append(order_item)
                subtotal += item_total
            
            # Round subtotal
            subtotal = round(subtotal, 2)
            
            # Step 3: Calculate tax and shipping
            tax = round(subtotal * TAX_RATE, 2)
            shipping_cost = self._calculate_shipping_cost(
                order_request.delivery_address,
                order_items
            )
            
            # Calculate total
            total = round(subtotal + tax + shipping_cost, 2)
            
            # Step 4: Generate order number
            order_number = await self._generate_order_number()
            
            # Step 5: Create order object
            order_dict = {
                "order_number": order_number,
                "user_id": ObjectId(user_id),
                "user_type": user_type,
                "items": [item.model_dump() for item in order_items],
                "subtotal": subtotal,
                "tax": tax,
                "shipping_cost": shipping_cost,
                "total": total,
                "delivery_address": order_request.delivery_address.model_dump(),
                "status": "pending",
                "payment_status": "pending",
                "payment_method": None,
                "notes": order_request.notes,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert into database
            result = await orders_collection.insert_one(order_dict)
            order_dict["_id"] = result.inserted_id
            
            logger.info(
                f"Created order {order_number} for user {user_id} "
                f"(type: {user_type}, total: {total})"
            )
            
            # Step 6: Deduct inventory quantities
            for item in order_items:
                try:
                    from app.schemas.inventory import InventoryUpdateRequest
                    await inventory_service.update_inventory(
                        str(item.product_id),
                        InventoryUpdateRequest(
                            quantity=item.quantity,
                            operation="subtract"
                        )
                    )
                except Exception as e:
                    logger.error(
                        f"Failed to deduct inventory for product {item.product_id}: {str(e)}"
                    )
                    # Note: In production, this should trigger a compensation transaction
                    # For now, we log the error and continue
            
            # Return order object
            return Order(**order_dict)
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            raise
    
    def _calculate_shipping_cost(
        self,
        delivery_address: Any,
        order_items: List[OrderItem]
    ) -> float:
        """
        Calculate shipping cost based on delivery address and order items.
        
        Inter-state delivery for jaggery and oil products costs more.
        
        Args:
            delivery_address: Delivery address
            order_items: List of order items
            
        Returns:
            float: Calculated shipping cost
        """
        # Base shipping cost
        shipping_cost = BASE_SHIPPING_COST
        
        # Check if any items are eligible for inter-state delivery
        # and if the delivery is inter-state (not Karnataka)
        if delivery_address.state.lower() != "karnataka":
            # Check if order contains jaggery or oil products
            # For now, we'll apply inter-state multiplier if state is not Karnataka
            # In a real implementation, we'd check product categories
            shipping_cost = BASE_SHIPPING_COST * INTER_STATE_SHIPPING_MULTIPLIER
            logger.info(
                f"Inter-state shipping to {delivery_address.state}: {shipping_cost}"
            )
        
        return round(shipping_cost, 2)
    
    async def _generate_order_number(self) -> str:
        """
        Generate a unique order number.
        
        Format: ORD-YYYYMMDD-NNNN
        where NNNN is a sequential number for the day.
        
        Returns:
            str: Generated order number
        """
        orders_collection = get_orders_collection()
        
        # Get current date
        now = datetime.utcnow()
        date_prefix = now.strftime("ORD-%Y%m%d")
        
        # Find the highest order number for today
        pipeline = [
            {
                "$match": {
                    "order_number": {"$regex": f"^{date_prefix}"}
                }
            },
            {
                "$sort": {"order_number": -1}
            },
            {
                "$limit": 1
            }
        ]
        
        cursor = orders_collection.aggregate(pipeline)
        results = await cursor.to_list(length=1)
        
        if results:
            last_order_number = results[0]["order_number"]
            # Extract the sequence number
            sequence = int(last_order_number.split("-")[-1]) + 1
        else:
            sequence = 1
        
        # Generate new order number
        order_number = f"{date_prefix}-{sequence:04d}"
        
        return order_number

    
    async def get_order_by_id(self, order_id: str) -> Optional[Order]:
        """
        Get order by ID.
        
        Args:
            order_id: Order ID
            
        Returns:
            Order object if found, None otherwise
        """
        orders_collection = get_orders_collection()
        
        try:
            order_data = await orders_collection.find_one({"_id": ObjectId(order_id)})
            
            if order_data:
                return Order(**order_data)
            return None
            
        except Exception as e:
            logger.error(f"Error fetching order by ID {order_id}: {str(e)}")
            return None
    
    async def get_orders(
        self,
        user_id: Optional[str] = None,
        user_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get orders with filtering and pagination.
        
        For consumers and distributors, returns only their own orders.
        For owners, returns all orders.
        
        Args:
            user_id: Filter by user ID (optional)
            user_type: Filter by user type (optional)
            status: Filter by order status (optional)
            limit: Number of orders to return (default: 20)
            offset: Number of orders to skip (default: 0)
            
        Returns:
            dict: Dictionary containing:
                - orders: List of Order objects
                - total: Total number of matching orders
                - limit: Limit used
                - offset: Offset used
        """
        orders_collection = get_orders_collection()
        
        try:
            # Build query filter
            query_filter = {}
            
            # User ID filter
            if user_id:
                query_filter["user_id"] = ObjectId(user_id)
            
            # User type filter
            if user_type:
                query_filter["user_type"] = user_type
            
            # Status filter
            if status:
                query_filter["status"] = status
            
            # Get total count
            total = await orders_collection.count_documents(query_filter)
            
            # Get orders with pagination
            cursor = orders_collection.find(query_filter).skip(offset).limit(limit)
            
            # Sort by created_at descending (newest first)
            cursor = cursor.sort("created_at", -1)
            
            orders_data = await cursor.to_list(length=limit)
            
            # Convert to Order objects
            orders = [Order(**order_data) for order_data in orders_data]
            
            logger.info(
                f"Retrieved {len(orders)} orders "
                f"(total: {total}, user_id: {user_id}, status: {status})"
            )
            
            return {
                "orders": orders,
                "total": total,
                "limit": limit,
                "offset": offset
            }
            
        except Exception as e:
            logger.error(f"Error fetching orders: {str(e)}")
            raise
    
    async def update_order_status(
        self,
        order_id: str,
        status_update: OrderUpdateStatusRequest
    ) -> Optional[Order]:
        """
        Update order status.
        
        This method updates the order status and optionally adds notes.
        Only owners can update order status.
        
        Args:
            order_id: Order ID
            status_update: Status update request with new status and optional notes
            
        Returns:
            Updated Order object if found, None otherwise
            
        Raises:
            Exception: If database operation fails
        """
        orders_collection = get_orders_collection()
        
        try:
            # Build update dict
            update_dict = {
                "status": status_update.status,
                "updated_at": datetime.utcnow()
            }
            
            # Add notes if provided
            if status_update.notes:
                update_dict["notes"] = status_update.notes
            
            # Update in database
            result = await orders_collection.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": update_dict}
            )
            
            if result.matched_count == 0:
                logger.warning(f"Order not found for status update: {order_id}")
                return None
            
            logger.info(
                f"Updated order {order_id} status to {status_update.status}"
            )
            
            # Fetch and return updated order
            return await self.get_order_by_id(order_id)
            
        except Exception as e:
            logger.error(f"Error updating order status {order_id}: {str(e)}")
            raise
    
    async def get_order_history(
        self,
        user_id: str,
        user_type: str,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get order history for a specific user.
        
        This is a convenience method that calls get_orders with user_id filter.
        
        Args:
            user_id: User ID
            user_type: User type (consumer or distributor)
            limit: Number of orders to return (default: 20)
            offset: Number of orders to skip (default: 0)
            
        Returns:
            dict: Dictionary containing orders, total, limit, and offset
        """
        return await self.get_orders(
            user_id=user_id,
            user_type=user_type,
            limit=limit,
            offset=offset
        )
    
    def calculate_inter_state_shipping_cost(
        self,
        state: str,
        product_categories: List[str]
    ) -> float:
        """
        Calculate inter-state shipping cost.
        
        Inter-state delivery is only available for jaggery and oil products.
        Other products are restricted to Karnataka.
        
        Args:
            state: Destination state
            product_categories: List of product categories in the order
            
        Returns:
            float: Calculated shipping cost
            
        Raises:
            ValueError: If inter-state delivery is not available for the products
        """
        # Check if state is Karnataka (in-state)
        if state.lower() == "karnataka":
            return BASE_SHIPPING_COST
        
        # Check if all products are eligible for inter-state delivery
        eligible_categories = {"jaggery", "oil"}
        
        for category in product_categories:
            if category not in eligible_categories:
                raise ValueError(
                    f"Inter-state delivery not available for {category} products. "
                    f"Only jaggery and oil products can be delivered outside Karnataka."
                )
        
        # Calculate inter-state shipping cost
        shipping_cost = BASE_SHIPPING_COST * INTER_STATE_SHIPPING_MULTIPLIER
        
        logger.info(
            f"Inter-state shipping to {state} for categories {product_categories}: "
            f"{shipping_cost}"
        )
        
        return round(shipping_cost, 2)


# Singleton instance
order_service = OrderService()
