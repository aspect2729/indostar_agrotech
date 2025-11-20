"""
Integration tests for order endpoints.
"""

import pytest
from bson import ObjectId

from app.services.product_service import product_service
from app.services.inventory_service import inventory_service
from app.schemas.product import ProductCreateRequest
from app.schemas.inventory import InventoryUpdateRequest


@pytest.mark.asyncio
class TestOrderEndpoints:
    """Test cases for order API endpoints."""
    
    async def test_create_order_without_auth(self, client, sample_product_data, sample_address_data):
        """Test POST /api/orders without authentication."""
        # Create product and set inventory
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        # Try to create order without auth
        order_data = {
            "items": [{"product_id": str(product.id), "quantity": 2}],
            "delivery_address": sample_address_data
        }
        
        response = await client.post("/api/orders", json=order_data)
        
        # Should fail without authentication
        assert response.status_code in [401, 403]
    
    async def test_create_order_as_consumer(self, client, consumer_access_token, sample_product_data, sample_address_data):
        """Test POST /api/orders as consumer."""
        # Create product and set inventory
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        # Create order
        order_data = {
            "items": [{"product_id": str(product.id), "quantity": 2}],
            "delivery_address": sample_address_data,
            "notes": "Test order"
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["status"] == "pending"
        assert len(data["items"]) == 1
        assert data["total"] > 0
    
    async def test_create_order_insufficient_inventory(self, client, consumer_access_token, sample_product_data, sample_address_data):
        """Test POST /api/orders with insufficient inventory."""
        # Create product with low inventory
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=1, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        # Try to order more than available
        order_data = {
            "items": [{"product_id": str(product.id), "quantity": 10}],
            "delivery_address": sample_address_data
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        assert response.status_code == 400
    
    async def test_get_orders_as_consumer(self, client, consumer_access_token, sample_product_data, sample_address_data):
        """Test GET /api/orders as consumer."""
        # Create product and order
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        order_data = {
            "items": [{"product_id": str(product.id), "quantity": 1}],
            "delivery_address": sample_address_data
        }
        
        await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        # Get orders
        response = await client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        assert "total" in data
    
    async def test_get_order_by_id(self, client, consumer_access_token, sample_product_data, sample_address_data):
        """Test GET /api/orders/{order_id}."""
        # Create product and order
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        order_data = {
            "items": [{"product_id": str(product.id), "quantity": 1}],
            "delivery_address": sample_address_data
        }
        
        create_response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        order_id = create_response.json()["id"]
        
        # Get order by ID
        response = await client.get(
            f"/api/orders/{order_id}",
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
    
    async def test_update_order_status_as_owner(self, client, owner_access_token, consumer_access_token, sample_product_data, sample_address_data):
        """Test PUT /api/orders/{order_id}/status as owner."""
        # Create product and order
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        order_data = {
            "items": [{"product_id": str(product.id), "quantity": 1}],
            "delivery_address": sample_address_data
        }
        
        create_response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        order_id = create_response.json()["id"]
        
        # Update order status as owner
        status_update = {"status": "confirmed", "notes": "Order confirmed"}
        response = await client.put(
            f"/api/orders/{order_id}/status",
            json=status_update,
            headers={"Authorization": f"Bearer {owner_access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "confirmed"
    
    async def test_update_order_status_as_consumer(self, client, consumer_access_token, sample_product_data, sample_address_data):
        """Test PUT /api/orders/{order_id}/status as consumer (should fail)."""
        # Create product and order
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        order_data = {
            "items": [{"product_id": str(product.id), "quantity": 1}],
            "delivery_address": sample_address_data
        }
        
        create_response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        order_id = create_response.json()["id"]
        
        # Try to update status as consumer
        status_update = {"status": "confirmed"}
        response = await client.put(
            f"/api/orders/{order_id}/status",
            json=status_update,
            headers={"Authorization": f"Bearer {consumer_access_token}"}
        )
        
        # Should fail - only owner can update status
        assert response.status_code == 403
