# ⚠️ MANUAL FIX REQUIRED IN RENDER DASHBOARD

## The Problem
Render is ignoring `runtime.txt` and using Python 3.13.4, which causes pydantic-core to fail building.

## ✅ SOLUTION: Set Python Version in Render Dashboard

You MUST manually set the Python version in Render. Here's how:

### Step-by-Step Instructions:

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click your service** (indostar-backend or whatever you named it)

3. **Go to "Environment" tab** (left sidebar)

4. **Click "Add Environment Variable"**

5. **Add this variable**:
   - **Key**: `PYTHON_VERSION`
   - **Value**: `3.11.0`

6. **Click "Save Changes"**

7. **Trigger Manual Deploy**:
   - Scroll down to "Manual Deploy" section
   - Click "Clear build cache & deploy"

---

## Alternative: Use Railway Instead

If Render continues to have issues, Railway is easier and works better with Python:

### Deploy to Railway (5 minutes):

1. **Go to**: https://railway.app
2. **Sign up with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `aspect2729/indostar_agrotech`
5. **Settings**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

6. **Add Environment Variables** (same as Render):
   ```
   MONGODB_URL = your-mongodb-atlas-url
   DATABASE_NAME = indostar
   JWT_SECRET = XYC8zTrKIQFf01dW6uiSbBTEv_7GypUO0wxX6Fqj5hs
   JWT_ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 30
   REFRESH_TOKEN_EXPIRE_DAYS = 7
   GOOGLE_CLIENT_ID = your-client-id
   GOOGLE_CLIENT_SECRET = your-client-secret
   GOOGLE_REDIRECT_URI = https://your-backend.up.railway.app/api/auth/callback
   CORS_ORIGINS = https://indostar-m10nlzk43-adviks-projects-996cbcc2.vercel.app
   ENVIRONMENT = production
   LOG_LEVEL = INFO
   ```

7. **Deploy** - Railway auto-detects Python and uses correct version!

---

## Why This Happens

- Render defaults to latest Python (3.13.4)
- `runtime.txt` is not always respected
- Python 3.13 is too new - pydantic-core needs Rust compilation
- Render's build environment has read-only filesystem for Rust
- **Solution**: Force Python 3.11 via environment variable

---

## After Setting PYTHON_VERSION=3.11.0

Expected build output:
```
==> Using Python version 3.11.0
==> Running build command 'pip install -r requirements.txt'...
Collecting fastapi==0.109.0
  Downloading fastapi-0.109.0-py3-none-any.whl
Collecting pydantic==2.6.0
  Downloading pydantic-2.6.0-py3-none-any.whl
...
Successfully installed [all packages]
==> Build succeeded ✅
```

---

## Quick Decision Matrix

| Option | Difficulty | Time | Recommendation |
|--------|-----------|------|----------------|
| **Set PYTHON_VERSION in Render** | Easy | 2 min | ⭐ Try this first |
| **Switch to Railway** | Easy | 5 min | ⭐ If Render fails |
| **Use Heroku** | Medium | 10 min | Alternative |

---

## 🎯 IMMEDIATE ACTION REQUIRED

**Go to Render Dashboard NOW and add:**
```
PYTHON_VERSION = 3.11.0
```

Then click "Clear build cache & deploy"

---

Need help? The issue is 100% the Python version. Once you set `PYTHON_VERSION=3.11.0` in Render, it will work!
