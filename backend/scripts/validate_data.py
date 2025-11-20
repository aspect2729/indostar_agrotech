"""
Data validation script for database integrity checks.

This script validates:
- All products have corresponding inventory records
- All orders reference valid products and users
- Data integrity constraints are met
- Required fields are present and valid
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import logging

from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ValidationResult:
    """Container for validation results."""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
    
    def add_error(self, message):
        self.errors.append(message)
        logger.error(f"  ✗ ERROR: {message}")
    
    def add_warning(self, message):
        self.warnings.append(message)
        logger.warning(f"  ⚠ WARNING: {message}")
    
    def add_info(self, message):
        self.info.append(message)
        logger.info(f"  ✓ {message}")
    
    def has_errors(self):
        return len(self.errors) > 0
    
    def summary(self):
        return {
            "errors": len(self.errors),
            "warnings": len(self.warnings),
            "info": len(self.info)
        }


async def validate_products(db, result):
    """Validate products collection."""
    logger.info("\nValidating products collection...")
    
    products = await db.products.find({}).to_list(length=None)
    
    if not products:
        result.add_warning("No products found in database")
        return
    
    result.add_info(f"Found {len(products)} products")
    
    # Validate each product
    for product in products:
        product_name = product.get('name', 'Unknown')
        
        # Check required fields
        required_fields = ['name', 'category', 'description', 'price', 'unit', 'is_active']
        for field in required_fields:
            if field not in product:
                result.add_error(f"Product '{product_name}' missing required field: {field}")
        
        # Validate price structure
        if 'price' in product:
            if not isinstance(product['price'], dict):
                result.add_error(f"Product '{product_name}' has invalid price structure")
            else:
                if 'consumer' not in product['price']:
                    result.add_error(f"Product '{product_name}' missing consumer price")
                if 'distributor' not in product['price']:
                    result.add_error(f"Product '{product_name}' missing distributor price")
                
                # Check distributor price <= consumer price
                if 'consumer' in product['price'] and 'distributor' in product['price']:
                    if product['price']['distributor'] > product['price']['consumer']:
                        result.add_error(
                            f"Product '{product_name}' has distributor price higher than consumer price"
                        )
        
        # Validate category
        valid_categories = ['jaggery', 'oil', 'chutney_powder', 'pickles', 'milk']
        if product.get('category') not in valid_categories:
            result.add_error(f"Product '{product_name}' has invalid category: {product.get('category')}")
        
        # Check inter-state delivery for jaggery and oil
        category = product.get('category')
        inter_state = product.get('inter_state_delivery', False)
        if category in ['jaggery', 'oil'] and not inter_state:
            result.add_warning(
                f"Product '{product_name}' is {category} but inter_state_delivery is False"
            )
    
    result.add_info(f"Products validation completed")


async def validate_inventory(db, result):
    """Validate inventory collection and product relationships."""
    logger.info("\nValidating inventory collection...")
    
    products = await db.products.find({}).to_list(length=None)
    inventory_records = await db.inventory.find({}).to_list(length=None)
    
    if not products:
        result.add_warning("No products found - skipping inventory validation")
        return
    
    result.add_info(f"Found {len(inventory_records)} inventory records")
    
    # Create product ID set
    product_ids = {product['_id'] for product in products}
    inventory_product_ids = {inv['product_id'] for inv in inventory_records}
    
    # Check if all products have inventory
    products_without_inventory = product_ids - inventory_product_ids
    if products_without_inventory:
        result.add_error(
            f"{len(products_without_inventory)} products missing inventory records"
        )
        for product in products:
            if product['_id'] in products_without_inventory:
                result.add_error(f"  - Product '{product['name']}' has no inventory record")
    else:
        result.add_info("All products have inventory records")
    
    # Check for orphaned inventory records
    orphaned_inventory = inventory_product_ids - product_ids
    if orphaned_inventory:
        result.add_warning(
            f"{len(orphaned_inventory)} inventory records reference non-existent products"
        )
    
    # Validate inventory data
    for inv in inventory_records:
        product_id = inv.get('product_id')
        
        # Check required fields
        required_fields = ['product_id', 'quantity', 'unit', 'low_stock_threshold']
        for field in required_fields:
            if field not in inv:
                result.add_error(f"Inventory for product {product_id} missing field: {field}")
        
        # Check quantity is non-negative
        if 'quantity' in inv and inv['quantity'] < 0:
            result.add_error(f"Inventory for product {product_id} has negative quantity")
        
        # Check threshold is positive
        if 'low_stock_threshold' in inv and inv['low_stock_threshold'] <= 0:
            result.add_error(f"Inventory for product {product_id} has invalid threshold")
        
        # Check for low stock
        if 'quantity' in inv and 'low_stock_threshold' in inv:
            if inv['quantity'] <= inv['low_stock_threshold']:
                product = next((p for p in products if p['_id'] == product_id), None)
                product_name = product['name'] if product else str(product_id)
                result.add_warning(
                    f"Product '{product_name}' is low on stock: "
                    f"{inv['quantity']} {inv.get('unit', '')} "
                    f"(threshold: {inv['low_stock_threshold']})"
                )
    
    result.add_info("Inventory validation completed")


async def validate_orders(db, result):
    """Validate orders collection and relationships."""
    logger.info("\nValidating orders collection...")
    
    orders = await db.orders.find({}).to_list(length=None)
    
    if not orders:
        result.add_info("No orders found in database")
        return
    
    result.add_info(f"Found {len(orders)} orders")
    
    # Get all users and products for validation
    users = await db.users.find({}).to_list(length=None)
    products = await db.products.find({}).to_list(length=None)
    
    user_ids = {user['_id'] for user in users}
    product_ids = {product['_id'] for product in products}
    
    # Validate each order
    for order in orders:
        order_number = order.get('order_number', 'Unknown')
        
        # Check required fields
        required_fields = ['order_number', 'user_id', 'user_type', 'items', 'subtotal', 
                          'tax', 'shipping_cost', 'total', 'delivery_address', 'status']
        for field in required_fields:
            if field not in order:
                result.add_error(f"Order '{order_number}' missing required field: {field}")
        
        # Validate user reference
        if 'user_id' in order:
            if order['user_id'] not in user_ids:
                result.add_error(f"Order '{order_number}' references non-existent user")
        
        # Validate order items
        if 'items' in order:
            if not order['items']:
                result.add_error(f"Order '{order_number}' has no items")
            
            for item in order['items']:
                # Check product reference
                if 'product_id' in item:
                    if item['product_id'] not in product_ids:
                        result.add_error(
                            f"Order '{order_number}' item references non-existent product"
                        )
                
                # Validate item total
                if all(k in item for k in ['quantity', 'price_per_unit', 'total']):
                    expected_total = round(item['quantity'] * item['price_per_unit'], 2)
                    if abs(item['total'] - expected_total) > 0.01:
                        result.add_error(
                            f"Order '{order_number}' item has incorrect total calculation"
                        )
        
        # Validate order totals
        if all(k in order for k in ['subtotal', 'tax', 'shipping_cost', 'total']):
            expected_total = round(
                order['subtotal'] + order['tax'] + order['shipping_cost'], 2
            )
            if abs(order['total'] - expected_total) > 0.01:
                result.add_error(f"Order '{order_number}' has incorrect total calculation")
        
        # Validate status
        valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        if order.get('status') not in valid_statuses:
            result.add_error(f"Order '{order_number}' has invalid status: {order.get('status')}")
        
        # Validate user type
        valid_user_types = ['consumer', 'distributor']
        if order.get('user_type') not in valid_user_types:
            result.add_error(f"Order '{order_number}' has invalid user_type: {order.get('user_type')}")
    
    result.add_info("Orders validation completed")


async def validate_users(db, result):
    """Validate users collection."""
    logger.info("\nValidating users collection...")
    
    users = await db.users.find({}).to_list(length=None)
    
    if not users:
        result.add_warning("No users found in database")
        return
    
    result.add_info(f"Found {len(users)} users")
    
    # Validate each user
    for user in users:
        user_name = user.get('name', 'Unknown')
        
        # Check required fields
        required_fields = ['google_id', 'email', 'name', 'role']
        for field in required_fields:
            if field not in user:
                result.add_error(f"User '{user_name}' missing required field: {field}")
        
        # Validate role
        valid_roles = ['consumer', 'distributor', 'owner']
        if user.get('role') not in valid_roles:
            result.add_error(f"User '{user_name}' has invalid role: {user.get('role')}")
        
        # Validate email format (basic check)
        if 'email' in user:
            if '@' not in user['email']:
                result.add_error(f"User '{user_name}' has invalid email format")
        
        # Validate addresses
        if 'addresses' in user and user['addresses']:
            for addr in user['addresses']:
                required_addr_fields = ['type', 'street', 'city', 'state', 'pincode']
                for field in required_addr_fields:
                    if field not in addr:
                        result.add_error(
                            f"User '{user_name}' has address missing field: {field}"
                        )
                
                # Validate pincode format (6 digits)
                if 'pincode' in addr:
                    if not addr['pincode'].isdigit() or len(addr['pincode']) != 6:
                        result.add_error(
                            f"User '{user_name}' has invalid pincode format: {addr['pincode']}"
                        )
    
    result.add_info("Users validation completed")


async def validate_database():
    """Run complete database validation."""
    client = None
    try:
        logger.info("="*60)
        logger.info("DATABASE VALIDATION")
        logger.info("="*60)
        
        logger.info("\nConnecting to MongoDB...")
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Verify connection
        await client.admin.command('ping')
        logger.info(f"Connected to database: {settings.database_name}")
        
        # Create validation result container
        result = ValidationResult()
        
        # Run all validations
        await validate_users(db, result)
        await validate_products(db, result)
        await validate_inventory(db, result)
        await validate_orders(db, result)
        
        # Print summary
        logger.info("\n" + "="*60)
        logger.info("VALIDATION SUMMARY")
        logger.info("="*60)
        summary = result.summary()
        logger.info(f"Errors: {summary['errors']}")
        logger.info(f"Warnings: {summary['warnings']}")
        logger.info(f"Info: {summary['info']}")
        
        if result.has_errors():
            logger.error("\n❌ Validation FAILED - Please fix the errors above")
            return False
        elif result.warnings:
            logger.warning("\n⚠ Validation completed with warnings")
            return True
        else:
            logger.info("\n✅ Validation PASSED - All checks successful!")
            return True
        
    except Exception as e:
        logger.error(f"Error during validation: {str(e)}")
        raise
    finally:
        if client:
            client.close()


if __name__ == "__main__":
    success = asyncio.run(validate_database())
    sys.exit(0 if success else 1)
