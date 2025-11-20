"""
Product API endpoints.

This module provides REST API endpoints for product management including
CRUD operations, search, filtering, and pagination.
"""

from fastapi import APIRouter, Depends, Query, status
from typing import Optional

from app.schemas.product import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductResponse,
    ProductListResponse
)
from app.services.product_service import product_service
from app.utils.dependencies import get_current_user, require_owner
from app.models.user import User
from app.exceptions import NotFoundException
from app.middleware.validation import validate_object_id

router = APIRouter()


@router.get("", response_model=ProductListResponse)
async def get_products(
    category: Optional[str] = Query(
        None,
        description="Filter by product category",
        pattern="^(jaggery|oil|chutney_powder|pickles|milk)$"
    ),
    search: Optional[str] = Query(
        None,
        description="Search term for product name and description",
        min_length=1,
        max_length=100
    ),
    is_active: Optional[bool] = Query(
        True,
        description="Filter by active status"
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
        description="Number of products to return"
    ),
    offset: int = Query(
        0,
        ge=0,
        description="Number of products to skip"
    )
):
    """
    Get products with optional filtering, search, and pagination.
    
    This endpoint supports:
    - Category filtering (jaggery, oil, chutney_powder, pickles, milk)
    - Text search on product name and description
    - Active/inactive status filtering
    - Pagination with limit and offset
    
    Returns a list of products matching the criteria along with pagination metadata.
    """
    result = await product_service.get_products(
        category=category,
        search=search,
        is_active=is_active,
        limit=limit,
        offset=offset
    )
    
    # Convert Product objects to response format
    products_response = []
    for product in result["products"]:
        product_dict = product.model_dump(by_alias=True)
        product_dict["_id"] = str(product_dict["_id"])
        products_response.append(ProductResponse(**product_dict))
    
    return ProductListResponse(
        products=products_response,
        total=result["total"],
        limit=result["limit"],
        offset=result["offset"]
    )



@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """
    Get a single product by ID.
    
    Returns detailed product information including:
    - Product details (name, description, category)
    - Pricing information
    - Nutritional information (if available)
    - Images
    - Availability status
    - Inter-state delivery eligibility
    """
    # Validate ObjectId format
    validate_object_id(product_id, "product_id")
    
    product = await product_service.get_product_by_id(product_id)
    
    if not product:
        raise NotFoundException(resource="Product", identifier=product_id)
    
    # Convert to response format
    product_dict = product.model_dump(by_alias=True)
    product_dict["_id"] = str(product_dict["_id"])
    
    return ProductResponse(**product_dict)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreateRequest,
    current_user: User = Depends(require_owner)
):
    """
    Create a new product (Owner only).
    
    This endpoint allows business owners to add new products to the catalog.
    All fields from the ProductCreateRequest schema are required except
    optional fields like nutritional_info and images.
    
    The endpoint automatically:
    - Sets creation and update timestamps
    - Validates pricing structure
    - Validates category values
    """
    product = await product_service.create_product(product_data)
    
    # Convert to response format
    product_dict = product.model_dump(by_alias=True)
    product_dict["_id"] = str(product_dict["_id"])
    
    return ProductResponse(**product_dict)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdateRequest,
    current_user: User = Depends(require_owner)
):
    """
    Update an existing product (Owner only).
    
    This endpoint allows business owners to update product information.
    Only the fields provided in the request will be updated; other fields
    remain unchanged.
    
    The endpoint automatically updates the updated_at timestamp.
    """
    # Validate ObjectId format
    validate_object_id(product_id, "product_id")
    
    product = await product_service.update_product(product_id, product_data)
    
    if not product:
        raise NotFoundException(resource="Product", identifier=product_id)
    
    # Convert to response format
    product_dict = product.model_dump(by_alias=True)
    product_dict["_id"] = str(product_dict["_id"])
    
    return ProductResponse(**product_dict)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(require_owner)
):
    """
    Delete a product (Owner only).
    
    This endpoint performs a soft delete by setting the product's is_active
    flag to False. The product remains in the database but will not appear
    in product listings by default.
    
    This approach preserves historical data and allows for product restoration
    if needed.
    """
    # Validate ObjectId format
    validate_object_id(product_id, "product_id")
    
    success = await product_service.delete_product(product_id)
    
    if not success:
        raise NotFoundException(resource="Product", identifier=product_id)
    
    return None
