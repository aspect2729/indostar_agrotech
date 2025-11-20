# Quick MongoDB Atlas Setup

## What You Need to Do:

### 1. Create MongoDB Atlas Account (5 minutes)
- Visit: https://www.mongodb.com/cloud/atlas/register
- Sign up (free, no credit card needed)

### 2. Create Free Cluster (3-5 minutes)
- Click "Build a Database"
- Choose "M0 FREE" tier
- Select a region close to you
- Click "Create"
- Wait for cluster to be ready

### 3. Create Database User (1 minute)
- Go to "Database Access" (left sidebar)
- Click "Add New Database User"
- Username: `indostar_admin` (or your choice)
- Password: Create a strong password (SAVE THIS!)
- Privileges: "Read and write to any database"
- Click "Add User"

### 4. Allow Network Access (1 minute)
- Go to "Network Access" (left sidebar)
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
- Click "Confirm"

### 5. Get Connection String (1 minute)
- Go to "Database" (left sidebar)
- Click "Connect" on your cluster
- Choose "Connect your application"
- Select "Python" driver
- Copy the connection string

### 6. Update Backend Configuration

Open `backend/.env` and update the `MONGODB_URL` line:

**Before:**
```
MONGODB_URL=mongodb://localhost:27017
```

**After:**
```
MONGODB_URL=mongodb+srv://indostar_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/indostar_db?retryWrites=true&w=majority
```

**Important:** 
- Replace `indostar_admin` with your username
- Replace `YOUR_PASSWORD` with your actual password
- Replace `cluster0.xxxxx` with your cluster address from Atlas
- Keep `/indostar_db` as the database name

### 7. Restart Backend

After saving the `.env` file, the backend will automatically reload and connect to MongoDB Atlas!

## Example

If your Atlas connection string is:
```
mongodb+srv://myuser:abc123@cluster0.mongodb.net/?retryWrites=true&w=majority
```

Your `.env` should have:
```
MONGODB_URL=mongodb+srv://myuser:abc123@cluster0.mongodb.net/indostar_db?retryWrites=true&w=majority
```

## Verification

Once configured, check the backend terminal. You should see:
```
INFO - Connected to MongoDB successfully
INFO - Application startup complete
```

Instead of connection errors!

## Need Help?

If you see errors:
1. Check username and password are correct
2. Verify IP whitelist includes 0.0.0.0/0
3. Make sure the connection string format is correct
4. Check for special characters in password (may need URL encoding)

---

**Once you've completed these steps, let me know and I'll help verify the connection!**
