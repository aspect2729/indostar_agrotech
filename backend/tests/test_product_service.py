"""
Unit tests for product service.
"""

import pytest
from bson import ObjectId

from app.services.product_service import product_service
from app.schemas.product import ProductCreateRequest, ProductUpdateRequest


@pytest.mark.asyncio
class TestProductService:
    """Test cases for ProductService."""
    
    async def test_create_product(self, sample_product_data):
        """Test creating a product."""
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        assert product is not None
        assert product.name == sample_product_data["name"]
        assert product.category == sample_product_data["category"]
        assert product.price.consumer == sample_product_data["price"]["consumer"]
        assert product.is_active is True
        assert product.id is not None
    
    async def test_get_product_by_id(self, sample_product_data):
        """Test getting a product by ID."""
        # Create a product first
        product_request = ProductCreateRequest(**sample_product_data)
        created_product = await product_service.create_product(product_request)
        
        # Fetch the product
        product = await product_service.get_product_by_id(str(created_product.id))
        
        assert product is not None
        assert product.id == created_product.id
        assert product.name == created_product.name
    
    async def test_get_product_by_invalid_id(self):
        """Test getting a product with invalid ID."""
        product = await product_service.get_product_by_id(str(ObjectId()))
        assert product is None
    
    async def test_update_product(self, sample_product_data):
        """Test updating a product."""
        # Create a product first
        product_request = ProductCreateRequest(**sample_product_data)
        created_product = await product_service.create_product(product_request)
        
        # Update the product
        update_data = ProductUpdateRequest(
            name="Updated Jaggery",
            price={"consumer": 180.0, "distributor": 150.0}
        )
        updated_product = await product_service.update_product(
            str(created_product.id),
            update_data
        )
        
        assert updated_product is not None
        assert updated_product.name == "Updated Jaggery"
        assert updated_product.price.consumer == 180.0
    
    async def test_delete_product(self, sample_product_data):
        """Test soft deleting a product."""
        # Create a product first
        product_request = ProductCreateRequest(**sample_product_data)
        created_product = await product_service.create_product(product_request)
        
        # Delete the product
        result = await product_service.delete_product(str(created_product.id))
        assert result is True
        
        # Verify product is marked inactive
        product = await product_service.get_product_by_id(str(created_product.id))
        assert product.is_active is False
    
    async def test_get_products_with_pagination(self, sample_product_data):
        """Test getting products with pagination."""
        # Create multiple products
        for i in range(5):
            data = sample_product_data.copy()
            data["name"] = f"Product {i}"
            product_request = ProductCreateRequest(**data)
            await product_service.create_product(product_request)
        
        # Get products with pagination
        result = await product_service.get_products(limit=3, offset=0)
        
        assert "products" in result
        assert "total" in result
        assert len(result["products"]) <= 3
        assert result["total"] >= 5
    
    async def test_get_products_by_category(self, sample_product_data):
        """Test filtering products by category."""
        # Create products with different categories
        jaggery_data = sample_product_data.copy()
        jaggery_data["category"] = "jaggery"
        await product_service.create_product(ProductCreateRequest(**jaggery_data))
        
        oil_data = sample_product_data.copy()
        oil_data["name"] = "Organic Oil"
        oil_data["category"] = "oil"
        await product_service.create_product(ProductCreateRequest(**oil_data))
        
        # Get jaggery products
        result = await product_service.get_products_by_category("jaggery")
        
        assert len(result["products"]) >= 1
        for product in result["products"]:
            assert product.category == "jaggery"
    
    async def test_search_products(self, sample_product_data):
        """Test searching products."""
        # Create a product
        product_request = ProductCreateRequest(**sample_product_data)
        await product_service.create_product(product_request)
        
        # Search for the product
        result = await product_service.search_products("Organic")
        
        assert len(result["products"]) >= 1
        assert "Organic" in result["products"][0].name
