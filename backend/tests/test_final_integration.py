"""
Final Integration Tests for Indostar E-commerce Application
Tests complete user flows for all three portals
"""
import pytest
from httpx import AsyncClient
from app.database import get_database
from bson import ObjectId
import asyncio


class TestConsumerPortalFlow:
    """Test complete consumer user flow"""
    
    @pytest.mark.asyncio
    async def test_consumer_complete_flow(self, client: AsyncClient, test_consumer_token: str):
        """Test: Browse products -> View details -> Add to cart -> Place order"""
        
        # 1. Browse products
        response = await client.get(
            "/api/products",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        product = products[0]
        
        # 2. View product details
        response = await client.get(
            f"/api/products/{product['_id']}",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 200
        product_detail = response.json()
        assert product_detail["_id"] == product["_id"]
        
        # 3. Check inventory availability
        db = await get_database()
        inventory = await db.inventory.find_one({"productId": ObjectId(product["_id"])})
        assert inventory is not None
        assert inventory["quantity"] > 0
        
        # 4. Place order
        order_data = {
            "items": [
                {
                    "productId": product["_id"],
                    "quantity": 2,
                    "pricePerUnit": product["price"]["consumer"]
                }
            ],
            "deliveryAddress": {
                "street": "123 Test Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 201
        order = response.json()
        assert order["status"] == "pending"
        assert len(order["items"]) == 1
        
        # 5. Verify inventory was updated
        updated_inventory = await db.inventory.find_one({"productId": ObjectId(product["_id"])})
        assert updated_inventory["quantity"] == inventory["quantity"] - 2
        
        # 6. View order history
        response = await client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) > 0
        assert any(o["_id"] == order["_id"] for o in orders)
    
    @pytest.mark.asyncio
    async def test_category_filtering(self, client: AsyncClient, test_consumer_token: str):
        """Test: Filter products by category"""
        
        response = await client.get(
            "/api/products?category=jaggery",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 200
        products = response.json()
        
        # Verify all products are jaggery
        for product in products:
            assert product["category"] == "jaggery"
    
    @pytest.mark.asyncio
    async def test_product_search(self, client: AsyncClient, test_consumer_token: str):
        """Test: Search products"""
        
        response = await client.get(
            "/api/products?search=jaggery",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 200
        products = response.json()
        
        # Verify search results contain the search term
        for product in products:
            assert "jaggery" in product["name"].lower() or "jaggery" in product["description"].lower()


class TestDistributorPortalFlow:
    """Test complete distributor user flow"""
    
    @pytest.mark.asyncio
    async def test_distributor_bulk_order_flow(self, client: AsyncClient, test_distributor_token: str):
        """Test: Browse bulk products -> Place bulk order -> Track order"""
        
        # 1. Browse products with distributor pricing
        response = await client.get(
            "/api/products",
            headers={"Authorization": f"Bearer {test_distributor_token}"}
        )
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        
        # Find a product eligible for inter-state delivery
        interstate_product = next((p for p in products if p.get("interStateDelivery")), None)
        assert interstate_product is not None
        
        # 2. Place bulk order with inter-state delivery
        order_data = {
            "items": [
                {
                    "productId": interstate_product["_id"],
                    "quantity": 50,  # Bulk quantity
                    "pricePerUnit": interstate_product["price"]["distributor"]
                }
            ],
            "deliveryAddress": {
                "street": "456 Distributor Ave",
                "city": "Mumbai",
                "state": "Maharashtra",  # Inter-state
                "pincode": "400001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {test_distributor_token}"}
        )
        assert response.status_code == 201
        order = response.json()
        assert order["status"] == "pending"
        assert order["shippingCost"] > 0  # Inter-state should have shipping cost
        
        # 3. View order history
        response = await client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {test_distributor_token}"}
        )
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) > 0
    
    @pytest.mark.asyncio
    async def test_interstate_delivery_calculation(self, client: AsyncClient, test_distributor_token: str):
        """Test: Verify inter-state delivery cost calculation"""
        
        # Get a product eligible for inter-state delivery
        response = await client.get(
            "/api/products",
            headers={"Authorization": f"Bearer {test_distributor_token}"}
        )
        products = response.json()
        interstate_product = next((p for p in products if p.get("interStateDelivery")), None)
        
        if interstate_product:
            # Place order with inter-state address
            order_data = {
                "items": [
                    {
                        "productId": interstate_product["_id"],
                        "quantity": 10,
                        "pricePerUnit": interstate_product["price"]["distributor"]
                    }
                ],
                "deliveryAddress": {
                    "street": "Test Street",
                    "city": "Delhi",
                    "state": "Delhi",  # Different state
                    "pincode": "110001"
                }
            }
            
            response = await client.post(
                "/api/orders",
                json=order_data,
                headers={"Authorization": f"Bearer {test_distributor_token}"}
            )
            assert response.status_code == 201
            order = response.json()
            
            # Verify shipping cost is calculated
            assert order["shippingCost"] > 0
            
            # Compare with in-state order
            order_data["deliveryAddress"]["state"] = "Karnataka"
            response = await client.post(
                "/api/orders",
                json=order_data,
                headers={"Authorization": f"Bearer {test_distributor_token}"}
            )
            instate_order = response.json()
            
            # Inter-state should cost more
            assert order["shippingCost"] >= instate_order["shippingCost"]


class TestOwnerDashboardFlow:
    """Test complete owner dashboard flow"""
    
    @pytest.mark.asyncio
    async def test_owner_inventory_management(self, client: AsyncClient, test_owner_token: str):
        """Test: View inventory -> Update stock -> Check alerts"""
        
        # 1. View all inventory
        response = await client.get(
            "/api/inventory",
            headers={"Authorization": f"Bearer {test_owner_token}"}
        )
        assert response.status_code == 200
        inventory_items = response.json()
        assert len(inventory_items) > 0
        
        item = inventory_items[0]
        original_quantity = item["quantity"]
        
        # 2. Update inventory
        update_data = {
            "quantity": original_quantity + 100,
            "operation": "set"
        }
        
        response = await client.put(
            f"/api/inventory/{item['productId']}",
            json=update_data,
            headers={"Authorization": f"Bearer {test_owner_token}"}
        )
        assert response.status_code == 200
        updated_item = response.json()
        assert updated_item["quantity"] == original_quantity + 100
        
        # 3. Check low-stock alerts
        response = await client.get(
            "/api/inventory/alerts",
            headers={"Authorization": f"Bearer {test_owner_token}"}
        )
        assert response.status_code == 200
        alerts = response.json()
        # Alerts should only include items below threshold
        for alert in alerts:
            assert alert["quantity"] <= alert["lowStockThreshold"]
    
    @pytest.mark.asyncio
    async def test_owner_order_management(self, client: AsyncClient, test_owner_token: str):
        """Test: View all orders -> Update order status"""
        
        # 1. View all orders (from all users)
        response = await client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {test_owner_token}"}
        )
        assert response.status_code == 200
        orders = response.json()
        
        if len(orders) > 0:
            order = orders[0]
            
            # 2. Update order status
            status_update = {"status": "confirmed"}
            
            response = await client.put(
                f"/api/orders/{order['_id']}/status",
                json=status_update,
                headers={"Authorization": f"Bearer {test_owner_token}"}
            )
            assert response.status_code == 200
            updated_order = response.json()
            assert updated_order["status"] == "confirmed"
    
    @pytest.mark.asyncio
    async def test_owner_product_management(self, client: AsyncClient, test_owner_token: str):
        """Test: Create product -> Update product -> Delete product"""
        
        # 1. Create new product
        new_product = {
            "name": "Test Organic Jaggery",
            "category": "jaggery",
            "description": "Premium organic jaggery for testing",
            "images": ["test-image.jpg"],
            "price": {
                "consumer": 150.0,
                "distributor": 120.0
            },
            "unit": "kg",
            "interStateDelivery": True,
            "isActive": True
        }
        
        response = await client.post(
            "/api/products",
            json=new_product,
            headers={"Authorization": f"Bearer {test_owner_token}"}
        )
        assert response.status_code == 201
        created_product = response.json()
        assert created_product["name"] == new_product["name"]
        product_id = created_product["_id"]
        
        # 2. Update product
        update_data = {
            "price": {
                "consumer": 160.0,
                "distributor": 130.0
            }
        }
        
        response = await client.put(
            f"/api/products/{product_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {test_owner_token}"}
        )
        assert response.status_code == 200
        updated_product = response.json()
        assert updated_product["price"]["consumer"] == 160.0
        
        # 3. Delete product
        response = await client.delete(
            f"/api/products/{product_id}",
            headers={"Authorization": f"Bearer {test_owner_token}"}
        )
        assert response.status_code == 200


class TestRoleBasedAccessControl:
    """Test role-based access control across all endpoints"""
    
    @pytest.mark.asyncio
    async def test_consumer_cannot_access_owner_endpoints(self, client: AsyncClient, test_consumer_token: str):
        """Test: Consumer should not access owner-only endpoints"""
        
        # Try to access inventory management
        response = await client.get(
            "/api/inventory",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 403
        
        # Try to create product
        response = await client.post(
            "/api/products",
            json={"name": "Test"},
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 403
        
        # Try to update order status
        response = await client.put(
            "/api/orders/123/status",
            json={"status": "confirmed"},
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_distributor_cannot_access_owner_endpoints(self, client: AsyncClient, test_distributor_token: str):
        """Test: Distributor should not access owner-only endpoints"""
        
        # Try to access inventory management
        response = await client.get(
            "/api/inventory",
            headers={"Authorization": f"Bearer {test_distributor_token}"}
        )
        assert response.status_code == 403
        
        # Try to update inventory
        response = await client.put(
            "/api/inventory/123",
            json={"quantity": 100, "operation": "set"},
            headers={"Authorization": f"Bearer {test_distributor_token}"}
        )
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_unauthenticated_access_denied(self, client: AsyncClient):
        """Test: Unauthenticated requests should be denied"""
        
        # Try to access products without token
        response = await client.get("/api/products")
        assert response.status_code == 401
        
        # Try to place order without token
        response = await client.post(
            "/api/orders",
            json={"items": []}
        )
        assert response.status_code == 401


class TestDataIntegrity:
    """Test data integrity across operations"""
    
    @pytest.mark.asyncio
    async def test_inventory_consistency_after_order(self, client: AsyncClient, test_consumer_token: str):
        """Test: Inventory should be correctly updated after order placement"""
        
        db = await get_database()
        
        # Get a product
        response = await client.get(
            "/api/products",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        products = response.json()
        product = products[0]
        
        # Get current inventory
        inventory_before = await db.inventory.find_one({"productId": ObjectId(product["_id"])})
        quantity_before = inventory_before["quantity"]
        
        # Place order
        order_quantity = 3
        order_data = {
            "items": [
                {
                    "productId": product["_id"],
                    "quantity": order_quantity,
                    "pricePerUnit": product["price"]["consumer"]
                }
            ],
            "deliveryAddress": {
                "street": "Test Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 201
        
        # Verify inventory was reduced
        inventory_after = await db.inventory.find_one({"productId": ObjectId(product["_id"])})
        assert inventory_after["quantity"] == quantity_before - order_quantity
    
    @pytest.mark.asyncio
    async def test_order_cannot_exceed_inventory(self, client: AsyncClient, test_consumer_token: str):
        """Test: Order should fail if quantity exceeds available inventory"""
        
        db = await get_database()
        
        # Get a product
        response = await client.get(
            "/api/products",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        products = response.json()
        product = products[0]
        
        # Get current inventory
        inventory = await db.inventory.find_one({"productId": ObjectId(product["_id"])})
        available_quantity = inventory["quantity"]
        
        # Try to order more than available
        order_data = {
            "items": [
                {
                    "productId": product["_id"],
                    "quantity": available_quantity + 1000,
                    "pricePerUnit": product["price"]["consumer"]
                }
            ],
            "deliveryAddress": {
                "street": "Test Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            }
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 400
        error = response.json()
        assert "insufficient" in error["error"]["message"].lower() or "stock" in error["error"]["message"].lower()


class TestErrorHandling:
    """Test error handling across the application"""
    
    @pytest.mark.asyncio
    async def test_invalid_product_id(self, client: AsyncClient, test_consumer_token: str):
        """Test: Invalid product ID should return 404"""
        
        response = await client.get(
            "/api/products/invalid_id_123",
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code in [400, 404]
    
    @pytest.mark.asyncio
    async def test_invalid_order_data(self, client: AsyncClient, test_consumer_token: str):
        """Test: Invalid order data should return 400"""
        
        # Missing required fields
        order_data = {
            "items": []  # Empty items
        }
        
        response = await client.post(
            "/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_malformed_request(self, client: AsyncClient, test_consumer_token: str):
        """Test: Malformed request should return 422"""
        
        response = await client.post(
            "/api/orders",
            json={"invalid": "data"},
            headers={"Authorization": f"Bearer {test_consumer_token}"}
        )
        assert response.status_code in [400, 422]
