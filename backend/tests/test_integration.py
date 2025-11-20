"""
Integration tests for the complete Indostar E-commerce Application.
Tests all user flows, authentication, order placement, and inventory management.
"""
import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from bson import ObjectId


class TestConsumerFlow:
    """Test complete consumer user flow"""
    
    async def test_consumer_registration_and_login(self, client: AsyncClient, db):
        """Test consumer can register via dev auth and access consumer portal"""
        # Register as consumer
        response = await client.post(
            "/api/auth/dev/login",
            json={
                "email": "consumer@test.com",
                "name": "Test Consumer",
                "role": "consumer"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == "consumer"
        assert "access_token" in data
        
        consumer_token = data["access_token"]
        
        # Verify profile access
        response = await client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == "consumer@test.com"
    
    async def test_consumer_browse_products(self, client: AsyncClient, consumer_token: str, sample_products):
        """Test consumer can browse and search products"""
        # Get all products
        response = await client.get(
            "/api/products",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        
        # Filter by category
        response = await client.get(
            "/api/products?category=jaggery",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 200
        jaggery_products = response.json()
        assert all(p["category"] == "jaggery" for p in jaggery_products)
        
        # Search products
        response = await client.get(
            "/api/products?search=organic",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 200
    
    async def test_consumer_view_product_details(self, client: AsyncClient, consumer_token: str, sample_products):
        """Test consumer can view detailed product information"""
        product_id = str(sample_products[0]["_id"])
        
        response = await client.get(
            f"/api/products/{product_id}",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 200
        product = response.json()
        assert product["_id"] == product_id
        assert "description" in product
        assert "price" in product
    
    async def test_consumer_place_order(self, client: AsyncClient, consumer_token: str, sample_products, db):
        """Test complete order placement flow with inventory update"""
        product = sample_products[0]
        product_id = str(product["_id"])
        
        # Check initial inventory
        initial_inventory = await db.inventory.find_one({"product_id": ObjectId(product_id)})
        initial_quantity = initial_inventory["quantity"]
        
        # Place order
        order_data = {
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2
                }
            ],
            "delivery_address": {
                "street": "123 Test Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 201
        order = response.json()
        assert order["status"] == "pending"
        assert len(order["items"]) == 1
        assert order["items"][0]["quantity"] == 2
        
        # Verify inventory was reduced
        updated_inventory = await db.inventory.find_one({"product_id": ObjectId(product_id)})
        assert updated_inventory["quantity"] == initial_quantity - 2
        
        # Verify order total calculation
        expected_subtotal = product["price"]["consumer"] * 2
        assert order["subtotal"] == expected_subtotal
        assert order["total"] > expected_subtotal  # Should include tax and shipping
        
        return order["_id"]
    
    async def test_consumer_view_order_history(self, client: AsyncClient, consumer_token: str):
        """Test consumer can view their order history"""
        response = await client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) > 0
        assert all(order["status"] in ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] for order in orders)


class TestDistributorFlow:
    """Test complete distributor user flow"""
    
    async def test_distributor_registration_and_login(self, client: AsyncClient, db):
        """Test distributor can register and access distributor portal"""
        response = await client.post(
            "/api/auth/dev/login",
            json={
                "email": "distributor@test.com",
                "name": "Test Distributor",
                "role": "distributor"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == "distributor"
        assert "access_token" in data
        
        distributor_token = data["access_token"]
        
        # Verify profile access
        response = await client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {distributor_token}"}
        )
        assert response.status_code == 200
        assert response.json()["role"] == "distributor"
    
    async def test_distributor_view_wholesale_pricing(self, client: AsyncClient, distributor_token: str, sample_products):
        """Test distributor sees wholesale pricing"""
        response = await client.get(
            "/api/products",
            headers={"Authorization": f"Bearer {distributor_token}"}
        )
        assert response.status_code == 200
        products = response.json()
        
        # Verify products have distributor pricing
        for product in products:
            assert "price" in product
            assert "distributor" in product["price"]
            assert product["price"]["distributor"] < product["price"]["consumer"]
    
    async def test_distributor_place_bulk_order(self, client: AsyncClient, distributor_token: str, sample_products, db):
        """Test distributor can place bulk orders"""
        # Find a product eligible for inter-state delivery
        jaggery_product = next(p for p in sample_products if p["category"] == "jaggery")
        product_id = str(jaggery_product["_id"])
        
        # Check initial inventory
        initial_inventory = await db.inventory.find_one({"product_id": ObjectId(product_id)})
        initial_quantity = initial_inventory["quantity"]
        
        # Place bulk order with inter-state delivery
        order_data = {
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 50  # Bulk quantity
                }
            ],
            "delivery_address": {
                "street": "456 Distributor Ave",
                "city": "Mumbai",
                "state": "Maharashtra",  # Inter-state
                "pincode": "400001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {distributor_token}"}
        )
        assert response.status_code == 201
        order = response.json()
        assert order["status"] == "pending"
        assert order["items"][0]["quantity"] == 50
        
        # Verify inter-state shipping cost is applied
        assert order["shipping_cost"] > 0
        
        # Verify inventory was reduced
        updated_inventory = await db.inventory.find_one({"product_id": ObjectId(product_id)})
        assert updated_inventory["quantity"] == initial_quantity - 50
        
        # Verify distributor pricing was used
        expected_price_per_unit = jaggery_product["price"]["distributor"]
        assert order["items"][0]["price_per_unit"] == expected_price_per_unit
    
    async def test_distributor_order_history(self, client: AsyncClient, distributor_token: str):
        """Test distributor can view their order history"""
        response = await client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {distributor_token}"}
        )
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) > 0


class TestOwnerFlow:
    """Test complete owner/admin user flow"""
    
    async def test_owner_registration_and_login(self, client: AsyncClient, db):
        """Test owner can register and access owner dashboard"""
        response = await client.post(
            "/api/auth/dev/login",
            json={
                "email": "owner@test.com",
                "name": "Test Owner",
                "role": "owner"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == "owner"
        assert "access_token" in data
    
    async def test_owner_manage_products(self, client: AsyncClient, owner_token: str, db):
        """Test owner can create, update, and delete products"""
        # Create new product
        new_product = {
            "name": "Premium Jaggery",
            "category": "jaggery",
            "description": "High quality organic jaggery",
            "price": {
                "consumer": 150.0,
                "distributor": 120.0
            },
            "unit": "kg",
            "inter_state_delivery": True,
            "images": ["jaggery.jpg"]
        }
        
        response = await client.post(
            "/api/products",
            json=new_product,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 201
        created_product = response.json()
        product_id = created_product["_id"]
        
        # Update product
        update_data = {
            "price": {
                "consumer": 160.0,
                "distributor": 130.0
            }
        }
        
        response = await client.put(
            f"/api/products/{product_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        updated_product = response.json()
        assert updated_product["price"]["consumer"] == 160.0
        
        # Delete product
        response = await client.delete(
            f"/api/products/{product_id}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
    
    async def test_owner_manage_inventory(self, client: AsyncClient, owner_token: str, sample_products, db):
        """Test owner can view and update inventory"""
        # Get all inventory
        response = await client.get(
            "/api/inventory",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        inventory_list = response.json()
        assert len(inventory_list) > 0
        
        # Update inventory for a product
        product_id = str(sample_products[0]["_id"])
        update_data = {
            "quantity": 100,
            "operation": "set"
        }
        
        response = await client.put(
            f"/api/inventory/{product_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        
        # Verify inventory was updated
        updated_inventory = await db.inventory.find_one({"product_id": ObjectId(product_id)})
        assert updated_inventory["quantity"] == 100
    
    async def test_owner_view_low_stock_alerts(self, client: AsyncClient, owner_token: str, db, sample_products):
        """Test owner can view low stock alerts"""
        # Set a product to low stock
        product_id = sample_products[0]["_id"]
        await db.inventory.update_one(
            {"product_id": product_id},
            {"$set": {"quantity": 5, "low_stock_threshold": 10}}
        )
        
        # Get low stock alerts
        response = await client.get(
            "/api/inventory/alerts",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        alerts = response.json()
        assert len(alerts) > 0
        assert any(alert["product_id"] == str(product_id) for alert in alerts)
    
    async def test_owner_manage_all_orders(self, client: AsyncClient, owner_token: str, consumer_token: str, sample_products):
        """Test owner can view and manage all orders"""
        # First, create an order as consumer
        product_id = str(sample_products[0]["_id"])
        order_data = {
            "items": [{"product_id": product_id, "quantity": 1}],
            "delivery_address": {
                "street": "123 Test St",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 201
        order_id = response.json()["_id"]
        
        # Owner views all orders
        response = await client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        all_orders = response.json()
        assert len(all_orders) > 0
        
        # Owner updates order status
        response = await client.put(
            f"/api/orders/{order_id}/status",
            json={"status": "confirmed"},
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        updated_order = response.json()
        assert updated_order["status"] == "confirmed"


class TestRoleBasedAccessControl:
    """Test role-based access control across all endpoints"""
    
    async def test_consumer_cannot_access_owner_endpoints(self, client: AsyncClient, consumer_token: str, sample_products):
        """Test consumer cannot access owner-only endpoints"""
        product_id = str(sample_products[0]["_id"])
        
        # Try to create product
        response = await client.post(
            "/api/products",
            json={"name": "Test", "category": "jaggery"},
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 403
        
        # Try to update inventory
        response = await client.put(
            f"/api/inventory/{product_id}",
            json={"quantity": 100, "operation": "set"},
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 403
        
        # Try to view all inventory
        response = await client.get(
            "/api/inventory",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 403
    
    async def test_distributor_cannot_access_owner_endpoints(self, client: AsyncClient, distributor_token: str, sample_products):
        """Test distributor cannot access owner-only endpoints"""
        product_id = str(sample_products[0]["_id"])
        
        # Try to delete product
        response = await client.delete(
            f"/api/products/{product_id}",
            headers={"Authorization": f"Bearer {distributor_token}"}
        )
        assert response.status_code == 403
        
        # Try to update inventory
        response = await client.put(
            f"/api/inventory/{product_id}",
            json={"quantity": 100, "operation": "set"},
            headers={"Authorization": f"Bearer {distributor_token}"}
        )
        assert response.status_code == 403
    
    async def test_unauthenticated_access_denied(self, client: AsyncClient):
        """Test unauthenticated users cannot access protected endpoints"""
        # Try to get products without token
        response = await client.get("/api/products")
        assert response.status_code == 401
        
        # Try to get profile without token
        response = await client.get("/api/users/profile")
        assert response.status_code == 401


class TestInterStateDelivery:
    """Test inter-state delivery calculations"""
    
    async def test_inter_state_delivery_for_eligible_products(self, client: AsyncClient, consumer_token: str, sample_products):
        """Test inter-state delivery works for jaggery and oil"""
        # Find jaggery product
        jaggery_product = next(p for p in sample_products if p["category"] == "jaggery")
        product_id = str(jaggery_product["_id"])
        
        # Order with inter-state delivery
        order_data = {
            "items": [{"product_id": product_id, "quantity": 2}],
            "delivery_address": {
                "street": "123 Test St",
                "city": "Delhi",
                "state": "Delhi",  # Different state
                "pincode": "110001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 201
        order = response.json()
        
        # Verify shipping cost is higher for inter-state
        assert order["shipping_cost"] > 50  # Should have inter-state charges
    
    async def test_in_state_delivery_lower_cost(self, client: AsyncClient, consumer_token: str, sample_products):
        """Test in-state delivery has lower shipping cost"""
        product_id = str(sample_products[0]["_id"])
        
        # Order with in-state delivery
        order_data = {
            "items": [{"product_id": product_id, "quantity": 2}],
            "delivery_address": {
                "street": "123 Test St",
                "city": "Bangalore",
                "state": "Karnataka",  # Same state
                "pincode": "560001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 201
        order = response.json()
        
        # Verify shipping cost is lower for in-state
        assert order["shipping_cost"] <= 50


class TestInventoryManagement:
    """Test inventory management and validation"""
    
    async def test_order_fails_with_insufficient_inventory(self, client: AsyncClient, consumer_token: str, sample_products, db):
        """Test order placement fails when inventory is insufficient"""
        product = sample_products[0]
        product_id = str(product["_id"])
        
        # Set inventory to low amount
        await db.inventory.update_one(
            {"product_id": ObjectId(product_id)},
            {"$set": {"quantity": 1}}
        )
        
        # Try to order more than available
        order_data = {
            "items": [{"product_id": product_id, "quantity": 10}],
            "delivery_address": {
                "street": "123 Test St",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 400
        assert "insufficient inventory" in response.json()["detail"].lower()
    
    async def test_inventory_atomic_updates(self, client: AsyncClient, owner_token: str, sample_products, db):
        """Test inventory updates are atomic"""
        product_id = str(sample_products[0]["_id"])
        
        # Set initial inventory
        await db.inventory.update_one(
            {"product_id": ObjectId(product_id)},
            {"$set": {"quantity": 100}}
        )
        
        # Add to inventory
        response = await client.put(
            f"/api/inventory/{product_id}",
            json={"quantity": 50, "operation": "add"},
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        
        # Verify inventory increased
        inventory = await db.inventory.find_one({"product_id": ObjectId(product_id)})
        assert inventory["quantity"] == 150
        
        # Subtract from inventory
        response = await client.put(
            f"/api/inventory/{product_id}",
            json={"quantity": 30, "operation": "subtract"},
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        
        # Verify inventory decreased
        inventory = await db.inventory.find_one({"product_id": ObjectId(product_id)})
        assert inventory["quantity"] == 120


class TestErrorHandling:
    """Test error handling across the application"""
    
    async def test_invalid_product_id(self, client: AsyncClient, consumer_token: str):
        """Test handling of invalid product IDs"""
        response = await client.get(
            "/api/products/invalid_id",
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 400
    
    async def test_invalid_order_data(self, client: AsyncClient, consumer_token: str):
        """Test validation of order data"""
        # Missing required fields
        response = await client.post(
            "/api/orders",
            json={"items": []},
            headers={"Authorization": f"Bearer {consumer_token}"}
        )
        assert response.status_code == 422
    
    async def test_duplicate_product_creation(self, client: AsyncClient, owner_token: str):
        """Test handling of duplicate product names"""
        product_data = {
            "name": "Unique Product",
            "category": "jaggery",
            "description": "Test",
            "price": {"consumer": 100, "distributor": 80},
            "unit": "kg",
            "inter_state_delivery": True,
            "images": []
        }
        
        # Create first product
        response = await client.post(
            "/api/products",
            json=product_data,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 201
        
        # Try to create duplicate
        response = await client.post(
            "/api/products",
            json=product_data,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        # Should either succeed or return appropriate error
        assert response.status_code in [201, 400, 409]
