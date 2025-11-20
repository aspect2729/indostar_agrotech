"""
Order API endpoints.

This module provides REST API endpoints for order management including
order creation, order history, order details, and status updates.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from bson import ObjectId

from app.schemas.order import (
    OrderCreateRequest,
    OrderUpdateStatusRequest,
    OrderResponse,
    OrderListResponse,
    OrderItemResponse
)
from app.services.order_service import order_service
from app.utils.dependencies import get_current_user, require_owner
from app.models.user import User

router = APIRouter()


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_request: OrderCreateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order with cart processing.
    
    This endpoint:
    - Validates inventory availability for all items
    - Calculates pricing based on user type (consumer/distributor)
    - Calculates tax (18% GST) and shipping costs
    - Handles inter-state shipping for eligible products
    - Deducts inventory quantities upon successful order creation
    
    The endpoint is available to consumers and distributors.
    Pricing is automatically adjusted based on user role.
    
    Returns the created order with order number and calculated totals.
    """
    try:
        # Get user ID and type
        user_id = str(current_user.id)
        user_type = current_user.role
        
        # Validate user type (only consumers and distributors can place orders)
        if user_type not in ["consumer", "distributor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only consumers and distributors can place orders"
            )
        
        # Create order
        order = await order_service.create_order(
            user_id=user_id,
            user_type=user_type,
            order_request=order_request
        )
        
        # Convert to response format
        order_dict = order.model_dump(by_alias=True)
        order_dict["_id"] = str(order_dict["_id"])
        order_dict["user_id"] = str(order_dict["user_id"])
        
        # Convert order items
        items_response = []
        for item in order_dict["items"]:
            item["product_id"] = str(item["product_id"])
            items_response.append(OrderItemResponse(**item))
        
        order_dict["items"] = items_response
        
        return OrderResponse(**order_dict)
        
    except ValueError as e:
        # Validation errors (inventory, product not found, etc.)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating order: {str(e)}"
        )


@router.get("", response_model=OrderListResponse)
async def get_orders(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by order status",
        pattern="^(pending|confirmed|processing|shipped|delivered|cancelled)$"
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
        description="Number of orders to return"
    ),
    offset: int = Query(
        0,
        ge=0,
        description="Number of orders to skip"
    ),
    current_user: User = Depends(get_current_user)
):
    """
    Get orders with role-based filtering.
    
    Role-based behavior:
    - Consumers: See only their own orders
    - Distributors: See only their own orders
    - Owners: See all orders from all users
    
    Supports filtering by order status and pagination.
    Orders are returned in descending order by creation date (newest first).
    """
    try:
        # Determine filtering based on user role
        if current_user.role == "owner":
            # Owners see all orders
            result = await order_service.get_orders(
                status=status_filter,
                limit=limit,
                offset=offset
            )
        else:
            # Consumers and distributors see only their own orders
            user_id = str(current_user.id)
            result = await order_service.get_orders(
                user_id=user_id,
                status=status_filter,
                limit=limit,
                offset=offset
            )
        
        # Convert Order objects to response format
        orders_response = []
        for order in result["orders"]:
            order_dict = order.model_dump(by_alias=True)
            order_dict["_id"] = str(order_dict["_id"])
            order_dict["user_id"] = str(order_dict["user_id"])
            
            # Convert order items
            items_response = []
            for item in order_dict["items"]:
                item["product_id"] = str(item["product_id"])
                items_response.append(OrderItemResponse(**item))
            
            order_dict["items"] = items_response
            orders_response.append(OrderResponse(**order_dict))
        
        return OrderListResponse(
            orders=orders_response,
            total=result["total"],
            limit=result["limit"],
            offset=result["offset"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching orders: {str(e)}"
        )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a single order by ID.
    
    Returns detailed order information including:
    - Order number and status
    - All order items with product details
    - Pricing breakdown (subtotal, tax, shipping, total)
    - Delivery address
    - Payment status
    - Order timestamps
    
    Access control:
    - Consumers and distributors can only view their own orders
    - Owners can view any order
    """
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order ID format"
            )
        
        order = await order_service.get_order_by_id(order_id)
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        # Check access permissions
        if current_user.role != "owner":
            # Consumers and distributors can only view their own orders
            if str(order.user_id) != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this order"
                )
        
        # Convert to response format
        order_dict = order.model_dump(by_alias=True)
        order_dict["_id"] = str(order_dict["_id"])
        order_dict["user_id"] = str(order_dict["user_id"])
        
        # Convert order items
        items_response = []
        for item in order_dict["items"]:
            item["product_id"] = str(item["product_id"])
            items_response.append(OrderItemResponse(**item))
        
        order_dict["items"] = items_response
        
        return OrderResponse(**order_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching order: {str(e)}"
        )


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: OrderUpdateStatusRequest,
    current_user: User = Depends(require_owner)
):
    """
    Update order status (Owner only).
    
    This endpoint allows business owners to update the status of orders
    as they progress through the fulfillment workflow:
    - pending → confirmed → processing → shipped → delivered
    - Any status can be changed to cancelled
    
    The endpoint also allows adding notes to document status changes.
    The updated_at timestamp is automatically updated.
    """
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order ID format"
            )
        
        # Check if order exists
        existing_order = await order_service.get_order_by_id(order_id)
        if not existing_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        # Update order status
        order = await order_service.update_order_status(order_id, status_update)
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        # Convert to response format
        order_dict = order.model_dump(by_alias=True)
        order_dict["_id"] = str(order_dict["_id"])
        order_dict["user_id"] = str(order_dict["user_id"])
        
        # Convert order items
        items_response = []
        for item in order_dict["items"]:
            item["product_id"] = str(item["product_id"])
            items_response.append(OrderItemResponse(**item))
        
        order_dict["items"] = items_response
        
        return OrderResponse(**order_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order status: {str(e)}"
        )
