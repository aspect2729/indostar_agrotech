# Database Seeding Quick Start Guide

This guide will help you quickly set up your database with initial data.

## Quick Start (Recommended)

For first-time setup, run the master seeding script:

```bash
cd backend
python scripts/seed_all.py
```

This will:
1. ✓ Create all database indexes
2. ✓ Seed 12 products (jaggery, oil, chutney powder, pickles, milk)
3. ✓ Create inventory records for all products
4. ✓ Optionally create sample users for testing

## What Gets Seeded

### Products (12 items)

**Jaggery Products (Inter-state delivery enabled)**
- Organic Jaggery Powder - ₹150/kg (consumer), ₹120/kg (distributor)
- Jaggery Blocks (Bella) - ₹140/kg (consumer), ₹110/kg (distributor)

**Oil Products (Inter-state delivery enabled)**
- Cold Pressed Coconut Oil - ₹350/L (consumer), ₹280/L (distributor)
- Cold Pressed Groundnut Oil - ₹280/L (consumer), ₹220/L (distributor)
- Cold Pressed Sesame Oil - ₹400/L (consumer), ₹320/L (distributor)

**Chutney Powder Products (Local delivery only)**
- Idli Podi (Gun Powder) - ₹180/kg (consumer), ₹145/kg (distributor)
- Coconut Chutney Powder - ₹200/kg (consumer), ₹160/kg (distributor)

**Pickle Products (Local delivery only)**
- Mango Pickle (Avakaya) - ₹250/kg (consumer), ₹200/kg (distributor)
- Lemon Pickle - ₹220/kg (consumer), ₹175/kg (distributor)
- Mixed Vegetable Pickle - ₹230/kg (consumer), ₹185/kg (distributor)

**Milk Products (Local delivery only)**
- Fresh Cow Milk - ₹60/L (consumer), ₹50/L (distributor)
- Fresh Buffalo Milk - ₹70/L (consumer), ₹58/L (distributor)

### Inventory

Default stock levels:
- Jaggery: 500 kg (low stock alert at 50 kg)
- Oil: 300 liters (low stock alert at 30 liters)
- Chutney Powder: 200 kg (low stock alert at 20 kg)
- Pickles: 150 kg (low stock alert at 15 kg)
- Milk: 100 liters (low stock alert at 20 liters)

### Sample Users (Optional)

If you choose to include sample users:

**Owner Account**
- Email: owner@indostar.com
- Name: Indostar Owner
- Access: Full system access

**Distributor Accounts**
- distributor1@example.com (Rajesh Kumar - Bangalore)
- distributor2@example.com (Priya Sharma - Mumbai)

**Consumer Accounts**
- consumer1@example.com (Amit Patel - Bangalore)
- consumer2@example.com (Sneha Reddy - Hyderabad)
- consumer3@example.com (Vikram Singh - Bangalore)

⚠️ **Note:** Sample users are for testing only. Remove before production!

## Step-by-Step Instructions

### 1. Ensure MongoDB is Running

**Local MongoDB:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**MongoDB Atlas:**
- Ensure your connection string is in `.env`
- Verify network access is configured

### 2. Configure Environment Variables

Make sure `backend/.env` has:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=indostar
```

### 3. Run the Seeding Script

```bash
cd backend
python scripts/seed_all.py
```

Follow the prompts:
1. Choose whether to include sample users (yes/no)
2. If data exists, confirm whether to clear and reseed (yes/no)

### 4. Verify the Data

```bash
python scripts/validate_data.py
```

You should see:
```
✅ Validation PASSED - All checks successful!
```

## Individual Scripts

If you need more control, run scripts individually:

### Create Indexes Only
```bash
python scripts/migrate_indexes.py
```

### Seed Products Only
```bash
python scripts/seed_products.py
```

### Seed Inventory Only (requires products)
```bash
python scripts/seed_inventory.py
```

### Seed Users Only
```bash
python scripts/seed_users.py
```

### Validate Data
```bash
python scripts/validate_data.py
```

## Common Scenarios

### Scenario 1: Fresh Installation
```bash
cd backend
python scripts/seed_all.py
# Answer 'yes' to include sample users
python scripts/validate_data.py
```

### Scenario 2: Reset Everything
```bash
cd backend
python scripts/seed_all.py
# Answer 'yes' to clear existing data
# Answer 'yes' to include sample users
python scripts/validate_data.py
```

### Scenario 3: Update Products Only
```bash
cd backend
python scripts/seed_products.py
# Answer 'yes' to clear existing products
python scripts/seed_inventory.py
# Answer 'yes' to clear existing inventory
python scripts/validate_data.py
```

### Scenario 4: Production Setup (No Sample Users)
```bash
cd backend
python scripts/seed_products.py
python scripts/seed_inventory.py
python scripts/migrate_indexes.py
python scripts/validate_data.py
```

## Verification

After seeding, verify in MongoDB:

```bash
mongosh

use indostar

# Check products
db.products.countDocuments()  // Should be 12

# Check inventory
db.inventory.countDocuments()  // Should be 12

# Check users (if seeded)
db.users.countDocuments()  // Should be 6

# View a sample product
db.products.findOne()

# Check indexes
db.products.getIndexes()
```

## Troubleshooting

### Error: "Database connection not initialized"
**Solution:** Check if MongoDB is running and MONGODB_URL is correct in `.env`

### Error: "No products found in database"
**Solution:** Run `python scripts/seed_products.py` first

### Warning: "Products collection already contains documents"
**Solution:** Answer 'yes' to clear and reseed, or 'no' to cancel

### Validation Errors
**Solution:** Review error messages, fix issues, and run validation again

## Next Steps

After seeding:

1. **Start the backend server:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test the application:**
   - Browse products in consumer portal
   - Check inventory in owner dashboard
   - Place test orders

4. **Monitor inventory:**
   - Owner dashboard shows low stock alerts
   - Update inventory as needed

## Production Checklist

Before deploying to production:

- [ ] Run seeding scripts on production database
- [ ] Do NOT include sample users
- [ ] Verify all indexes are created
- [ ] Run validation script
- [ ] Backup the database
- [ ] Test all functionality
- [ ] Remove any test data

## Need Help?

- Check `backend/scripts/README.md` for detailed documentation
- Run validation script to identify issues
- Review error logs
- Check MongoDB connection

---

**Ready to start?** Run `python scripts/seed_all.py` and follow the prompts!
