# Local MongoDB Setup Guide

## Current Situation
You have **MongoDB Compass** (the GUI tool) installed, but you need **MongoDB Community Server** (the actual database) to run locally.

## Quick Setup Steps

### Step 1: Download MongoDB Community Server

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (7.0 or higher)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

### Step 2: Install MongoDB Server

1. **Run the downloaded MSI file**
2. Choose **"Complete"** installation type
3. **IMPORTANT**: On the "Service Configuration" screen:
   - ✅ Check **"Install MongoDB as a Service"**
   - ✅ Check **"Run service as Network Service user"**
   - Keep default data directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Keep default log directory: `C:\Program Files\MongoDB\Server\7.0\log`
4. **IMPORTANT**: On the "Install MongoDB Compass" screen:
   - ⬜ **UNCHECK** this option (you already have Compass)
5. Click **Install**
6. Wait for installation to complete
7. Click **Finish**

### Step 3: Verify MongoDB is Running

After installation, MongoDB should start automatically as a Windows service.

**Check if MongoDB service is running:**

Open PowerShell and run:
```powershell
Get-Service -Name MongoDB
```

You should see:
```
Status   Name               DisplayName
------   ----               -----------
Running  MongoDB            MongoDB Server
```

**If the service is not running, start it:**
```powershell
net start MongoDB
```

### Step 4: Test Connection with MongoDB Compass

1. Open **MongoDB Compass**
2. You should see a connection string: `mongodb://localhost:27017`
3. Click **Connect**
4. If successful, you'll see the MongoDB interface with databases

### Step 5: Verify Backend Connection

Your backend is already configured for local MongoDB. The `.env` file has:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=indostar
```

**No changes needed!** Just restart the backend:

1. Stop the current backend process (if running)
2. Start it again:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

You should see:
```
INFO - Connected to MongoDB successfully
INFO - Application startup complete
```

## Troubleshooting

### MongoDB Service Won't Start

**Option 1: Start manually**
```powershell
net start MongoDB
```

**Option 2: Check Windows Services**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "MongoDB Server" in the list
4. Right-click → Start

**Option 3: Run MongoDB manually (without service)**
```powershell
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

### Connection Refused Error

1. Check if MongoDB service is running:
   ```powershell
   Get-Service -Name MongoDB
   ```

2. Check if port 27017 is in use:
   ```powershell
   netstat -ano | findstr :27017
   ```

3. Try restarting the service:
   ```powershell
   net stop MongoDB
   net start MongoDB
   ```

### MongoDB Compass Can't Connect

1. Make sure MongoDB service is running
2. Try connection string: `mongodb://localhost:27017`
3. Check firewall isn't blocking port 27017

## Alternative: Use MongoDB Compass's Built-in Server

If you're having trouble with the service installation, MongoDB Compass can connect to MongoDB Atlas (cloud) instead. See `MONGODB_ATLAS_SETUP.md` for that option.

## What's Next?

Once MongoDB is running:
1. ✅ Backend will connect automatically
2. ✅ Database and collections will be created automatically
3. ✅ You can view data in MongoDB Compass
4. ✅ Full application will work end-to-end

## Quick Commands Reference

```powershell
# Check MongoDB service status
Get-Service -Name MongoDB

# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB

# Restart MongoDB service
net stop MongoDB; net start MongoDB
```

---

**After installing MongoDB Server, let me know and I'll help verify the connection!**
