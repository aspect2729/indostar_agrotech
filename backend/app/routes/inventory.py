"""
Inventory API endpoints.

This module provides REST API endpoints for inventory management including
viewing inventory levels, updating stock, and monitoring low-stock alerts.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.schemas.inventory import (
    InventoryUpdateRequest,
    InventoryResponse,
    InventoryListResponse,
    InventoryAlertResponse
)
from app.services.inventory_service import inventory_service
from app.utils.dependencies import require_owner
from app.models.user import User

router = APIRouter()


@router.get("", response_model=InventoryListResponse)
async def get_inventory(
    current_user: User = Depends(require_owner)
):
    """
    Get all inventory items (Owner only).
    
    This endpoint returns a complete list of all inventory items with:
    - Current stock levels
    - Product information
    - Low stock indicators
    - Out of stock indicators
    - Last restocked timestamps
    
    Only accessible by business owners for inventory management.
    """
    try:
        inventory_list = await inventory_service.get_all_inventory()
        
        # Convert to response format
        inventory_responses = []
        for item in inventory_list:
            # Convert ObjectId to string
            if "_id" in item and isinstance(item["_id"], ObjectId):
                item["_id"] = str(item["_id"])
            if "product_id" in item and isinstance(item["product_id"], ObjectId):
                item["product_id"] = str(item["product_id"])
            
            inventory_responses.append(InventoryResponse(**item))
        
        return InventoryListResponse(
            inventory=inventory_responses,
            total=len(inventory_responses)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching inventory: {str(e)}"
        )


@router.put("/{product_id}", response_model=InventoryResponse)
async def update_inventory(
    product_id: str,
    update_request: InventoryUpdateRequest,
    current_user: User = Depends(require_owner)
):
    """
    Update inventory for a product (Owner only).
    
    This endpoint allows business owners to update inventory levels using
    three different operations:
    
    - **set**: Replace the current quantity with a new value
    - **add**: Increase the current quantity (e.g., after restocking)
    - **subtract**: Decrease the current quantity (e.g., after manual adjustment)
    
    The operation is atomic to prevent race conditions during concurrent updates.
    
    Args:
        product_id: The ID of the product to update
        update_request: Update request containing quantity and operation type
        current_user: Current authenticated owner user
    
    Returns:
        Updated inventory information
    
    Raises:
        400: Invalid product ID format
        404: Product inventory not found
        422: Insufficient inventory for subtract operation
        500: Internal server error
    """
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product ID format"
            )
        
        # Update inventory
        inventory = await inventory_service.update_inventory(product_id, update_request)
        
        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory not found for product {product_id}"
            )
        
        # Convert to response format
        inventory_dict = inventory.model_dump(by_alias=True)
        inventory_dict["_id"] = str(inventory_dict["_id"])
        inventory_dict["product_id"] = str(inventory_dict["product_id"])
        inventory_dict["is_low_stock"] = inventory.is_low_stock
        inventory_dict["is_out_of_stock"] = inventory.is_out_of_stock
        
        return InventoryResponse(**inventory_dict)
        
    except ValueError as e:
        # Handle insufficient inventory error
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating inventory: {str(e)}"
        )


@router.get("/alerts", response_model=InventoryAlertResponse)
async def get_inventory_alerts(
    current_user: User = Depends(require_owner)
):
    """
    Get low stock alerts (Owner only).
    
    This endpoint returns all products where the current inventory level
    is at or below the configured low stock threshold. Results are sorted
    by quantity (ascending) to prioritize the most critical items.
    
    Use this endpoint to:
    - Monitor products that need restocking
    - Identify out-of-stock items
    - Plan inventory replenishment
    
    Only accessible by business owners.
    """
    try:
        alerts = await inventory_service.get_low_stock_alerts()
        
        # Convert to response format
        alert_responses = []
        for item in alerts:
            alert_responses.append(InventoryResponse(**item))
        
        return InventoryAlertResponse(
            alerts=alert_responses,
            total=len(alert_responses)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching inventory alerts: {str(e)}"
        )
