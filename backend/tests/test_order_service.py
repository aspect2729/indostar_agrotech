"""
Unit tests for order service.
"""

import pytest
from bson import ObjectId

from app.services.order_service import order_service
from app.services.product_service import product_service
from app.services.inventory_service import inventory_service
from app.schemas.order import OrderCreateRequest, OrderItemRequest, OrderUpdateStatusRequest
from app.schemas.product import ProductCreateRequest
from app.schemas.inventory import InventoryUpdateRequest
from app.models.order import Address


@pytest.mark.asyncio
class TestOrderService:
    """Test cases for OrderService."""
    
    async def test_calculate_shipping_cost_in_state(self, sample_address_data):
        """Test shipping cost calculation for in-state delivery."""
        address = Address(**sample_address_data)
        shipping_cost = order_service._calculate_shipping_cost(address, [])
        
        assert shipping_cost == 50.0  # Base shipping cost
    
    async def test_calculate_shipping_cost_inter_state(self, sample_address_data):
        """Test shipping cost calculation for inter-state delivery."""
        address_data = sample_address_data.copy()
        address_data["state"] = "Maharashtra"
        address = Address(**address_data)
        
        shipping_cost = order_service._calculate_shipping_cost(address, [])
        
        assert shipping_cost == 150.0  # Base * 3 for inter-state
    
    async def test_generate_order_number(self):
        """Test order number generation."""
        order_number = await order_service._generate_order_number()
        
        assert order_number is not None
        assert order_number.startswith("ORD-")
        assert len(order_number.split("-")) == 3
    
    async def test_create_order(self, sample_product_data, sample_address_data):
        """Test creating an order."""
        # Create a product first
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        # Set inventory
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        # Create order
        order_items = [
            OrderItemRequest(product_id=str(product.id), quantity=2)
        ]
        address = Address(**sample_address_data)
        order_request = OrderCreateRequest(
            items=order_items,
            delivery_address=address,
            notes="Test order"
        )
        
        user_id = str(ObjectId())
        order = await order_service.create_order(user_id, "consumer", order_request)
        
        assert order is not None
        assert order.user_id == ObjectId(user_id)
        assert order.user_type == "consumer"
        assert len(order.items) == 1
        assert order.items[0].quantity == 2
        assert order.status == "pending"
        assert order.subtotal > 0
        assert order.total > order.subtotal
    
    async def test_get_order_by_id(self, sample_product_data, sample_address_data):
        """Test getting an order by ID."""
        # Create product and order
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        order_items = [OrderItemRequest(product_id=str(product.id), quantity=1)]
        address = Address(**sample_address_data)
        order_request = OrderCreateRequest(items=order_items, delivery_address=address)
        
        created_order = await order_service.create_order(
            str(ObjectId()), "consumer", order_request
        )
        
        # Fetch the order
        order = await order_service.get_order_by_id(str(created_order.id))
        
        assert order is not None
        assert order.id == created_order.id
    
    async def test_update_order_status(self, sample_product_data, sample_address_data):
        """Test updating order status."""
        # Create product and order
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        order_items = [OrderItemRequest(product_id=str(product.id), quantity=1)]
        address = Address(**sample_address_data)
        order_request = OrderCreateRequest(items=order_items, delivery_address=address)
        
        created_order = await order_service.create_order(
            str(ObjectId()), "consumer", order_request
        )
        
        # Update status
        status_update = OrderUpdateStatusRequest(
            status="confirmed",
            notes="Order confirmed"
        )
        updated_order = await order_service.update_order_status(
            str(created_order.id),
            status_update
        )
        
        assert updated_order is not None
        assert updated_order.status == "confirmed"
    
    async def test_get_orders_with_filters(self, sample_product_data, sample_address_data):
        """Test getting orders with filters."""
        # Create product
        product_request = ProductCreateRequest(**sample_product_data)
        product = await product_service.create_product(product_request)
        
        inventory_update = InventoryUpdateRequest(quantity=100, operation="set")
        await inventory_service.update_inventory(str(product.id), inventory_update)
        
        # Create multiple orders
        user_id = str(ObjectId())
        for i in range(3):
            order_items = [OrderItemRequest(product_id=str(product.id), quantity=1)]
            address = Address(**sample_address_data)
            order_request = OrderCreateRequest(items=order_items, delivery_address=address)
            await order_service.create_order(user_id, "consumer", order_request)
        
        # Get orders for user
        result = await order_service.get_orders(user_id=user_id)
        
        assert "orders" in result
        assert len(result["orders"]) >= 3
    
    async def test_calculate_inter_state_shipping_cost(self):
        """Test inter-state shipping cost calculation."""
        # Test for eligible categories
        cost = order_service.calculate_inter_state_shipping_cost(
            "Maharashtra",
            ["jaggery", "oil"]
        )
        assert cost == 150.0
        
        # Test for in-state
        cost = order_service.calculate_inter_state_shipping_cost(
            "Karnataka",
            ["jaggery"]
        )
        assert cost == 50.0
        
        # Test for ineligible category
        with pytest.raises(ValueError):
            order_service.calculate_inter_state_shipping_cost(
                "Maharashtra",
                ["pickles"]
            )
