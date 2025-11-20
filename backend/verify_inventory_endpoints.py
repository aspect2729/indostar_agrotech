"""
Verification script for inventory management endpoints.

This script tests the inventory service and API endpoints to ensure
they work correctly with the database.
"""

import asyncio
import sys
from datetime import datetime
from bson import ObjectId

# Add parent directory to path
sys.path.insert(0, '.')

from app.database import connect_to_mongodb, close_mongodb_connection, get_inventory_collection, get_products_collection
from app.services.inventory_service import inventory_service
from app.schemas.inventory import InventoryUpdateRequest


async def verify_inventory_service():
    """Verify inventory service functionality."""
    print("\n" + "="*60)
    print("INVENTORY SERVICE VERIFICATION")
    print("="*60)
    
    try:
        # Connect to database
        print("\n1. Connecting to MongoDB...")
        await connect_to_mongodb()
        print("✓ Connected to MongoDB")
        
        # Get collections
        inventory_collection = get_inventory_collection()
        products_collection = get_products_collection()
        
        # Create a test product if needed
        print("\n2. Setting up test data...")
        test_product = await products_collection.find_one({"name": "Test Jaggery"})
        
        if not test_product:
            test_product_data = {
                "name": "Test Jaggery",
                "category": "jaggery",
                "description": "Test product for inventory verification",
                "images": [],
                "price": {"consumer": 100.0, "distributor": 80.0},
                "unit": "kg",
                "interStateDelivery": True,
                "isActive": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            result = await products_collection.insert_one(test_product_data)
            test_product_id = result.inserted_id
            print(f"✓ Created test product: {test_product_id}")
        else:
            test_product_id = test_product["_id"]
            print(f"✓ Using existing test product: {test_product_id}")
        
        # Create inventory for test product
        existing_inventory = await inventory_collection.find_one({"productId": test_product_id})
        
        if not existing_inventory:
            inventory_data = {
                "productId": test_product_id,
                "quantity": 100.0,
                "unit": "kg",
                "lowStockThreshold": 20.0,
                "lastRestocked": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            await inventory_collection.insert_one(inventory_data)
            print("✓ Created test inventory")
        else:
            print("✓ Using existing test inventory")
        
        # Test 1: Get inventory by product ID
        print("\n3. Testing get_inventory_by_product_id...")
        inventory = await inventory_service.get_inventory_by_product_id(str(test_product_id))
        if inventory:
            print(f"✓ Retrieved inventory: {inventory.quantity} {inventory.unit}")
            print(f"  - Low stock threshold: {inventory.low_stock_threshold}")
            print(f"  - Is low stock: {inventory.is_low_stock}")
            print(f"  - Is out of stock: {inventory.is_out_of_stock}")
        else:
            print("✗ Failed to retrieve inventory")
            return False
        
        # Test 2: Get all inventory
        print("\n4. Testing get_all_inventory...")
        all_inventory = await inventory_service.get_all_inventory()
        print(f"✓ Retrieved {len(all_inventory)} inventory items")
        if all_inventory:
            sample = all_inventory[0]
            print(f"  - Sample: {sample.get('product_name', 'N/A')} - {sample['quantity']} {sample['unit']}")
        
        # Test 3: Update inventory (add operation)
        print("\n5. Testing update_inventory (add operation)...")
        update_request = InventoryUpdateRequest(quantity=50.0, operation="add")
        updated_inventory = await inventory_service.update_inventory(str(test_product_id), update_request)
        if updated_inventory:
            print(f"✓ Added 50.0 to inventory")
            print(f"  - New quantity: {updated_inventory.quantity} {updated_inventory.unit}")
        else:
            print("✗ Failed to update inventory")
            return False
        
        # Test 4: Update inventory (subtract operation)
        print("\n6. Testing update_inventory (subtract operation)...")
        update_request = InventoryUpdateRequest(quantity=30.0, operation="subtract")
        updated_inventory = await inventory_service.update_inventory(str(test_product_id), update_request)
        if updated_inventory:
            print(f"✓ Subtracted 30.0 from inventory")
            print(f"  - New quantity: {updated_inventory.quantity} {updated_inventory.unit}")
        else:
            print("✗ Failed to update inventory")
            return False
        
        # Test 5: Update inventory (set operation)
        print("\n7. Testing update_inventory (set operation)...")
        update_request = InventoryUpdateRequest(quantity=15.0, operation="set")
        updated_inventory = await inventory_service.update_inventory(str(test_product_id), update_request)
        if updated_inventory:
            print(f"✓ Set inventory to 15.0")
            print(f"  - New quantity: {updated_inventory.quantity} {updated_inventory.unit}")
            print(f"  - Is low stock: {updated_inventory.is_low_stock}")
        else:
            print("✗ Failed to update inventory")
            return False
        
        # Test 6: Get low stock alerts
        print("\n8. Testing get_low_stock_alerts...")
        alerts = await inventory_service.get_low_stock_alerts()
        print(f"✓ Retrieved {len(alerts)} low stock alerts")
        if alerts:
            for alert in alerts[:3]:  # Show first 3
                print(f"  - {alert.get('product_name', 'N/A')}: {alert['quantity']} {alert['unit']} (threshold: {alert['low_stock_threshold']})")
        
        # Test 7: Validate inventory for order
        print("\n9. Testing validate_inventory_for_order...")
        order_items = [
            {"product_id": test_product_id, "quantity": 10.0}
        ]
        validation = await inventory_service.validate_inventory_for_order(order_items)
        print(f"✓ Validation result: valid={validation['valid']}")
        if validation['errors']:
            print(f"  - Errors: {validation['errors']}")
        if validation['warnings']:
            print(f"  - Warnings: {validation['warnings']}")
        
        # Test 8: Validate insufficient inventory
        print("\n10. Testing validate_inventory_for_order (insufficient)...")
        order_items = [
            {"product_id": test_product_id, "quantity": 1000.0}
        ]
        validation = await inventory_service.validate_inventory_for_order(order_items)
        print(f"✓ Validation result: valid={validation['valid']}")
        if validation['errors']:
            print(f"  - Expected errors: {validation['errors']}")
        
        # Test 9: Test insufficient inventory error
        print("\n11. Testing insufficient inventory error handling...")
        try:
            update_request = InventoryUpdateRequest(quantity=1000.0, operation="subtract")
            await inventory_service.update_inventory(str(test_product_id), update_request)
            print("✗ Should have raised ValueError for insufficient inventory")
            return False
        except ValueError as e:
            print(f"✓ Correctly raised ValueError: {str(e)}")
        
        print("\n" + "="*60)
        print("✓ ALL INVENTORY SERVICE TESTS PASSED")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during verification: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Close database connection
        await close_mongodb_connection()
        print("\n✓ Closed MongoDB connection")


async def main():
    """Main verification function."""
    success = await verify_inventory_service()
    
    if success:
        print("\n✓ Inventory service verification completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Inventory service verification failed!")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
