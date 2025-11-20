"""
Integration tests for product endpoints.
"""

import pytest
from app.services.product_service import product_service
from app.schemas.product import ProductCreateRequest


@pytest.mark.asyncio
class TestProductEndpoints:
    """Test cases for product API endpoints."""
    
    async def test_get_products(self, client, sample_product_data):
        """Test GET /api/products endpoint."""
        # Create a product first
        product_request = ProductCreateRequest(**sample_product_data)
        await product_service.create_product(product_request)
        
        response = await client.get("/api/products")
        
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data
        assert isinstance(data["products"], list)
    
    async def test_get_products_with_category_filter(self, client, sample_product_data):
        """Test GET /api/products with category filter."""
        # Create products
        product_request = ProductCreateRequest(**sample_product_data)
        await product_service.create_product(product_request)
        
        response = await client.get("/api/products?category=jaggery")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) >= 1
        for product in data["products"]:
            assert product["category"] == "jaggery"
    
    async def test_get_products_with_search(self, client, sample_product_data):
        """Test GET /api/products with search parameter."""
        # Create a product
        product_request = ProductCreateRequest(**sample_product_data)
        await product_service.create_product(product_request)
        
        response = await client.get("/api/products?search=Organic")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) >= 1
    
    async def test_get_product_by_id(self, client, sample_product_data):
        """Test GET /api/products/{product_id} endpoint."""
        # Create a product
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        response = await client.get(f"/api/products/{product.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(product.id)
        assert data["name"] == product.name
    
    async def test_get_product_by_invalid_id(self, client):
        """Test GET /api/products/{product_id} with invalid ID."""
        from bson import ObjectId
        
        response = await client.get(f"/api/products/{ObjectId()}")
        
        assert response.status_code == 404
    
    async def test_create_product_without_auth(self, client, sample_product_data):
        """Test POST /api/products without authentication."""
        response = await client.post("/api/products", json=sample_product_data)
        
        # Should fail without authentication
        assert response.status_code in [401, 403]
    
    async def test_create_product_as_consumer(self, client, consumer_access_token, sample_product_data):
        """Test POST /api/products as consumer (should fail)."""
        response = await client.post(
            "/api/products",
            json=sample_product_data,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        # Should fail - only owner can create products
        assert response.status_code == 403
    
    async def test_create_product_as_owner(self, client, owner_access_token, sample_product_data):
        """Test POST /api/products as owner."""
        response = await client.post(
            "/api/products",
            json=sample_product_data,
            headers={"Authorization": f"Bearer {owner_access_token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_product_data["name"]
        assert "id" in data
    
    async def test_update_product_as_owner(self, client, owner_access_token, sample_product_data):
        """Test PUT /api/products/{product_id} as owner."""
        # Create a product first
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        # Update the product
        update_data = {"name": "Updated Product Name"}
        response = await client.put(
            f"/api/products/{product.id}",
            json=update_data,
            headers={"Authorization": f"Bearer {owner_access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Product Name"
    
    async def test_delete_product_as_owner(self, client, owner_access_token, sample_product_data):
        """Test DELETE /api/products/{product_id} as owner."""
        # Create a product first
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        # Delete the product
        response = await client.delete(
            f"/api/products/{product.id}",
            headers={"Authorization": f"Bearer {owner_access_token}"}
        )
        
        assert response.status_code == 200
        
        # Verify product is soft deleted
        deleted_product = await product_service.get_product_by_id(str(product.id))
        assert deleted_product.is_active is False
