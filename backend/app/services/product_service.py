"""
Product service for managing product operations.

This module handles product CRUD operations, search functionality,
category filtering, and pagination logic.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import logging

from app.database import get_products_collection
from app.models.product import Product
from app.schemas.product import ProductCreateRequest, ProductUpdateRequest

logger = logging.getLogger(__name__)


class ProductService:
    """Service class for product operations."""
    
    async def create_product(self, product_data: ProductCreateRequest) -> Product:
        """
        Create a new product.
        
        Args:
            product_data: Product creation request data
            
        Returns:
            Product: Created product object
            
        Raises:
            Exception: If database operation fails
        """
        products_collection = get_products_collection()
        
        try:
            # Convert request to dict
            product_dict = product_data.model_dump()
            
            # Add timestamps
            product_dict["created_at"] = datetime.utcnow()
            product_dict["updated_at"] = datetime.utcnow()
            
            # Insert into database
            result = await products_collection.insert_one(product_dict)
            product_dict["_id"] = result.inserted_id
            
            logger.info(f"Created product: {product_dict['name']} (ID: {result.inserted_id})")
            
            # Return product object
            return Product(**product_dict)
            
        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            raise

    async def get_product_by_id(self, product_id: str) -> Optional[Product]:
        """
        Get product by ID.
        
        Args:
            product_id: Product ID
            
        Returns:
            Product object if found, None otherwise
        """
        products_collection = get_products_collection()
        
        try:
            product_data = await products_collection.find_one({"_id": ObjectId(product_id)})
            
            if product_data:
                return Product(**product_data)
            return None
            
        except Exception as e:
            logger.error(f"Error fetching product by ID {product_id}: {str(e)}")
            return None
    
    async def update_product(
        self,
        product_id: str,
        product_data: ProductUpdateRequest
    ) -> Optional[Product]:
        """
        Update an existing product.
        
        Args:
            product_id: Product ID
            product_data: Product update request data
            
        Returns:
            Updated Product object if found, None otherwise
            
        Raises:
            Exception: If database operation fails
        """
        products_collection = get_products_collection()
        
        try:
            # Convert request to dict, excluding None values
            update_dict = product_data.model_dump(exclude_none=True)
            
            if not update_dict:
                # No fields to update
                return await self.get_product_by_id(product_id)
            
            # Add updated timestamp
            update_dict["updated_at"] = datetime.utcnow()
            
            # Update in database
            result = await products_collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_dict}
            )
            
            if result.matched_count == 0:
                logger.warning(f"Product not found for update: {product_id}")
                return None
            
            logger.info(f"Updated product: {product_id}")
            
            # Fetch and return updated product
            return await self.get_product_by_id(product_id)
            
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {str(e)}")
            raise
    
    async def delete_product(self, product_id: str) -> bool:
        """
        Soft delete a product by setting is_active to False.
        
        Args:
            product_id: Product ID
            
        Returns:
            bool: True if product was deleted, False if not found
            
        Raises:
            Exception: If database operation fails
        """
        products_collection = get_products_collection()
        
        try:
            result = await products_collection.update_one(
                {"_id": ObjectId(product_id)},
                {
                    "$set": {
                        "is_active": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.matched_count == 0:
                logger.warning(f"Product not found for deletion: {product_id}")
                return False
            
            logger.info(f"Soft deleted product: {product_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting product {product_id}: {str(e)}")
            raise

    async def get_products(
        self,
        category: Optional[str] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = True,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get products with filtering, search, and pagination.
        
        Args:
            category: Filter by product category (optional)
            search: Search term for product name and description (optional)
            is_active: Filter by active status (optional)
            limit: Number of products to return (default: 20)
            offset: Number of products to skip (default: 0)
            
        Returns:
            dict: Dictionary containing:
                - products: List of Product objects
                - total: Total number of matching products
                - limit: Limit used
                - offset: Offset used
        """
        products_collection = get_products_collection()
        
        try:
            # Build query filter
            query_filter = {}
            
            # Category filter
            if category:
                query_filter["category"] = category
            
            # Active status filter
            if is_active is not None:
                query_filter["is_active"] = is_active
            
            # Search filter (text search on name and description)
            if search:
                # Use text search if available, otherwise use regex
                query_filter["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}}
                ]
            
            # Get total count
            total = await products_collection.count_documents(query_filter)
            
            # Get products with pagination
            cursor = products_collection.find(query_filter).skip(offset).limit(limit)
            
            # Sort by created_at descending (newest first)
            cursor = cursor.sort("created_at", -1)
            
            products_data = await cursor.to_list(length=limit)
            
            # Convert to Product objects
            products = [Product(**product_data) for product_data in products_data]
            
            logger.info(
                f"Retrieved {len(products)} products "
                f"(total: {total}, category: {category}, search: {search})"
            )
            
            return {
                "products": products,
                "total": total,
                "limit": limit,
                "offset": offset
            }
            
        except Exception as e:
            logger.error(f"Error fetching products: {str(e)}")
            raise
    
    async def search_products(
        self,
        search_term: str,
        category: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Search products by name or description.
        
        This is a convenience method that calls get_products with search parameter.
        
        Args:
            search_term: Search term for product name and description
            category: Filter by product category (optional)
            limit: Number of products to return (default: 20)
            offset: Number of products to skip (default: 0)
            
        Returns:
            dict: Dictionary containing products, total, limit, and offset
        """
        return await self.get_products(
            category=category,
            search=search_term,
            is_active=True,
            limit=limit,
            offset=offset
        )
    
    async def get_products_by_category(
        self,
        category: str,
        is_active: Optional[bool] = True,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get products filtered by category.
        
        This is a convenience method that calls get_products with category parameter.
        
        Args:
            category: Product category
            is_active: Filter by active status (optional)
            limit: Number of products to return (default: 20)
            offset: Number of products to skip (default: 0)
            
        Returns:
            dict: Dictionary containing products, total, limit, and offset
        """
        return await self.get_products(
            category=category,
            is_active=is_active,
            limit=limit,
            offset=offset
        )


# Singleton instance
product_service = ProductService()
