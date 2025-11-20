# Database Scripts

This directory contains scripts for database seeding, migration, and validation for the Indostar E-commerce Application.

## Overview

The scripts help you:
- Seed the database with initial product data
- Create sample users for testing
- Set up inventory records
- Create database indexes for optimal performance
- Validate data integrity

## Prerequisites

1. MongoDB must be running (local or Atlas)
2. Backend environment variables must be configured in `backend/.env`
3. Python dependencies must be installed: `pip install -r requirements.txt`

## Scripts

### 1. Complete Database Setup (Recommended)

**`seed_all.py`** - Master script that runs all seeding operations in the correct order.

```bash
cd backend
python scripts/seed_all.py
```

This script will:
- Create all database indexes
- Seed 12 products across all categories (jaggery, oil, chutney powder, pickles, milk)
- Create inventory records for all products
- Optionally create sample users for testing

**When to use:** First-time setup or complete database reset.

---

### 2. Individual Seeding Scripts

#### Seed Products

**`seed_products.py`** - Populates the products collection with initial product data.

```bash
cd backend
python scripts/seed_products.py
```

Products included:
- **Jaggery:** Organic Jaggery Powder, Jaggery Blocks
- **Oil:** Coconut Oil, Groundnut Oil, Sesame Oil
- **Chutney Powder:** Idli Podi, Coconut Chutney Powder
- **Pickles:** Mango Pickle, Lemon Pickle, Mixed Vegetable Pickle
- **Milk:** Fresh Cow Milk, Fresh Buffalo Milk

**When to use:** Add or reset product catalog.

---

#### Seed Inventory

**`seed_inventory.py`** - Creates inventory records for all products in the database.

```bash
cd backend
python scripts/seed_inventory.py
```

**Prerequisites:** Products must be seeded first.

Default inventory quantities:
- Jaggery: 500 kg (threshold: 50 kg)
- Oil: 300 liters (threshold: 30 liters)
- Chutney Powder: 200 kg (threshold: 20 kg)
- Pickles: 150 kg (threshold: 15 kg)
- Milk: 100 liters (threshold: 20 liters)

**When to use:** After seeding products or to reset inventory levels.

---

#### Seed Users

**`seed_users.py`** - Creates sample users for testing purposes.

```bash
cd backend
python scripts/seed_users.py
```

Sample users created:
- **Owner:** owner@indostar.com
- **Distributors:** distributor1@example.com, distributor2@example.com
- **Consumers:** consumer1@example.com, consumer2@example.com, consumer3@example.com

**When to use:** Development and testing only. In production, users are created via Google OAuth.

**⚠️ WARNING:** These are test users with fake Google IDs. Remove before production deployment.

---

### 3. Database Migration

#### Migrate Indexes

**`migrate_indexes.py`** - Creates and updates database indexes for optimal query performance.

```bash
cd backend
python scripts/migrate_indexes.py
```

Indexes created:
- **Users:** email (unique), google_id (unique), role
- **Products:** category, is_active, text search, compound indexes
- **Orders:** user_id, order_number (unique), status, compound indexes
- **Inventory:** product_id (unique), low stock alerts

**When to use:** 
- Initial database setup
- After schema changes
- Performance optimization

---

### 4. Data Validation

#### Validate Data

**`validate_data.py`** - Validates database integrity and relationships.

```bash
cd backend
python scripts/validate_data.py
```

Validation checks:
- ✓ All required fields are present
- ✓ Data types are correct
- ✓ Relationships are valid (products ↔ inventory, orders ↔ users/products)
- ✓ Business rules are enforced (distributor price ≤ consumer price)
- ✓ Low stock alerts
- ✓ Orphaned records detection

**When to use:**
- After seeding data
- Before deployment
- Regular maintenance checks
- Troubleshooting data issues

---

## Typical Workflows

### First-Time Setup

```bash
cd backend

# Option 1: Use master script (recommended)
python scripts/seed_all.py

# Option 2: Run individual scripts
python scripts/migrate_indexes.py
python scripts/seed_products.py
python scripts/seed_inventory.py
python scripts/seed_users.py  # Optional

# Validate everything
python scripts/validate_data.py
```

### Reset Product Catalog

```bash
cd backend
python scripts/seed_products.py  # Will prompt to clear existing
python scripts/seed_inventory.py  # Update inventory for new products
python scripts/validate_data.py   # Verify integrity
```

### Add Sample Users for Testing

```bash
cd backend
python scripts/seed_users.py
```

### Performance Optimization

```bash
cd backend
python scripts/migrate_indexes.py  # Create/update indexes
```

### Regular Maintenance

```bash
cd backend
python scripts/validate_data.py  # Check for data issues
```

---

## Configuration

All scripts use the configuration from `backend/app/config.py`, which reads from environment variables:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=indostar
```

Make sure your `.env` file is properly configured before running any scripts.

---

## Error Handling

All scripts include:
- Connection error handling
- Validation before operations
- Confirmation prompts for destructive operations
- Detailed logging
- Graceful cleanup

If a script fails:
1. Check MongoDB connection
2. Verify environment variables
3. Check the error logs
4. Run validation script to identify issues

---

## Production Considerations

### Before Production Deployment:

1. **Remove test users:**
   ```bash
   # In MongoDB shell or using a script
   db.users.deleteMany({ google_id: { $regex: /^(owner|distributor|consumer)_test_/ } })
   ```

2. **Verify data:**
   ```bash
   python scripts/validate_data.py
   ```

3. **Create indexes:**
   ```bash
   python scripts/migrate_indexes.py
   ```

4. **Backup database:**
   ```bash
   mongodump --uri="mongodb://..." --out=backup/
   ```

### Production Seeding:

For production, you typically want:
- Products and inventory (yes)
- Sample users (no - users will register via OAuth)

```bash
cd backend
python scripts/seed_products.py
python scripts/seed_inventory.py
python scripts/migrate_indexes.py
python scripts/validate_data.py
```

---

## Troubleshooting

### "Database connection not initialized"
- Check if MongoDB is running
- Verify MONGODB_URL in .env file
- Test connection: `mongosh <your-connection-string>`

### "Products collection already contains documents"
- Scripts will prompt before overwriting
- Answer 'yes' to clear and reseed
- Or manually clear: `db.products.deleteMany({})`

### "No products found in database"
- Run `seed_products.py` first
- Inventory and validation scripts depend on products

### Validation errors
- Review the error messages
- Fix data issues manually or reseed
- Run validation again to confirm

---

## Development Tips

1. **Quick reset during development:**
   ```bash
   python scripts/seed_all.py  # Answer 'yes' to clear all data
   ```

2. **Test with sample users:**
   ```bash
   python scripts/seed_users.py
   # Use dev login feature in the app
   ```

3. **Check data integrity regularly:**
   ```bash
   python scripts/validate_data.py
   ```

4. **Monitor low stock:**
   - Validation script will warn about low stock items
   - Use owner dashboard to manage inventory

---

## Script Dependencies

```
seed_all.py
├── migrate_indexes.py (indexes)
├── seed_products.py (products)
├── seed_inventory.py (inventory, requires products)
└── seed_users.py (users, optional)

validate_data.py (can run independently)
```

---

## Support

For issues or questions:
1. Check the error logs
2. Run validation script
3. Review this README
4. Check main project documentation

---

## License

Part of the Indostar E-commerce Application.
