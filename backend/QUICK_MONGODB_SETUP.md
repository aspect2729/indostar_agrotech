# Quick MongoDB Local Setup

## You Have: MongoDB Compass ✅
## You Need: MongoDB Community Server ⏳

## 3-Minute Setup

### 1. Download (2 minutes)
🔗 https://www.mongodb.com/try/download/community
- Choose: **Windows MSI**
- Click: **Download**

### 2. Install (3 minutes)
- Run the MSI file
- Choose: **Complete** installation
- ✅ **Check**: "Install MongoDB as a Service"
- ⬜ **Uncheck**: "Install MongoDB Compass" (you have it)
- Click: **Install**

### 3. Verify (30 seconds)
Open PowerShell:
```powershell
Get-Service -Name MongoDB
```

Should show: `Status: Running`

If not running:
```powershell
net start MongoDB
```

### 4. Test in Compass (30 seconds)
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Click: **Connect**
- Should see: MongoDB interface

### 5. Restart Backend (10 seconds)
The backend will automatically connect!

Check the backend terminal - you should see:
```
INFO - Connected to MongoDB successfully
```

## That's It! 🎉

Your `.env` is already configured:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=indostar
```

No changes needed!

---

## Need Help?

**Service won't start?**
```powershell
# Check status
Get-Service -Name MongoDB

# Start it
net start MongoDB
```

**Still having issues?**
See `MONGODB_LOCAL_SETUP.md` for detailed troubleshooting.

**Prefer cloud instead?**
See `MONGODB_ATLAS_SETUP.md` for MongoDB Atlas (no local install needed).
