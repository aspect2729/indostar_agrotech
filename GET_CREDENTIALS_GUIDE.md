# How to Get MongoDB Credentials and JWT Secret

## 🔐 Part 1: MongoDB Atlas Username & Password

### Option A: If You Already Have MongoDB Atlas Account

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Go to Database Access** (left sidebar)
3. **Find Your User**:
   - Look for existing database users
   - Username will be visible (e.g., `advikgudodagi_db_user`)
   
4. **If You Forgot Password**:
   - Click "Edit" on your user
   - Click "Edit Password"
   - Enter new password
   - Click "Update User"
   - **SAVE THIS PASSWORD!**

5. **Get Connection String**:
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Option B: Create New MongoDB Atlas Account (5 minutes)

**Step 1: Sign Up**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Complete registration (FREE, no credit card needed)

**Step 2: Create Free Cluster**
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select region (choose closest to you)
4. Click "Create"
5. Wait 3-5 minutes for cluster creation

**Step 3: Create Database User**
1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. **Username**: `indostar_admin` (or your choice)
5. **Password**: Click "Autogenerate Secure Password" OR create your own
   - **IMPORTANT**: Copy and save this password immediately!
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

**Step 4: Allow Network Access**
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` (needed for Render/Railway/Heroku)
4. Click "Confirm"

**Step 5: Get Connection String**
1. Go to "Database" (left sidebar)
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: Python, Version: 3.6 or later
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

**Step 6: Format Your Connection String**

Replace placeholders:
```
mongodb+srv://indostar_admin:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/indostar?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://indostar_admin:MySecurePass123@cluster0.zz0gmfl.mongodb.net/indostar?retryWrites=true&w=majority
```

**⚠️ Important Notes:**
- Replace `<username>` with your actual username
- Replace `<password>` with your actual password
- Add `/indostar` before the `?` to specify database name
- If password has special characters, URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

---

## 🔑 Part 2: JWT Secret

The JWT secret is used to sign authentication tokens. You need a secure random string.

### Method 1: Generate Online (Easiest)

1. Go to: https://randomkeygen.com/
2. Copy any "Fort Knox Password" (256-bit key)
3. Example: `kJ8n3mP9qR2sT5vW8xZ1aC4dF7gH0jK3mN6pQ9rS2tU5vX8yA1bC4eF7hJ0kM3n`

### Method 2: Generate with Python

Open terminal and run:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Output example: `xK9mP2nQ5rS8tV1wY4zA7bD0eG3hJ6kM9nP2qR5sT8u`

### Method 3: Generate with OpenSSL

```bash
openssl rand -base64 32
```

Output example: `7J9kM2nP5qR8sT1vW4xZ7aC0dF3gH6jK9mN2pQ5rS8t=`

### Method 4: Use PowerShell (Windows)

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**⚠️ Important:**
- Use a DIFFERENT secret for production vs development
- Never commit JWT secrets to Git
- Keep it at least 32 characters long
- Use random characters (letters, numbers, symbols)

---

## 📋 Part 3: Your Complete Environment Variables

Once you have everything, here's what you need for deployment:

### For Render/Railway/Heroku:

```
MONGODB_URL = mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/indostar?retryWrites=true&w=majority
DATABASE_NAME = indostar
JWT_SECRET = YOUR_GENERATED_JWT_SECRET_HERE
JWT_ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your-google-client-secret
GOOGLE_REDIRECT_URI = https://your-backend-url.onrender.com/api/auth/callback
CORS_ORIGINS = https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app
ENVIRONMENT = production
LOG_LEVEL = INFO
```

### Example with Real Values:

```
MONGODB_URL = mongodb+srv://indostar_admin:MySecurePass123@cluster0.zz0gmfl.mongodb.net/indostar?retryWrites=true&w=majority
DATABASE_NAME = indostar
JWT_SECRET = kJ8n3mP9qR2sT5vW8xZ1aC4dF7gH0jK3mN6pQ9rS2tU5vX8yA1bC4eF7hJ0kM3n
JWT_ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your-google-client-secret
GOOGLE_REDIRECT_URI = https://indostar-backend.onrender.com/api/auth/callback
CORS_ORIGINS = https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app
ENVIRONMENT = production
LOG_LEVEL = INFO
```

---

## ✅ Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster created (M0 tier)
- [ ] Database user created with username and password
- [ ] Password saved securely
- [ ] Network access set to 0.0.0.0/0
- [ ] Connection string copied
- [ ] Connection string formatted with database name `/indostar`
- [ ] JWT secret generated (32+ characters)
- [ ] All environment variables ready for deployment

---

## 🔍 Verify Your Credentials

### Test MongoDB Connection Locally

1. Update `backend/.env` with your credentials:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/indostar?retryWrites=true&w=majority
JWT_SECRET=your-generated-jwt-secret
```

2. Run backend:
```bash
cd backend
python main.py
```

3. Check health endpoint:
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 🐛 Common Issues

### "Authentication failed"
- Check username and password are correct
- Verify user has "Read and write" permissions
- Check for special characters in password (URL-encode them)

### "Connection timeout"
- Verify Network Access includes 0.0.0.0/0
- Check cluster is running (not paused)
- Verify connection string format

### "Database not found"
- MongoDB creates databases automatically
- Make sure `/indostar` is in connection string
- Database will appear after first data write

---

## 📞 Need Help?

1. **MongoDB Atlas Issues**: Check MongoDB Atlas dashboard for cluster status
2. **Connection String**: Make sure format is exactly right
3. **JWT Secret**: Any random 32+ character string works
4. **Test Locally First**: Always test credentials locally before deploying

---

## 🎯 Next Steps

Once you have all credentials:
1. ✅ Save them securely (password manager recommended)
2. ✅ Add to Render/Railway/Heroku environment variables
3. ✅ Deploy backend
4. ✅ Test health endpoint
5. ✅ Update frontend with backend URL

---

**Ready to deploy?** You now have everything you need!
