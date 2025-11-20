"""
Inventory service for managing inventory operations.

This module handles inventory query operations, atomic updates,
low-stock alerts, and inventory validation for orders.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import logging

from app.database import get_inventory_collection, get_products_collection
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryUpdateRequest

logger = logging.getLogger(__name__)


class InventoryService:
    """Service class for inventory operations."""
    
    async def get_inventory_by_product_id(self, product_id: str) -> Optional[Inventory]:
        """
        Get inventory by product ID.
        
        Args:
            product_id: Product ID
            
        Returns:
            Inventory object if found, None otherwise
        """
        inventory_collection = get_inventory_collection()
        
        try:
            inventory_data = await inventory_collection.find_one(
                {"productId": ObjectId(product_id)}
            )
            
            if inventory_data:
                return Inventory(**inventory_data)
            return None
            
        except Exception as e:
            logger.error(f"Error fetching inventory for product {product_id}: {str(e)}")
            return None
    
    async def get_all_inventory(self) -> List[Dict[str, Any]]:
        """
        Get all inventory items with product information.
        
        Returns:
            List of inventory items with product details
        """
        inventory_collection = get_inventory_collection()
        products_collection = get_products_collection()
        
        try:
            # Aggregate inventory with product information
            pipeline = [
                {
                    "$lookup": {
                        "from": "products",
                        "localField": "productId",
                        "foreignField": "_id",
                        "as": "product"
                    }
                },
                {
                    "$unwind": {
                        "path": "$product",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$sort": {"updatedAt": -1}
                }
            ]
            
            cursor = inventory_collection.aggregate(pipeline)
            inventory_list = await cursor.to_list(length=None)
            
            # Process results
            result = []
            for item in inventory_list:
                inventory_dict = {
                    "_id": item["_id"],
                    "product_id": item["productId"],
                    "quantity": item["quantity"],
                    "unit": item["unit"],
                    "low_stock_threshold": item["lowStockThreshold"],
                    "last_restocked": item.get("lastRestocked"),
                    "updated_at": item["updatedAt"]
                }
                
                # Add product name if available
                if "product" in item and item["product"]:
                    inventory_dict["product_name"] = item["product"].get("name")
                
                # Calculate stock status
                inventory_dict["is_low_stock"] = item["quantity"] <= item["lowStockThreshold"]
                inventory_dict["is_out_of_stock"] = item["quantity"] == 0
                
                result.append(inventory_dict)
            
            logger.info(f"Retrieved {len(result)} inventory items")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching all inventory: {str(e)}")
            raise

    async def update_inventory(
        self,
        product_id: str,
        update_request: InventoryUpdateRequest
    ) -> Optional[Inventory]:
        """
        Update inventory with atomic operations.
        
        This method performs atomic inventory updates to prevent race conditions.
        Supports three operations: set, add, and subtract.
        
        Args:
            product_id: Product ID
            update_request: Inventory update request with quantity and operation
            
        Returns:
            Updated Inventory object if successful, None if not found
            
        Raises:
            ValueError: If operation would result in negative inventory
            Exception: If database operation fails
        """
        inventory_collection = get_inventory_collection()
        
        try:
            # Build update operation based on request
            update_dict = {"updatedAt": datetime.utcnow()}
            
            if update_request.operation == "set":
                # Set quantity to specific value
                update_dict["quantity"] = update_request.quantity
                update_dict["lastRestocked"] = datetime.utcnow()
                
                result = await inventory_collection.update_one(
                    {"productId": ObjectId(product_id)},
                    {"$set": update_dict}
                )
                
            elif update_request.operation == "add":
                # Increment quantity (atomic operation)
                result = await inventory_collection.update_one(
                    {"productId": ObjectId(product_id)},
                    {
                        "$inc": {"quantity": update_request.quantity},
                        "$set": {
                            "updatedAt": datetime.utcnow(),
                            "lastRestocked": datetime.utcnow()
                        }
                    }
                )
                
            elif update_request.operation == "subtract":
                # Decrement quantity with validation (atomic operation)
                # First check if we have enough inventory
                current_inventory = await self.get_inventory_by_product_id(product_id)
                
                if not current_inventory:
                    logger.warning(f"Inventory not found for product: {product_id}")
                    return None
                
                if current_inventory.quantity < update_request.quantity:
                    raise ValueError(
                        f"Insufficient inventory. Available: {current_inventory.quantity}, "
                        f"Requested: {update_request.quantity}"
                    )
                
                result = await inventory_collection.update_one(
                    {
                        "productId": ObjectId(product_id),
                        "quantity": {"$gte": update_request.quantity}
                    },
                    {
                        "$inc": {"quantity": -update_request.quantity},
                        "$set": {"updatedAt": datetime.utcnow()}
                    }
                )
            
            if result.matched_count == 0:
                logger.warning(f"Inventory not found for product: {product_id}")
                return None
            
            logger.info(
                f"Updated inventory for product {product_id}: "
                f"{update_request.operation} {update_request.quantity}"
            )
            
            # Fetch and return updated inventory
            return await self.get_inventory_by_product_id(product_id)
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating inventory for product {product_id}: {str(e)}")
            raise
    
    async def get_low_stock_alerts(self) -> List[Dict[str, Any]]:
        """
        Get all products with low stock levels.
        
        Returns products where quantity is at or below the low stock threshold.
        
        Returns:
            List of inventory items with low stock
        """
        inventory_collection = get_inventory_collection()
        products_collection = get_products_collection()
        
        try:
            # Aggregate inventory with product information for low stock items
            pipeline = [
                {
                    "$match": {
                        "$expr": {"$lte": ["$quantity", "$lowStockThreshold"]}
                    }
                },
                {
                    "$lookup": {
                        "from": "products",
                        "localField": "productId",
                        "foreignField": "_id",
                        "as": "product"
                    }
                },
                {
                    "$unwind": {
                        "path": "$product",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$sort": {"quantity": 1}  # Sort by quantity ascending (most critical first)
                }
            ]
            
            cursor = inventory_collection.aggregate(pipeline)
            low_stock_list = await cursor.to_list(length=None)
            
            # Process results
            result = []
            for item in low_stock_list:
                inventory_dict = {
                    "_id": item["_id"],
                    "product_id": item["productId"],
                    "quantity": item["quantity"],
                    "unit": item["unit"],
                    "low_stock_threshold": item["lowStockThreshold"],
                    "last_restocked": item.get("lastRestocked"),
                    "updated_at": item["updatedAt"]
                }
                
                # Add product name if available
                if "product" in item and item["product"]:
                    inventory_dict["product_name"] = item["product"].get("name")
                
                # Calculate stock status
                inventory_dict["is_low_stock"] = True
                inventory_dict["is_out_of_stock"] = item["quantity"] == 0
                
                result.append(inventory_dict)
            
            logger.info(f"Found {len(result)} low stock items")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching low stock alerts: {str(e)}")
            raise
    
    async def validate_inventory_for_order(
        self,
        order_items: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Validate that sufficient inventory exists for an order.
        
        Checks each item in the order against current inventory levels.
        
        Args:
            order_items: List of order items with product_id and quantity
                Example: [{"product_id": "...", "quantity": 10}, ...]
        
        Returns:
            dict: Validation result with the following keys:
                - valid: boolean indicating if order can be fulfilled
                - errors: list of error messages for items with insufficient inventory
                - warnings: list of warnings for items that will be low stock after order
        """
        try:
            validation_result = {
                "valid": True,
                "errors": [],
                "warnings": []
            }
            
            for item in order_items:
                product_id = item.get("product_id")
                requested_quantity = item.get("quantity", 0)
                
                if not product_id:
                    validation_result["valid"] = False
                    validation_result["errors"].append("Missing product_id in order item")
                    continue
                
                # Get current inventory
                inventory = await self.get_inventory_by_product_id(str(product_id))
                
                if not inventory:
                    validation_result["valid"] = False
                    validation_result["errors"].append(
                        f"No inventory record found for product {product_id}"
                    )
                    continue
                
                # Check if sufficient inventory exists
                if inventory.quantity < requested_quantity:
                    validation_result["valid"] = False
                    validation_result["errors"].append(
                        f"Insufficient inventory for product {product_id}. "
                        f"Available: {inventory.quantity}, Requested: {requested_quantity}"
                    )
                    continue
                
                # Check if order will result in low stock
                remaining_quantity = inventory.quantity - requested_quantity
                if remaining_quantity <= inventory.low_stock_threshold:
                    validation_result["warnings"].append(
                        f"Product {product_id} will be low stock after order. "
                        f"Remaining: {remaining_quantity}, Threshold: {inventory.low_stock_threshold}"
                    )
            
            logger.info(
                f"Inventory validation result: valid={validation_result['valid']}, "
                f"errors={len(validation_result['errors'])}, "
                f"warnings={len(validation_result['warnings'])}"
            )
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating inventory for order: {str(e)}")
            raise
    
    async def create_inventory_for_product(
        self,
        product_id: str,
        quantity: float,
        unit: str,
        low_stock_threshold: float
    ) -> Inventory:
        """
        Create inventory record for a new product.
        
        Args:
            product_id: Product ID
            quantity: Initial quantity
            unit: Unit of measurement
            low_stock_threshold: Low stock threshold
            
        Returns:
            Created Inventory object
            
        Raises:
            Exception: If database operation fails
        """
        inventory_collection = get_inventory_collection()
        
        try:
            inventory_dict = {
                "productId": ObjectId(product_id),
                "quantity": quantity,
                "unit": unit,
                "lowStockThreshold": low_stock_threshold,
                "lastRestocked": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            result = await inventory_collection.insert_one(inventory_dict)
            inventory_dict["_id"] = result.inserted_id
            
            logger.info(f"Created inventory for product {product_id}")
            
            return Inventory(**inventory_dict)
            
        except Exception as e:
            logger.error(f"Error creating inventory for product {product_id}: {str(e)}")
            raise


# Singleton instance
inventory_service = InventoryService()
