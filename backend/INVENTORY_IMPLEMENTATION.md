# Inventory Management Implementation

## Overview

This document describes the implementation of the inventory management service and API endpoints for the Indostar E-commerce application.

## Implementation Status

✅ **Task 7.1: Create inventory service layer** - COMPLETED
✅ **Task 7.2: Create inventory API endpoints** - COMPLETED

## Files Created/Modified

### New Files

1. **`app/services/inventory_service.py`**
   - Inventory service layer with all business logic
   - Implements inventory query operations
   - Atomic inventory update operations (set, add, subtract)
   - Low-stock alert logic
   - Inventory validation for orders

2. **`app/routes/inventory.py`**
   - REST API endpoints for inventory management
   - Owner-only access control
   - Three main endpoints: GET /api/inventory, PUT /api/inventory/{product_id}, GET /api/inventory/alerts

3. **`verify_inventory_endpoints.py`**
   - Verification script to test inventory functionality
   - Tests all service methods and edge cases

### Modified Files

1. **`main.py`**
   - Added inventory router registration
   - Endpoint prefix: `/api/inventory`

## Features Implemented

### 1. Inventory Service Layer (`inventory_service.py`)

#### Methods:

- **`get_inventory_by_product_id(product_id)`**
  - Retrieves inventory for a specific product
  - Returns Inventory object or None

- **`get_all_inventory()`**
  - Retrieves all inventory items with product information
  - Uses MongoDB aggregation to join with products collection
  - Returns list with product names, stock levels, and status indicators

- **`update_inventory(product_id, update_request)`**
  - Atomic inventory updates to prevent race conditions
  - Supports three operations:
    - `set`: Replace quantity with new value
    - `add`: Increment quantity (for restocking)
    - `subtract`: Decrement quantity (with validation)
  - Validates sufficient inventory for subtract operations
  - Updates `lastRestocked` timestamp for set/add operations
  - Returns updated Inventory object

- **`get_low_stock_alerts()`**
  - Retrieves products where quantity ≤ low_stock_threshold
  - Uses MongoDB aggregation with $expr for comparison
  - Sorted by quantity (ascending) - most critical first
  - Returns list with product details and stock status

- **`validate_inventory_for_order(order_items)`**
  - Validates sufficient inventory exists for order items
  - Checks each item against current inventory levels
  - Returns validation result with:
    - `valid`: boolean indicating if order can be fulfilled
    - `errors`: list of items with insufficient inventory
    - `warnings`: list of items that will be low stock after order

- **`create_inventory_for_product(product_id, quantity, unit, low_stock_threshold)`**
  - Creates new inventory record for a product
  - Used when adding new products to catalog

### 2. Inventory API Endpoints (`routes/inventory.py`)

#### Endpoints:

**GET /api/inventory** (Owner only)
- Returns all inventory items with product information
- Response includes:
  - Current stock levels
  - Product names
  - Low stock indicators
  - Out of stock indicators
  - Last restocked timestamps
- Response model: `InventoryListResponse`

**PUT /api/inventory/{product_id}** (Owner only)
- Updates inventory for a specific product
- Request body: `InventoryUpdateRequest`
  - `quantity`: float (amount to set/add/subtract)
  - `operation`: "set" | "add" | "subtract"
- Atomic operation to prevent race conditions
- Validates sufficient inventory for subtract operations
- Response model: `InventoryResponse`
- Error codes:
  - 400: Invalid product ID format
  - 404: Product inventory not found
  - 422: Insufficient inventory for subtract operation
  - 500: Internal server error

**GET /api/inventory/alerts** (Owner only)
- Returns products with low stock levels
- Sorted by quantity (most critical first)
- Response model: `InventoryAlertResponse`

### 3. Authorization

All inventory endpoints require **Owner role** authentication:
- Uses `require_owner` dependency from `app.utils.dependencies`
- Returns 401 if not authenticated
- Returns 403 if user is not an owner

## Data Models

### Inventory Model
```python
{
  "_id": ObjectId,
  "productId": ObjectId,
  "quantity": float,
  "unit": string,
  "lowStockThreshold": float,
  "lastRestocked": datetime (optional),
  "updatedAt": datetime
}
```

### Request/Response Schemas

**InventoryUpdateRequest**
```json
{
  "quantity": 50.0,
  "operation": "add"  // "set" | "add" | "subtract"
}
```

**InventoryResponse**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "product_id": "507f1f77bcf86cd799439012",
  "product_name": "Organic Jaggery Powder",
  "quantity": 100.0,
  "unit": "kg",
  "low_stock_threshold": 20.0,
  "is_low_stock": false,
  "is_out_of_stock": false,
  "last_restocked": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Requirements Satisfied

✅ **Requirement 3.1**: Owner Dashboard displays current inventory levels for all products
✅ **Requirement 3.2**: Real-time inventory updates reflected across all portals
✅ **Requirement 3.4**: Low-stock alerts displayed on Owner Dashboard
✅ **Requirement 5.4**: Atomic update operations in MongoDB

## Testing

### Manual Testing (requires MongoDB)

1. **Start MongoDB** (if not running):
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Run verification script**:
   ```bash
   cd backend
   python verify_inventory_endpoints.py
   ```

3. **Test via API** (requires running FastAPI server):
   ```bash
   # Start server
   uvicorn main:app --reload

   # Get all inventory (requires owner token)
   curl -X GET "http://localhost:8000/api/inventory" \
     -H "Authorization: Bearer <owner_token>"

   # Update inventory
   curl -X PUT "http://localhost:8000/api/inventory/{product_id}" \
     -H "Authorization: Bearer <owner_token>" \
     -H "Content-Type: application/json" \
     -d '{"quantity": 50.0, "operation": "add"}'

   # Get low stock alerts
   curl -X GET "http://localhost:8000/api/inventory/alerts" \
     -H "Authorization: Bearer <owner_token>"
   ```

### Verification Script Tests

The `verify_inventory_endpoints.py` script tests:

1. ✅ Database connection
2. ✅ Test data setup (product and inventory)
3. ✅ Get inventory by product ID
4. ✅ Get all inventory
5. ✅ Update inventory (add operation)
6. ✅ Update inventory (subtract operation)
7. ✅ Update inventory (set operation)
8. ✅ Get low stock alerts
9. ✅ Validate inventory for order (sufficient)
10. ✅ Validate inventory for order (insufficient)
11. ✅ Error handling for insufficient inventory

## Integration with Other Services

### Order Service Integration (Future)

When implementing the order service (Task 8), use the inventory validation:

```python
from app.services.inventory_service import inventory_service

# Before creating order
order_items = [
    {"product_id": "...", "quantity": 10},
    {"product_id": "...", "quantity": 5}
]

validation = await inventory_service.validate_inventory_for_order(order_items)

if not validation["valid"]:
    raise HTTPException(
        status_code=422,
        detail={"message": "Insufficient inventory", "errors": validation["errors"]}
    )

# After order is confirmed, deduct inventory
for item in order_items:
    update_request = InventoryUpdateRequest(
        quantity=item["quantity"],
        operation="subtract"
    )
    await inventory_service.update_inventory(item["product_id"], update_request)
```

## API Documentation

Once the server is running, view the interactive API documentation:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Error Handling

The implementation includes comprehensive error handling:

1. **Invalid Product ID**: Returns 400 Bad Request
2. **Product Not Found**: Returns 404 Not Found
3. **Insufficient Inventory**: Returns 422 Unprocessable Entity with details
4. **Database Errors**: Returns 500 Internal Server Error with error message
5. **Authentication Errors**: Returns 401 Unauthorized
6. **Authorization Errors**: Returns 403 Forbidden

## Logging

All operations are logged with appropriate log levels:
- INFO: Successful operations with details
- WARNING: Not found scenarios
- ERROR: Exception details with stack traces

## Next Steps

The inventory management implementation is complete. The next task in the implementation plan is:

**Task 8: Implement order management service and endpoints**
- This will integrate with the inventory service for validation and stock deduction
- Use `inventory_service.validate_inventory_for_order()` before order creation
- Use `inventory_service.update_inventory()` to deduct stock after order confirmation

## Notes

- All inventory operations are atomic to prevent race conditions
- The service uses MongoDB aggregation for efficient joins with product data
- Low stock alerts are calculated dynamically based on current quantity vs threshold
- The implementation follows the same patterns as the product service for consistency
