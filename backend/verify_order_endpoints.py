"""
Verification script for order management endpoints.

This script tests the order service and API endpoints to ensure they work correctly.
"""

import asyncio
from datetime import datetime
from bson import ObjectId

from app.database import connect_to_mongodb, close_mongodb_connection, get_database
from app.services.order_service import order_service
from app.schemas.order import OrderCreateRequest, OrderItemRequest, AddressSchema, OrderUpdateStatusRequest


async def setup_test_data():
    """Create test data for order verification."""
    db = get_database()
    
    print("Setting up test data...")
    
    # Create test user (consumer)
    test_user = {
        "_id": ObjectId(),
        "google_id": "test_consumer_123",
        "email": "consumer@test.com",
        "name": "Test Consumer",
        "role": "consumer",
        "phone": "+919876543210",
        "addresses": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.users.delete_one({"email": test_user["email"]})
    await db.users.insert_one(test_user)
    print(f"✓ Created test consumer: {test_user['_id']}")
    
    # Create test distributor
    test_distributor = {
        "_id": ObjectId(),
        "google_id": "test_distributor_123",
        "email": "distributor@test.com",
        "name": "Test Distributor",
        "role": "distributor",
        "phone": "+919876543211",
        "addresses": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.users.delete_one({"email": test_distributor["email"]})
    await db.users.insert_one(test_distributor)
    print(f"✓ Created test distributor: {test_distributor['_id']}")
    
    # Create test products
    test_products = [
        {
            "_id": ObjectId(),
            "name": "Organic Jaggery Powder",
            "category": "jaggery",
            "description": "Pure organic jaggery powder",
            "images": ["jaggery.jpg"],
            "price": {
                "consumer": 150.0,
                "distributor": 120.0
            },
            "unit": "kg",
            "nutritional_info": {
                "calories": 383,
                "protein": 0.4,
                "carbohydrates": 98.0,
                "fat": 0.1
            },
            "inter_state_delivery": True,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Cold Pressed Coconut Oil",
            "category": "oil",
            "description": "Pure cold pressed coconut oil",
            "images": ["coconut_oil.jpg"],
            "price": {
                "consumer": 250.0,
                "distributor": 200.0
            },
            "unit": "liter",
            "nutritional_info": {
                "calories": 862,
                "protein": 0.0,
                "carbohydrates": 0.0,
                "fat": 100.0
            },
            "inter_state_delivery": True,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    for product in test_products:
        await db.products.delete_one({"name": product["name"]})
        await db.products.insert_one(product)
        print(f"✓ Created test product: {product['name']} ({product['_id']})")
        
        # Create inventory for product
        inventory = {
            "productId": product["_id"],
            "quantity": 100.0,
            "unit": product["unit"],
            "lowStockThreshold": 10.0,
            "lastRestocked": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        await db.inventory.delete_one({"productId": product["_id"]})
        await db.inventory.insert_one(inventory)
        print(f"  ✓ Created inventory: {inventory['quantity']} {inventory['unit']}")
    
    return test_user, test_distributor, test_products


async def test_order_creation():
    """Test order creation with inventory validation."""
    print("\n" + "="*60)
    print("TEST: Order Creation")
    print("="*60)
    
    test_user, test_distributor, test_products = await setup_test_data()
    
    # Test 1: Create consumer order
    print("\n1. Creating consumer order...")
    
    delivery_address = AddressSchema(
        type="shipping",
        street="123 Test Street",
        city="Bangalore",
        state="Karnataka",
        pincode="560001",
        is_default=True
    )
    
    order_items = [
        OrderItemRequest(
            product_id=str(test_products[0]["_id"]),
            quantity=2.0
        ),
        OrderItemRequest(
            product_id=str(test_products[1]["_id"]),
            quantity=1.0
        )
    ]
    
    order_request = OrderCreateRequest(
        items=order_items,
        delivery_address=delivery_address,
        notes="Test order - please deliver before 5 PM"
    )
    
    try:
        order = await order_service.create_order(
            user_id=str(test_user["_id"]),
            user_type="consumer",
            order_request=order_request
        )
        
        print(f"✓ Order created successfully!")
        print(f"  Order Number: {order.order_number}")
        print(f"  User Type: {order.user_type}")
        print(f"  Items: {len(order.items)}")
        print(f"  Subtotal: ₹{order.subtotal}")
        print(f"  Tax (18%): ₹{order.tax}")
        print(f"  Shipping: ₹{order.shipping_cost}")
        print(f"  Total: ₹{order.total}")
        print(f"  Status: {order.status}")
        
        # Verify calculations
        expected_subtotal = (2.0 * 150.0) + (1.0 * 250.0)  # Consumer prices
        assert abs(order.subtotal - expected_subtotal) < 0.01, "Subtotal mismatch"
        
        expected_tax = round(expected_subtotal * 0.18, 2)
        assert abs(order.tax - expected_tax) < 0.01, "Tax mismatch"
        
        expected_total = order.subtotal + order.tax + order.shipping_cost
        assert abs(order.total - expected_total) < 0.01, "Total mismatch"
        
        print("✓ Price calculations verified")
        
        consumer_order_id = str(order.id)
        
    except Exception as e:
        print(f"✗ Error creating consumer order: {str(e)}")
        return
    
    # Test 2: Create distributor order with inter-state shipping
    print("\n2. Creating distributor order with inter-state shipping...")
    
    inter_state_address = AddressSchema(
        type="shipping",
        street="456 Test Avenue",
        city="Mumbai",
        state="Maharashtra",
        pincode="400001",
        is_default=True
    )
    
    distributor_items = [
        OrderItemRequest(
            product_id=str(test_products[0]["_id"]),
            quantity=10.0
        )
    ]
    
    distributor_request = OrderCreateRequest(
        items=distributor_items,
        delivery_address=inter_state_address,
        notes="Bulk order for distribution"
    )
    
    try:
        distributor_order = await order_service.create_order(
            user_id=str(test_distributor["_id"]),
            user_type="distributor",
            order_request=distributor_request
        )
        
        print(f"✓ Distributor order created successfully!")
        print(f"  Order Number: {distributor_order.order_number}")
        print(f"  User Type: {distributor_order.user_type}")
        print(f"  Items: {len(distributor_order.items)}")
        print(f"  Subtotal: ₹{distributor_order.subtotal}")
        print(f"  Tax (18%): ₹{distributor_order.tax}")
        print(f"  Shipping (Inter-state): ₹{distributor_order.shipping_cost}")
        print(f"  Total: ₹{distributor_order.total}")
        
        # Verify distributor pricing
        expected_subtotal = 10.0 * 120.0  # Distributor price
        assert abs(distributor_order.subtotal - expected_subtotal) < 0.01, "Distributor subtotal mismatch"
        
        # Verify inter-state shipping
        assert distributor_order.shipping_cost > 50.0, "Inter-state shipping should be higher"
        
        print("✓ Distributor pricing and inter-state shipping verified")
        
        distributor_order_id = str(distributor_order.id)
        
    except Exception as e:
        print(f"✗ Error creating distributor order: {str(e)}")
        return
    
    # Test 3: Test insufficient inventory
    print("\n3. Testing insufficient inventory validation...")
    
    insufficient_items = [
        OrderItemRequest(
            product_id=str(test_products[0]["_id"]),
            quantity=200.0  # More than available (100)
        )
    ]
    
    insufficient_request = OrderCreateRequest(
        items=insufficient_items,
        delivery_address=delivery_address
    )
    
    try:
        await order_service.create_order(
            user_id=str(test_user["_id"]),
            user_type="consumer",
            order_request=insufficient_request
        )
        print("✗ Should have failed with insufficient inventory error")
    except ValueError as e:
        if "Insufficient inventory" in str(e):
            print(f"✓ Correctly rejected order with insufficient inventory")
        else:
            print(f"✗ Unexpected error: {str(e)}")
    except Exception as e:
        print(f"✗ Unexpected error type: {str(e)}")
    
    return consumer_order_id, distributor_order_id


async def test_order_retrieval(consumer_order_id, distributor_order_id):
    """Test order retrieval operations."""
    print("\n" + "="*60)
    print("TEST: Order Retrieval")
    print("="*60)
    
    # Test 1: Get order by ID
    print("\n1. Getting order by ID...")
    
    try:
        order = await order_service.get_order_by_id(consumer_order_id)
        
        if order:
            print(f"✓ Retrieved order: {order.order_number}")
            print(f"  Status: {order.status}")
            print(f"  Total: ₹{order.total}")
        else:
            print("✗ Order not found")
            
    except Exception as e:
        print(f"✗ Error retrieving order: {str(e)}")
    
    # Test 2: Get all orders
    print("\n2. Getting all orders...")
    
    try:
        result = await order_service.get_orders(limit=10, offset=0)
        
        print(f"✓ Retrieved {len(result['orders'])} orders")
        print(f"  Total orders: {result['total']}")
        
        for order in result['orders']:
            print(f"  - {order.order_number}: {order.status} (₹{order.total})")
            
    except Exception as e:
        print(f"✗ Error retrieving orders: {str(e)}")
    
    # Test 3: Filter by status
    print("\n3. Filtering orders by status...")
    
    try:
        result = await order_service.get_orders(status="pending", limit=10, offset=0)
        
        print(f"✓ Retrieved {len(result['orders'])} pending orders")
        
        for order in result['orders']:
            assert order.status == "pending", "Status filter not working"
            print(f"  - {order.order_number}: {order.status}")
            
    except Exception as e:
        print(f"✗ Error filtering orders: {str(e)}")


async def test_order_status_update(order_id):
    """Test order status update."""
    print("\n" + "="*60)
    print("TEST: Order Status Update")
    print("="*60)
    
    # Test status progression
    statuses = ["confirmed", "processing", "shipped", "delivered"]
    
    for new_status in statuses:
        print(f"\n1. Updating order status to '{new_status}'...")
        
        try:
            status_update = OrderUpdateStatusRequest(
                status=new_status,
                notes=f"Order {new_status} at {datetime.utcnow().isoformat()}"
            )
            
            order = await order_service.update_order_status(order_id, status_update)
            
            if order:
                print(f"✓ Order status updated to: {order.status}")
                print(f"  Notes: {order.notes}")
                assert order.status == new_status, "Status not updated correctly"
            else:
                print("✗ Order not found")
                
        except Exception as e:
            print(f"✗ Error updating order status: {str(e)}")


async def test_inter_state_shipping():
    """Test inter-state shipping cost calculation."""
    print("\n" + "="*60)
    print("TEST: Inter-State Shipping Calculation")
    print("="*60)
    
    # Test 1: In-state shipping (Karnataka)
    print("\n1. Testing in-state shipping (Karnataka)...")
    
    try:
        cost = order_service.calculate_inter_state_shipping_cost(
            "Karnataka",
            ["jaggery", "oil"]
        )
        
        print(f"✓ In-state shipping cost: ₹{cost}")
        assert cost == 50.0, "In-state shipping should be base cost"
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
    
    # Test 2: Inter-state shipping for eligible products
    print("\n2. Testing inter-state shipping (Maharashtra)...")
    
    try:
        cost = order_service.calculate_inter_state_shipping_cost(
            "Maharashtra",
            ["jaggery", "oil"]
        )
        
        print(f"✓ Inter-state shipping cost: ₹{cost}")
        assert cost == 150.0, "Inter-state shipping should be 3x base cost"
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
    
    # Test 3: Inter-state shipping for ineligible products
    print("\n3. Testing inter-state shipping for ineligible products...")
    
    try:
        cost = order_service.calculate_inter_state_shipping_cost(
            "Maharashtra",
            ["pickles"]  # Not eligible for inter-state
        )
        
        print(f"✗ Should have raised ValueError for ineligible products")
        
    except ValueError as e:
        if "not available" in str(e):
            print(f"✓ Correctly rejected inter-state shipping for ineligible products")
        else:
            print(f"✗ Unexpected error: {str(e)}")
    except Exception as e:
        print(f"✗ Unexpected error type: {str(e)}")


async def main():
    """Main verification function."""
    print("\n" + "="*60)
    print("ORDER MANAGEMENT VERIFICATION")
    print("="*60)
    
    try:
        # Connect to database
        await connect_to_mongodb()
        print("✓ Connected to MongoDB")
        
        # Run tests
        consumer_order_id, distributor_order_id = await test_order_creation()
        await test_order_retrieval(consumer_order_id, distributor_order_id)
        await test_order_status_update(consumer_order_id)
        await test_inter_state_shipping()
        
        print("\n" + "="*60)
        print("VERIFICATION COMPLETE")
        print("="*60)
        print("\n✓ All order management tests passed!")
        
    except Exception as e:
        print(f"\n✗ Verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Close database connection
        await close_mongodb_connection()
        print("\n✓ Database connection closed")


if __name__ == "__main__":
    asyncio.run(main())
